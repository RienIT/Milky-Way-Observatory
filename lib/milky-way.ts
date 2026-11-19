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
 * Exact 4 spiral arms + Orion-Cygnus Local Spur mapped by NASA/JPL-Caltech (Spitzer GLIMPSE & Gaia)
 */
export const MILKY_WAY_SPIRAL_ARMS: SpiralArmDefinition[] = [
  {
    id: 'scutum-centaurus',
    isMajor: true,
    startAngleRad: MILKY_WAY_NASA_DATA.barAngleRad,
    startRadius: 20.5,
    endRadius: 86.0,
    windFactor: 3.15,
    widthUnits: 4.8,
    starShare: 0.28,
    nebulaTintHex: '#f472b6',
  },
  {
    id: 'perseus',
    isMajor: true,
    startAngleRad: MILKY_WAY_NASA_DATA.barAngleRad + Math.PI,
    startRadius: 20.5,
    endRadius: 88.0,
    windFactor: 3.15,
    widthUnits: 4.8,
    starShare: 0.28,
    nebulaTintHex: '#60a5fa',
  },
  {
    id: 'sagittarius-carina',
    isMajor: false,
    startAngleRad: MILKY_WAY_NASA_DATA.barAngleRad + Math.PI * 0.52,
    startRadius: 21.5,
    endRadius: 79.0,
    windFactor: 3.05,
    widthUnits: 3.7,
    starShare: 0.16,
    nebulaTintHex: '#e879f9',
  },
  {
    id: 'norma-outer',
    isMajor: false,
    startAngleRad: MILKY_WAY_NASA_DATA.barAngleRad + Math.PI * 1.52,
    startRadius: 21.5,
    endRadius: 84.0,
    windFactor: 3.05,
    widthUnits: 3.7,
    starShare: 0.16,
    nebulaTintHex: '#38bdf8',
  },
  {
    id: 'orion-spur',
    isMajor: false,
    startAngleRad: 0.65,
    startRadius: 37.5,
    endRadius: 56.5,
    windFactor: 1.55,
    widthUnits: 2.9,
    starShare: 0.12,
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
 * - 18% Central Galactic Bulge & 27° Elongated Stellar Bar (warm K/M gold-amber giants)
 * - 72% 4 Logarithmic Spiral Arms + Orion-Cygnus Spur (hot blue-white O/B stars + solar F/G stars + H-II pockets)
 * - 10% Diffuse Galactic Disk & Stellar Halo
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

  const barCount = Math.floor(totalStars * 0.19);
  const haloCount = Math.floor(totalStars * 0.11);
  const armTotalCount = totalStars - barCount - haloCount;

  const cosBar = Math.cos(MILKY_WAY_NASA_DATA.barAngleRad);
  const sinBar = Math.sin(MILKY_WAY_NASA_DATA.barAngleRad);

  let idx = 0;

  // 1. CENTRAL GALACTIC BAR & GOLDEN BULGE (Spitzer GLIMPSE 27° Bar, keeping center hollow outside Sgr A* accretion disk)
  for (let i = 0; i < barCount; i++) {
    // Elongated ellipsoidal bar along barAngleRad, clear of immediate black hole accretion disk (r > 22.5)
    let bx = gaussianRandom(rng) * 16.5;
    let bz = gaussianRandom(rng) * 5.2;
    const r2d = Math.hypot(bx, bz);
    if (r2d < 22.5) {
      const push = (22.5 + rng() * 9.5) / Math.max(0.5, r2d);
      bx *= push;
      bz *= push * 0.68;
    }
    bx = Math.max(-30.0, Math.min(30.0, bx));
    bz = Math.max(-13.5, Math.min(13.5, bz));

    const lx = bx * cosBar - bz * sinBar;
    const lz = bx * sinBar + bz * cosBar;
    const radialNorm = Math.min(1, Math.hypot(lx, lz) / 26.0);
    const ly = gaussianRandom(rng) * (2.6 * (1.0 - radialNorm * 0.45));

    positions[idx * 3] = lx;
    positions[idx * 3 + 1] = ly;
    positions[idx * 3 + 2] = lz;

    // Warm cream-gold -> amber-peach bulge palette
    const warmMix = rng();
    colors[idx * 3] = 0.96 + 0.04 * warmMix;
    colors[idx * 3 + 1] = 0.76 + 0.18 * warmMix;
    colors[idx * 3 + 2] = 0.48 + 0.28 * warmMix;

    sizes[idx] = 0.9 + Math.pow(rng(), 2.8) * 2.4;
    phases[idx] = rng() * Math.PI * 2;
    idx++;
  }

  // 2. FOUR LOGARITHMIC SPIRAL ARMS + ORION-CYGNUS LOCAL SPUR
  for (const arm of MILKY_WAY_SPIRAL_ARMS) {
    const armStars = Math.floor(armTotalCount * arm.starShare);
    for (let i = 0; i < armStars && idx < totalStars - haloCount; i++) {
      // Bias slightly denser toward inner-mid spiral arms, tapering gracefully out to 88 units
      const t = Math.pow(rng(), 0.88);
      const baseR = arm.startRadius + t * (arm.endRadius - arm.startRadius);
      // Logarithmic spiral sweep
      const spiralTheta =
        arm.startAngleRad +
        arm.windFactor * Math.log(baseR / Math.max(12.0, arm.startRadius));

      // Arm width flares smoothly outward with radius
      const localWidth = arm.widthUnits * (0.65 + 0.75 * t);
      const radialScatter = gaussianRandom(rng) * localWidth;
      const angularScatter =
        (gaussianRandom(rng) * localWidth * 0.55) / Math.max(18.0, baseR);

      const finalR = Math.max(20.0, Math.min(92.0, baseR + radialScatter));
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
        -(radialScatter * radialScatter) / (localWidth * localWidth * 0.45)
      );
      const roll = rng();

      if (roll < 0.08 * ridgeProximity) {
        // Pink/rose H-alpha star-forming H-II region
        colors[idx * 3] = 0.96;
        colors[idx * 3 + 1] = 0.44 + 0.16 * rng();
        colors[idx * 3 + 2] = 0.68 + 0.14 * rng();
        sizes[idx] = 1.6 + rng() * 2.2;
      } else if (roll < 0.58 * ridgeProximity + 0.15) {
        // Hot young blue-white O/B spiral arm stars
        const cool = rng();
        colors[idx * 3] = 0.62 + 0.32 * cool;
        colors[idx * 3 + 1] = 0.78 + 0.19 * cool;
        colors[idx * 3 + 2] = 0.98;
        sizes[idx] = 0.85 + Math.pow(rng(), 2.5) * 2.5;
      } else {
        // Solar-like cream / pale gold / soft white disk stars
        const s = rng();
        colors[idx * 3] = 0.95;
        colors[idx * 3 + 1] = 0.84 + 0.12 * s;
        colors[idx * 3 + 2] = 0.66 + 0.24 * s;
        sizes[idx] = 0.75 + Math.pow(rng(), 3.0) * 2.0;
      }

      phases[idx] = rng() * Math.PI * 2;
      idx++;
    }
  }

  // 3. DIFFUSE INTER-ARM DISK & OUTER GALACTIC HALO
  while (idx < totalStars) {
    const theta = rng() * Math.PI * 2;
    const r = 22.0 + Math.pow(rng(), 0.72) * 72.0;
    const isHalo = rng() < 0.22;
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
 * along NASA's Milky Way spiral arms to give painterly astronomical depth.
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

  const barClouds = Math.floor(totalClouds * 0.22);
  const cosBar = Math.cos(MILKY_WAY_NASA_DATA.barAngleRad);
  const sinBar = Math.sin(MILKY_WAY_NASA_DATA.barAngleRad);

  let idx = 0;

  // Warm golden haze along the 27° Galactic Bar (safely outside Sgr A* accretion disk to avoid edge-on additive blowout)
  for (let i = 0; i < barClouds; i++) {
    let bx = gaussianRandom(rng) * 16.5;
    let bz = gaussianRandom(rng) * 4.8;
    if (Math.hypot(bx, bz) < 26.5) {
      bx = (bx >= 0 ? 1 : -1) * (26.5 + rng() * 9.5);
    }
    const lx = bx * cosBar - bz * sinBar;
    const lz = bx * sinBar + bz * cosBar;
    const ly = gaussianRandom(rng) * 1.25;

    positions[idx * 3] = lx;
    positions[idx * 3 + 1] = ly;
    positions[idx * 3 + 2] = lz;

    colors[idx * 3] = 0.76;
    colors[idx * 3 + 1] = 0.56;
    colors[idx * 3 + 2] = 0.34;
    sizes[idx] = 12.0 + rng() * 11.0;
    phases[idx] = rng() * Math.PI * 2;
    idx++;
  }

  // Soft sapphire & magenta-rose H-II nebulae tracing the 4 spiral arms + Orion Spur
  while (idx < totalClouds) {
    const arm = MILKY_WAY_SPIRAL_ARMS[idx % MILKY_WAY_SPIRAL_ARMS.length];
    const t = Math.pow(rng(), 0.92);
    const baseR = arm.startRadius + t * (arm.endRadius - arm.startRadius);
    const spiralTheta =
      arm.startAngleRad +
      arm.windFactor * Math.log(baseR / Math.max(12.0, arm.startRadius));

    const scatterR = gaussianRandom(rng) * (arm.widthUnits * 0.55);
    const r = Math.max(21.0, baseR + scatterR);
    const lx = Math.cos(spiralTheta) * r;
    const lz = Math.sin(spiralTheta) * r;
    const ly = gaussianRandom(rng) * 0.65;

    positions[idx * 3] = lx;
    positions[idx * 3 + 1] = ly;
    positions[idx * 3 + 2] = lz;

    const isHAlpha = rng() < 0.34;
    if (isHAlpha) {
      // H-II Magenta/Rose star-forming nebula (Orion, Carina, Eagle, Lagoon)
      colors[idx * 3] = 0.88;
      colors[idx * 3 + 1] = 0.34;
      colors[idx * 3 + 2] = 0.58;
      sizes[idx] = 11.0 + rng() * 11.0;
    } else if (arm.id === 'orion-spur') {
      // Soft golden-blue local Orion Spur glow
      colors[idx * 3] = 0.78;
      colors[idx * 3 + 1] = 0.82;
      colors[idx * 3 + 2] = 0.96;
      sizes[idx] = 12.0 + rng() * 10.0;
    } else {
      // Sapphire-indigo young spiral arm dust & OB association glow
      colors[idx * 3] = 0.36;
      colors[idx * 3 + 1] = 0.58;
      colors[idx * 3 + 2] = 0.96;
      sizes[idx] = 14.0 + rng() * 16.0;
    }

    phases[idx] = rng() * Math.PI * 2;
    idx++;
  }

  return { positions, colors, sizes, phases, count: totalClouds };
}
