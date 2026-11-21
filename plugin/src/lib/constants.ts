/**
 * Physical & Astronomical Constants (SI Units: meters, kilograms, seconds, degrees).
 *
 * HARD RULE: Zero invented constants. Every value below cites its peer-reviewed
 * paper, space agency, or IAU/CODATA standard and year.
 */

// ---------------------------------------------------------------------------
// Fundamental SI Constants (CODATA 2018 / SI 2019 Redefinition)
// ---------------------------------------------------------------------------

/** Speed of light in vacuum [m/s]. Exact by SI 2019 definition (CODATA 2018). */
export const SPEED_OF_LIGHT_M_S = 299_792_458;

/** Newtonian constant of gravitation [m^3 kg^-1 s^-2]. CODATA 2018 (Tiesinga et al. 2021, Rev. Mod. Phys. 93, 025010). */
export const GRAVITATIONAL_CONSTANT_SI = 6.6743e-11;

// ---------------------------------------------------------------------------
// Astronomical Distance Scales (IAU 2012 Res. B2 & IAU 2015 Res. B2/B3)
// ---------------------------------------------------------------------------

/** Kilometers to meters [m/km]. Exact SI prefix. */
export const METERS_PER_KM = 1_000;

/** Astronomical Unit [m]. Exact by IAU 2012 Resolution B2. */
export const AU_IN_METERS = 149_597_870_700;

/** Julian year [s] = 365.25 * 86400 s. Exact IAU definition. */
export const JULIAN_YEAR_SECONDS = 31_557_600;

/** Julian light-year [m] = c * 365.25 * 86400. Exact IAU definition. */
export const LIGHT_YEAR_METERS = SPEED_OF_LIGHT_M_S * JULIAN_YEAR_SECONDS;

/** Parsec [m] = (648000 / pi) AU. Exact small-angle definition, IAU 2015 Resolution B2 Note 4. */
export const PARSEC_METERS = (AU_IN_METERS * 648_000) / Math.PI;

/** Kiloparsec [m]. Derived from IAU 2015 parsec. */
export const KILOPARSEC_METERS = PARSEC_METERS * 1e3;

/** Megaparsec [m]. Derived from IAU 2015 parsec. */
export const MEGAPARSEC_METERS = PARSEC_METERS * 1e6;

/** Gigaparsec [m]. Derived from IAU 2015 parsec. */
export const GIGAPARSEC_METERS = PARSEC_METERS * 1e9;

/** Light-years per parsec [ly/pc]. Derived from IAU 2015 definitions (~3.261563777). */
export const LIGHT_YEARS_PER_PARSEC = PARSEC_METERS / LIGHT_YEAR_METERS;

// ---------------------------------------------------------------------------
// Solar & Terrestrial Nominal Constants (IAU 2015 Res. B3 / NASA JPL 2024)
// ---------------------------------------------------------------------------

/** Nominal solar mass parameter GM_sun [m^3 s^-2]. Exact nominal value, IAU 2015 Resolution B3. */
export const SOLAR_GM_M3_S2 = 1.3271244e20;

/** Solar mass [kg] = GM_sun / G. Derived from IAU 2015 Res. B3 & CODATA 2018 (~1.98841e30 kg). */
export const SOLAR_MASS_KG = SOLAR_GM_M3_S2 / GRAVITATIONAL_CONSTANT_SI;

/** Nominal solar radius [m]. Exact nominal value, IAU 2015 Resolution B3. */
export const SOLAR_RADIUS_M = 6.957e8;

/** Nominal Earth equatorial radius [m]. Exact nominal value, IAU 2015 Resolution B3. */
export const EARTH_EQUATORIAL_RADIUS_M = 6_378_100;

/** Earth volumetric mean radius [m]. NASA JPL Planetary Fact Sheet (Williams, 2024). */
export const EARTH_MEAN_RADIUS_M = 6_371_008.4;

/** Moon volumetric mean radius [m]. NASA JPL Moon Fact Sheet (Williams, 2024). */
export const MOON_MEAN_RADIUS_M = 1_737_400;

/** Mean Earth–Moon center-to-center semi-major axis [m]. NASA JPL Moon Fact Sheet (Williams, 2024). */
export const EARTH_MOON_MEAN_DISTANCE_M = 384_400_000;

/** Earth atmospheric Karman line altitude [m]. FAI / NOAA standard boundary. */
export const EARTH_KARMAN_LINE_M = 100_000;

// ---------------------------------------------------------------------------
// Sagittarius A* & Milky Way Constants (GRAVITY 2019/2022, EHT 2022, Reid+2019)
// ---------------------------------------------------------------------------

/**
 * Sagittarius A* gravitational mass [M_sun].
 * Source: GRAVITY Collaboration et al. (2022), A&A 657, L12 ("Mass distribution in the Galactic Center based on interferometric astrometry of multiple stellar orbits"), M = 4.297 +/- 0.012 x 10^6 M_sun.
 */
export const SGR_A_MASS_SOLAR = 4.297e6;

/** Sagittarius A* mass [kg]. Derived from GRAVITY 2022 & IAU 2015. */
export const SGR_A_MASS_KG = SGR_A_MASS_SOLAR * SOLAR_MASS_KG;

/**
 * Sagittarius A* Schwarzschild radius r_s = 2 G M / c^2 [m].
 * Derived from GRAVITY Collaboration (2022) mass (~1.2689e10 m ≈ 12.69 million km ≈ 0.08482 AU).
 */
export const SGR_A_SCHWARZSCHILD_RADIUS_M =
  (2 * GRAVITATIONAL_CONSTANT_SI * SGR_A_MASS_KG) /
  (SPEED_OF_LIGHT_M_S * SPEED_OF_LIGHT_M_S);

/** Sagittarius A* photon sphere radius r_ph = 1.5 r_s [m]. Schwarzschild metric exact. */
export const SGR_A_PHOTON_SPHERE_RADIUS_M = 1.5 * SGR_A_SCHWARZSCHILD_RADIUS_M;

/**
 * Sagittarius A* critical impact parameter / shadow radius b_c = sqrt(27)/2 * r_s [m].
 * Schwarzschild metric exact (~2.598 r_s ≈ 3.297e10 m); consistent with EHT Collaboration (2022), ApJL 930, L12 (~51.8 microarcseconds).
 */
export const SGR_A_SHADOW_RADIUS_M =
  (Math.sqrt(27) / 2) * SGR_A_SCHWARZSCHILD_RADIUS_M;

/** Sagittarius A* non-spinning ISCO radius r_isco = 3 r_s [m]. Schwarzschild metric exact. */
export const SGR_A_ISCO_RADIUS_M = 3.0 * SGR_A_SCHWARZSCHILD_RADIUS_M;

/**
 * Galactocentric distance of the Sun R_0 [pc].
 * Source: GRAVITY Collaboration et al. (2019), A&A 625, L10, R_0 = 8178 +/- 13 (stat) +/- 22 (sys) pc
 * (also consistent with GRAVITY 2022 8277 +/- 9 +/- 33 pc within 1.2%).
 */
export const SUN_GALACTOCENTRIC_DISTANCE_PC = 8178;

/** Galactocentric distance of the Sun R_0 [m]. Derived from GRAVITY 2019 & IAU 2015. */
export const SUN_GALACTOCENTRIC_DISTANCE_M =
  SUN_GALACTOCENTRIC_DISTANCE_PC * PARSEC_METERS;

/**
 * Height of the Sun above the Galactic midplane Z_0 [pc].
 * Source: Bennett & Bovy (2019), MNRAS 482, 1417, Z_sun = 20.8 +/- 0.3 pc.
 */
export const SUN_GALACTIC_PLANE_Z_PC = 20.8;

/** Height of the Sun above the Galactic midplane Z_0 [m]. Derived from Bennett & Bovy (2019). */
export const SUN_GALACTIC_PLANE_Z_M = SUN_GALACTIC_PLANE_Z_PC * PARSEC_METERS;

/**
 * Milky Way thin stellar disk effective radius [kpc].
 * Source: Reid et al. (2019), ApJ 885, 131 & Bland-Hawthorn & Gerhard (2016), ARA&A 54, 529.
 */
export const MILKY_WAY_DISK_RADIUS_KPC = 15.5;
export const MILKY_WAY_DISK_RADIUS_M = MILKY_WAY_DISK_RADIUS_KPC * KILOPARSEC_METERS;

/**
 * Milky Way Galactic Bar half-length [kpc] & orientation angle to Sun–GC line [deg].
 * Source: Wegg, Gerhard & Portail (2015), MNRAS 450, 4050 ("The structure of the Milky Way's bar outside the bulge").
 */
export const MILKY_WAY_BAR_HALF_LENGTH_KPC = 5.0;
export const MILKY_WAY_BAR_ANGLE_DEG = 27.0;

// ---------------------------------------------------------------------------
// Reference Frame Orientation Constants (IAU 1958 / Hipparcos J2000 / IAU 2006)
// ---------------------------------------------------------------------------

/**
 * Mean obliquity of the ecliptic at J2000.0 [deg].
 * Source: IAU 2006 / USNO Astronomical Almanac (84381.406 arcsec = 23.439279444 deg; standard J2000 Lieske 1979 = 23.4392911 deg).
 */
export const J2000_OBLIQUITY_DEG = 23.4392911;

/**
 * North Galactic Pole J2000 Equatorial Right Ascension [deg].
 * Source: ESA Hipparcos & Tycho Catalogues (Perryman et al. 1997, Vol. 1, Sec. 1.5.3; IAU 1958 transformed to ICRS/J2000).
 */
export const NGP_RA_J2000_DEG = 192.8594812065348;

/**
 * North Galactic Pole J2000 Equatorial Declination [deg].
 * Source: ESA Hipparcos & Tycho Catalogues (Perryman et al. 1997, Vol. 1, Sec. 1.5.3).
 */
export const NGP_DEC_J2000_DEG = 27.12825118085622;

/**
 * Galactic longitude of the J2000 North Celestial Pole [deg].
 * Source: ESA Hipparcos & Tycho Catalogues (Perryman et al. 1997, Vol. 1, Sec. 1.5.3).
 */
export const GALACTIC_LON_NCP_J2000_DEG = 122.9319185680026;

/**
 * Mutual inclination between the J2000 Ecliptic Plane and the Galactic Plane [deg].
 * Derived from NGP J2000 and J2000 obliquity (~60.189 deg).
 */
export const ECLIPTIC_TO_GALACTIC_TILT_DEG = 60.189;

// ---------------------------------------------------------------------------
// Solar System Physical Data (NASA JPL Planetary Fact Sheets, Williams 2024;
// NASA JPL Solar System Dynamics SSD, 2024)
// ---------------------------------------------------------------------------

export interface SolarSystemBodyPhysical {
  id: string;
  name: string;
  kind: 'star' | 'planet' | 'dwarf-planet' | 'moon';
  parentId: string | null;
  /** Mean volumetric radius [m]. Source: NASA JPL Fact Sheets (2024). */
  meanRadiusM: number;
  /** Equatorial radius [m]. Source: NASA JPL Fact Sheets (2024). */
  equatorialRadiusM: number;
  /** Axial tilt / obliquity to orbit [deg]. Source: NASA JPL Fact Sheets (2024). */
  obliquityDeg: number;
  /** Sidereal rotation period [hours] (negative = retrograde). Source: NASA JPL Fact Sheets (2024). */
  rotationPeriodHours: number;
  /** Mean orbital semi-major axis [AU] for heliocentric bodies, or [m] for moons stored in semiMajorAxisM. */
  semiMajorAxisAu: number;
  /** Mean orbital semi-major axis [m]. */
  semiMajorAxisM: number;
  /** Orbital inclination to ecliptic (for planets) or parent equator/Laplace plane (for moons) [deg]. */
  inclinationDeg: number;
  /** Orbital period [days]. Source: NASA JPL SSD (2024). */
  orbitalPeriodDays: number;
  /** Bond / visual geometric albedo. Source: NASA JPL Fact Sheets (2024). */
  geometricAlbedo: number;
  /** Citation string. */
  source: string;
}

export const SOLAR_SYSTEM_BODIES: Record<string, SolarSystemBodyPhysical> = {
  sun: {
    id: 'sun',
    name: 'Sun',
    kind: 'star',
    parentId: null,
    meanRadiusM: SOLAR_RADIUS_M,
    equatorialRadiusM: SOLAR_RADIUS_M,
    obliquityDeg: 7.25,
    rotationPeriodHours: 609.12, // Carrington sidereal ~25.38 d
    semiMajorAxisAu: 0,
    semiMajorAxisM: 0,
    inclinationDeg: 0,
    orbitalPeriodDays: 0,
    geometricAlbedo: 1.0,
    source: 'IAU 2015 Res. B3 / NASA JPL Sun Fact Sheet (2024)',
  },
  mercury: {
    id: 'mercury',
    name: 'Mercury',
    kind: 'planet',
    parentId: 'sun',
    meanRadiusM: 2_439_700,
    equatorialRadiusM: 2_440_500,
    obliquityDeg: 0.034,
    rotationPeriodHours: 1407.6,
    semiMajorAxisAu: 0.387098,
    semiMajorAxisM: 0.387098 * AU_IN_METERS,
    inclinationDeg: 7.005,
    orbitalPeriodDays: 87.9691,
    geometricAlbedo: 0.142,
    source: 'NASA JPL Mercury Fact Sheet (2024)',
  },
  venus: {
    id: 'venus',
    name: 'Venus',
    kind: 'planet',
    parentId: 'sun',
    meanRadiusM: 6_051_800,
    equatorialRadiusM: 6_051_800,
    obliquityDeg: 177.36,
    rotationPeriodHours: -5832.5,
    semiMajorAxisAu: 0.723332,
    semiMajorAxisM: 0.723332 * AU_IN_METERS,
    inclinationDeg: 3.39458,
    orbitalPeriodDays: 224.701,
    geometricAlbedo: 0.689,
    source: 'NASA JPL Venus Fact Sheet (2024)',
  },
  earth: {
    id: 'earth',
    name: 'Earth',
    kind: 'planet',
    parentId: 'sun',
    meanRadiusM: EARTH_MEAN_RADIUS_M,
    equatorialRadiusM: EARTH_EQUATORIAL_RADIUS_M,
    obliquityDeg: 23.4393,
    rotationPeriodHours: 23.9344696,
    semiMajorAxisAu: 1.00000102,
    semiMajorAxisM: 1.00000102 * AU_IN_METERS,
    inclinationDeg: 0.0,
    orbitalPeriodDays: 365.25636,
    geometricAlbedo: 0.434,
    source: 'IAU 2015 Res. B3 / NASA JPL Earth Fact Sheet (2024)',
  },
  moon: {
    id: 'moon',
    name: 'Moon',
    kind: 'moon',
    parentId: 'earth',
    meanRadiusM: MOON_MEAN_RADIUS_M,
    equatorialRadiusM: 1_738_100,
    obliquityDeg: 6.687,
    rotationPeriodHours: 655.728,
    semiMajorAxisAu: EARTH_MOON_MEAN_DISTANCE_M / AU_IN_METERS,
    semiMajorAxisM: EARTH_MOON_MEAN_DISTANCE_M,
    inclinationDeg: 5.145,
    orbitalPeriodDays: 27.321661,
    geometricAlbedo: 0.136,
    source: 'NASA JPL Moon Fact Sheet (2024)',
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    kind: 'planet',
    parentId: 'sun',
    meanRadiusM: 3_389_500,
    equatorialRadiusM: 3_396_200,
    obliquityDeg: 25.19,
    rotationPeriodHours: 24.6229,
    semiMajorAxisAu: 1.523679,
    semiMajorAxisM: 1.523679 * AU_IN_METERS,
    inclinationDeg: 1.85,
    orbitalPeriodDays: 686.98,
    geometricAlbedo: 0.17,
    source: 'NASA JPL Mars Fact Sheet (2024)',
  },
  ceres: {
    id: 'ceres',
    name: 'Ceres',
    kind: 'dwarf-planet',
    parentId: 'sun',
    meanRadiusM: 469_730,
    equatorialRadiusM: 482_200,
    obliquityDeg: 4.0,
    rotationPeriodHours: 9.074,
    semiMajorAxisAu: 2.769165,
    semiMajorAxisM: 2.769165 * AU_IN_METERS,
    inclinationDeg: 10.594,
    orbitalPeriodDays: 1681.63,
    geometricAlbedo: 0.09,
    source: 'NASA Dawn Mission / JPL SSD Small-Body Database (2024)',
  },
  jupiter: {
    id: 'jupiter',
    name: 'Jupiter',
    kind: 'planet',
    parentId: 'sun',
    meanRadiusM: 69_911_000,
    equatorialRadiusM: 71_492_000,
    obliquityDeg: 3.13,
    rotationPeriodHours: 9.925,
    semiMajorAxisAu: 5.2044,
    semiMajorAxisM: 5.2044 * AU_IN_METERS,
    inclinationDeg: 1.303,
    orbitalPeriodDays: 4332.59,
    geometricAlbedo: 0.538,
    source: 'NASA JPL Jupiter Fact Sheet (2024)',
  },
  io: {
    id: 'io',
    name: 'Io',
    kind: 'moon',
    parentId: 'jupiter',
    meanRadiusM: 1_821_600,
    equatorialRadiusM: 1_829_400,
    obliquityDeg: 0.05,
    rotationPeriodHours: 42.459,
    semiMajorAxisAu: 421_700_000 / AU_IN_METERS,
    semiMajorAxisM: 421_700_000,
    inclinationDeg: 0.05,
    orbitalPeriodDays: 1.769138,
    geometricAlbedo: 0.63,
    source: 'NASA JPL Planetary Satellite Physical Parameters (2024)',
  },
  europa: {
    id: 'europa',
    name: 'Europa',
    kind: 'moon',
    parentId: 'jupiter',
    meanRadiusM: 1_560_800,
    equatorialRadiusM: 1_562_600,
    obliquityDeg: 0.1,
    rotationPeriodHours: 85.228,
    semiMajorAxisAu: 671_034_000 / AU_IN_METERS,
    semiMajorAxisM: 671_034_000,
    inclinationDeg: 0.47,
    orbitalPeriodDays: 3.551181,
    geometricAlbedo: 0.67,
    source: 'NASA JPL Planetary Satellite Physical Parameters (2024)',
  },
  ganymede: {
    id: 'ganymede',
    name: 'Ganymede',
    kind: 'moon',
    parentId: 'jupiter',
    meanRadiusM: 2_634_100,
    equatorialRadiusM: 2_634_100,
    obliquityDeg: 0.2,
    rotationPeriodHours: 171.709,
    semiMajorAxisAu: 1_070_412_000 / AU_IN_METERS,
    semiMajorAxisM: 1_070_412_000,
    inclinationDeg: 0.2,
    orbitalPeriodDays: 7.154553,
    geometricAlbedo: 0.43,
    source: 'NASA JPL Planetary Satellite Physical Parameters (2024)',
  },
  callisto: {
    id: 'callisto',
    name: 'Callisto',
    kind: 'moon',
    parentId: 'jupiter',
    meanRadiusM: 2_410_300,
    equatorialRadiusM: 2_410_300,
    obliquityDeg: 0.19,
    rotationPeriodHours: 400.536,
    semiMajorAxisAu: 1_882_709_000 / AU_IN_METERS,
    semiMajorAxisM: 1_882_709_000,
    inclinationDeg: 0.192,
    orbitalPeriodDays: 16.689018,
    geometricAlbedo: 0.22,
    source: 'NASA JPL Planetary Satellite Physical Parameters (2024)',
  },
  saturn: {
    id: 'saturn',
    name: 'Saturn',
    kind: 'planet',
    parentId: 'sun',
    meanRadiusM: 58_232_000,
    equatorialRadiusM: 60_268_000,
    obliquityDeg: 26.73,
    rotationPeriodHours: 10.656,
    semiMajorAxisAu: 9.5826,
    semiMajorAxisM: 9.5826 * AU_IN_METERS,
    inclinationDeg: 2.485,
    orbitalPeriodDays: 10759.22,
    geometricAlbedo: 0.499,
    source: 'NASA JPL Saturn Fact Sheet (2024)',
  },
  titan: {
    id: 'titan',
    name: 'Titan',
    kind: 'moon',
    parentId: 'saturn',
    meanRadiusM: 2_574_730,
    equatorialRadiusM: 2_574_730,
    obliquityDeg: 0.3,
    rotationPeriodHours: 382.68,
    semiMajorAxisAu: 1_221_870_000 / AU_IN_METERS,
    semiMajorAxisM: 1_221_870_000,
    inclinationDeg: 0.3485,
    orbitalPeriodDays: 15.945421,
    geometricAlbedo: 0.22,
    source: 'NASA JPL Planetary Satellite Physical Parameters (2024)',
  },
  enceladus: {
    id: 'enceladus',
    name: 'Enceladus',
    kind: 'moon',
    parentId: 'saturn',
    meanRadiusM: 252_100,
    equatorialRadiusM: 256_600,
    obliquityDeg: 0.02,
    rotationPeriodHours: 32.885,
    semiMajorAxisAu: 237_948_000 / AU_IN_METERS,
    semiMajorAxisM: 237_948_000,
    inclinationDeg: 0.019,
    orbitalPeriodDays: 1.370218,
    geometricAlbedo: 1.375,
    source: 'NASA JPL Planetary Satellite Physical Parameters (2024)',
  },
  uranus: {
    id: 'uranus',
    name: 'Uranus',
    kind: 'planet',
    parentId: 'sun',
    meanRadiusM: 25_362_000,
    equatorialRadiusM: 25_559_000,
    obliquityDeg: 97.77,
    rotationPeriodHours: -17.24,
    semiMajorAxisAu: 19.19126,
    semiMajorAxisM: 19.19126 * AU_IN_METERS,
    inclinationDeg: 0.773,
    orbitalPeriodDays: 30688.5,
    geometricAlbedo: 0.488,
    source: 'NASA JPL Uranus Fact Sheet (2024)',
  },
  neptune: {
    id: 'neptune',
    name: 'Neptune',
    kind: 'planet',
    parentId: 'sun',
    meanRadiusM: 24_622_000,
    equatorialRadiusM: 24_764_000,
    obliquityDeg: 28.32,
    rotationPeriodHours: 16.11,
    semiMajorAxisAu: 30.07,
    semiMajorAxisM: 30.07 * AU_IN_METERS,
    inclinationDeg: 1.77,
    orbitalPeriodDays: 60195.0,
    geometricAlbedo: 0.442,
    source: 'NASA JPL Neptune Fact Sheet (2024)',
  },
  triton: {
    id: 'triton',
    name: 'Triton',
    kind: 'moon',
    parentId: 'neptune',
    meanRadiusM: 1_353_400,
    equatorialRadiusM: 1_353_400,
    obliquityDeg: 0.0,
    rotationPeriodHours: -141.044,
    semiMajorAxisAu: 354_759_000 / AU_IN_METERS,
    semiMajorAxisM: 354_759_000,
    inclinationDeg: 156.885,
    orbitalPeriodDays: 5.876854,
    geometricAlbedo: 0.76,
    source: 'NASA JPL Planetary Satellite Physical Parameters (2024)',
  },
  pluto: {
    id: 'pluto',
    name: 'Pluto',
    kind: 'dwarf-planet',
    parentId: 'sun',
    meanRadiusM: 1_188_300,
    equatorialRadiusM: 1_188_300,
    obliquityDeg: 122.53,
    rotationPeriodHours: -153.2928,
    semiMajorAxisAu: 39.482,
    semiMajorAxisM: 39.482 * AU_IN_METERS,
    inclinationDeg: 17.16,
    orbitalPeriodDays: 90560.0,
    geometricAlbedo: 0.58,
    source: 'NASA New Horizons / JPL Pluto Fact Sheet (2024)',
  },
};
