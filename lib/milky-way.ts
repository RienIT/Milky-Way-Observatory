import { BLACK_HOLE_DISK_ROLL } from './memory-logic';

/**
 * NASA / Spitzer GLIMPSE / ESA Gaia DR3 / EHT Published Milky Way Galaxy Parameters
 * Scene scale: 1 scene unit ≈ 600 light-years (Galactic diameter ~105,700 ly -> radius ~88 units)
 */
export const MILKY_WAY_NASA_DATA = {
  classification: 'SBbc (Barred Spiral Galaxy)',
  diameterLightYears: 105700,
  diskThicknessLightYears: 1000,
  estimatedStars: '100 – 400 Billion',
  centralBlackHole: 'Sagittarius A* (4.3 Million M☉)',
  barLengthLightYears: 27000,
  barAngleDeg: 27,
  sunDistanceLightYears: 26670,
  sunOrbitalSpeedKmS: 230,
  galacticYearMillionYears: 230,
  sceneUnitsPerLightYear: 1 / 600,
  galaxyRadiusUnits: 88,
  barHalfLengthUnits: 22.5, // ~27,000 ly full bar length
  barAngleRad: (27 * Math.PI) / 180,
  sunOrbitRadiusUnits: 44.5, // 44.5 * 600 = 26,700 ly on the Orion-Cygnus Spur
  sunOrbitAngleRad: 1.18, // Positioned cleanly on the Orion-Cygnus Spur
} as const;

export interface SpiralArmDefinition {
  id:
    | 'scutum-centaurus'
    | 'perseus'
    | 'sagittarius-carina'
    | 'norma-outer'
    | 'orion-spur';
  isMajor: boolean;
  startAngleRad: number;
  startRadius: number;
  endRadius: number;
  windFactor: number; // Controls logarithmic pitch (~12-13 degrees per NASA Spitzer)
  widthUnits: number;
  starShare: number;
  nebulaTintHex: string;
}

/**
 * Exact 4 spiral arms + Orion-Cygnus Local Spur mapped by NASA/JPL-Caltech (Spitzer GLIMPSE & Gaia).
 * Star shares are proportional to physical spiral arc area so no minor spur blows out brighter than major arms.
 */
export const MILKY_WAY_SPIRAL_ARMS: SpiralArmDefinition[] = [
  {
    id: 'scutum-centaurus',
    isMajor: true,
    startAngleRad: MILKY_WAY_NASA_DATA.barAngleRad,
    startRadius: 22.5,
    endRadius: 86.0,
    windFactor: 3.15,
    widthUnits: 5.2,
    starShare: 0.295,
    nebulaTintHex: '#f472b6',
  },
  {
    id: 'perseus',
    isMajor: true,
    startAngleRad: MILKY_WAY_NASA_DATA.barAngleRad + Math.PI,
    startRadius: 22.5,
    endRadius: 88.0,
    windFactor: 3.15,
    widthUnits: 5.2,
    starShare: 0.295,
    nebulaTintHex: '#60a5fa',
  },
  {
    id: 'sagittarius-carina',
    isMajor: false,
    startAngleRad: MILKY_WAY_NASA_DATA.barAngleRad + Math.PI * 0.52,
    startRadius: 23.0,
    endRadius: 81.0,
    windFactor: 3.05,
    widthUnits: 4.1,
    starShare: 0.185,
    nebulaTintHex: '#e879f9',
  },
  {
    id: 'norma-outer',
    isMajor: false,
    startAngleRad: MILKY_WAY_NASA_DATA.barAngleRad + Math.PI * 1.52,
    startRadius: 23.0,
    endRadius: 85.0,
    windFactor: 3.05,
    widthUnits: 4.1,
    starShare: 0.185,
    nebulaTintHex: '#38bdf8',
  },
  {
    // Local Orion-Cygnus Spur: delicate branch aligned with the 12-13 deg logarithmic pitch,
    // passing directly through the Solar System (r = 44.5, angle = 1.18 rad) with balanced density.
    id: 'orion-spur',
    isMajor: false,
    startAngleRad: 0.56,
    startRadius: 35.5,
    endRadius: 58.5,
    windFactor: 2.75,
    widthUnits: 4.1,
    starShare: 0.04,
    nebulaTintHex: '#fbbf24',
  },
];

/**
 * Deterministic PRNG (Mulberry32) so Milky Way stars & nebulae are 100% reproducible
 */
function createSeededRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Box-Muller Gaussian distribution helper for natural astronomical star scatter
 */
function gaussianRandom(rng: () => number): number {
  const u1 = Math.max(1e-6, rng());
  const u2 = rng();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

/**
 * Smooth Hermite interpolation in [0, 1] for soft radial feathering with zero hard boundaries
 */
function smoothstep01(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / Math.max(1e-6, edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Selects a spiral arm weighted proportionally by arm.starShare
 */
function pickWeightedSpiralArm(rng: () => number): SpiralArmDefinition {
  const r = rng();
  let acc = 0;
  for (const arm of MILKY_WAY_SPIRAL_ARMS) {
    acc += arm.starShare;
    if (r <= acc) return arm;
  }
  return MILKY_WAY_SPIRAL_ARMS[0];
}

/**
 * Samples an organic triaxial elliptical Galactic Bar & Bulge coordinate (bx, bz)
 * using smooth rejection sampling with ZERO rectangular clamping and smooth feathering outside Sgr A*'s accretion disk.
 */
function sampleOrganicGalacticBar(
  rng: () => number,
  innerFadeStart = 21.8,
  innerFadeEnd = 30.5
): [number, number] {
  for (let attempt = 0; attempt < 24; attempt++) {
    // 68% elongated triaxial bar (27 deg NASA Spitzer bar) + 32% round soft central bulge
    const isBulgeHalo = rng() < 0.32;
    let bx: number;
    let bz: number;
    if (isBulgeHalo) {
      bx = gaussianRandom(rng) * 20.5;
      bz = gaussianRandom(rng) * 18.0;
    } else {
      // Smooth elongated elliptical bar with tapered rounded tips and subtle S-twist into the major spiral arms
      bx = gaussianRandom(rng) * 22.5;
      const tipTaper = 1.0 / (1.0 + Math.pow(Math.abs(bx) / 34.0, 2.2));
      bz = gaussianRandom(rng) * (6.2 + 5.6 * tipTaper);
      // Gentle S-curve shear so the outer bar tips flow smoothly into Scutum-Centaurus & Perseus
      bz += Math.sign(bx) * Math.pow(Math.max(0, Math.abs(bx) - 18.0) / 28.0, 1.8) * 6.5;
    }

    const r2d = Math.hypot(bx, bz);
    if (r2d < innerFadeStart || r2d > 62.0) continue;

    // Smooth radial ramp outward from Sgr A*'s accretion disk edge (zero hard ring or sharp cutout)
    const innerProb = smoothstep01(innerFadeStart, innerFadeEnd, r2d);
    const outerProb = 1.0 - smoothstep01(44.0, 62.0, r2d);
    if (rng() <= innerProb * outerProb) {
      return [bx, bz];
    }
  }

  // Smooth elliptical polar fallback (zero straight-line clamping)
  const theta = rng() * Math.PI * 2;
  const rBase = innerFadeEnd + Math.abs(gaussianRandom(rng)) * 9.5;
  const bx = Math.cos(theta) * rBase * 1.18;
  const bz = Math.sin(theta) * rBase * 0.72;
  return [bx, bz];
}

/**
 * Transforms galactic-disk local (x, y, z) into world space aligned with BLACK_HOLE_DISK_ROLL
 */
export function rotateToGalacticPlane(
  lx: number,
  ly: number,
  lz: number
): [number, number, number] {
  const cosR = Math.cos(BLACK_HOLE_DISK_ROLL);
  const sinR = Math.sin(BLACK_HOLE_DISK_ROLL);
  return [lx * cosR - ly * sinR, lx * sinR + ly * cosR, lz];
}

/**
 * Computes the Solar System's exact 3D position on the Orion-Cygnus Spur (26,670 ly from Sgr A*)
 */
export function computeSolarSystemWorldPosition(
  elapsedSeconds = 0,
  speedMultiplier = 1
): [number, number, number] {
  const r = MILKY_WAY_NASA_DATA.sunOrbitRadiusUnits;
  // Gentle realistic galactic rotation matched to the Milky Way disk rotation speed
  const angle =
    MILKY_WAY_NASA_DATA.sunOrbitAngleRad +
    elapsedSeconds * 0.012 * speedMultiplier;
  const lx = Math.cos(angle) * r;
  const lz = Math.sin(angle) * r;
  const ly = 0.25; // Sun sits ~55 ly above the galactic midplane
  return rotateToGalacticPlane(lx, ly, lz);
}

export interface MilkyWayParticleData {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  phases: Float32Array;
  count: number;
}

/**
 * Procedurally generates NASA-accurate Milky Way Barred Spiral Galaxy star positions & spectral colors:
 * - 14% Organic Triaxial Central Galactic Bar & Golden Bulge (warm K/M gold-amber giants, zero hard edges)
 * - 74% 4 Logarithmic Spiral Arms + balanced Orion-Cygnus Spur (blue-white O/B + solar F/G + H-II pockets)
 * - 12% Diffuse Inter-Arm Galactic Disk & Stellar Halo
 */
export function generateMilkyWayStarfield(
  totalStars = 20000,
  seed = 20220512 // EHT Sagittarius A* announcement date
): MilkyWayParticleData {
  const rng = createSeededRng(seed);
  const positions = new Float32Array(totalStars * 3);
  const colors = new Float32Array(totalStars * 3);
  const sizes = new Float32Array(totalStars);
  const phases = new Float32Array(totalStars);

  const barCount = Math.floor(totalStars * 0.14);
  const haloCount = Math.floor(totalStars * 0.12);
  const armTotalCount = totalStars - barCount - haloCount;

  const cosBar = Math.cos(MILKY_WAY_NASA_DATA.barAngleRad);
  const sinBar = Math.sin(MILKY_WAY_NASA_DATA.barAngleRad);

  let idx = 0;

  // 1. ORGANIC TRIAXIAL CENTRAL GALACTIC BAR & GOLDEN BULGE (Spitzer GLIMPSE 27 deg Bar)
  for (let i = 0; i < barCount; i++) {
    const [bx, bz] = sampleOrganicGalacticBar(rng, 21.8, 30.5);

    const lx = bx * cosBar - bz * sinBar;
    const lz = bx * sinBar + bz * cosBar;
    const r2d = Math.hypot(lx, lz);
    const radialNorm = Math.min(1, r2d / 38.0);
    const ly = gaussianRandom(rng) * (2.4 * (1.0 - radialNorm * 0.42));

    positions[idx * 3] = lx;
    positions[idx * 3 + 1] = ly;
    positions[idx * 3 + 2] = lz;

    // Balanced warm golden-amber bulge palette (prevents additive white clipping)
    const warmMix = rng();
    const fade = 0.72 + 0.24 * smoothstep01(21.8, 31.0, r2d);
    colors[idx * 3] = (0.86 + 0.08 * warmMix) * fade;
    colors[idx * 3 + 1] = (0.68 + 0.16 * warmMix) * fade;
    colors[idx * 3 + 2] = (0.44 + 0.24 * warmMix) * fade;

    sizes[idx] = 0.8 + Math.pow(rng(), 2.9) * 2.1;
    phases[idx] = rng() * Math.PI * 2;
    idx++;
  }

  // 2. FOUR LOGARITHMIC SPIRAL ARMS + BALANCED ORION-CYGNUS LOCAL SPUR
  for (const arm of MILKY_WAY_SPIRAL_ARMS) {
    const armStars = Math.floor(armTotalCount * arm.starShare);
    const isLocalSpur = arm.id === 'orion-spur';
    for (let i = 0; i < armStars && idx < totalStars - haloCount; i++) {
      // Smooth distribution along arm; Orion Spur uses a bell-shaped radial profile so both ends taper gently
      const t = isLocalSpur
        ? Math.max(0.02, Math.min(0.98, 0.5 + gaussianRandom(rng) * 0.26))
        : Math.pow(rng(), 0.88);
      const baseR = arm.startRadius + t * (arm.endRadius - arm.startRadius);

      // Logarithmic spiral sweep
      const spiralTheta =
        arm.startAngleRad +
        arm.windFactor * Math.log(baseR / Math.max(12.0, arm.startRadius));

      // Arm width flares smoothly outward with radius (no blunt tips)
      const endSoftness = isLocalSpur ? 1.0 + 0.65 * Math.abs(t - 0.5) * 2.0 : 1.0;
      const localWidth = arm.widthUnits * (0.68 + 0.78 * t) * endSoftness;

      // Keep stars smoothly outside Sgr A*'s disk without hard boundary stacking
      let radialScatter = gaussianRandom(rng) * localWidth;
      let finalR = baseR + radialScatter;
      if (finalR < 22.0) {
        finalR = 22.0 + Math.abs(radialScatter) * 0.65 + rng() * 2.5;
        radialScatter = finalR - baseR;
      } else if (finalR > 92.0) {
        finalR = 92.0 - Math.abs(radialScatter) * 0.5 - rng() * 3.0;
        radialScatter = finalR - baseR;
      }

      const angularScatter =
        (gaussianRandom(rng) * localWidth * 0.58) / Math.max(18.0, baseR);
      const finalTheta = spiralTheta + angularScatter;

      const lx = Math.cos(finalTheta) * finalR;
      const lz = Math.sin(finalTheta) * finalR;
      // Thin Milky Way disk (~1,000 ly -> ~1.6 units vertical thickness)
      const ly = gaussianRandom(rng) * (0.75 + 0.55 * (1.0 - t));

      positions[idx * 3] = lx;
      positions[idx * 3 + 1] = ly;
      positions[idx * 3 + 2] = lz;

      // Spectral distribution along spiral arms:
      // Bright young blue-white O/B stars near arm ridge, warm gold F/G stars further out, rose H-II pockets
      const ridgeProximity = Math.exp(
        -(radialScatter * radialScatter) / (localWidth * localWidth * 0.48)
      );
      const roll = rng();
      // Gently attenuate Orion Spur brightness slightly so it reads as a delicate minor branch like NASA's map
      const spurScale = isLocalSpur ? 0.86 : 1.0;

      if (roll < 0.075 * ridgeProximity) {
        // Pink/rose H-alpha star-forming H-II region
        colors[idx * 3] = 0.92 * spurScale;
        colors[idx * 3 + 1] = (0.44 + 0.16 * rng()) * spurScale;
        colors[idx * 3 + 2] = (0.66 + 0.14 * rng()) * spurScale;
        sizes[idx] = 1.4 + rng() * 1.9;
      } else if (roll < 0.56 * ridgeProximity + 0.15) {
        // Hot young blue-white O/B spiral arm stars
        const cool = rng();
        colors[idx * 3] = (0.62 + 0.30 * cool) * spurScale;
        colors[idx * 3 + 1] = (0.78 + 0.18 * cool) * spurScale;
        colors[idx * 3 + 2] = 0.96 * spurScale;
        sizes[idx] = 0.8 + Math.pow(rng(), 2.6) * 2.3;
      } else {
        // Solar-like cream / pale gold / soft white disk stars
        const s = rng();
        colors[idx * 3] = 0.92 * spurScale;
        colors[idx * 3 + 1] = (0.82 + 0.12 * s) * spurScale;
        colors[idx * 3 + 2] = (0.64 + 0.24 * s) * spurScale;
        sizes[idx] = 0.72 + Math.pow(rng(), 3.0) * 1.9;
      }

      phases[idx] = rng() * Math.PI * 2;
      idx++;
    }
  }

  // 3. DIFFUSE INTER-ARM DISK & OUTER GALACTIC HALO
  while (idx < totalStars) {
    const theta = rng() * Math.PI * 2;
    const r = 22.5 + Math.pow(rng(), 0.74) * 71.0;
    const isHalo = rng() < 0.24;
    const ly = gaussianRandom(rng) * (isHalo ? 7.5 : 1.5);

    positions[idx * 3] = Math.cos(theta) * r;
    positions[idx * 3 + 1] = ly;
    positions[idx * 3 + 2] = Math.sin(theta) * r;

    const dim = 0.42 + 0.38 * rng();
    colors[idx * 3] = 0.78 * dim;
    colors[idx * 3 + 1] = 0.82 * dim;
    colors[idx * 3 + 2] = 0.94 * dim;
    sizes[idx] = 0.7 + rng() * 1.4;
    phases[idx] = rng() * Math.PI * 2;
    idx++;
  }

  return { positions, colors, sizes, phases, count: totalStars };
}

/**
 * Generates ~420 soft glowing volumetric H-II nebulae, blue star-forming clouds, and warm central bar haze
 * weighted proportionally across NASA's Milky Way spiral arms and organic elliptical bar.
 */
export function generateMilkyWayNebulae(
  totalClouds = 420,
  seed = 19950401
): MilkyWayParticleData {
  const rng = createSeededRng(seed);
  const positions = new Float32Array(totalClouds * 3);
  const colors = new Float32Array(totalClouds * 3);
  const sizes = new Float32Array(totalClouds);
  const phases = new Float32Array(totalClouds);

  const barClouds = Math.floor(totalClouds * 0.16);
  const cosBar = Math.cos(MILKY_WAY_NASA_DATA.barAngleRad);
  const sinBar = Math.sin(MILKY_WAY_NASA_DATA.barAngleRad);

  let idx = 0;

  // Soft warm golden haze along the organic 27 deg Galactic Bar (zero straight walls, clear of Sgr A* disk)
  for (let i = 0; i < barClouds; i++) {
    const [bx, bz] = sampleOrganicGalacticBar(rng, 25.0, 33.5);
    const lx = bx * cosBar - bz * sinBar;
    const lz = bx * sinBar + bz * cosBar;
    const ly = gaussianRandom(rng) * 1.2;

    positions[idx * 3] = lx;
    positions[idx * 3 + 1] = ly;
    positions[idx * 3 + 2] = lz;

    colors[idx * 3] = 0.68;
    colors[idx * 3 + 1] = 0.50;
    colors[idx * 3 + 2] = 0.30;
    sizes[idx] = 11.0 + rng() * 10.0;
    phases[idx] = rng() * Math.PI * 2;
    idx++;
  }

  // Soft sapphire & magenta-rose H-II nebulae weighted proportionally by arm starShare
  while (idx < totalClouds) {
    const arm = pickWeightedSpiralArm(rng);
    const isLocalSpur = arm.id === 'orion-spur';
    const t = isLocalSpur
      ? Math.max(0.08, Math.min(0.92, 0.5 + gaussianRandom(rng) * 0.24))
      : Math.pow(rng(), 0.92);
    const baseR = arm.startRadius + t * (arm.endRadius - arm.startRadius);
    const spiralTheta =
      arm.startAngleRad +
      arm.windFactor * Math.log(baseR / Math.max(12.0, arm.startRadius));

    const scatterR = gaussianRandom(rng) * (arm.widthUnits * 0.6);
    const r = Math.max(23.5, baseR + scatterR);
    const lx = Math.cos(spiralTheta) * r;
    const lz = Math.sin(spiralTheta) * r;
    const ly = gaussianRandom(rng) * 0.65;

    positions[idx * 3] = lx;
    positions[idx * 3 + 1] = ly;
    positions[idx * 3 + 2] = lz;

    const isHAlpha = rng() < 0.32;
    if (isHAlpha) {
      // H-II Magenta/Rose star-forming nebula (Orion, Carina, Eagle, Lagoon)
      colors[idx * 3] = 0.82;
      colors[idx * 3 + 1] = 0.32;
      colors[idx * 3 + 2] = 0.54;
      sizes[idx] = 10.5 + rng() * 10.0;
    } else if (isLocalSpur) {
      // Delicate pale golden-blue local Orion Spur dust glow
      colors[idx * 3] = 0.62;
      colors[idx * 3 + 1] = 0.68;
      colors[idx * 3 + 2] = 0.82;
      sizes[idx] = 10.0 + rng() * 8.0;
    } else {
      // Sapphire-indigo young spiral arm dust & OB association glow
      colors[idx * 3] = 0.34;
      colors[idx * 3 + 1] = 0.54;
      colors[idx * 3 + 2] = 0.92;
      sizes[idx] = 13.0 + rng() * 15.0;
    }

    phases[idx] = rng() * Math.PI * 2;
    idx++;
  }

  return { positions, colors, sizes, phases, count: totalClouds };
}

/**
 * Generates a 3D volumetric Milky Way starfield directly in kiloparsecs (kpc) aligned 1:1
 * with NASA/JPL-Caltech (R. Hurt / Spitzer GLIMPSE / Reid et al. 2019) barred-spiral morphology:
 * - Full creamy-gold triaxial central Galactic Bar (r = 0..4.4 kpc, tilted -54° in XZ; ZERO hollow center hole)
 * - 4 tightly-wound logarithmic spiral arms (Scutum-Centaurus, Perseus, Sagittarius-Carina, Norma-Outer)
 *   winding counter-clockwise outward (pitch ~12.4°, k = 4.55) with crisp OB blue-white ridges & pink H-II knots
 * - Orion-Cygnus Local Spur passing through the Solar System at (-8.178, 0.02, 0) kpc
 * - Smooth exponential outer disk & stellar halo fading organically to 19.5 kpc (ZERO hard circular edge)
 */
export function generateNasaMilkyWayKpcStarfield(
  totalStars = 20000,
  seed = 20220512
): MilkyWayParticleData {
  const rng = createSeededRng(seed);
  const positions = new Float32Array(totalStars * 3);
  const colors = new Float32Array(totalStars * 3);
  const sizes = new Float32Array(totalStars);
  const phases = new Float32Array(totalStars);

  // Shared NASA R. Hurt geometry constants (synchronized with createMilkyWayParametricDiskMaterial)
  const barAngle = -0.95; // -54.4° in Three.js XZ (top-right to bottom-left diagonal)
  const cosBar = Math.cos(barAngle);
  const sinBar = Math.sin(barAngle);
  const r0 = 3.15; // kpc bar-tip launch radius
  const pitchK = 4.55; // cot(12.4°)

  const armDefs = [
    { startAngle: barAngle, isMajor: true, share: 0.275, maxR: 17.5, widthBase: 0.42 }, // Scutum-Centaurus
    { startAngle: barAngle + Math.PI, isMajor: true, share: 0.275, maxR: 18.0, widthBase: 0.42 }, // Perseus
    { startAngle: barAngle + 1.57, isMajor: false, share: 0.19, maxR: 16.5, widthBase: 0.36 }, // Sagittarius-Carina
    { startAngle: barAngle - 1.57, isMajor: false, share: 0.21, maxR: 18.8, widthBase: 0.38 }, // Norma-Outer
  ];

  const barCount = Math.floor(totalStars * 0.20);
  const orionCount = Math.floor(totalStars * 0.035);
  const haloCount = Math.floor(totalStars * 0.185);
  const armTotalCount = totalStars - barCount - orionCount - haloCount;

  let idx = 0;

  // 1. FULL CREAMY-GOLD CENTRAL GALACTIC BAR & NUCLEAR BULGE (r = 0..4.6 kpc, zero donut cutout!)
  for (let i = 0; i < barCount; i++) {
    const isNuclearBulge = rng() < 0.38;
    let bx: number;
    let bz: number;
    if (isNuclearBulge) {
      bx = gaussianRandom(rng) * 1.45;
      bz = gaussianRandom(rng) * 1.15;
    } else {
      // Elongated triaxial peanut-ellipse bar
      bx = gaussianRandom(rng) * 2.35;
      const tipTaper = 1.0 / (1.0 + Math.pow(Math.abs(bx) / 3.6, 2.4));
      bz = gaussianRandom(rng) * (0.48 + 0.56 * tipTaper);
      // Gentle counter-clockwise S-twist at outer bar tips into Scutum-Centaurus & Perseus
      bz -= Math.sign(bx) * Math.pow(Math.max(0, Math.abs(bx) - 2.2) / 2.6, 1.7) * 0.55;
    }

    const rBar = Math.hypot(bx, bz);
    if (rBar > 5.8) {
      const s = 5.8 / rBar;
      bx *= s;
      bz *= s;
    }

    const lx = bx * cosBar - bz * sinBar;
    const lz = bx * sinBar + bz * cosBar;
    const ly = gaussianRandom(rng) * (0.58 * Math.exp(-rBar / 4.2) + 0.12);

    positions[idx * 3] = lx;
    positions[idx * 3 + 1] = ly;
    positions[idx * 3 + 2] = lz;

    // Warm creamy-gold / pale-amber K & G bulge giants (NASA R. Hurt central bar hue)
    const coreProx = Math.exp(-(rBar * rBar) / 5.5);
    const w = rng();
    const bright = 0.58 + 0.34 * coreProx;
    colors[idx * 3] = (0.98 - 0.08 * w) * bright;
    colors[idx * 3 + 1] = (0.86 - 0.12 * w) * bright;
    colors[idx * 3 + 2] = (0.56 + 0.18 * coreProx - 0.10 * w) * bright;
    sizes[idx] = 0.72 + Math.pow(rng(), 3.2) * 1.65;
    phases[idx] = rng() * Math.PI * 2;
    idx++;
  }

  // 2. FOUR TIGHTLY-WOUND LOGARITHMIC SPIRAL ARMS (counter-clockwise outward from bar tips)
  for (const arm of armDefs) {
    const count = Math.floor(armTotalCount * arm.share);
    for (let i = 0; i < count && idx < totalStars - orionCount - haloCount; i++) {
      // Exponential-weighted radial sampling -> denser in inner-mid galaxy, smoothly vanishing past 15-18 kpc
      const u = Math.pow(rng(), 0.78);
      const baseR = r0 + u * (arm.maxR - r0);
      const radialFade = Math.exp(-Math.max(0, baseR - 3.2) / 7.8) * smoothstep01(arm.maxR + 1.2, 11.5, baseR);

      // Counter-clockwise logarithmic spiral: theta decreases as r grows
      const spiralTheta = arm.startAngle - pitchK * Math.log(baseR / r0);
      const localWidth = arm.widthBase * (0.72 + 1.25 * u);
      const radialScatter = gaussianRandom(rng) * localWidth;
      const finalR = Math.max(2.6, baseR + radialScatter);
      const angularScatter = (gaussianRandom(rng) * localWidth * 0.42) / Math.max(2.8, finalR);
      const finalTheta = spiralTheta + angularScatter;

      const lx = Math.cos(finalTheta) * finalR;
      const lz = Math.sin(finalTheta) * finalR;
      const ly = gaussianRandom(rng) * (0.14 + 0.24 * Math.exp(-finalR / 8.5));

      positions[idx * 3] = lx;
      positions[idx * 3 + 1] = ly;
      positions[idx * 3 + 2] = lz;

      const ridgeProx = Math.exp(
        -(radialScatter * radialScatter) / Math.max(0.04, localWidth * localWidth * 0.45)
      );
      const roll = rng();
      const lum = (0.48 + 0.52 * radialFade) * (arm.isMajor ? 1.0 : 0.86);

      if (roll < 0.10 * ridgeProx) {
        // Ruby-pink / rose H-II star-forming nebular knots beaded along arm ridges
        colors[idx * 3] = 0.98 * lum;
        colors[idx * 3 + 1] = (0.36 + 0.16 * rng()) * lum;
        colors[idx * 3 + 2] = (0.58 + 0.16 * rng()) * lum;
        sizes[idx] = 1.25 + Math.pow(rng(), 2.0) * 1.85;
      } else if (roll < 0.64 * ridgeProx + 0.12) {
        // Icy blue-white young OB associations along the spiral ridge
        const c = rng();
        colors[idx * 3] = (0.68 + 0.28 * c) * lum;
        colors[idx * 3 + 1] = (0.80 + 0.18 * c) * lum;
        colors[idx * 3 + 2] = 1.0 * lum;
        sizes[idx] = 0.72 + Math.pow(rng(), 2.8) * 1.95;
      } else {
        // Dusty periwinkle-blue & soft cream disk stars
        const s = rng();
        colors[idx * 3] = (0.64 + 0.24 * s) * lum;
        colors[idx * 3 + 1] = (0.70 + 0.18 * s) * lum;
        colors[idx * 3 + 2] = (0.86 + 0.10 * s) * lum;
        sizes[idx] = 0.62 + Math.pow(rng(), 3.1) * 1.35;
      }

      phases[idx] = rng() * Math.PI * 2;
      idx++;
    }
  }

  // 3. ORION-CYGNUS LOCAL SPUR passing cleanly through Solar System (-8.178, 0) kpc
  for (let i = 0; i < orionCount && idx < totalStars - haloCount; i++) {
    const t = Math.max(-1, Math.min(1, gaussianRandom(rng) * 0.42));
    const baseR = 8.18 + t * 1.45;
    const baseTheta = Math.PI - pitchK * Math.log(baseR / 8.18);
    const scatterR = gaussianRandom(rng) * 0.34;
    const finalR = Math.max(6.4, baseR + scatterR);
    const finalTheta = baseTheta + (gaussianRandom(rng) * 0.12) / finalR;

    positions[idx * 3] = Math.cos(finalTheta) * finalR;
    positions[idx * 3 + 1] = gaussianRandom(rng) * 0.14;
    positions[idx * 3 + 2] = Math.sin(finalTheta) * finalR;

    const isPink = rng() < 0.12;
    const taper = Math.exp(-t * t * 1.8) * 0.84;
    if (isPink) {
      colors[idx * 3] = 0.96 * taper;
      colors[idx * 3 + 1] = 0.42 * taper;
      colors[idx * 3 + 2] = 0.62 * taper;
      sizes[idx] = 1.1 + rng() * 1.3;
    } else {
      colors[idx * 3] = 0.78 * taper;
      colors[idx * 3 + 1] = 0.86 * taper;
      colors[idx * 3 + 2] = 1.0 * taper;
      sizes[idx] = 0.72 + Math.pow(rng(), 2.8) * 1.5;
    }
    phases[idx] = rng() * Math.PI * 2;
    idx++;
  }

  // 4. SMOOTH EXPONENTIAL INTER-ARM DISK & OUTER STELLAR HALO (fades organically out to ~20 kpc, zero hard edge!)
  while (idx < totalStars) {
    const theta = rng() * Math.PI * 2;
    // Exponential radial distribution: -R_d * ln(1 - u) -> smooth natural disk falloff with zero outer ring cutoff!
    const u = Math.min(0.996, rng());
    const r = Math.min(20.5, -5.6 * Math.log(1.0 - u));
    const isHalo = rng() < 0.22;
    const ly = gaussianRandom(rng) * (isHalo ? 1.85 * Math.exp(-r / 12.0) + 0.35 : 0.28);

    positions[idx * 3] = Math.cos(theta) * r;
    positions[idx * 3 + 1] = ly;
    positions[idx * 3 + 2] = Math.sin(theta) * r;

    const outerFade = smoothstep01(20.5, 10.5, r);
    const dim = (0.30 + 0.36 * rng()) * (0.25 + 0.75 * outerFade);
    const warmCore = Math.exp(-(r * r) / 16.0);
    colors[idx * 3] = (0.58 + 0.36 * warmCore) * dim;
    colors[idx * 3 + 1] = (0.64 + 0.20 * warmCore) * dim;
    colors[idx * 3 + 2] = (0.86 - 0.24 * warmCore) * dim;
    sizes[idx] = 0.58 + Math.pow(rng(), 3.0) * 1.15;
    phases[idx] = rng() * Math.PI * 2;
    idx++;
  }

  return { positions, colors, sizes, phases, count: totalStars };
}

