/**
 * Unified Multi-Scale Target Resolution (Phases 1–4).
 *
 * Maps any target identifier — Solar System ephemeris body, Sagittarius A*,
 * Milky Way catalog object (MemoryNode), or Local Group / Galaxy Cluster —
 * into an exact float64 UniversePosition, framing distance, radius, and data provenance.
 */

import {
  AU_IN_METERS,
  EARTH_MEAN_RADIUS_M,
  KILOPARSEC_METERS,
  LIGHT_YEAR_METERS,
  MEGAPARSEC_METERS,
  SGR_A_SCHWARZSCHILD_RADIUS_M,
  SOLAR_RADIUS_M,
  SOLAR_SYSTEM_BODIES,
} from './constants';
import {
  eclipticJ2000ToGalactic,
  SolarSystemEphemerisSnapshot,
  SUN_GALACTOCENTRIC_THREE_M,
} from './ephemeris';
import {
  EXTRAGALACTIC_CATALOG,
  getExtragalacticPosThreeM,
  getExtragalacticRadiusM,
} from './extragalactic-catalog';
import { getPlanetSpecForNode, MemoryNode } from './memory-types';
import {
  AnchorFrameId,
  galacticToThreeUp,
  UniversePosition,
  Vec3d,
} from './scale-engine';
import { getLocalizedNode } from './celestial-translations';
import { LanguageCode } from './i18n';
import { getScientificAstrometry } from './scientific-catalog';
import {
  getMilkyWayLandmarkById,
  getMilkyWayLandmarkPosM,
} from './milky-way-landmarks';
import { ScalePresetId } from './universe-i18n';

/**
 * Exact physical meters per 1.0 Sagittarius A* shader unit.
 * The baseline volumetric Schwarzschild shader uses rs = 1.76 units.
 * Mapping 1.76 units -> physical SGR_A_SCHWARZSCHILD_RADIUS_M (~1.2689e10 m)
 * guarantees Sgr A* is both physically scaled AND pixel-identical at the baseline pose!
 */
export const SGRA_SHADER_RS_UNITS = 1.76;
export const SGRA_METERS_PER_SHADER_UNIT =
  SGR_A_SCHWARZSCHILD_RADIUS_M / SGRA_SHADER_RS_UNITS;

/**
 * Standard display scale boost (+35%) for Sagittarius A* so the event horizon,
 * photon sphere, and relativistic accretion disk have grander visual presence
 * while preserving the exact physical Schwarzschild constant in lib/constants.ts.
 */
export const SGRA_DISPLAY_SCALE = 1.35;
export const SGRA_DISPLAY_METERS_PER_SHADER_UNIT =
  SGRA_METERS_PER_SHADER_UNIT * SGRA_DISPLAY_SCALE;

/** Exact baseline Sgr A* close-up framing distance. */
export const SGRA_BASELINE_CAMERA_OFFSET_UNITS: Vec3d = [0, 1.75, 29.5];
export const SGRA_BASELINE_DIST_M =
  Math.hypot(0, 1.75, 29.5) * SGRA_DISPLAY_METERS_PER_SHADER_UNIT;

/** Bidirectional mapping between MemoryNode IDs and real ephemeris Solar System IDs. */
export const MEMORY_ID_TO_EPHEMERIS_ID: Record<string, string> = {
  'star-sol': 'sun',
  'astro-bh-06': 'mercury',
  'astro-lava-06': 'venus',
  'astro-ocean-01': 'earth',
  'small-moon': 'moon',
  'astro-ice-01': 'mars',
  'small-ceres': 'ceres',
  'astro-gas-03': 'jupiter',
  'astro-lava-04': 'io',
  'astro-ice-04': 'europa',
  'small-ganymede': 'ganymede',
  'astro-gas-02': 'saturn',
  'astro-ice-05': 'titan',
  'astro-ice-03': 'uranus',
  'astro-ice-02': 'neptune',
  'small-pluto': 'pluto',
};

export const EPHEMERIS_ID_TO_MEMORY_ID: Record<string, string> = Object.fromEntries(
  Object.entries(MEMORY_ID_TO_EPHEMERIS_ID).map(([k, v]) => [v, k])
);

/** Catalog IDs that map to specialized core/extragalactic renderers rather than individual 3D meshes. */
const SPECIALIZED_CORE_IDS = new Set([
  'astro-bh-01',
  'astro-bh-02',
  'astro-bh-04',
  'astro-bh-05',
]);

/**
 * Deterministic heliocentric J2000 ecliptic polar placements (radiusAu, lonDeg, incDeg)
 * for non-ephemeris Solar System small bodies so they sit at true AU distances around the Sun
 * instead of collapsing onto [0, 0, 0].
 */
const SOLAR_SMALL_BODY_HELIO_ORBITS: Record<
  string,
  { radiusAu: number; lonDeg: number; incDeg: number }
> = {
  'small-eris': { radiusAu: 67.9, lonDeg: 142.0, incDeg: 24.5 },
  'small-vesta': { radiusAu: 2.36, lonDeg: 296.0, incDeg: 7.1 },
  'small-bennu': { radiusAu: 1.13, lonDeg: 87.0, incDeg: 6.0 },
  'small-halley': { radiusAu: 17.9, lonDeg: 145.0, incDeg: 14.5 },
  'small-oumuamua': { radiusAu: 32.0, lonDeg: 214.0, incDeg: 28.0 },
};

/**
 * Returns true when a MemoryNode should be given its own dedicated 3D procedural model
 * in UniverseCanvas's catalog object renderer (all non-Sun stars, exoplanets, extra small bodies,
 * and user-created AI-simulated worlds).
 */
export function isCatalogDirectRenderedId(nodeId: string): boolean {
  if (MEMORY_ID_TO_EPHEMERIS_ID[nodeId]) return false;
  if (SPECIALIZED_CORE_IDS.has(nodeId)) return false;
  return true;
}

export interface ResolvedUniverseTarget {
  id: string;
  label: string;
  position: UniversePosition;
  /** Physical radius [m] used for minimum zoom clearance & framing. */
  radiusM: number;
  /** Recommended camera center-to-center distance [m] on fly-to. */
  idealDistM: number;
  /** Ideal camera spherical angles [rad]. */
  idealYaw: number;
  idealPitch: number;
  /** Data provenance classification for HUD badge. */
  provenance: 'measured' | 'illustrative' | 'mixed';
  /** True when close-up altitude above surface should be shown (e.g. Earth, planets, moons). */
  showSurfaceAltitude: boolean;
}

/**
 * Convert a MemoryNode's ESA Gaia DR3 / NASA heliocentric Galactic (l, b, distLy)
 * into Galactocentric Three.js Y-up SI meters.
 */
export function computeCatalogNodeGalacticPosM(node: MemoryNode): Vec3d {
  const astro = getScientificAstrometry(node.id);
  const distLy = astro?.distanceFromSunLy ?? 1200;
  const lRad = ((astro?.galacticLonDeg ?? 0) * Math.PI) / 180;
  const bRad = ((astro?.galacticLatDeg ?? 0) * Math.PI) / 180;
  const distM = distLy * LIGHT_YEAR_METERS;

  const cosB = Math.cos(bRad);
  const helioGal: Vec3d = [
    distM * cosB * Math.cos(lRad),
    distM * cosB * Math.sin(lRad),
    distM * Math.sin(bRad),
  ];
  const helioThree = galacticToThreeUp(helioGal);
  return [
    SUN_GALACTOCENTRIC_THREE_M[0] + helioThree[0],
    SUN_GALACTOCENTRIC_THREE_M[1] + helioThree[1],
    SUN_GALACTOCENTRIC_THREE_M[2] + helioThree[2],
  ];
}

/**
 * Unified UniversePosition resolver for any non-ephemeris catalog object.
 * - Solar System small bodies (Eris, 4 Vesta, 101955 Bennu, 1P/Halley, 1I/'Oumuamua)
 *   use exact heliocentric J2000 ecliptic AU coordinates ('heliocentric' anchor).
 * - All interstellar stars, exoplanets, and custom AI-simulated worlds use exact
 *   ESA Gaia DR3 Galactocentric coordinates ('galactic' anchor).
 */
export function computeCatalogObjectPosition(node: MemoryNode): UniversePosition {
  const smallOrbit = SOLAR_SMALL_BODY_HELIO_ORBITS[node.id];
  if (smallOrbit) {
    const rM = smallOrbit.radiusAu * AU_IN_METERS;
    const lon = (smallOrbit.lonDeg * Math.PI) / 180;
    const inc = (smallOrbit.incDeg * Math.PI) / 180;
    const cosInc = Math.cos(inc);
    const eclM: Vec3d = [
      rM * cosInc * Math.cos(lon),
      rM * cosInc * Math.sin(lon),
      rM * Math.sin(inc),
    ];
    const helioThreeM = galacticToThreeUp(eclipticJ2000ToGalactic(eclM));
    return { anchor: 'heliocentric', offsetM: helioThreeM };
  }

  // Custom user-created objects get a deterministic, unique galactic offset so they never overlap
  const astro = getScientificAstrometry(node.id);
  if (
    !node.id.startsWith('star-') &&
    !node.id.startsWith('astro-') &&
    !node.id.startsWith('small-')
  ) {
    let hash = 0;
    for (let i = 0; i < node.id.length; i++) {
      hash = (hash * 31 + node.id.charCodeAt(i)) >>> 0;
    }
    const lDeg = (hash % 3600) / 10;
    const bDeg = (((hash >> 8) % 600) / 10) - 30;
    const distLy = 80 + ((hash >> 14) % 2400);
    const lRad = (lDeg * Math.PI) / 180;
    const bRad = (bDeg * Math.PI) / 180;
    const distM = distLy * LIGHT_YEAR_METERS;
    const cosB = Math.cos(bRad);
    const helioThree = galacticToThreeUp([
      distM * cosB * Math.cos(lRad),
      distM * cosB * Math.sin(lRad),
      distM * Math.sin(bRad),
    ]);
    return {
      anchor: 'galactic',
      offsetM: [
        SUN_GALACTOCENTRIC_THREE_M[0] + helioThree[0],
        SUN_GALACTOCENTRIC_THREE_M[1] + helioThree[1],
        SUN_GALACTOCENTRIC_THREE_M[2] + helioThree[2],
      ],
    };
  }

  if (astro.semiMajorAxisAu && astro.semiMajorAxisAu > 0) {
    const rM = astro.semiMajorAxisAu * AU_IN_METERS;
    const lon = node.orbitAngle || 1.2;
    const inc = node.orbitTilt || 0.08;
    const eclM: Vec3d = [
      rM * Math.cos(inc) * Math.cos(lon),
      rM * Math.cos(inc) * Math.sin(lon),
      rM * Math.sin(inc),
    ];
    return {
      anchor: 'heliocentric',
      offsetM: galacticToThreeUp(eclipticJ2000ToGalactic(eclM)),
    };
  }

  return { anchor: 'galactic', offsetM: computeCatalogNodeGalacticPosM(node) };
}

/**
 * Compute physical radius [m] for any catalog MemoryNode.
 */
export function computeCatalogObjectRadiusM(node: MemoryNode): number {
  const astro = getScientificAstrometry(node.id);
  const isStar = node.id.startsWith('star-') || astro.objectClass === 'star';
  if (astro?.diameterKmNumeric && astro.diameterKmNumeric > 0) {
    return astro.diameterKmNumeric * 500;
  }
  return isStar ? SOLAR_RADIUS_M : EARTH_MEAN_RADIUS_M * 1.5;
}

/**
 * Resolve any target ID (Solar System body, Sgr A*, MemoryNode, or Extragalactic galaxy/cluster)
 * at the current ephemeris snapshot.
 */
export function resolveUniverseTarget(
  rawId: string,
  ephemeris: SolarSystemEphemerisSnapshot,
  memories: MemoryNode[],
  lang: LanguageCode = 'en'
): ResolvedUniverseTarget {
  // 1. Sagittarius A* (Galactic Center & relativistic core phenomena)
  if (
    rawId === 'BLACK_HOLE_CORE' ||
    rawId === 'sgr-a' ||
    rawId === 'astro-bh-04' ||
    rawId === 'astro-bh-01' ||
    rawId === 'astro-bh-02'
  ) {
    return {
      id: 'BLACK_HOLE_CORE',
      label: 'Sagittarius A*',
      position: { anchor: 'galactic', offsetM: [0, 0, 0] },
      radiusM: SGR_A_SCHWARZSCHILD_RADIUS_M * 4.5 * SGRA_DISPLAY_SCALE,
      idealDistM: 25.5 * SGRA_DISPLAY_METERS_PER_SHADER_UNIT,
      idealYaw: 0,
      idealPitch: 0.34,
      provenance: 'measured',
      showSurfaceAltitude: false,
    };
  }

  // 2. Real Solar System Ephemeris Body (direct ID or mapped MemoryNode ID)
  const ephemId = MEMORY_ID_TO_EPHEMERIS_ID[rawId] ?? rawId;
  if (ephemeris.bodies[ephemId] && SOLAR_SYSTEM_BODIES[ephemId]) {
    const bodyState = ephemeris.bodies[ephemId];
    const phys = SOLAR_SYSTEM_BODIES[ephemId];
    const isEarthOrMoon = ephemId === 'earth' || ephemId === 'moon';
    const anchor: AnchorFrameId = isEarthOrMoon ? 'earth' : 'heliocentric';
    const offsetM: Vec3d =
      ephemId === 'earth'
        ? [0, 0, 0]
        : ephemId === 'moon'
          ? bodyState.localOffsetM
          : bodyState.helioPosM;

    const ringFactor =
      ephemId === 'sun'
        ? 4.8
        : ephemId === 'saturn'
          ? 5.8
          : ephemId === 'uranus'
            ? 4.4
            : 3.4;
    const idealDistM = phys.meanRadiusM * ringFactor;

    return {
      id: ephemId,
      label: phys.name,
      position: { anchor, offsetM },
      radiusM: phys.meanRadiusM,
      idealDistM,
      idealYaw: ephemId === 'earth' ? 0.55 : 0.65,
      idealPitch: 0.24,
      provenance: 'measured',
      showSurfaceAltitude: ephemId !== 'sun',
    };
  }

  // 3. Extragalactic Local Group / Nearby Galaxies / Galaxy Clusters
  const extra = EXTRAGALACTIC_CATALOG.find((g) => g.id === rawId);
  if (extra) {
    const posM = getExtragalacticPosThreeM(extra);
    const radiusM = getExtragalacticRadiusM(extra);
    return {
      id: extra.id,
      label: extra.name,
      position: { anchor: 'galactic', offsetM: posM },
      radiusM: Math.max(1000 * LIGHT_YEAR_METERS, radiusM * 0.25),
      idealDistM:
        extra.id === 'mw-galaxy'
          ? 32 * KILOPARSEC_METERS
          : Math.max(radiusM * 4.5, 0.2 * MEGAPARSEC_METERS),
      idealYaw: 0.4,
      idealPitch: extra.id === 'mw-galaxy' ? 0.92 : 0.42,
      provenance: 'mixed',
      showSurfaceAltitude: false,
    };
  }

  // 3B. Real Milky Way Star Clusters, H-II Complexes & Spiral Arm Landmarks
  const mwLandmark = getMilkyWayLandmarkById(rawId);
  if (mwLandmark) {
    const posM = getMilkyWayLandmarkPosM(mwLandmark);
    return {
      id: mwLandmark.id,
      label: mwLandmark.name[lang] || mwLandmark.name.en,
      position: { anchor: 'galactic', offsetM: posM },
      radiusM: Math.max(15 * LIGHT_YEAR_METERS, mwLandmark.diameterLy * 0.5 * LIGHT_YEAR_METERS),
      idealDistM: mwLandmark.idealInspectDistKpc * KILOPARSEC_METERS,
      idealYaw: 0.42,
      idealPitch: mwLandmark.kind === 'spiral-arm' ? 0.78 : 0.48,
      provenance: mwLandmark.kind === 'spiral-arm' ? 'mixed' : 'measured',
      showSurfaceAltitude: false,
    };
  }

  // 4. M87* -> Virgo Cluster
  if (rawId === 'astro-bh-05') {
    const virgo = EXTRAGALACTIC_CATALOG.find((g) => g.id === 'virgo-cluster')!;
    return resolveUniverseTarget(virgo.id, ephemeris, memories, lang);
  }

  // 5. Remaining Milky Way Catalog Nodes (Bright Stars, Exoplanets, Small Bodies & Custom Objects)
  const mem = memories.find((m) => m.id === rawId);
  if (mem) {
    const localized = getLocalizedNode(mem, lang);
    const position = computeCatalogObjectPosition(mem);
    const astro = getScientificAstrometry(mem.id);
    const spec = getPlanetSpecForNode(mem);
    const isStar = mem.id.startsWith('star-') || astro.objectClass === 'star';
    const radiusM = computeCatalogObjectRadiusM(mem);
    const maxAxis = astro.irregularShape
      ? Math.max(...astro.irregularShape)
      : 1.0;

    let idealDistM: number;
    if (isStar) {
      idealDistM = spec.hasRings
        ? radiusM * Math.max(5.6, spec.ringOuterRadius * 2.35)
        : radiusM * 4.8;
    } else if (spec.hasRings && spec.ringOuterRadius > 1.05) {
      idealDistM = radiusM * Math.max(5.8, spec.ringOuterRadius * 2.35);
    } else if (astro.hasCometTail) {
      idealDistM = Math.max(radiusM * 6.5, radiusM + 600);
    } else if (maxAxis > 1.4) {
      idealDistM = Math.max(radiusM * maxAxis * 2.8, radiusM + 600);
    } else {
      idealDistM = Math.max(radiusM * 3.6, radiusM + 600);
    }

    return {
      id: mem.id,
      label: localized.title.split(' — ')[0],
      position,
      radiusM,
      idealDistM,
      idealYaw: spec.hasRings ? 0.58 : 0.55,
      idealPitch: spec.hasRings ? 0.34 : 0.24,
      provenance: 'measured',
      showSurfaceAltitude: !isStar,
    };
  }

  // Fallback: Earth
  return resolveUniverseTarget('earth', ephemeris, memories, lang);
}

/**
 * Resolve one of the 6 primary multi-scale quick-jump presets.
 */
export function resolveScalePreset(
  preset: ScalePresetId,
  ephemeris: SolarSystemEphemerisSnapshot,
  memories: MemoryNode[]
): ResolvedUniverseTarget {
  switch (preset) {
    case 'earth':
      return {
        ...resolveUniverseTarget('earth', ephemeris, memories),
        idealDistM: EARTH_MEAN_RADIUS_M * 3.1, // ~13,380 km altitude showing globe + terminator + clouds
        idealYaw: 0.58,
        idealPitch: 0.26,
      };
    case 'solar-system':
      return {
        ...resolveUniverseTarget('sun', ephemeris, memories),
        id: 'sun',
        idealDistM: 12.5 * AU_IN_METERS,
        idealYaw: 0.45,
        idealPitch: 0.68,
      };
    case 'nearby-stars':
      return {
        id: 'sun',
        label: 'Solar Neighborhood',
        position: { anchor: 'heliocentric', offsetM: [0, 0, 0] },
        radiusM: SOLAR_RADIUS_M,
        idealDistM: 42 * LIGHT_YEAR_METERS,
        idealYaw: 0.6,
        idealPitch: 0.48,
        provenance: 'measured',
        showSurfaceAltitude: false,
      };
    case 'milky-way':
      return {
        id: 'mw-galaxy',
        label: 'Milky Way',
        position: { anchor: 'galactic', offsetM: [0, 0, 0] },
        radiusM: SGR_A_SCHWARZSCHILD_RADIUS_M * 4.5,
        idealDistM: 34 * KILOPARSEC_METERS,
        idealYaw: -0.25,
        idealPitch: 0.88,
        provenance: 'illustrative',
        showSurfaceAltitude: false,
      };
    case 'sgr-a':
      return resolveUniverseTarget('BLACK_HOLE_CORE', ephemeris, memories);
    case 'local-group': {
      const m31 = EXTRAGALACTIC_CATALOG.find((g) => g.id === 'm31');
      const m31Pos = m31 ? getExtragalacticPosThreeM(m31) : ([0, 0, 0] as Vec3d);
      const midPos: Vec3d = [m31Pos[0] * 0.46, m31Pos[1] * 0.46, m31Pos[2] * 0.46];
      // Look perpendicular to the MW-M31 axis in XZ so Milky Way & Andromeda sit cleanly side-by-side
      const axisYaw = Math.atan2(m31Pos[0], m31Pos[2]);
      return {
        id: 'm31',
        label: 'Local Group',
        position: { anchor: 'galactic', offsetM: midPos },
        radiusM: 15.5 * KILOPARSEC_METERS,
        idealDistM: 1.55 * MEGAPARSEC_METERS,
        idealYaw: axisYaw + Math.PI * 0.52,
        idealPitch: 0.28,
        provenance: 'mixed',
        showSurfaceAltitude: false,
      };
    }
  }
}
