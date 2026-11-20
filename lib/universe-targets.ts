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
  SolarSystemEphemerisSnapshot,
  SUN_GALACTOCENTRIC_THREE_M,
} from './ephemeris';
import {
  EXTRAGALACTIC_CATALOG,
  getExtragalacticPosThreeM,
  getExtragalacticRadiusM,
} from './extragalactic-catalog';
import { MemoryNode } from './memory-types';
import {
  AnchorFrameId,
  galacticToThreeUp,
  UniversePosition,
  Vec3d,
} from './scale-engine';
import { getScientificAstrometry } from './scientific-catalog';
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
 * Resolve any target ID (Solar System body, Sgr A*, MemoryNode, or Extragalactic galaxy/cluster)
 * at the current ephemeris snapshot.
 */
export function resolveUniverseTarget(
  rawId: string,
  ephemeris: SolarSystemEphemerisSnapshot,
  memories: MemoryNode[]
): ResolvedUniverseTarget {
  // 1. Sagittarius A* (Galactic Center)
  if (rawId === 'BLACK_HOLE_CORE' || rawId === 'sgr-a' || rawId === 'astro-bh-04') {
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

    const ringFactor = ephemId === 'saturn' ? 5.8 : ephemId === 'uranus' ? 4.4 : 3.4;
    const idealDistM =
      ephemId === 'sun'
        ? 4.2 * AU_IN_METERS
        : phys.meanRadiusM * ringFactor;

    return {
      id: ephemId,
      label: phys.name,
      position: { anchor, offsetM },
      radiusM: phys.meanRadiusM,
      idealDistM,
      idealYaw: ephemId === 'earth' ? 0.55 : 0.65,
      idealPitch: ephemId === 'sun' ? 0.58 : 0.24,
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

  // 4. M87* -> Virgo Cluster
  if (rawId === 'astro-bh-05') {
    const virgo = EXTRAGALACTIC_CATALOG.find((g) => g.id === 'virgo-cluster')!;
    return resolveUniverseTarget(virgo.id, ephemeris, memories);
  }

  // 5. Remaining Milky Way Catalog Nodes (Exoplanets, Bright Stars, Pulsars, Nebulae)
  const mem = memories.find((m) => m.id === rawId);
  if (mem) {
    const posM = computeCatalogNodeGalacticPosM(mem);
    const astro = getScientificAstrometry(mem.id);
    const isStar = mem.id.startsWith('star-');
    const radiusM = astro?.diameterKmNumeric
      ? astro.diameterKmNumeric * 500
      : isStar
        ? SOLAR_RADIUS_M
        : EARTH_MEAN_RADIUS_M * 1.5;
    return {
      id: mem.id,
      label: mem.title.split(' — ')[0],
      position: { anchor: 'galactic', offsetM: posM },
      radiusM,
      idealDistM: Math.max(radiusM * 4.5, 0.015 * LIGHT_YEAR_METERS),
      idealYaw: 0.5,
      idealPitch: 0.28,
      provenance: 'measured',
      showSurfaceAltitude: false,
    };
  }

  // Fallback: Earth
  return resolveUniverseTarget('earth', ephemeris, memories);
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
