/**
 * Multi-Scale Precision & Floating-Origin Architecture (Phase 1).
 *
 * Internal units: SI meters in IEEE-754 float64.
 *
 * Coordinate Convention (Galactocentric J2000 Right-Handed -> Three.js Y-Up):
 *   In Galactic Cartesian:
 *     +X_gal points from Sun toward Galactic Center (l = 0, b = 0)
 *     +Y_gal points in direction of Galactic rotation (l = 90, b = 0)
 *     +Z_gal points toward North Galactic Pole (b = +90)
 *   Mapped into Three.js Y-up screen space via pure right-handed -90 deg X rotation:
 *     x_three =  X_gal
 *     y_three =  Z_gal   (Galactic North = +Y up)
 *     z_three = -Y_gal
 *
 * Floating-Origin + Hierarchical Anchor Representation:
 *   To guarantee sub-meter precision (<1 km altitude at Earth's surface) even though
 *   Earth is ~2.52e20 m (8.178 kpc) from Sagittarius A* (where raw float64 ULP would
 *   be ~28 km), positions carry an explicit AnchorFrameId ('earth' | 'heliocentric' | 'galactic')
 *   and a float64 offsetM in meters. Subtracting two positions in the same anchor preserves
 *   full 53-bit float64 precision (~1e-9 m at Earth's surface) before casting to float32 for GPU!
 */

import {
  AU_IN_METERS,
  KILOPARSEC_METERS,
  LIGHT_YEAR_METERS,
  MEGAPARSEC_METERS,
  METERS_PER_KM,
  PARSEC_METERS,
} from './constants';

export type Vec3d = readonly [number, number, number];
export type MutableVec3d = [number, number, number];

export type DistanceUnit = 'm' | 'km' | 'AU' | 'ly' | 'pc' | 'kpc' | 'Mpc';

export type ScaleLayerId = 'planetary' | 'stellar' | 'galactic' | 'extragalactic';

export type AnchorFrameId = 'earth' | 'heliocentric' | 'galactic';

export interface UniversePosition {
  anchor: AnchorFrameId;
  offsetM: Vec3d;
}

export interface AnchorOriginsM {
  /** Heliocentric origin (Sun center) in Galactocentric Three.js Y-up meters. */
  sunInGalacticM: Vec3d;
  /** Earth center in Heliocentric Three.js Y-up meters (for current ephemeris Date). */
  earthInHelioM: Vec3d;
}

// ---------------------------------------------------------------------------
// Exact Float64 Unit Conversions
// ---------------------------------------------------------------------------

export function kmToMeters(km: number): number {
  return km * METERS_PER_KM;
}
export function metersToKm(m: number): number {
  return m / METERS_PER_KM;
}
export function auToMeters(au: number): number {
  return au * AU_IN_METERS;
}
export function metersToAu(m: number): number {
  return m / AU_IN_METERS;
}
export function lyToMeters(ly: number): number {
  return ly * LIGHT_YEAR_METERS;
}
export function metersToLy(m: number): number {
  return m / LIGHT_YEAR_METERS;
}
export function pcToMeters(pc: number): number {
  return pc * PARSEC_METERS;
}
export function metersToPc(m: number): number {
  return m / PARSEC_METERS;
}
export function kpcToMeters(kpc: number): number {
  return kpc * KILOPARSEC_METERS;
}
export function metersToKpc(m: number): number {
  return m / KILOPARSEC_METERS;
}
export function mpcToMeters(mpc: number): number {
  return mpc * MEGAPARSEC_METERS;
}
export function metersToMpc(m: number): number {
  return m / MEGAPARSEC_METERS;
}

/** Convert between Galactic Cartesian (X_gal, Y_gal, Z_gal) and Three.js Y-up (X, Y, Z). */
export function galacticToThreeUp(gal: Vec3d): Vec3d {
  return [gal[0], gal[2], -gal[1]];
}

export function threeUpToGalactic(threeVec: Vec3d): Vec3d {
  return [threeVec[0], -threeVec[2], threeVec[1]];
}

// ---------------------------------------------------------------------------
// Float64 Vector Algebra & Hierarchical Floating-Origin Subtraction
// ---------------------------------------------------------------------------

export function addVec3d(a: Vec3d, b: Vec3d): Vec3d {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function subVec3d(a: Vec3d, b: Vec3d): Vec3d {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function scaleVec3d(v: Vec3d, s: number): Vec3d {
  return [v[0] * s, v[1] * s, v[2] * s];
}

export function lengthVec3d(v: Vec3d): number {
  return Math.hypot(v[0], v[1], v[2]);
}

export function distanceVec3d(a: Vec3d, b: Vec3d): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export function normalizeVec3d(v: Vec3d): Vec3d {
  const len = Math.hypot(v[0], v[1], v[2]);
  if (len <= 0 || !Number.isFinite(len)) return [0, 0, 1];
  return [v[0] / len, v[1] / len, v[2] / len];
}

/**
 * Exact float64 displacement vector (target - camera) in SI meters,
 * preserving full precision inside local anchors ('earth' or 'heliocentric')
 * while seamlessly transforming across anchor boundaries.
 */
export function computeRelativeMeters(
  target: UniversePosition,
  camera: UniversePosition,
  origins: AnchorOriginsM
): Vec3d {
  // Fast & exact path: same anchor -> direct subtraction preserves 53-bit precision
  if (target.anchor === camera.anchor) {
    return subVec3d(target.offsetM, camera.offsetM);
  }

  // Earth <-> Heliocentric (stays well inside ~1 AU, sub-millimeter precision)
  if (target.anchor === 'earth' && camera.anchor === 'heliocentric') {
    return [
      target.offsetM[0] + origins.earthInHelioM[0] - camera.offsetM[0],
      target.offsetM[1] + origins.earthInHelioM[1] - camera.offsetM[1],
      target.offsetM[2] + origins.earthInHelioM[2] - camera.offsetM[2],
    ];
  }
  if (target.anchor === 'heliocentric' && camera.anchor === 'earth') {
    return [
      target.offsetM[0] - (camera.offsetM[0] + origins.earthInHelioM[0]),
      target.offsetM[1] - (camera.offsetM[1] + origins.earthInHelioM[1]),
      target.offsetM[2] - (camera.offsetM[2] + origins.earthInHelioM[2]),
    ];
  }

  // Convert both to Galactocentric meters (needed only for interstellar/galactic separation)
  const toGalactic = (p: UniversePosition): Vec3d => {
    if (p.anchor === 'galactic') return p.offsetM;
    if (p.anchor === 'heliocentric') return addVec3d(origins.sunInGalacticM, p.offsetM);
    return addVec3d(origins.sunInGalacticM, addVec3d(origins.earthInHelioM, p.offsetM));
  };

  return subVec3d(toGalactic(target), toGalactic(camera));
}

/**
 * Compute GPU float32-safe camera-relative coordinates for a given scale layer.
 * Camera is always at (0, 0, 0) in render space!
 */
export function computeCameraRelativeGpuPos(
  objAbsM: Vec3d,
  camAbsM: Vec3d,
  metersPerUnit: number
): [number, number, number] {
  const dx = (objAbsM[0] - camAbsM[0]) / metersPerUnit;
  const dy = (objAbsM[1] - camAbsM[1]) / metersPerUnit;
  const dz = (objAbsM[2] - camAbsM[2]) / metersPerUnit;
  return [Math.fround(dx), Math.fround(dy), Math.fround(dz)];
}

/**
 * Compute GPU float32-safe camera-relative coordinates from hierarchical UniversePositions.
 */
export function computeAnchoredCameraRelativeGpuPos(
  target: UniversePosition,
  camera: UniversePosition,
  origins: AnchorOriginsM,
  metersPerUnit: number
): [number, number, number] {
  const relM = computeRelativeMeters(target, camera, origins);
  return [
    Math.fround(relM[0] / metersPerUnit),
    Math.fround(relM[1] / metersPerUnit),
    Math.fround(relM[2] / metersPerUnit),
  ];
}

// ---------------------------------------------------------------------------
// Scale-Hierarchy Layer Definitions & Smooth Boundary Crossfades
// ---------------------------------------------------------------------------

export interface ScaleLayerConfig {
  id: ScaleLayerId;
  /** SI meters per 1.0 Three.js render unit in this layer. */
  metersPerUnit: number;
  /** Minimum log10(viewDistanceM) where this layer begins fading in. */
  fadeInStartLogM: number;
  /** log10(viewDistanceM) where this layer reaches full opacity. */
  fadeInEndLogM: number;
  /** log10(viewDistanceM) where this layer begins fading out. */
  fadeOutStartLogM: number;
  /** log10(viewDistanceM) where this layer reaches 0 opacity. */
  fadeOutEndLogM: number;
  /** Default camera near/far clip planes in layer units. */
  defaultNearUnits: number;
  defaultFarUnits: number;
}

/**
 * 4 continuous scale layers spanning 10^2 m (100 m above Earth's surface) to
 * 10^25.5 m (>300 Mpc, beyond Coma Cluster) with wide overlap crossfades.
 */
export const SCALE_LAYERS: Record<ScaleLayerId, ScaleLayerConfig> = {
  planetary: {
    id: 'planetary',
    metersPerUnit: 1e6, // 1 unit = 1,000 km (Earth radius = 6.371 u, 1 km alt = 0.001 u)
    fadeInStartLogM: 0,
    fadeInEndLogM: 0,
    fadeOutStartLogM: 13.8, // ~420 AU
    fadeOutEndLogM: 15.6,   // ~0.42 ly
    defaultNearUnits: 1e-4,
    defaultFarUnits: 2e7,
  },
  stellar: {
    id: 'stellar',
    metersPerUnit: LIGHT_YEAR_METERS, // 1 unit = 1 light-year
    fadeInStartLogM: 13.2,  // ~105 AU
    fadeInEndLogM: 15.2,    // ~0.17 ly
    fadeOutStartLogM: 19.6, // ~1.3 kpc
    fadeOutEndLogM: 21.0,   // ~32 kpc
    defaultNearUnits: 1e-4,
    defaultFarUnits: 5e4,
  },
  galactic: {
    id: 'galactic',
    metersPerUnit: KILOPARSEC_METERS, // 1 unit = 1 kpc (MW radius = 15.5 u)
    fadeInStartLogM: 18.2,  // ~51 pc
    fadeInEndLogM: 19.6,    // ~1.3 kpc
    fadeOutStartLogM: 22.8, // ~2 Mpc
    fadeOutEndLogM: 24.0,   // ~32 Mpc
    defaultNearUnits: 1e-4,
    defaultFarUnits: 2e4,
  },
  extragalactic: {
    id: 'extragalactic',
    metersPerUnit: MEGAPARSEC_METERS, // 1 unit = 1 Mpc (M31 = 0.778 u, Virgo = 16.5 u, Coma = 99 u)
    fadeInStartLogM: 20.6,  // ~13 kpc
    fadeInEndLogM: 21.8,    // ~205 kpc
    fadeOutStartLogM: 28.0,
    fadeOutEndLogM: 29.0,
    defaultNearUnits: 1e-4,
    defaultFarUnits: 5e3,
  },
};

export interface ScaleLayerWeights {
  planetary: number;
  stellar: number;
  galactic: number;
  extragalactic: number;
  dominant: ScaleLayerId;
}

function smoothstep01(edge0: number, edge1: number, x: number): number {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0;
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Compute smooth [0..1] visibility weights for all 4 scale layers from camera
 * viewing distance in meters. Guarantees smooth crossfading with zero popping.
 */
export function computeScaleLayerWeights(viewDistanceM: number): ScaleLayerWeights {
  const safeDist = Math.max(1, Number.isFinite(viewDistanceM) ? viewDistanceM : 1e7);
  const logD = Math.log10(safeDist);

  const weightFor = (cfg: ScaleLayerConfig): number => {
    const fadeIn =
      cfg.fadeInEndLogM <= cfg.fadeInStartLogM
        ? 1
        : smoothstep01(cfg.fadeInStartLogM, cfg.fadeInEndLogM, logD);
    const fadeOut =
      1 - smoothstep01(cfg.fadeOutStartLogM, cfg.fadeOutEndLogM, logD);
    return Math.max(0, Math.min(1, fadeIn * fadeOut));
  };

  const planetary = weightFor(SCALE_LAYERS.planetary);
  const stellar = weightFor(SCALE_LAYERS.stellar);
  const galactic = weightFor(SCALE_LAYERS.galactic);
  const extragalactic = weightFor(SCALE_LAYERS.extragalactic);

  let dominant: ScaleLayerId = 'planetary';
  if (logD < 14.5) {
    dominant = 'planetary';
  } else if (logD < 19.3) {
    dominant = 'stellar';
  } else if (logD < 21.7) {
    dominant = 'galactic';
  } else {
    dominant = 'extragalactic';
  }

  return { planetary, stellar, galactic, extragalactic, dominant };
}

/**
 * Compute tight, z-fighting-free dynamic near/far clip planes for a given layer
 * and distance-to-surface in meters. Keeps far/near well within WebGL2 log-depth precision.
 */
export function computeLayerClipPlanes(
  layer: ScaleLayerId,
  nearestSurfaceDistM: number
): { near: number; far: number } {
  const cfg = SCALE_LAYERS[layer];
  const distUnits = Math.max(1e-6, nearestSurfaceDistM / cfg.metersPerUnit);

  if (layer === 'planetary') {
    // Allow getting down to 200 m above Earth's surface without near-plane clipping
    const near = Math.max(5e-5, Math.min(0.5, distUnits * 0.08));
    const far = Math.max(near * 1e6, Math.min(5e7, distUnits * 5e4 + 1e7));
    return { near, far };
  }
  if (layer === 'stellar') {
    const near = Math.max(1e-4, Math.min(1.0, distUnits * 0.02));
    return { near, far: cfg.defaultFarUnits };
  }
  if (layer === 'galactic') {
    const near = Math.max(1e-4, Math.min(0.5, distUnits * 0.02));
    return { near, far: cfg.defaultFarUnits };
  }
  return {
    near: Math.max(1e-4, Math.min(0.1, distUnits * 0.02)),
    far: cfg.defaultFarUnits,
  };
}

// ---------------------------------------------------------------------------
// Logarithmic Zoom, Log-Space Fly-To & Distance-Proportional Flight Speed
// ---------------------------------------------------------------------------

/** Minimum camera altitude above a body's surface [m] (~250 m above Earth). */
export const MIN_SURFACE_ALTITUDE_M = 250;

/** Maximum universe zoom-out radius [m] (~350 Mpc, comfortably encompassing Coma Cluster at 99 Mpc). */
export const MAX_UNIVERSE_RADIUS_M = 350 * MEGAPARSEC_METERS;

/**
 * Logarithmic zoom step: scroll/pinch changes log10(distance) linearly so zooming
 * across 23+ orders of magnitude feels uniform and controllable at every scale.
 */
export function applyLogZoom(
  currentDistM: number,
  normalizedDelta: number,
  minDistM: number,
  maxDistM = MAX_UNIVERSE_RADIUS_M
): number {
  const safeMin = Math.max(1, minDistM);
  const safeMax = Math.max(safeMin * 10, maxDistM);
  const clampedCurrent = Math.max(safeMin, Math.min(safeMax, currentDistM));
  const logNext = Math.log10(clampedCurrent) + normalizedDelta;
  const clampedLog = Math.max(
    Math.log10(safeMin),
    Math.min(Math.log10(safeMax), logNext)
  );
  return Math.pow(10, clampedLog);
}

/**
 * Smooth ease-in-out interpolation in log10 distance space for multi-scale fly-to.
 */
export function interpolateLogDistance(
  startDistM: number,
  endDistM: number,
  t: number
): number {
  const clampedT = Math.max(0, Math.min(1, t));
  // Quintic smoothstep for cinema-grade deceleration
  const eased =
    clampedT * clampedT * clampedT * (clampedT * (clampedT * 6 - 15) + 10);
  const logStart = Math.log10(Math.max(1, startDistM));
  const logEnd = Math.log10(Math.max(1, endDistM));
  return Math.pow(10, logStart + (logEnd - logStart) * eased);
}

/**
 * Distance-proportional WASD/QE flight speed [m/s].
 * Scales linearly with distance to nearest significant body so cruising at 10 km above
 * Earth moves at ~6 km/s, while cruising at 10 kpc from Sgr A* moves at ~6 kpc/s.
 */
export function computeAdaptiveFlightSpeedMps(
  nearestSurfaceDistM: number,
  boost: boolean
): number {
  const clampedDist = Math.max(
    MIN_SURFACE_ALTITUDE_M,
    Math.min(MAX_UNIVERSE_RADIUS_M, nearestSurfaceDistM)
  );
  const baseSpeed = clampedDist * 0.65;
  return boost ? baseSpeed * 3.5 : baseSpeed;
}

// ---------------------------------------------------------------------------
// Auto-Unit Human Formatting & Dynamic Scale Bar
// ---------------------------------------------------------------------------

export interface FormattedDistance {
  value: number;
  unit: DistanceUnit;
  text: string;
}

/**
 * Format any physical distance in SI meters into the most legible astronomical unit
 * from meters up to Megaparsecs.
 */
export function formatDistanceAuto(meters: number): FormattedDistance {
  const absM = Math.abs(Number.isFinite(meters) ? meters : 0);

  if (absM < 1_000) {
    const val = Math.round(absM);
    return { value: val, unit: 'm', text: `${val.toLocaleString('en-US')} m` };
  }
  if (absM < 0.05 * AU_IN_METERS) {
    // Up to ~7.5 million km
    const km = absM / METERS_PER_KM;
    const text =
      km >= 100
        ? `${Math.round(km).toLocaleString('en-US')} km`
        : `${km.toFixed(km >= 10 ? 1 : 2)} km`;
    return { value: km, unit: 'km', text };
  }
  if (absM < 0.05 * LIGHT_YEAR_METERS) {
    // Up to ~3,160 AU
    const au = absM / AU_IN_METERS;
    const text =
      au >= 100
        ? `${Math.round(au).toLocaleString('en-US')} AU`
        : `${au.toFixed(au >= 10 ? 1 : 2)} AU`;
    return { value: au, unit: 'AU', text };
  }
  if (absM < 100 * PARSEC_METERS) {
    // Up to ~326 ly
    const ly = absM / LIGHT_YEAR_METERS;
    const text =
      ly >= 100
        ? `${Math.round(ly).toLocaleString('en-US')} ly`
        : `${ly.toFixed(ly >= 10 ? 1 : 2)} ly`;
    return { value: ly, unit: 'ly', text };
  }
  if (absM < 1.0 * KILOPARSEC_METERS) {
    const pc = absM / PARSEC_METERS;
    return { value: pc, unit: 'pc', text: `${Math.round(pc).toLocaleString('en-US')} pc` };
  }
  if (absM < 0.5 * MEGAPARSEC_METERS) {
    const kpc = absM / KILOPARSEC_METERS;
    const text =
      kpc >= 100
        ? `${Math.round(kpc).toLocaleString('en-US')} kpc`
        : `${kpc.toFixed(kpc >= 10 ? 1 : 2)} kpc`;
    return { value: kpc, unit: 'kpc', text };
  }

  const mpc = absM / MEGAPARSEC_METERS;
  const text =
    mpc >= 100
      ? `${Math.round(mpc).toLocaleString('en-US')} Mpc`
      : `${mpc.toFixed(mpc >= 10 ? 1 : 2)} Mpc`;
  return { value: mpc, unit: 'Mpc', text };
}

export interface ScaleBarReadout {
  widthPx: number;
  label: string;
  meters: number;
  unit: DistanceUnit;
}

/**
 * Compute a crisp 1 / 2 / 5 x 10^n dynamic map scale bar from the current
 * meters-per-pixel at the target distance.
 */
export function computeScaleBar(
  metersPerPixel: number,
  targetWidthPx = 110
): ScaleBarReadout {
  if (!Number.isFinite(metersPerPixel) || metersPerPixel <= 0) {
    return { widthPx: targetWidthPx, label: '1 km', meters: 1_000, unit: 'km' };
  }

  const rawMeters = metersPerPixel * targetWidthPx;
  const unitTable: { unit: DistanceUnit; metersPerUnit: number; maxRaw: number }[] = [
    { unit: 'm', metersPerUnit: 1, maxRaw: 1_000 },
    { unit: 'km', metersPerUnit: METERS_PER_KM, maxRaw: 0.05 * AU_IN_METERS },
    { unit: 'AU', metersPerUnit: AU_IN_METERS, maxRaw: 0.05 * LIGHT_YEAR_METERS },
    { unit: 'ly', metersPerUnit: LIGHT_YEAR_METERS, maxRaw: 100 * PARSEC_METERS },
    { unit: 'pc', metersPerUnit: PARSEC_METERS, maxRaw: KILOPARSEC_METERS },
    { unit: 'kpc', metersPerUnit: KILOPARSEC_METERS, maxRaw: 0.5 * MEGAPARSEC_METERS },
    { unit: 'Mpc', metersPerUnit: MEGAPARSEC_METERS, maxRaw: Infinity },
  ];

  const chosen = unitTable.find((u) => rawMeters < u.maxRaw) ?? unitTable[unitTable.length - 1];
  const rawInUnit = rawMeters / chosen.metersPerUnit;
  const pow10 = Math.pow(10, Math.floor(Math.log10(Math.max(1e-9, rawInUnit))));
  const norm = rawInUnit / pow10;
  const niceMult = norm >= 5 ? 5 : norm >= 2 ? 2 : 1;
  const niceVal = niceMult * pow10;
  const niceMeters = niceVal * chosen.metersPerUnit;
  const widthPx = Math.max(44, Math.min(180, Math.round(niceMeters / metersPerPixel)));

  const valLabel =
    niceVal >= 1
      ? Math.round(niceVal).toLocaleString('en-US')
      : niceVal.toFixed(niceVal >= 0.1 ? 1 : 2);

  return {
    widthPx,
    label: `${valLabel} ${chosen.unit}`,
    meters: niceMeters,
    unit: chosen.unit,
  };
}
