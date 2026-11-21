/**
 * Real Extragalactic Catalog: Local Group, Nearby Galaxies & Galaxy Clusters (Phase 3).
 *
 * HARD RULE: Zero invented positions or distances.
 * - Local Group members: McConnachie (2012), AJ 144, 4 ("The Observed Properties of
 *   Dwarf Galaxies in and around the Local Group", updated catalog).
 * - Nearby galaxies & galaxy clusters: NASA/IPAC Extragalactic Database (NED, 2024),
 *   2MASS Redshift Survey (2MRS, Huchra et al. 2012), Tully et al. (2023) Cosmicflows-4.
 *
 * Provenance separation:
 *   - `positionIllustrative: false` -> measured J2000 (RA, Dec) & distance (Mpc).
 *   - `morphologyIllustrative: true` -> 3D shader visual disc/elliptical/cluster sprite.
 */

import { KILOPARSEC_METERS, MEGAPARSEC_METERS } from './constants';
import { raDecDistToThreeGalacticM, SUN_GALACTOCENTRIC_THREE_M } from './ephemeris';
import { addVec3d, Vec3d } from './scale-engine';

export type ExtragalacticMorphology =
  | 'barred-spiral'
  | 'spiral'
  | 'elliptical'
  | 'irregular'
  | 'dwarf-sph'
  | 'cluster';

export type ExtragalacticGroup = 'local-group' | 'nearby-galaxies' | 'galaxy-clusters';

export interface ExtragalacticEntry {
  id: string;
  name: string;
  designation: string;
  group: ExtragalacticGroup;
  morphology: ExtragalacticMorphology;
  /** J2000 Right Ascension [deg]. */
  raDeg: number;
  /** J2000 Declination [deg]. */
  decDeg: number;
  /** Heliocentric distance [Mpc]. */
  distanceMpc: number;
  /** Physical optical/virial diameter [kpc]. */
  diameterKpc: number;
  /** Approximate stellar or total dynamical mass label. */
  massLabel: string;
  /** Visual tint color [hex] calibrated to spectral type (young blue spiral vs old golden elliptical). */
  tintHex: string;
  /** Disk inclination [deg] for spiral sprites. */
  inclinationDeg: number;
  /** Position angle [deg] for sprite orientation. */
  positionAngleDeg: number;
  /** Measured astrometry/distance provenance. */
  positionIllustrative: false;
  /** Visual sprite morphology is procedural/illustrative. */
  morphologyIllustrative: true;
  /** Peer-reviewed source citation. */
  source: string;
}

export const EXTRAGALACTIC_CATALOG: readonly ExtragalacticEntry[] = [
  // -------------------------------------------------------------------------
  // Local Group (McConnachie 2012, AJ 144, 4)
  // -------------------------------------------------------------------------
  {
    id: 'mw-galaxy',
    name: 'Milky Way',
    designation: 'SBbc Barred Spiral',
    group: 'local-group',
    morphology: 'barred-spiral',
    raDeg: 266.4168,
    decDeg: -29.0078,
    distanceMpc: 0.008178,
    diameterKpc: 32.0,
    massLabel: '~1.15 × 10¹² M☉',
    tintHex: '#f5e2c4',
    inclinationDeg: 0,
    positionAngleDeg: 0,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: 'GRAVITY Collaboration (2019); Bland-Hawthorn & Gerhard (2016)',
  },
  {
    id: 'sgr-dsph',
    name: 'Sagittarius dSph',
    designation: 'SagDEG',
    group: 'local-group',
    morphology: 'dwarf-sph',
    raDeg: 283.8313,
    decDeg: -30.5453,
    distanceMpc: 0.026,
    diameterKpc: 3.1,
    massLabel: '~4 × 10⁸ M☉',
    tintHex: '#f3d4a0',
    inclinationDeg: 45,
    positionAngleDeg: 102,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: 'McConnachie (2012), AJ 144, 4',
  },
  {
    id: 'lmc',
    name: 'Large Magellanic Cloud',
    designation: 'LMC · ESO 56-G 115',
    group: 'local-group',
    morphology: 'irregular',
    raDeg: 80.8942,
    decDeg: -69.7561,
    distanceMpc: 0.04997,
    diameterKpc: 9.8,
    massLabel: '~1.38 × 10¹¹ M☉',
    tintHex: '#b9d8ff',
    inclinationDeg: 35,
    positionAngleDeg: 122,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: 'Pietrzynski et al. (2019), Nature 567, 200; McConnachie (2012)',
  },
  {
    id: 'smc',
    name: 'Small Magellanic Cloud',
    designation: 'SMC · NGC 292',
    group: 'local-group',
    morphology: 'irregular',
    raDeg: 13.1583,
    decDeg: -72.8003,
    distanceMpc: 0.06244,
    diameterKpc: 5.8,
    massLabel: '~7 × 10⁹ M☉',
    tintHex: '#c6deff',
    inclinationDeg: 68,
    positionAngleDeg: 45,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: 'Graczyk et al. (2020), ApJ 904, 13; McConnachie (2012)',
  },
  {
    id: 'draco-dsph',
    name: 'Draco Dwarf',
    designation: 'UGC 10822',
    group: 'local-group',
    morphology: 'dwarf-sph',
    raDeg: 260.0517,
    decDeg: 57.9153,
    distanceMpc: 0.076,
    diameterKpc: 0.9,
    massLabel: '~2.2 × 10⁷ M☉',
    tintHex: '#f0d8b2',
    inclinationDeg: 30,
    positionAngleDeg: 89,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: 'McConnachie (2012), AJ 144, 4',
  },
  {
    id: 'sculptor-dsph',
    name: 'Sculptor Dwarf',
    designation: 'ESO 351-G 30',
    group: 'local-group',
    morphology: 'dwarf-sph',
    raDeg: 15.0392,
    decDeg: -33.7092,
    distanceMpc: 0.086,
    diameterKpc: 1.1,
    massLabel: '~1.4 × 10⁷ M☉',
    tintHex: '#ecd4b0',
    inclinationDeg: 38,
    positionAngleDeg: 99,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: 'McConnachie (2012), AJ 144, 4',
  },
  {
    id: 'fornax-dsph',
    name: 'Fornax Dwarf',
    designation: 'ESO 356-G 04',
    group: 'local-group',
    morphology: 'dwarf-sph',
    raDeg: 39.9971,
    decDeg: -34.4492,
    distanceMpc: 0.147,
    diameterKpc: 2.8,
    massLabel: '~6.8 × 10⁷ M☉',
    tintHex: '#f1d9b4',
    inclinationDeg: 31,
    positionAngleDeg: 41,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: 'McConnachie (2012), AJ 144, 4',
  },
  {
    id: 'leo-i',
    name: 'Leo I',
    designation: 'DDO 74',
    group: 'local-group',
    morphology: 'dwarf-sph',
    raDeg: 152.1171,
    decDeg: 12.3064,
    distanceMpc: 0.254,
    diameterKpc: 1.0,
    massLabel: '~2.2 × 10⁷ M☉',
    tintHex: '#ebd6b8',
    inclinationDeg: 25,
    positionAngleDeg: 79,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: 'McConnachie (2012), AJ 144, 4',
  },
  {
    id: 'ngc-6822',
    name: "Barnard's Galaxy",
    designation: 'NGC 6822',
    group: 'local-group',
    morphology: 'irregular',
    raDeg: 296.2358,
    decDeg: -14.7892,
    distanceMpc: 0.459,
    diameterKpc: 2.3,
    massLabel: '~1.0 × 10⁸ M☉',
    tintHex: '#b9d4ff',
    inclinationDeg: 60,
    positionAngleDeg: 122,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: 'McConnachie (2012), AJ 144, 4',
  },
  {
    id: 'ic-1613',
    name: 'IC 1613',
    designation: 'DDO 8',
    group: 'local-group',
    morphology: 'irregular',
    raDeg: 16.1992,
    decDeg: 2.1178,
    distanceMpc: 0.755,
    diameterKpc: 3.6,
    massLabel: '~1.0 × 10⁸ M☉',
    tintHex: '#bfd8ff',
    inclinationDeg: 38,
    positionAngleDeg: 58,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: 'McConnachie (2012), AJ 144, 4',
  },
  {
    id: 'm31',
    name: 'Andromeda Galaxy',
    designation: 'M31 · NGC 224',
    group: 'local-group',
    morphology: 'spiral',
    raDeg: 10.6847,
    decDeg: 41.2687,
    distanceMpc: 0.778,
    diameterKpc: 46.5,
    massLabel: '~1.5 × 10¹² M☉',
    tintHex: '#ffe6c6',
    inclinationDeg: 77,
    positionAngleDeg: 38,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: 'McConnachie (2012), AJ 144, 4; Conn et al. (2012), ApJ 758, 11',
  },
  {
    id: 'm32',
    name: 'M32',
    designation: 'NGC 221',
    group: 'local-group',
    morphology: 'elliptical',
    raDeg: 10.6743,
    decDeg: 40.8652,
    distanceMpc: 0.805,
    diameterKpc: 2.0,
    massLabel: '~3 × 10⁹ M☉',
    tintHex: '#ffe2ba',
    inclinationDeg: 30,
    positionAngleDeg: 159,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: 'McConnachie (2012), AJ 144, 4',
  },
  {
    id: 'm110',
    name: 'M110',
    designation: 'NGC 205',
    group: 'local-group',
    morphology: 'elliptical',
    raDeg: 10.0919,
    decDeg: 41.6854,
    distanceMpc: 0.824,
    diameterKpc: 5.2,
    massLabel: '~4 × 10⁹ M☉',
    tintHex: '#f8dfbd',
    inclinationDeg: 55,
    positionAngleDeg: 170,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: 'McConnachie (2012), AJ 144, 4',
  },
  {
    id: 'm33',
    name: 'Triangulum Galaxy',
    designation: 'M33 · NGC 598',
    group: 'local-group',
    morphology: 'spiral',
    raDeg: 23.4621,
    decDeg: 30.6602,
    distanceMpc: 0.859,
    diameterKpc: 18.7,
    massLabel: '~5 × 10¹⁰ M☉',
    tintHex: '#c4dcff',
    inclinationDeg: 54,
    positionAngleDeg: 23,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: 'McConnachie (2012), AJ 144, 4; Conn et al. (2012)',
  },

  // -------------------------------------------------------------------------
  // Nearby Galaxies (NED 2024 / Cosmicflows-4, Tully et al. 2023)
  // -------------------------------------------------------------------------
  {
    id: 'm82',
    name: 'Cigar Galaxy',
    designation: 'M82 · NGC 3034',
    group: 'nearby-galaxies',
    morphology: 'irregular',
    raDeg: 148.9685,
    decDeg: 69.6797,
    distanceMpc: 3.53,
    diameterKpc: 12.5,
    massLabel: '~1.0 × 10¹⁰ M☉',
    tintHex: '#ffc5a6',
    inclinationDeg: 80,
    positionAngleDeg: 65,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: 'Dalcanton et al. (2009), ApJS 183, 67; NED (2024)',
  },
  {
    id: 'ngc-253',
    name: 'Sculptor Galaxy',
    designation: 'NGC 253',
    group: 'nearby-galaxies',
    morphology: 'spiral',
    raDeg: 11.888,
    decDeg: -25.2882,
    distanceMpc: 3.56,
    diameterKpc: 27.6,
    massLabel: '~7 × 10¹⁰ M☉',
    tintHex: '#f8e3c4',
    inclinationDeg: 78,
    positionAngleDeg: 52,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: 'Radburn-Smith et al. (2011), ApJS 195, 18; NED (2024)',
  },
  {
    id: 'm81',
    name: "Bode's Galaxy",
    designation: 'M81 · NGC 3031',
    group: 'nearby-galaxies',
    morphology: 'spiral',
    raDeg: 148.8882,
    decDeg: 69.0653,
    distanceMpc: 3.63,
    diameterKpc: 29.4,
    massLabel: '~7 × 10¹⁰ M☉',
    tintHex: '#ffe3bc',
    inclinationDeg: 59,
    positionAngleDeg: 157,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: 'Gerke et al. (2011), ApJ 743, 176; NED (2024)',
  },
  {
    id: 'cen-a',
    name: 'Centaurus A',
    designation: 'NGC 5128',
    group: 'nearby-galaxies',
    morphology: 'elliptical',
    raDeg: 201.3651,
    decDeg: -43.0191,
    distanceMpc: 3.8,
    diameterKpc: 18.4,
    massLabel: '~1.0 × 10¹² M☉',
    tintHex: '#ffd7aa',
    inclinationDeg: 72,
    positionAngleDeg: 35,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: 'Harris et al. (2010), PASA 27, 457; NED (2024)',
  },
  {
    id: 'm101',
    name: 'Pinwheel Galaxy',
    designation: 'M101 · NGC 5457',
    group: 'nearby-galaxies',
    morphology: 'spiral',
    raDeg: 210.8024,
    decDeg: 54.3488,
    distanceMpc: 6.4,
    diameterKpc: 52.0,
    massLabel: '~1.0 × 10¹¹ M☉',
    tintHex: '#d2e2ff',
    inclinationDeg: 18,
    positionAngleDeg: 39,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: 'Shappee & Stanek (2011), ApJ 733, 124; NED (2024)',
  },
  {
    id: 'm51',
    name: 'Whirlpool Galaxy',
    designation: 'M51 · NGC 5194',
    group: 'nearby-galaxies',
    morphology: 'spiral',
    raDeg: 202.4696,
    decDeg: 47.1953,
    distanceMpc: 8.58,
    diameterKpc: 23.6,
    massLabel: '~1.6 × 10¹¹ M☉',
    tintHex: '#d8e4ff',
    inclinationDeg: 22,
    positionAngleDeg: 172,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: 'McQuinn et al. (2016), ApJ 826, 21; NED (2024)',
  },
  {
    id: 'm104',
    name: 'Sombrero Galaxy',
    designation: 'M104 · NGC 4594',
    group: 'nearby-galaxies',
    morphology: 'spiral',
    raDeg: 189.9976,
    decDeg: -11.6231,
    distanceMpc: 9.55,
    diameterKpc: 29.0,
    massLabel: '~8 × 10¹¹ M☉',
    tintHex: '#ffe5be',
    inclinationDeg: 84,
    positionAngleDeg: 89,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: 'McQuinn et al. (2016), AJ 152, 144; NED (2024)',
  },

  // -------------------------------------------------------------------------
  // Nearby Galaxy Clusters (NED / 2MRS / Mei et al. 2007 / Tully et al. 2023)
  // -------------------------------------------------------------------------
  {
    id: 'virgo-cluster',
    name: 'Virgo Cluster (M87)',
    designation: 'Abell Virgo · M87',
    group: 'galaxy-clusters',
    morphology: 'cluster',
    raDeg: 187.7059,
    decDeg: 12.3911,
    distanceMpc: 16.5,
    diameterKpc: 4400.0,
    massLabel: '~1.2 × 10¹⁵ M☉',
    tintHex: '#ffd9a8',
    inclinationDeg: 25,
    positionAngleDeg: 12,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: 'Mei et al. (2007), ApJ 655, 144; EHT Collaboration (2019)',
  },
  {
    id: 'fornax-cluster',
    name: 'Fornax Cluster',
    designation: 'Abell S0373 · NGC 1399',
    group: 'galaxy-clusters',
    morphology: 'cluster',
    raDeg: 54.6212,
    decDeg: -35.4506,
    distanceMpc: 19.0,
    diameterKpc: 1900.0,
    massLabel: '~7 × 10¹³ M☉',
    tintHex: '#ffe0b5',
    inclinationDeg: 35,
    positionAngleDeg: 60,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: 'Blakeslee et al. (2009), ApJ 694, 556; NED (2024)',
  },
  {
    id: 'perseus-cluster',
    name: 'Perseus Cluster',
    designation: 'Abell 426 · NGC 1275',
    group: 'galaxy-clusters',
    morphology: 'cluster',
    raDeg: 49.9507,
    decDeg: 41.5117,
    distanceMpc: 73.0,
    diameterKpc: 5200.0,
    massLabel: '~6.6 × 10¹⁴ M☉',
    tintHex: '#ffcf9e',
    inclinationDeg: 40,
    positionAngleDeg: 105,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: '2MRS (Huchra et al. 2012); NED (2024)',
  },
  {
    id: 'coma-cluster',
    name: 'Coma Cluster',
    designation: 'Abell 1656 · NGC 4889',
    group: 'galaxy-clusters',
    morphology: 'cluster',
    raDeg: 194.9531,
    decDeg: 27.9807,
    distanceMpc: 99.0,
    diameterKpc: 6100.0,
    massLabel: '~1.0 × 10¹⁵ M☉',
    tintHex: '#ffd4a3',
    inclinationDeg: 20,
    positionAngleDeg: 80,
    positionIllustrative: false,
    morphologyIllustrative: true,
    source: 'Carter et al. (2008), ApJS 176, 424; NED (2024)',
  },
];

/**
 * Compute Galactocentric Three.js Y-up float64 meters for any extragalactic entry.
 * Places Milky Way at origin (0, 0, 0) and all external galaxies relative to the Sun's
 * Galactocentric position using exact Hipparcos J2000 EQJ -> Galactic transformation.
 */
export function getExtragalacticPosThreeM(entry: ExtragalacticEntry): Vec3d {
  if (entry.id === 'mw-galaxy') {
    return [0, 0, 0];
  }
  const helioM = raDecDistToThreeGalacticM(
    entry.raDeg,
    entry.decDeg,
    entry.distanceMpc * MEGAPARSEC_METERS
  );
  return addVec3d(SUN_GALACTOCENTRIC_THREE_M, helioM);
}

/** Convert physical diameter [kpc] to SI meters. */
export function getExtragalacticRadiusM(entry: ExtragalacticEntry): number {
  return (entry.diameterKpc * 0.5) * KILOPARSEC_METERS;
}
