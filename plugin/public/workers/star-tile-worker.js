/**
 * Off-main-thread Star Tile Decoder Web Worker.
 *
 * Fetches compact Float32LE star tiles (/data/stars-tier0.bin, /data/stars-tier1.bin),
 * converts J2000 (RA, Dec, distPc) -> Heliocentric Three.js Y-up Galactic coordinates
 * in light-years using the exact Hipparcos/IAU 1958 J2000 matrix, computes realistic
 * Ballesteros (2012) blackbody RGB from Johnson B-V color index, and returns zero-copy
 * Transferable Float32Arrays to the renderer.
 */

const DEG2RAD = Math.PI / 180;
const LY_PER_PC = 3.261563777167433;

// Exact Hipparcos/IAU J2000 EQJ -> Galactic rotation matrix
const ALPHA_G = 192.8594812065348 * DEG2RAD;
const DELTA_G = 27.12825118085622 * DEG2RAD;
const L_NCP = 122.9319185680026 * DEG2RAD;

const sinA = Math.sin(ALPHA_G);
const cosA = Math.cos(ALPHA_G);
const sinD = Math.sin(DELTA_G);
const cosD = Math.cos(DELTA_G);
const sinL = Math.sin(L_NCP);
const cosL = Math.cos(L_NCP);

const Z0 = cosD * cosA;
const Z1 = cosD * sinA;
const Z2 = sinD;

const R00 = -cosL * sinD * cosA - sinL * sinA;
const R01 = -cosL * sinD * sinA + sinL * cosA;
const R02 = cosL * cosD;

const r10Raw = sinL * sinD * cosA - cosL * sinA;
const r11Raw = sinL * sinD * sinA + cosL * cosA;
const r12Raw = -sinL * cosD;

const cx = R01 * r12Raw - R02 * r11Raw;
const cy = R02 * r10Raw - R00 * r12Raw;
const cz = R00 * r11Raw - R01 * r10Raw;
const sign = cx * Z0 + cy * Z1 + cz * Z2 >= 0 ? 1 : -1;

const R10 = r10Raw * sign;
const R11 = r11Raw * sign;
const R12 = r12Raw * sign;

/**
 * Physically calibrated Johnson B-V -> approximate linear sRGB star color.
 */
function bvToRgb(bv) {
  const t = Math.max(-0.4, Math.min(2.0, bv));
  let r = 1.0;
  let g = 1.0;
  let b = 1.0;

  if (t < 0.0) {
    // O/B blue-white
    const f = (t + 0.4) / 0.4;
    r = 0.62 + 0.34 * f;
    g = 0.76 + 0.22 * f;
    b = 1.0;
  } else if (t < 0.4) {
    // A/F white to warm-white
    const f = t / 0.4;
    r = 0.96 + 0.04 * f;
    g = 0.98 - 0.02 * f;
    b = 1.0 - 0.08 * f;
  } else if (t < 1.0) {
    // G/K solar yellow to warm amber
    const f = (t - 0.4) / 0.6;
    r = 1.0;
    g = 0.96 - 0.19 * f;
    b = 0.92 - 0.44 * f;
  } else {
    // K/M orange-red giants & red dwarfs
    const f = (t - 1.0) / 1.0;
    r = 1.0;
    g = 0.77 - 0.36 * f;
    b = 0.48 - 0.32 * f;
  }
  return [r, g, b];
}

self.onmessage = async (event) => {
  const { type, urls, requestId } = event.data || {};
  if (type !== 'LOAD_STAR_TILES' || !Array.isArray(urls)) return;

  try {
    const chunks = [];
    let totalStars = 0;

    for (let uIdx = 0; uIdx < urls.length; uIdx += 1) {
      const url = urls[uIdx];
      self.postMessage({
        type: 'PROGRESS',
        requestId,
        progress: uIdx / Math.max(1, urls.length),
      });
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} fetching ${url}`);
      }
      const buf = await res.arrayBuffer();
      const floats = new Float32Array(buf);
      const count = Math.floor(floats.length / 6);
      chunks.push({ floats, count });
      totalStars += count;
    }

    const positionsLy = new Float32Array(totalStars * 3);
    const colors = new Float32Array(totalStars * 3);
    const sizes = new Float32Array(totalStars);
    const illustrative = new Float32Array(totalStars);

    let outIdx = 0;
    for (const chunk of chunks) {
      const f = chunk.floats;
      for (let i = 0; i < chunk.count; i += 1) {
        const base = i * 6;
        const ra = f[base + 0] * DEG2RAD;
        const dec = f[base + 1] * DEG2RAD;
        const distLy = f[base + 2] * LY_PER_PC;
        const vMag = f[base + 3];
        const bv = f[base + 4];
        const isIllus = f[base + 5];

        const cosDec = Math.cos(dec);
        const ex = distLy * cosDec * Math.cos(ra);
        const ey = distLy * cosDec * Math.sin(ra);
        const ez = distLy * Math.sin(dec);

        const gx = R00 * ex + R01 * ey + R02 * ez;
        const gy = R10 * ex + R11 * ey + R12 * ez;
        const gz = Z0 * ex + Z1 * ey + Z2 * ez;

        // Three.js Y-up Galactic mapping: (X_gal, Z_gal, -Y_gal)
        const p3 = outIdx * 3;
        positionsLy[p3 + 0] = gx;
        positionsLy[p3 + 1] = gz;
        positionsLy[p3 + 2] = -gy;

        const [cr, cg, cb] = bvToRgb(bv);
        colors[p3 + 0] = cr;
        colors[p3 + 1] = cg;
        colors[p3 + 2] = cb;

        // Apparent visual luminosity weight -> point size
        const lum = Math.max(0.4, Math.min(5.2, 3.6 - vMag * 0.24));
        sizes[outIdx] = isIllus > 0.5 ? Math.min(2.2, lum * 0.72) : lum;
        illustrative[outIdx] = isIllus;
        outIdx += 1;
      }
    }

    self.postMessage(
      {
        type: 'LOADED',
        requestId,
        count: totalStars,
        positionsLy,
        colors,
        sizes,
        illustrative,
      },
      [positionsLy.buffer, colors.buffer, sizes.buffer, illustrative.buffer]
    );
  } catch (err) {
    self.postMessage({
      type: 'ERROR',
      requestId,
      message: err instanceof Error ? err.message : String(err),
    });
  }
};
