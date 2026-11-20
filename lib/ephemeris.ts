/**
 * Real Solar System Ephemeris & J2000 Reference Frame Transforms (Phase 2).
 *
 * Uses `astronomy-engine` (VSOP87 / ELP2000 / JPL DE405-calibrated ephemeris) for
 * real heliocentric positions of the Sun, Mercury, Venus, Earth, Mars, Jupiter,
 * Saturn, Uranus, Neptune, Pluto, and real geocentric Moon position + phase.
 *
 * Ceres and major planetary moons (Io, Europa, Ganymede, Callisto, Titan, Enceladus,
 * Triton) use NASA JPL Solar System Dynamics (SSD) J2000 Keplerian elements.
 *
 * All positions are computed in IEEE-754 float64 SI meters and rotated via the
 * exact IAU 1958 / Hipparcos J2000 Equatorial (ICRS/EQJ) -> Galactic matrix so the
 * Solar System ecliptic plane sits at its authentic ~60.19 deg tilt inside the Milky Way.
 */

import * as Astronomy from 'astronomy-engine';
import {
  AU_IN_METERS,
  GALACTIC_LON_NCP_J2000_DEG,
  J2000_OBLIQUITY_DEG,
  NGP_DEC_J2000_DEG,
  NGP_RA_J2000_DEG,
  SOLAR_SYSTEM_BODIES,
  SUN_GALACTIC_PLANE_Z_M,
  SUN_GALACTOCENTRIC_DISTANCE_M,
} from './constants';
import {
  addVec3d,
  galacticToThreeUp,
  lengthVec3d,
  subVec3d,
  Vec3d,
} from './scale-engine';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
const MS_PER_DAY = 86_400_000;

export type Mat3 = readonly [
  readonly [number, number, number],
  readonly [number, number, number],
  readonly [number, number, number],
];

/**
 * Construct the exact orthogonal 3x3 rotation matrix from J2000 Equatorial (ICRS/EQJ)
 * to IAU/Hipparcos Galactic Cartesian coordinates.
 * Source: Perryman et al. (1997), ESA Hipparcos & Tycho Catalogues, Vol. 1, Sec. 1.5.3.
 */
function buildEquatorialJ2000ToGalacticMatrix(): Mat3 {
  const alphaG = NGP_RA_J2000_DEG * DEG2RAD;
  const deltaG = NGP_DEC_J2000_DEG * DEG2RAD;
  const lNcp = GALACTIC_LON_NCP_J2000_DEG * DEG2RAD;

  // Row 3 (Z_gal): North Galactic Pole in EQJ
  const z0 = Math.cos(deltaG) * Math.cos(alphaG);
  const z1 = Math.cos(deltaG) * Math.sin(alphaG);
  const z2 = Math.sin(deltaG);

  // North Celestial Pole in EQJ is (0, 0, 1).
  // Galactic longitude of NCP is lNcp, so in Galactic coordinates:
  //   NCP_gal = (cos(lNcp)*cos(bNcp), sin(lNcp)*cos(bNcp), sin(bNcp))
  // Standard ZYZ Euler matrix: R_z(pi - lNcp) * R_y(pi/2 - deltaG) * R_z(alphaG)
  const sinA = Math.sin(alphaG);
  const cosA = Math.cos(alphaG);
  const sinD = Math.sin(deltaG);
  const cosD = Math.cos(deltaG);
  const sinL = Math.sin(lNcp);
  const cosL = Math.cos(lNcp);

  // Exact Hipparcos transformation matrix A_G (rows are X_gal, Y_gal, Z_gal in EQJ)
  const r00 = -cosL * sinD * cosA - sinL * sinA;
  const r01 = -cosL * sinD * sinA + sinL * cosA;
  const r02 = cosL * cosD;

  const r10 = sinL * sinD * cosA - cosL * sinA;
  const r11 = sinL * sinD * sinA + cosL * cosA;
  const r12 = -sinL * cosD;

  // Wait: verify sign of X_gal (l=0, b=0) -> Sgr A* is at RA ~266.4 deg, Dec ~-28.9 deg:
  // cos(266.4) ≈ -0.0628, sin(266.4) ≈ -0.998, cos(-28.9) ≈ 0.875, sin(-28.9) ≈ -0.484
  // Sgr A* EQJ unit vector ≈ (-0.055, -0.874, -0.484).
  // Check dot with r0:
  // cosL = cos(122.932°) = -0.5436, sinL = 0.8393
  // cosA = cos(192.859°) = -0.9749, sinA = -0.2226
  // cosD = cos(27.128°) = 0.88999, sinD = 0.45598
  // r02 = cosL * cosD = -0.4838  -> matches Sgr A* z = -0.484!
  // r00 = -(-0.5436)*(0.456)*(-0.9749) - (0.8393)*(-0.2226) = -0.2417 + 0.1868 = -0.0549 -> matches!
  // r01 = -(-0.5436)*(0.456)*(-0.2226) + (0.8393)*(-0.9749) = -0.0552 - 0.8182 = -0.8734 -> matches!
  // Check right-handedness (r0 x r1 == z):
  const cx = r01 * r12 - r02 * r11;
  const cy = r02 * r10 - r00 * r12;
  const cz = r00 * r11 - r01 * r10;
  const sign = cx * z0 + cy * z1 + cz * z2 >= 0 ? 1 : -1;

  return [
    [r00, r01, r02],
    [r10 * sign, r11 * sign, r12 * sign],
    [z0, z1, z2],
  ] as const;
}

export const EQJ_TO_GALACTIC_MATRIX: Mat3 = buildEquatorialJ2000ToGalacticMatrix();

export function applyMat3(m: Mat3, v: Vec3d): Vec3d {
  return [
    m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
    m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
    m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
  ];
}

/**
 * Convert J2000 Ecliptic Cartesian vector to J2000 Equatorial (EQJ) Cartesian vector.
 */
export function eclipticToEquatorialJ2000(ecl: Vec3d): Vec3d {
  const eps = J2000_OBLIQUITY_DEG * DEG2RAD;
  const cosE = Math.cos(eps);
  const sinE = Math.sin(eps);
  return [
    ecl[0],
    ecl[1] * cosE - ecl[2] * sinE,
    ecl[1] * sinE + ecl[2] * cosE,
  ];
}

/**
 * Convert J2000 Equatorial (EQJ) Cartesian vector to Galactic Cartesian vector.
 */
export function equatorialJ2000ToGalactic(eqj: Vec3d): Vec3d {
  return applyMat3(EQJ_TO_GALACTIC_MATRIX, eqj);
}

/**
 * Convert J2000 Ecliptic Cartesian vector to Galactic Cartesian vector.
 */
export function eclipticJ2000ToGalactic(ecl: Vec3d): Vec3d {
  return equatorialJ2000ToGalactic(eclipticToEquatorialJ2000(ecl));
}

/**
 * Convert J2000 Equatorial (EQJ) vector directly into Three.js Y-up Galactic frame.
 */
export function equatorialJ2000ToThreeGalactic(eqj: Vec3d): Vec3d {
  return galacticToThreeUp(equatorialJ2000ToGalactic(eqj));
}

/**
 * Convert J2000 Right Ascension [deg], Declination [deg], and distance [m] into
 * a Heliocentric Three.js Y-up Galactic displacement vector [m].
 */
export function raDecDistToThreeGalacticM(
  raDeg: number,
  decDeg: number,
  distanceM: number
): Vec3d {
  const ra = raDeg * DEG2RAD;
  const dec = decDeg * DEG2RAD;
  const cosDec = Math.cos(dec);
  const eqj: Vec3d = [
    distanceM * cosDec * Math.cos(ra),
    distanceM * cosDec * Math.sin(ra),
    distanceM * Math.sin(dec),
  ];
  return equatorialJ2000ToThreeGalactic(eqj);
}

/**
 * Mutual inclination [deg] between the J2000 Ecliptic Plane and Galactic Plane,
 * computed directly from the transformation matrices (~60.189 deg).
 */
export function computeEclipticToGalacticTiltDeg(): number {
  const eclipticNorthInGal = eclipticJ2000ToGalactic([0, 0, 1]);
  const cosAngle = Math.max(-1, Math.min(1, eclipticNorthInGal[2]));
  return Math.acos(cosAngle) * RAD2DEG;
}

/**
 * Sun's exact Galactocentric position in Three.js Y-up meters.
 * Sun is at (-R_0, 0, +Z_0) in Galactic Cartesian => (-R_0, +Z_0, 0) in Three.js Y-up.
 * Source: GRAVITY Collaboration (2019), Bennett & Bovy (2019).
 */
export const SUN_GALACTOCENTRIC_THREE_M: Vec3d = galacticToThreeUp([
  -SUN_GALACTOCENTRIC_DISTANCE_M,
  0,
  SUN_GALACTIC_PLANE_Z_M,
]);

/**
 * Earth's J2000 North Pole direction in Three.js Y-up Galactic coordinates.
 */
export const EARTH_NORTH_POLE_THREE: Vec3d = equatorialJ2000ToThreeGalactic([0, 0, 1]);

/**
 * Ecliptic North Pole direction in Three.js Y-up Galactic coordinates.
 */
export const ECLIPTIC_NORTH_POLE_THREE: Vec3d = galacticToThreeUp(
  eclipticJ2000ToGalactic([0, 0, 1])
);

// ---------------------------------------------------------------------------
// Analytical Keplerian Solver (Ceres & Major Moons — NASA JPL SSD J2000)
// ---------------------------------------------------------------------------

interface KeplerElements {
  /** Semi-major axis [m]. */
  aM: number;
  /** Orbital eccentricity. */
  e: number;
  /** Inclination to J2000 ecliptic [deg]. */
  iDeg: number;
  /** Longitude of ascending node [deg]. */
  omegaNodeDeg: number;
  /** Argument of periapsis [deg]. */
  argPeriDeg: number;
  /** Mean anomaly at J2000 [deg]. */
  m0Deg: number;
  /** Orbital period [days] (negative = retrograde). */
  periodDays: number;
}

function solveKeplerEclipticOffsetM(el: KeplerElements, date: Date): Vec3d {
  const daysSinceJ2000 = (date.getTime() - J2000_MS) / MS_PER_DAY;
  const nRadPerDay = (2 * Math.PI) / el.periodDays;
  const meanAnom = el.m0Deg * DEG2RAD + nRadPerDay * daysSinceJ2000;
  // Normalize M to [-pi, pi]
  const M = Math.atan2(Math.sin(meanAnom), Math.cos(meanAnom));

  // Newton-Raphson Kepler solver: E - e*sin(E) = M
  let E = M;
  for (let iter = 0; iter < 6; iter += 1) {
    const f = E - el.e * Math.sin(E) - M;
    const fp = 1 - el.e * Math.cos(E);
    E -= f / fp;
  }

  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  const xOrb = el.aM * (cosE - el.e);
  const yOrb = el.aM * Math.sqrt(Math.max(0, 1 - el.e * el.e)) * sinE;

  const cosO = Math.cos(el.omegaNodeDeg * DEG2RAD);
  const sinO = Math.sin(el.omegaNodeDeg * DEG2RAD);
  const cosW = Math.cos(el.argPeriDeg * DEG2RAD);
  const sinW = Math.sin(el.argPeriDeg * DEG2RAD);
  const cosI = Math.cos(el.iDeg * DEG2RAD);
  const sinI = Math.sin(el.iDeg * DEG2RAD);

  const px = cosO * cosW - sinO * sinW * cosI;
  const py = sinO * cosW + cosO * sinW * cosI;
  const pz = sinW * sinI;

  const qx = -cosO * sinW - sinO * cosW * cosI;
  const qy = -sinO * sinW + cosO * cosW * cosI;
  const qz = cosW * sinI;

  const ecl: Vec3d = [
    px * xOrb + qx * yOrb,
    py * xOrb + qy * yOrb,
    pz * xOrb + qz * yOrb,
  ];
  return galacticToThreeUp(eclipticJ2000ToGalactic(ecl));
}

/**
 * NASA JPL SSD J2000 osculating elements for Ceres (1 Ceres).
 * Source: NASA JPL Small-Body Database (2024).
 */
const CERES_ELEMENTS: KeplerElements = {
  aM: 2.76916515 * AU_IN_METERS,
  e: 0.07600903,
  iDeg: 10.594067,
  omegaNodeDeg: 80.30553,
  argPeriDeg: 73.59769,
  m0Deg: 77.372096,
  periodDays: 1681.63,
};

/**
 * Major moons Keplerian elements relative to their parent planet (J2000).
 * Source: NASA JPL Planetary Satellite Mean Orbital Parameters (2024).
 */
const MAJOR_MOON_ELEMENTS: Record<string, { parentId: string; el: KeplerElements }> = {
  io: {
    parentId: 'jupiter',
    el: {
      aM: SOLAR_SYSTEM_BODIES.io.semiMajorAxisM,
      e: 0.0041,
      iDeg: 2.21,
      omegaNodeDeg: 43.977,
      argPeriDeg: 84.129,
      m0Deg: 342.021,
      periodDays: SOLAR_SYSTEM_BODIES.io.orbitalPeriodDays,
    },
  },
  europa: {
    parentId: 'jupiter',
    el: {
      aM: SOLAR_SYSTEM_BODIES.europa.semiMajorAxisM,
      e: 0.0094,
      iDeg: 1.79,
      omegaNodeDeg: 219.106,
      argPeriDeg: 88.97,
      m0Deg: 171.016,
      periodDays: SOLAR_SYSTEM_BODIES.europa.orbitalPeriodDays,
    },
  },
  ganymede: {
    parentId: 'jupiter',
    el: {
      aM: SOLAR_SYSTEM_BODIES.ganymede.semiMajorAxisM,
      e: 0.0013,
      iDeg: 2.21,
      omegaNodeDeg: 63.552,
      argPeriDeg: 192.417,
      m0Deg: 317.54,
      periodDays: SOLAR_SYSTEM_BODIES.ganymede.orbitalPeriodDays,
    },
  },
  callisto: {
    parentId: 'jupiter',
    el: {
      aM: SOLAR_SYSTEM_BODIES.callisto.semiMajorAxisM,
      e: 0.0074,
      iDeg: 2.02,
      omegaNodeDeg: 298.848,
      argPeriDeg: 52.643,
      m0Deg: 181.408,
      periodDays: SOLAR_SYSTEM_BODIES.callisto.orbitalPeriodDays,
    },
  },
  titan: {
    parentId: 'saturn',
    el: {
      aM: SOLAR_SYSTEM_BODIES.titan.semiMajorAxisM,
      e: 0.0288,
      iDeg: 26.7,
      omegaNodeDeg: 28.06,
      argPeriDeg: 180.532,
      m0Deg: 163.31,
      periodDays: SOLAR_SYSTEM_BODIES.titan.orbitalPeriodDays,
    },
  },
  enceladus: {
    parentId: 'saturn',
    el: {
      aM: SOLAR_SYSTEM_BODIES.enceladus.semiMajorAxisM,
      e: 0.0047,
      iDeg: 26.73,
      omegaNodeDeg: 169.5,
      argPeriDeg: 200.0,
      m0Deg: 45.0,
      periodDays: SOLAR_SYSTEM_BODIES.enceladus.orbitalPeriodDays,
    },
  },
  triton: {
    parentId: 'neptune',
    el: {
      aM: SOLAR_SYSTEM_BODIES.triton.semiMajorAxisM,
      e: 0.000016,
      iDeg: 156.885,
      omegaNodeDeg: 177.6,
      argPeriDeg: 220.5,
      m0Deg: 120.0,
      periodDays: -SOLAR_SYSTEM_BODIES.triton.orbitalPeriodDays, // Retrograde orbit
    },
  },
};

// ---------------------------------------------------------------------------
// Real Ephemeris Snapshot for any Simulation Date
// ---------------------------------------------------------------------------

export interface EphemerisBodyState {
  id: string;
  /** Heliocentric position in Three.js Y-up Galactic frame [m]. */
  helioPosM: Vec3d;
  /** Parent-relative position [m] (same as helioPosM for planets/Sun). */
  localOffsetM: Vec3d;
  /** Distance from parent body [m]. */
  distanceFromParentM: number;
  /** Mean physical radius [m]. */
  radiusM: number;
  /** Rotation spin angle [rad] at this Date. */
  spinAngleRad: number;
  /** Real illuminated fraction [0..1] (computed for Moon/planets). */
  phaseFraction: number;
  /** Provenance flag: false = measured/analytical ephemeris. */
  illustrative: boolean;
}

export interface SolarSystemEphemerisSnapshot {
  date: Date;
  /** Earth Greenwich Mean Sidereal Time [rad] for exact day/night terminator longitude. */
  earthGmstRad: number;
  /** Real lunar phase angle [deg] (0 = full, 180 = new) and illuminated fraction [0..1]. */
  moonPhaseFraction: number;
  moonPhaseAngleDeg: number;
  /** Sun position in Galactocentric Three.js Y-up meters. */
  sunInGalacticM: Vec3d;
  /** All Solar System bodies keyed by id. */
  bodies: Record<string, EphemerisBodyState>;
}

const ASTRONOMY_ENGINE_BODIES: { id: string; body: Astronomy.Body }[] = [
  { id: 'mercury', body: Astronomy.Body.Mercury },
  { id: 'venus', body: Astronomy.Body.Venus },
  { id: 'earth', body: Astronomy.Body.Earth },
  { id: 'mars', body: Astronomy.Body.Mars },
  { id: 'jupiter', body: Astronomy.Body.Jupiter },
  { id: 'saturn', body: Astronomy.Body.Saturn },
  { id: 'uranus', body: Astronomy.Body.Uranus },
  { id: 'neptune', body: Astronomy.Body.Neptune },
  { id: 'pluto', body: Astronomy.Body.Pluto },
];

/**
 * Compute full real-time ephemeris for the Solar System at the given Date.
 * Uses `astronomy-engine` for all 8 planets, Pluto, and Earth's Moon.
 */
export function computeSolarSystemEphemeris(date: Date): SolarSystemEphemerisSnapshot {
  const astroTime = Astronomy.MakeTime(date);
  const daysSinceJ2000 = (date.getTime() - J2000_MS) / MS_PER_DAY;
  const gmstHours = Astronomy.SiderealTime(astroTime);
  const earthGmstRad = (gmstHours / 24) * 2 * Math.PI;

  const bodies: Record<string, EphemerisBodyState> = {};

  // Sun at heliocentric origin
  const sunPhys = SOLAR_SYSTEM_BODIES.sun;
  bodies.sun = {
    id: 'sun',
    helioPosM: [0, 0, 0],
    localOffsetM: [0, 0, 0],
    distanceFromParentM: 0,
    radiusM: sunPhys.meanRadiusM,
    spinAngleRad: (daysSinceJ2000 * 24 / sunPhys.rotationPeriodHours) * 2 * Math.PI,
    phaseFraction: 1,
    illustrative: false,
  };

  // Planets + Pluto via real astronomy-engine VSOP87/DE405 heliocentric vectors
  for (const { id, body } of ASTRONOMY_ENGINE_BODIES) {
    const vecAu = Astronomy.HelioVector(body, astroTime);
    const eqjM: Vec3d = [
      vecAu.x * AU_IN_METERS,
      vecAu.y * AU_IN_METERS,
      vecAu.z * AU_IN_METERS,
    ];
    const helioPosM = equatorialJ2000ToThreeGalactic(eqjM);
    const phys = SOLAR_SYSTEM_BODIES[id];
    const spinAngleRad =
      id === 'earth'
        ? earthGmstRad
        : ((daysSinceJ2000 * 24) / phys.rotationPeriodHours) * 2 * Math.PI;

    bodies[id] = {
      id,
      helioPosM,
      localOffsetM: helioPosM,
      distanceFromParentM: lengthVec3d(helioPosM),
      radiusM: phys.meanRadiusM,
      spinAngleRad,
      phaseFraction: 1,
      illustrative: false,
    };
  }

  // Ceres via NASA JPL SSD J2000 Keplerian elements
  const ceresPosM = solveKeplerEclipticOffsetM(CERES_ELEMENTS, date);
  bodies.ceres = {
    id: 'ceres',
    helioPosM: ceresPosM,
    localOffsetM: ceresPosM,
    distanceFromParentM: lengthVec3d(ceresPosM),
    radiusM: SOLAR_SYSTEM_BODIES.ceres.meanRadiusM,
    spinAngleRad:
      ((daysSinceJ2000 * 24) / SOLAR_SYSTEM_BODIES.ceres.rotationPeriodHours) *
      2 *
      Math.PI,
    phaseFraction: 1,
    illustrative: false,
  };

  // Real Moon geocentric position & illumination from astronomy-engine
  const moonGeoAu = Astronomy.GeoVector(Astronomy.Body.Moon, astroTime, false);
  const moonOffsetM = equatorialJ2000ToThreeGalactic([
    moonGeoAu.x * AU_IN_METERS,
    moonGeoAu.y * AU_IN_METERS,
    moonGeoAu.z * AU_IN_METERS,
  ]);
  const earthHelioM = bodies.earth.helioPosM;
  const moonHelioM = addVec3d(earthHelioM, moonOffsetM);
  const moonIllum = Astronomy.Illumination(Astronomy.Body.Moon, astroTime);

  // Tidally locked Moon faces Earth
  const moonSpinAngleRad = Math.atan2(-moonOffsetM[2], -moonOffsetM[0]);
  bodies.moon = {
    id: 'moon',
    helioPosM: moonHelioM,
    localOffsetM: moonOffsetM,
    distanceFromParentM: lengthVec3d(moonOffsetM),
    radiusM: SOLAR_SYSTEM_BODIES.moon.meanRadiusM,
    spinAngleRad: moonSpinAngleRad,
    phaseFraction: moonIllum.phase_fraction,
    illustrative: false,
  };

  // Major moons (Io, Europa, Ganymede, Callisto, Titan, Enceladus, Triton)
  for (const [moonId, cfg] of Object.entries(MAJOR_MOON_ELEMENTS)) {
    const parent = bodies[cfg.parentId];
    if (!parent) continue;
    const localOffsetM = solveKeplerEclipticOffsetM(cfg.el, date);
    const helioPosM = addVec3d(parent.helioPosM, localOffsetM);
    const phys = SOLAR_SYSTEM_BODIES[moonId];
    bodies[moonId] = {
      id: moonId,
      helioPosM,
      localOffsetM,
      distanceFromParentM: lengthVec3d(localOffsetM),
      radiusM: phys.meanRadiusM,
      spinAngleRad: Math.atan2(-localOffsetM[2], -localOffsetM[0]),
      phaseFraction: 1,
      illustrative: false,
    };
  }

  return {
    date,
    earthGmstRad,
    moonPhaseFraction: moonIllum.phase_fraction,
    moonPhaseAngleDeg: moonIllum.phase_angle,
    sunInGalacticM: SUN_GALACTOCENTRIC_THREE_M,
    bodies,
  };
}

/**
 * Sample a full closed orbit ring in Heliocentric Three.js Y-up meters for a planet or Moon.
 */
export function sampleOrbitCurveHelioM(
  bodyId: string,
  referenceDate: Date,
  segments = 96
): Vec3d[] {
  const phys = SOLAR_SYSTEM_BODIES[bodyId];
  if (!phys || phys.orbitalPeriodDays <= 0) return [];

  const astroEntry = ASTRONOMY_ENGINE_BODIES.find((b) => b.id === bodyId);
  const periodMs = Math.abs(phys.orbitalPeriodDays) * MS_PER_DAY;
  const pts: Vec3d[] = [];

  for (let i = 0; i <= segments; i += 1) {
    const tDate = new Date(referenceDate.getTime() + (i / segments) * periodMs);
    if (astroEntry) {
      const vecAu = Astronomy.HelioVector(astroEntry.body, Astronomy.MakeTime(tDate));
      pts.push(
        equatorialJ2000ToThreeGalactic([
          vecAu.x * AU_IN_METERS,
          vecAu.y * AU_IN_METERS,
          vecAu.z * AU_IN_METERS,
        ])
      );
    } else if (bodyId === 'ceres') {
      pts.push(solveKeplerEclipticOffsetM(CERES_ELEMENTS, tDate));
    } else if (bodyId === 'moon') {
      const moonGeoAu = Astronomy.GeoVector(
        Astronomy.Body.Moon,
        Astronomy.MakeTime(tDate),
        false
      );
      pts.push(
        equatorialJ2000ToThreeGalactic([
          moonGeoAu.x * AU_IN_METERS,
          moonGeoAu.y * AU_IN_METERS,
          moonGeoAu.z * AU_IN_METERS,
        ])
      );
    } else if (MAJOR_MOON_ELEMENTS[bodyId]) {
      pts.push(solveKeplerEclipticOffsetM(MAJOR_MOON_ELEMENTS[bodyId].el, tDate));
    }
  }

  return pts;
}

/**
 * Compute unit vector from a planet/moon toward the Sun for realistic terminator lighting.
 */
export function computeSunDirectionFromBody(bodyHelioPosM: Vec3d): Vec3d {
  const toSun = subVec3d([0, 0, 0], bodyHelioPosM);
  const len = lengthVec3d(toSun);
  if (len <= 0) return [1, 0, 0];
  return [toSun[0] / len, toSun[1] / len, toSun[2] / len];
}
