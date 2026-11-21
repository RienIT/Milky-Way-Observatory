import { MemoryNode, PlanetSpec } from './memory-types';
import { MILKY_WAY_NASA_DATA, rotateToGalacticPlane } from './milky-way';

export type SimulationScaleMode = 'atlas' | 'true-1to1';

export type CelestialObjectClass =
  | 'star'
  | 'planet'
  | 'dwarf-planet'
  | 'asteroid'
  | 'comet'
  | 'moon'
  | 'exoplanet'
  | 'black-hole';

export interface ScientificAstrometry {
  objectClass: CelestialObjectClass;
  diameterKmNumeric: number; // Mean diameter in km (Earth = 12,742 km, Sun = 1,392,700 km, Bennu = 0.49 km)
  spectralOrType: string;
  // ESA Gaia DR3 / IAU Galactic Coordinates relative to Sun (l = 0 toward Sgr A*)
  galacticLonDeg: number;
  galacticLatDeg: number;
  distanceFromSunLy: number;
  // Heliocentric orbital parameters (for Solar System planets, dwarf planets, asteroids, comets)
  semiMajorAxisAu?: number;
  perihelionAu?: number;
  aphelionAu?: number;
  orbitalPeriodLabel: string;
  massLabel: string;
  irregularShape?: [number, number, number]; // Triaxial asteroid proportions (e.g. Vesta, Bennu, 'Oumuamua)
  hasCometTail?: boolean;
  sourceCitation: string;
}

/**
 * Exact ESA Gaia DR3 transformation from Galactic Spherical Coordinates (l, b, d_ly)
 * into Galactocentric Cartesian Coordinates (in light-years and scene units).
 *
 * Convention (Gaia DR3 / Reid et al. 2019 / GRAVITY 2022):
 * - Origin (0, 0, 0) = Sagittarius A* (Galactic Center)
 * - Sun sits at R0 = 26,670 ly (~8.18 kpc) on the Orion-Cygnus Local Spur
 * - l = 0° points from Sun directly toward Sagittarius A*
 * - l = 90° points along Galactic rotation
 * - b = +90° points toward North Galactic Pole (+Y)
 */
export function computeGalactocentricPosition(
  galacticLonDeg: number,
  galacticLatDeg: number,
  distanceFromSunLy: number
): {
  galactocentricLy: [number, number, number];
  sceneUnits: [number, number, number];
} {
  const r0 = MILKY_WAY_NASA_DATA.sunDistanceLightYears; // 26,670 ly
  const lRad = (galacticLonDeg * Math.PI) / 180;
  const bRad = (galacticLatDeg * Math.PI) / 180;

  // Galactocentric Cartesian in light-years (Sun at (+R0, 0, 0))
  const cosB = Math.cos(bRad);
  const dxFromSun = -distanceFromSunLy * cosB * Math.cos(lRad);
  const dzFromSun = distanceFromSunLy * cosB * Math.sin(lRad);
  const dyFromSun = distanceFromSunLy * Math.sin(bRad);

  const gxLy = r0 + dxFromSun;
  const gyLy = dyFromSun + 55; // Sun sits ~55 ly above galactic midplane
  const gzLy = dzFromSun;

  // Rotate into our Milky Way scene frame where Sun sits at sunOrbitAngleRad on Orion Spur
  const scale = MILKY_WAY_NASA_DATA.sceneUnitsPerLightYear;
  const sunAngle = MILKY_WAY_NASA_DATA.sunOrbitAngleRad;
  const cosA = Math.cos(sunAngle);
  const sinA = Math.sin(sunAngle);

  const rx = (gxLy * cosA - gzLy * sinA) * scale;
  const rz = (gxLy * sinA + gzLy * cosA) * scale;
  const ry = gyLy * scale;

  return {
    galactocentricLy: [gxLy, gyLy, gzLy],
    sceneUnits: rotateToGalacticPlane(rx, ry, rz),
  };
}

/**
 * Exact physical reference constants anchoring our 3D scene to EHT / NASA measurements:
 * - Sagittarius A* Event Horizon shadow diameter = 25,400,000 km -> scene radius = 4.52 units
 * - Shared planet base SphereGeometry radius = 0.64 units
 * Therefore, 1 scene unit of diameter = 2,809,734.5 km in True 1:1 mode.
 */
export const SGRA_EVENT_HORIZON_RADIUS_UNITS = 4.52;
export const SGRA_SHADOW_DIAMETER_KM = 25_400_000;
export const PLANET_BASE_SPHERE_RADIUS = 0.64;

/**
 * NASA JPL Heliocentric Asteroid Belt (2.2–3.2 AU) and Kuiper Belt (30–50 AU) bounds.
 */
export const SOLAR_SYSTEM_MAIN_BELT_AU = { inner: 2.2, outer: 3.2 } as const;
export const SOLAR_SYSTEM_KUIPER_BELT_AU = { inner: 30.0, outer: 50.0 } as const;

/**
 * Maps Solar System natural satellites to their host planet in True 1:1 heliocentric mode.
 * Orbit radii are scaled proportionally outside the host planet's globe + rings.
 */
export const SOLAR_SYSTEM_MOON_PARENTS: Record<
  string,
  { parentId: string; orbitRadiusUnits: number; orbitSpeed: number; inclinationRad: number }
> = {
  'small-moon': {
    parentId: 'astro-ocean-01',
    orbitRadiusUnits: 0.014,
    orbitSpeed: 1.45,
    inclinationRad: 0.09,
  },
  'astro-lava-04': {
    parentId: 'astro-gas-03',
    orbitRadiusUnits: 0.048,
    orbitSpeed: 2.6,
    inclinationRad: 0.02,
  },
  'astro-ice-04': {
    parentId: 'astro-gas-03',
    orbitRadiusUnits: 0.068,
    orbitSpeed: 1.8,
    inclinationRad: 0.03,
  },
  'small-ganymede': {
    parentId: 'astro-gas-03',
    orbitRadiusUnits: 0.095,
    orbitSpeed: 1.15,
    inclinationRad: 0.025,
  },
  'astro-ice-05': {
    parentId: 'astro-gas-02',
    orbitRadiusUnits: 0.088,
    orbitSpeed: 0.92,
    inclinationRad: 0.04,
  },
};

/**
 * Converts a NASA JPL heliocentric semi-major axis (in AU) into proportional scene units
 * around the Sun on the Orion-Cygnus Spur:
 * - Sun photosphere radius = 0.248 units
 * - Mercury (0.39 AU) = 0.417 -> Venus (0.72 AU) = 0.464 -> Earth (1.0 AU) = 0.505 -> Mars (1.52 AU) = 0.580
 * - Main Asteroid Belt (2.2–3.2 AU) = 0.679–0.824 (Ceres 2.77 AU & Vesta 2.36 AU sit right inside!)
 * - Jupiter (5.2 AU) = 1.114 -> Saturn (9.54 AU) = 1.743 -> Uranus (19.19 AU) = 3.143 -> Neptune (30.06 AU) = 4.719
 * - Kuiper Belt (30–50 AU) = 4.710–7.610 (Pluto 39.48 AU sits right inside!) -> Eris (67.9 AU) = 10.206
 */
export function computeHeliocentricOrbitRadiusUnits(semiMajorAxisAu: number): number {
  const safeAu = Math.max(0, semiMajorAxisAu);
  return Number((0.36 + safeAu * 0.145).toFixed(4));
}

/**
 * True 1:1 Scientific Diameter Scaling Engine anchored directly to Sagittarius A*'s 4.52-unit event horizon (25.4M km):
 * - Sagittarius A* Event Horizon (25,400,000 km) -> radius 4.520 units (scale 7.0625)
 * - The Sun (1,392,700 km = 1/18.24 Sgr A*)     -> radius 0.2478 units (scale 0.3872) — exact linear!
 * - Jupiter (139,820 km = 1/10 Sun = 1/182 Sgr A*) -> radius 0.0249 units (scale 0.0389) — exact linear!
 * - Saturn (116,460 km)                          -> radius 0.0207 units (scale 0.0324) — exact linear!
 * - Earth (12,742 km = 1/109.3 Sun = 1/1,993 Sgr A*) -> radius 0.00227 units (scale 0.00354) — exact linear!
 * - Mars (6,779 km) -> 0.00121 | Mercury (4,879 km) -> 0.000868 | Pluto (2,377 km) -> 0.000423
 * - Ceres (939 km) -> 0.000167 | 4 Vesta (525 km) -> 0.0000935
 * - Small asteroids/comets (<200 km: Halley, Bennu, 'Oumuamua) preserve strict monotonic order down to
 *   logarithmic-depth-buffer safe floor (~0.00005 scale) so they zoom cleanly with zero clipping.
 * - Supergiant/Hypergiant stars (>6M km: Polaris, Rigel, Antares, Betelgeuse, UY Scuti) compress gently
 *   above 6M km so they tower dramatically over the Sun while never visually dwarfing Sagittarius A*'s core.
 */
export function computeTrue1To1RadiusScale(
  diameterKm: number,
  objectClass: CelestialObjectClass
): number {
  const safeDiameterKm = Math.max(0.05, diameterKm);
  const scalePerKm =
    SGRA_EVENT_HORIZON_RADIUS_UNITS /
    (SGRA_SHADOW_DIAMETER_KM * PLANET_BASE_SPHERE_RADIUS);

  if (objectClass === 'black-hole') {
    // Sagittarius A* (25.4M km) -> 7.0625 (radius 4.52); Cygnus X-1 (86,000 km) -> 0.0239 (radius 0.0153)
    const linearBh = safeDiameterKm * scalePerKm;
    return Math.max(0.005, Math.min(7.0625, linearBh));
  }

  if (objectClass === 'star') {
    // Sun (1.39M km), Alpha Cen (1.70M km), Sirius A (2.38M km): exact 1:1 linear to Sgr A* & planets!
    const linearThresholdKm = 2_400_000;
    if (safeDiameterKm <= linearThresholdKm) {
      return safeDiameterKm * scalePerKm;
    }
    // Gentle logarithmic continuation for bright giants & hypergiants (Vega -> Polaris -> Rigel -> Antares -> Betelgeuse -> UY Scuti)
    // Caps at 0.94 scale (radius 0.60, 7.5x smaller than Sgr A*'s 4.52 shadow) so no star looks like an oversized ping-pong ball in galactic overview
    const baseAtThreshold = linearThresholdKm * scalePerKm; // ~0.667 (radius ~0.427)
    const logExcess = Math.log10(safeDiameterKm / linearThresholdKm); // 0 .. ~2.72
    return Math.min(0.94, baseAtThreshold + logExcess * 0.10);
  }

  // Strictly 1:1 linear diameter ratio for all planets, exoplanets, moons, dwarf planets, and large asteroids (>= 250 km)
  if (safeDiameterKm >= 250) {
    return safeDiameterKm * scalePerKm;
  }

  // Sub-250 km comets & rubble-pile asteroids (Halley 11 km, Bennu 0.49 km, 'Oumuamua 0.23 km):
  // Smooth monotonic floor between 0.000050 and 0.000069 (strictly smaller than 250 km -> 0.0000695)
  const normalizedLog =
    (Math.log10(Math.max(0.05, safeDiameterKm)) - Math.log10(0.05)) /
    (Math.log10(250) - Math.log10(0.05));
  return 0.000048 + Math.max(0, Math.min(1, normalizedLog)) * 0.000021;
}

/**
 * Generates realistic Main Asteroid Belt (2.2–3.2 AU) and Kuiper Belt (30–50 AU) rocky particle distributions
 * that respond dynamically to the user's Graphics Settings.
 */
export function generateRockyBeltParticles(
  totalCount: number,
  innerRadius: number,
  outerRadius: number,
  verticalThickness: number,
  seed: number,
  icyTint = false
): {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  count: number;
} {
  const safeCount = Math.max(0, Math.floor(totalCount));
  const positions = new Float32Array(safeCount * 3);
  const colors = new Float32Array(safeCount * 3);
  const sizes = new Float32Array(safeCount);

  let a = seed >>> 0;
  const rng = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  for (let i = 0; i < safeCount; i++) {
    const theta = rng() * Math.PI * 2;
    // Slight Gaussian clustering toward the middle of the belt (Kirkwood-like density)
    const radialMix = (rng() + rng()) * 0.5;
    const r = innerRadius + radialMix * (outerRadius - innerRadius);
    const y = (rng() - 0.5) * 2.0 * verticalThickness * (0.4 + 0.6 * rng());

    positions[i * 3] = Math.cos(theta) * r;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(theta) * r;

    const shade = 0.52 + 0.42 * rng();
    if (icyTint) {
      // Kuiper Belt icy methane/nitrogen-frosted TNOs
      colors[i * 3] = 0.62 * shade;
      colors[i * 3 + 1] = 0.76 * shade;
      colors[i * 3 + 2] = 0.94 * shade;
    } else {
      // Main Asteroid Belt carbonaceous C-type & silicate S-type rocky asteroids
      colors[i * 3] = 0.78 * shade;
      colors[i * 3 + 1] = 0.72 * shade;
      colors[i * 3 + 2] = 0.64 * shade;
    }

    sizes[i] = 0.65 + Math.pow(rng(), 3.2) * 2.1;
  }

  return { positions, colors, sizes, count: safeCount };
}

/**
 * 18 NEW Real Published Milky Way Stars (ESA Gaia DR3), Dwarf Planets, Asteroids, Comets & Iconic Moons (NASA JPL Horizons)
 */
export const EXTRA_MILKY_WAY_OBJECTS: MemoryNode[] = [
  // ======================== 9 REAL ESA GAIA DR3 MILKY WAY STARS ========================
  {
    id: 'star-sol',
    title: 'Mặt Trời (The Sun · Sol) — Ngôi Sao Lùn Vàng G2V Của Nhánh Lạp Hộ',
    category: 'Ngôi sao Dải Ngân Hà',
    summary: [
      'Đường kính 1.392.700 km (gấp 109,3 lần Trái Đất), chiếm 99,86% tổng khối lượng toàn Hệ Mặt Trời.',
      'Nằm cách tâm hố đen Sagittarius A* đúng 26.670 năm ánh sáng (8,18 kpc) trên Nhánh phụ Lạp Hộ (Orion Spur).',
      'Hoàn thành một vòng quỹ đạo quanh Dải Ngân Hà mỗi 230 triệu năm với vận tốc 230 km/s.',
    ],
    tags: ['star', 'sol', 'gaia-dr3', 'orion-spur'],
    content:
      'Mặt Trời (Sol) là ngôi sao dãy chính quang phổ G2V 4,6 tỷ năm tuổi nằm gần mặt phẳng giữa của Dải Ngân Hà (+55 năm ánh sáng về phía Bắc). Phản ứng tổng hợp hạt nhân Hydro thành Heli ở lõi 15 triệu Kelvin duy trì sự sống trên Trái Đất và giữ 8 hành tinh, các hành tinh lùn, vành đai tiểu hành tinh cùng vành đai Kuiper trong giếng hấp dẫn ổn định.',
    createdAt: 'Nhánh Lạp Hộ (0.00 ly)',
    orbitRadius: 28.4,
    orbitAngle: 0.42,
    orbitSpeed: 0.044,
    orbitTilt: 0.02,
    position: [25.9, 0.5, 11.6],
    starSize: 2.8,
  },
  {
    id: 'star-alpha-cen',
    title: 'Alpha Centauri A/B (Rigil Kentaurus) — Hệ Sao Gần Mặt Trời Nhất',
    category: 'Ngôi sao Dải Ngân Hà',
    summary: [
      'Tọa độ thiên hà Gaia DR3: l = 315,72°, b = -0,67°, cách Hệ Mặt Trời chỉ 4,37 năm ánh sáng.',
      'Hệ ba sao gồm cặp sao giống Mặt Trời Alpha Centauri A (G2V) & B (K1V) cùng sao lùn đỏ Proxima Centauri.',
      'Alpha Centauri A có đường kính 1.702.000 km (1,22 R☉) và sáng gấp 1,5 lần Mặt Trời.',
    ],
    tags: ['star', 'gaia-dr3', 'alpha-centauri', 'nearby'],
    content:
      'Alpha Centauri là hệ sao gần Hệ Mặt Trời nhất trong Dải Ngân Hà. Theo dữ liệu trắc lượng học ESA Gaia DR3, hệ sao nằm ngay sát mặt phẳng thiên hà (b = -0,67°) về hướng chòm sao Bán Nhân Mã. Đây là mục tiêu hàng đầu của các dự án thám hiểm liên sao trong tương lai.',
    createdAt: 'Gaia DR3 (4.37 ly)',
    orbitRadius: 29.8,
    orbitAngle: 5.51,
    orbitSpeed: 0.041,
    orbitTilt: -0.02,
    position: [21.3, -0.6, -20.8],
    starSize: 2.3,
  },
  {
    id: 'star-sirius',
    title: 'Sirius A (Sao Thiên Lang) — Ngôi Sao Sáng Nhất Bầu Trời Đêm',
    category: 'Ngôi sao Dải Ngân Hà',
    summary: [
      'Tọa độ thiên hà Gaia DR3: l = 227,11°, b = -8,89°, khoảng cách 8,60 năm ánh sáng thuộc chòm sao Đại Khuyển.',
      'Sao dãy chính quang phổ A1V màu xanh-trắng rực rỡ, nhiệt độ bề mặt 9.940 K và độ sáng gấp 25,4 lần Mặt Trời.',
      'Quay cùng sao lùn trắng đặc cực độ Sirius B có khối lượng ngang Mặt Trời nhưng kích thước chỉ bằng Trái Đất.',
    ],
    tags: ['star', 'sirius', 'gaia-dr3', 'binary'],
    content:
      'Sirius A (Thiên Lang) có đường kính 2,38 triệu km (1,71 R☉) và cấp sao biểu kiến -1,46, là ngôi sao sáng nhất khi quan sát từ Trái Đất. Đo đạc thị sai chính xác cao từ tàu ESA Gaia xác định khoảng cách 8,60 năm ánh sáng và chuyển động riêng tiến dần về phía Hệ Mặt Trời trong 60.000 năm tới.',
    createdAt: 'Gaia DR3 (8.60 ly)',
    orbitRadius: 31.0,
    orbitAngle: 3.96,
    orbitSpeed: 0.036,
    orbitTilt: -0.08,
    position: [-21.1, -2.4, -22.7],
    starSize: 2.4,
  },
  {
    id: 'star-vega',
    title: 'Vega (Sao Chức Nữ · α Lyrae) — Ngôi Sao Chuẩn Quang Trắc Thiên Văn',
    category: 'Ngôi sao Dải Ngân Hà',
    summary: [
      'Tọa độ thiên hà Gaia DR3: l = 67,44°, b = +19,24°, cách Hệ Mặt Trời 25,04 năm ánh sáng.',
      'Quay cực nhanh (12,5 giờ/vòng) làm xích đạo phình rộng hơn hai cực tới 23%, quang phổ chuẩn A0V.',
      'Sẽ trở thành Sao Bắc Cực của Trái Đất vào khoảng năm 13.727 do hiện tượng tiến động trục quay.',
    ],
    tags: ['star', 'vega', 'gaia-dr3', 'debris-disk'],
    content:
      'Vega là ngôi sao sáng thứ 5 bầu trời đêm và từng là mốc chuẩn cấp sao 0,0 của toàn ngành thiên văn học hiện đại. Kính thiên văn không gian James Webb (JWST) năm 2024 phát hiện đĩa bụi mảnh vỡ cực kỳ trơn mịn xung quanh Vega ở khoảng cách 100 AU.',
    createdAt: 'Gaia DR3 (25.04 ly)',
    orbitRadius: 34.8,
    orbitAngle: 1.18,
    orbitSpeed: 0.033,
    orbitTilt: 0.14,
    position: [13.3, 4.9, 32.1],
    starSize: 2.4,
  },
  {
    id: 'star-polaris',
    title: 'Polaris (Sao Bắc Đẩu · α Ursae Minoris) — Siêu Khổng Lồ Biến Quang Cepheid',
    category: 'Ngôi sao Dải Ngân Hà',
    summary: [
      'Tọa độ thiên hà Gaia DR3: l = 123,28°, b = +26,46°, khoảng cách đo thị sai Gaia DR3 khoảng 446 năm ánh sáng.',
      'Ngôi sao siêu khổng lồ vàng F7Ib có đường kính 52,2 triệu km (gấp 37,5 lần Mặt Trời) và sáng gấp 1.260 lần Mặt Trời.',
      'Là sao biến quang Cepheid gần Trái Đất nhất, đóng vai trò then chốt trong thang đo khoảng cách vũ trụ.',
    ],
    tags: ['star', 'polaris', 'gaia-dr3', 'cepheid'],
    content:
      'Polaris nằm cách thiên cực Bắc chưa đầy 0,7°, là kim chỉ nam thiên văn suốt hàng thiên niên kỷ. Hệ sao gồm ba thành viên Polaris Aa, Ab và B; ngôi sao chính Aa phập phồng nhịp nhàng theo chu kỳ 3,97 ngày giúp các nhà thiên văn hiệu chuẩn định luật Leavitt đo khoảng cách liên thiên hà.',
    createdAt: 'Gaia DR3 (446 ly)',
    orbitRadius: 43.2,
    orbitAngle: 2.15,
    orbitSpeed: 0.025,
    orbitTilt: 0.19,
    position: [-23.7, 8.1, 36.1],
    starSize: 2.7,
  },
  {
    id: 'star-antares',
    title: 'Antares (Tâm Tú Nhị · α Scorpii) — Siêu Khổng Lồ Đỏ Chòm Bọ Cạp',
    category: 'Ngôi sao Dải Ngân Hà',
    summary: [
      'Tọa độ thiên hà: l = 351,95°, b = +15,06°, cách Trái Đất ~550 năm ánh sáng thuộc cụm sao trẻ OB Scorpius.',
      'Đường kính khổng lồ ~946 triệu km (680 lần Mặt Trời) — nếu đặt vào tâm Hệ Mặt Trời sẽ nuốt trọn quỹ đạo Sao Hỏa.',
      'Quang phổ M1.5Iab với khí quyển đối lưu hỗn loạn sục sôi, chuẩn bị kết thúc đời bằng vụ nổ Siêu tân tinh loại II.',
    ],
    tags: ['star', 'antares', 'supergiant', 'gaia-dr3'],
    content:
      'Antares là ngôi sao sáng nhất chòm sao Bọ Cạp (Scorpius), nổi bật với sắc đỏ cam rực rỡ đối nghịch với Sao Hỏa. Quan sát giao thoa kế VLTI của ESO đã chụp được bản đồ vận tốc khí quyển đầu tiên ngoài Mặt Trời, tiết lộ các luồng khí đối lưu khổng lồ phun ra xa gấp nhiều lần bán kính sao.',
    createdAt: 'VLTI / Gaia (550 ly)',
    orbitRadius: 47.4,
    orbitAngle: 6.14,
    orbitSpeed: 0.022,
    orbitTilt: 0.11,
    position: [46.9, 5.2, -6.6],
    starSize: 3.1,
  },
  {
    id: 'star-betelgeuse',
    title: 'Betelgeuse (Tham Tú Tứ · α Orionis) — Siêu Khổng Lồ Đỏ Vai Lạp Hộ',
    category: 'Ngôi sao Dải Ngân Hà',
    summary: [
      'Tọa độ thiên hà: l = 199,79°, b = -8,96°, khoảng cách radio/VLBA khoảng 642 năm ánh sáng trong Nhánh Lạp Hộ.',
      'Đường kính ~1,064 tỷ km (~764 R☉), thể tích đủ chứa hơn 400 triệu Mặt Trời.',
      'Sự kiện "Đại Suy Giảm Độ Sáng" (2019–2020) được Hubble xác nhận do vụ phun trào đám mây bụi khổng lồ từ bề mặt.',
    ],
    tags: ['star', 'betelgeuse', 'supergiant', 'orion-spur'],
    content:
      'Betelgeuse là ngôi sao siêu khổng lồ đỏ biểu tượng trên vai phải chòm sao Lạp Hộ (Orion). Vì quá sáng làm bão hòa cảm biến Gaia, khoảng cách ~548–642 năm ánh sáng được đo bằng tổ hợp kính thiên văn vô tuyến VLBA và Hipparcos. Ngôi sao dự kiến phát nổ thành Siêu tân tinh trong vòng 100.000 năm tới.',
    createdAt: 'VLBA / Hubble (642 ly)',
    orbitRadius: 50.8,
    orbitAngle: 3.49,
    orbitSpeed: 0.021,
    orbitTilt: -0.09,
    position: [-47.8, -4.5, -17.2],
    starSize: 3.2,
  },
  {
    id: 'star-rigel',
    title: 'Rigel (Sâm Tú Thất · β Orionis) — Siêu Khổng Lồ Xanh Cực Sáng',
    category: 'Ngôi sao Dải Ngân Hà',
    summary: [
      'Tọa độ thiên hà: l = 209,24°, b = -25,25°, khoảng cách ~860 năm ánh sáng trong tinh vân phức hợp Lạp Hộ.',
      'Siêu khổng lồ xanh B8Ia có nhiệt độ bề mặt 12.100 K và độ sáng gấp 120.000 lần Mặt Trời.',
      'Chiếu sáng Tinh vân Đầu Phù Thủy (Witch Head Nebula) bằng bức xạ tử ngoại mãnh liệt.',
    ],
    tags: ['star', 'rigel', 'blue-supergiant', 'orion-spur'],
    content:
      'Rigel là ngôi sao sáng nhất chòm sao Lạp Hộ và sáng thứ 7 toàn bầu trời đêm dù nằm xa tới 860 năm ánh sáng. Với khối lượng gấp 21 lần Mặt Trời và bán kính 79 R☉ (đường kính ~110 triệu km), Rigel đốt cháy nhiên liệu hạt nhân nhanh gấp hàng chục nghìn lần Mặt Trời.',
    createdAt: 'Gaia / VLBA (860 ly)',
    orbitRadius: 54.6,
    orbitAngle: 3.65,
    orbitSpeed: 0.019,
    orbitTilt: -0.18,
    position: [-47.7, -9.8, -26.6],
    starSize: 2.9,
  },
  {
    id: 'star-uy-scuti',
    title: 'UY Scuti — Ngôi Sao Cực Siêu Khổng Lồ Đỏ Nhánh Scutum-Centaurus',
    category: 'Ngôi sao Dải Ngân Hà',
    summary: [
      'Tọa độ thiên hà Gaia DR3: l = 18,57°, b = -0,30°, khoảng cách hiệu chỉnh mới theo Gaia DR3 ~5.900 năm ánh sáng.',
      'Đường kính ước tính ~1,26 tỷ km (~905 R☉ theo thị sai Gaia DR3), nằm giữa dải sao giàu kim loại hướng tâm Ngân Hà.',
      'Bầu khí quyển cực loãng đang thổi mất khối lượng dữ dội tạo lớp vỏ bụi silicat dày bao quanh.',
    ],
    tags: ['star', 'uy-scuti', 'hypergiant', 'gaia-dr3'],
    content:
      'UY Scuti là một trong những ngôi sao lớn nhất từng được đo đạc trong Dải Ngân Hà. Trước kỷ nguyên Gaia, UY Scuti từng được ước tính 1.700 R☉ ở khoảng cách 9.500 năm ánh sáng; các công bố thị sai chính xác từ ESA Gaia DR3 hiệu chỉnh khoảng cách xuống ~5.900 năm ánh sáng (~1,8 kpc), nhưng UY Scuti vẫn là một gã khổng lồ đỏ choáng ngợp.',
    createdAt: 'Gaia DR3 (5.900 ly)',
    orbitRadius: 61.5,
    orbitAngle: 0.32,
    orbitSpeed: 0.016,
    orbitTilt: -0.01,
    position: [58.3, -0.6, 19.3],
    starSize: 3.4,
  },

  // ============== 9 REAL NASA JPL DWARF PLANETS, ASTEROIDS, COMETS & MOONS ==============
  {
    id: 'small-moon',
    title: 'Mặt Trăng (The Moon · Luna) — Vệ Tinh Tự Nhiên Của Trái Đất',
    category: 'Tiểu hành tinh, Hành tinh Lùn & Sao chổi',
    summary: [
      'Đường kính 3.474,8 km (0,273 R⊕), quỹ đạo trung bình 384.400 km quanh Trái Đất (1,00 AU từ Mặt Trời).',
      'Khóa thủy triều đồng bộ, điều hòa độ nghiêng trục 23,4° giúp khí hậu Trái Đất ổn định suốt hàng tỷ năm.',
      'Thiên thể duy nhất ngoài Trái Đất từng đón bước chân con người (Apollo 11–17) và là mục tiêu NASA Artemis.',
    ],
    tags: ['moon', 'nasa-jpl', 'solar-system', 'artemis'],
    content:
      'Mặt Trăng hình thành khoảng 4,5 tỷ năm trước sau vụ va chạm khổng lồ giữa Trái Đất sơ khai và tiền hành tinh Theia. Bề mặt lưu giữ các biển bazan tối (Maria), cao nguyên cổ đầy hố thiên thạch và băng nước vĩnh cửu tại các hố cực Nam Shackleton.',
    createdAt: 'Hệ Mặt Trời (1.00 AU)',
    orbitRadius: 29.2,
    orbitAngle: 0.62,
    orbitSpeed: 0.042,
    orbitTilt: 0.04,
    position: [23.8, 1.1, 16.9],
    starSize: 0.9,
  },
  {
    id: 'small-ganymede',
    title: 'Mặt trăng Ganymede (Jupiter III) — Vệ Tinh Lớn Nhất Hệ Mặt Trời',
    category: 'Tiểu hành tinh, Hành tinh Lùn & Sao chổi',
    summary: [
      'Đường kính 5.268 km (0,413 R⊕) — lớn hơn cả hành tinh Sao Thủy (4.879 km) và Sao Diêm Vương.',
      'Vệ tinh duy nhất trong Hệ Mặt Trời tự sinh ra từ trường nội tại mạnh mẽ nhờ lõi sắt lỏng đối lưu.',
      'Tàu vũ trụ ESA JUICE đang trên hành trình tới nghiên cứu đại dương nước mặn ngầm sâu dưới lớp vỏ băng.',
    ],
    tags: ['moon', 'ganymede', 'jupiter', 'nasa-jpl'],
    content:
      'Ganymede quay quanh Sao Mộc ở quỹ đạo 5,20 AU từ Mặt Trời. Kính thiên văn Hubble đã quan sát thấy cực quang dao động trên hai cực của Ganymede, bằng chứng thuyết phục về một đại dương nước mặn khổng lồ chứa lượng nước lớn hơn toàn bộ các đại dương Trái Đất cộng lại.',
    createdAt: 'Hệ Sao Mộc (5.20 AU)',
    orbitRadius: 40.2,
    orbitAngle: 2.38,
    orbitSpeed: 0.028,
    orbitTilt: 0.03,
    position: [-29.0, 1.2, 27.8],
    starSize: 1.0,
  },
  {
    id: 'small-pluto',
    title: 'Sao Diêm Vương (134340 Pluto) — Hành Tinh Lùn Vành Đai Kuiper',
    category: 'Tiểu hành tinh, Hành tinh Lùn & Sao chổi',
    summary: [
      'Đường kính chuẩn NASA New Horizons: 2.376,6 km (0,186 R⊕); bán trục lớn 39,48 AU (29,66 – 49,31 AU).',
      'Nổi bật với đồng bằng băng Nitơ hình trái tim Sputnik Planitia và những dãy núi băng nước cao 3.500 m.',
      'Hệ đôi kỳ thú cùng vệ tinh lớn Charon (đường kính 1.212 km), cùng quay quanh trọng tâm nằm ngoài bề mặt.',
    ],
    tags: ['dwarf-planet', 'pluto', 'kuiper-belt', 'nasa-jpl'],
    content:
      'Chuyến bay ngang lịch sử của tàu NASA New Horizons năm 2015 đã biến Sao Diêm Vương từ một điểm sáng mờ thành thế giới địa chất sống động bậc nhất vùng rìa Hệ Mặt Trời, với băng Nitơ đối lưu, sương mù xanh methane và khả năng tồn tại đại dương nước lỏng ngầm.',
    createdAt: 'Vành đai Kuiper (39.48 AU)',
    orbitRadius: 56.2,
    orbitAngle: 4.82,
    orbitSpeed: 0.017,
    orbitTilt: 0.16,
    position: [6.0, 8.9, -55.8],
    starSize: 0.85,
  },
  {
    id: 'small-eris',
    title: 'Hành tinh Lùn Eris (136199 Eris) — Thế Giới Băng Vùng Đĩa Phân Tán',
    category: 'Tiểu hành tinh, Hành tinh Lùn & Sao chổi',
    summary: [
      'Đường kính 2.326 km (0,183 R⊕) nhưng nặng hơn Sao Diêm Vương tới 27% nhờ cấu trúc lõi đá đặc.',
      'Quỹ đạo cực elip: bán trục lớn 67,9 AU (cận nhật 37,9 AU – viễn nhật 97,5 AU), chu kỳ 559 năm Trái Đất.',
      'Phát hiện năm 2005 đã trực tiếp thúc đẩy IAU thiết lập định nghĩa chính thức về "Hành tinh Lùn".',
    ],
    tags: ['dwarf-planet', 'eris', 'kuiper-belt', 'nasa-jpl'],
    content:
      'Eris là một trong những vật thể băng lớn và sáng nhất ngoài quỹ đạo Sao Hải Vương (suất phản chiếu tới 96% nhờ lớp băng Methane đóng tuyết siêu trắng). JWST năm 2024 đo được đồng vị D/H trên bề mặt Eris, hé lộ hoạt động địa nhiệt nội tại từ lõi đá.',
    createdAt: 'Đĩa Phân tán (67.9 AU)',
    orbitRadius: 63.4,
    orbitAngle: 1.72,
    orbitSpeed: 0.014,
    orbitTilt: 0.24,
    position: [-9.5, 14.8, 62.6],
    starSize: 0.85,
  },
  {
    id: 'small-ceres',
    title: 'Hành tinh Lùn Ceres (1 Ceres) — Thiên Thể Lớn Nhất Vành Đai Tiểu Hành Tinh',
    category: 'Tiểu hành tinh, Hành tinh Lùn & Sao chổi',
    summary: [
      'Đường kính 939,4 km (0,074 R⊕), bán trục lớn 2,77 AU (2,55 – 2,98 AU) giữa Sao Hỏa và Sao Mộc.',
      'Chiếm gần 1/3 tổng khối lượng toàn bộ Vành đai Tiểu hành tinh chính, là hành tinh lùn duy nhất ở Hệ Mặt Trời trong.',
      'Tàu NASA Dawn phát hiện các đốm sáng muối Natri Cacbonat trong hố Occator từ núi lửa băng nước mặn.',
    ],
    tags: ['dwarf-planet', 'ceres', 'asteroid-belt', 'nasa-jpl'],
    content:
      'Ceres là thiên thể cầu đá-băng duy nhất trong Vành đai Tiểu hành tinh chính. Dữ liệu trọng trường và quang phổ từ tàu quỹ đạo NASA Dawn (2015–2018) xác nhận Ceres có lớp vỏ giàu băng nước, đất sét ngậm nước và túi nước mặn ngầm hoạt động địa chất gần đây.',
    createdAt: 'Vành đai Tiểu hành tinh (2.77 AU)',
    orbitRadius: 33.4,
    orbitAngle: 2.95,
    orbitSpeed: 0.035,
    orbitTilt: 0.09,
    position: [-32.8, 3.0, 6.4],
    starSize: 0.72,
  },
  {
    id: 'small-vesta',
    title: 'Tiểu hành tinh 4 Vesta — Tiền Hành Tinh Đá Khổng Lồ Với Đỉnh Rheasilvia',
    category: 'Tiểu hành tinh, Hành tinh Lùn & Sao chổi',
    summary: [
      'Kích thước chuẩn NASA JPL: 525,4 km (khối elip bất quy tắc 572,6 × 557,2 × 446,4 km), bán trục lớn 2,36 AU.',
      'Sở hữu hố va chạm Rheasilvia rộng 500 km với đỉnh trung tâm cao 22 km — cao tương đương đỉnh Olympus Mons.',
      'Là tiền hành tinh phân dị hoàn chỉnh có lõi sắt-niken, lớp phủ và vỏ bazan như các hành tinh đá.',
    ],
    tags: ['asteroid', 'vesta', 'asteroid-belt', 'nasa-jpl'],
    content:
      '4 Vesta là tiểu hành tinh sáng nhất nhìn từ Trái Đất và là thiên thể lớn thứ hai trong Vành đai Tiểu hành tinh chính. Sứ mệnh NASA Dawn (2011–2012) xác nhận Vesta là nguồn gốc của nhóm thiên thạch HED rơi xuống Trái Đất.',
    createdAt: 'Vành đai Tiểu hành tinh (2.36 AU)',
    orbitRadius: 32.1,
    orbitAngle: 5.18,
    orbitSpeed: 0.037,
    orbitTilt: 0.07,
    position: [14.5, 2.2, -28.6],
    starSize: 0.66,
  },
  {
    id: 'small-bennu',
    title: 'Tiểu hành tinh 101955 Bennu — Tiểu Hành Tinh Cận Trái Đất OSIRIS-REx',
    category: 'Tiểu hành tinh, Hành tinh Lùn & Sao chổi',
    summary: [
      'Đường kính chỉ 490 mét (0,49 km · hình khối con quay 500 × 490 × 460 m), bán trục lớn 1,13 AU (0,90 – 1,36 AU).',
      'Tiểu hành tinh giàu Carbon loại B cấu tạo từ "đống đá rời" cổ đại 4,5 tỷ năm tuổi.',
      'Tàu NASA OSIRIS-REx đã lấy thành công 121,6 gram mẫu vật bề mặt Bennu mang về Trái Đất (9/2023).',
    ],
    tags: ['asteroid', 'bennu', 'osiris-rex', 'nasa-jpl'],
    content:
      '101955 Bennu là một trong những vật thể cận Trái Đất được nghiên cứu kỹ lưỡng nhất lịch sử. Phân tích mẫu vật do tàu NASA OSIRIS-REx mang về đã phát hiện hàm lượng carbon cao, khoáng chất ngậm nước và các khối xây dựng hữu cơ sơ khai của sự sống.',
    createdAt: 'Cận Trái Đất (1.13 AU)',
    orbitRadius: 28.8,
    orbitAngle: 1.52,
    orbitSpeed: 0.041,
    orbitTilt: 0.06,
    position: [1.5, 1.7, 28.7],
    starSize: 0.58,
  },
  {
    id: 'small-halley',
    title: 'Sao chổi 1P/Halley — Sao Chổi Chu Kỳ Ngắn Nổi Tiếng Nhất Lịch Sử',
    category: 'Tiểu hành tinh, Hành tinh Lùn & Sao chổi',
    summary: [
      'Lõi băng-đá tối kích thước 15 × 8 × 8 km (trung bình ~11 km); bán trục lớn 17,9 AU (0,58 AU – 35,3 AU).',
      'Quay ngược chiều quỹ đạo với chu kỳ 75–76 năm; lần quay về cận nhật tiếp theo vào tháng 7/2061.',
      'Khi tiến gần Mặt Trời, băng nước và CO thăng hoa tạo bầu khí quyển Coma và đuôi ion xanh dài hàng chục triệu km.',
    ],
    tags: ['comet', 'halley', 'solar-system', 'nasa-jpl'],
    content:
      'Sao chổi 1P/Halley là sao chổi đầu tiên được Edmond Halley chứng minh có tính chu kỳ (năm 1705) và là mục tiêu chụp ảnh cận cảnh đầu tiên của tàu ESA Giotto (1986). Các mảnh bụi rơi dọc quỹ đạo của Halley tạo nên hai trận mưa sao băng nổi tiếng Eta Aquariids và Orionids hàng năm.',
    createdAt: 'Quỹ đạo Elip (0.58–35.3 AU)',
    orbitRadius: 46.0,
    orbitAngle: 0.88,
    orbitSpeed: 0.029,
    orbitTilt: 0.28,
    position: [29.3, 12.6, 35.4],
    starSize: 0.72,
  },
  {
    id: 'small-oumuamua',
    title: 'Vật thể Liên sao 1I/ʻOumuamua — Vị Khách Đầu Tiên Từ Ngoài Hệ Mặt Trời',
    category: 'Tiểu hành tinh, Hành tinh Lùn & Sao chổi',
    summary: [
      'Kích thước ước tính ~230 × 35 mét (hình điếu xì gà / đĩa dẹt cực dài), bay vào từ hướng sao Vega.',
      'Quỹ đạo Hyperbol độ lệch tâm e = 1,20 với vận tốc dư liên sao 26,3 km/s — không bị lực hấp dẫn Mặt Trời giữ lại.',
      'Phát hiện năm 2017 bởi kính Pan-STARRS (Hawaii), có gia tốc phi hấp dẫn nhẹ do thoát khí băng hydro/nitơ.',
    ],
    tags: ['interstellar', 'asteroid', 'oumuamua', 'nasa-jpl'],
    content:
      '1I/2017 U1 (ʻOumuamua — "Sứ giả đầu tiên từ phương xa" trong tiếng Hawaii) là thiên thể đầu tiên trong lịch sử nhân loại được xác nhận đến từ một hệ sao khác trong Dải Ngân Hà và đi xuyên qua Hệ Mặt Trời.',
    createdAt: 'Quỹ đạo Liên sao (e = 1.20)',
    orbitRadius: 58.6,
    orbitAngle: 2.58,
    orbitSpeed: 0.024,
    orbitTilt: 0.34,
    position: [-49.6, 19.5, 31.2],
    starSize: 0.62,
  },
];

/**
 * Exact PlanetSpec entries for all 18 new real stars, dwarf planets, asteroids, comets & moons
 */
export const EXTRA_MILKY_WAY_SPECS: Record<string, PlanetSpec> = {
  'star-sol': {
    archetypeId: 9,
    designation: 'Sol (G2V · 109.3 R⊕)',
    planetTypeVi: 'Ngôi sao Dãy chính Vàng G2V · Hệ Mặt Trời',
    realInspiration: 'NASA SDO & Parker Solar Probe · Mặt Trời',
    diameterKm: '1.392.700 km (109,3 R⊕)',
    earthRadiusRatio: 109.3,
    atmosphereComposition: 'Plasma H 73.5%, He 24.9%, Nhật hoa 1–3 triệu K',
    surfaceGravity: '27.9 g (274 m/s²)',
    surfaceTemp: '5.778 K (quang cầu)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#fbbf24',
    axialTiltRad: 0.126,
    atmosphereColorHex: '#ffb32b',
    radiusScale: 1.15,
  },
  'star-alpha-cen': {
    archetypeId: 9,
    designation: 'Alpha Centauri A (G2V · 4.37 ly)',
    planetTypeVi: 'Hệ Ba Sao Gần Mặt Trời Nhất',
    realInspiration: 'ESA Gaia DR3 (l=315.72°, b=-0.67°)',
    diameterKm: '1.702.000 km (133,6 R⊕)',
    earthRadiusRatio: 133.6,
    atmosphereComposition: 'Quang cầu G2V giàu kim loại hơn Mặt Trời 1,6×',
    surfaceGravity: '20.4 g',
    surfaceTemp: '5.790 K',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#fde047',
    axialTiltRad: 0.1,
    atmosphereColorHex: '#ffd15c',
    radiusScale: 1.2,
  },
  'star-sirius': {
    archetypeId: 9,
    designation: 'Sirius A (A1V · 8.60 ly)',
    planetTypeVi: 'Sao Dãy chính Xanh-Trắng Sáng Nhất Đêm',
    realInspiration: 'ESA Gaia DR3 (l=227.11°, b=-8.89°)',
    diameterKm: '2.380.000 km (186,8 R⊕)',
    earthRadiusRatio: 186.8,
    atmosphereComposition: 'Quang cầu Hydro nóng A1V + sao lùn trắng Sirius B',
    surfaceGravity: '19.5 g',
    surfaceTemp: '9.940 K',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#bae6fd',
    axialTiltRad: 0.08,
    atmosphereColorHex: '#7dd3fc',
    radiusScale: 1.26,
  },
  'star-vega': {
    archetypeId: 9,
    designation: 'Vega (A0V · 25.04 ly)',
    planetTypeVi: 'Ngôi sao Chuẩn Quang Trắc Xoay Nhanh',
    realInspiration: 'ESA Gaia DR3 & JWST (l=67.44°, b=+19.24°)',
    diameterKm: '3.280.000 km (257,4 R⊕)',
    earthRadiusRatio: 257.4,
    atmosphereComposition: 'Quang cầu A0V xanh trắng + đĩa mảnh vỡ 100 AU',
    surfaceGravity: '10.2 g',
    surfaceTemp: '9.602 K',
    hasRings: true,
    ringInnerRadius: 1.55,
    ringOuterRadius: 2.35,
    ringColorHex: '#bae6fd',
    axialTiltRad: 0.09,
    atmosphereColorHex: '#93c5fd',
    radiusScale: 1.32,
  },
  'star-polaris': {
    archetypeId: 9,
    designation: 'Polaris Aa (F7Ib · 446 ly)',
    planetTypeVi: 'Siêu Khổng Lồ Vàng Biến Quang Cepheid',
    realInspiration: 'ESA Gaia DR3 (l=123.28°, b=+26.46°)',
    diameterKm: '52.200.000 km (37,5 R☉)',
    earthRadiusRatio: 4097,
    atmosphereComposition: 'Khí quyển siêu khổng lồ vàng dao động chu kỳ 3,97 ngày',
    surfaceGravity: '0.11 g',
    surfaceTemp: '6.015 K',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#fef08a',
    axialTiltRad: 0.14,
    atmosphereColorHex: '#fde68a',
    radiusScale: 1.42,
  },
  'star-antares': {
    archetypeId: 9,
    designation: 'Antares (M1.5Iab · 550 ly)',
    planetTypeVi: 'Siêu Khổng Lồ Đỏ Chòm Bọ Cạp',
    realInspiration: 'ESO VLTI & Gaia (l=351.95°, b=+15.06°)',
    diameterKm: '946.000.000 km (680 R☉)',
    earthRadiusRatio: 74240,
    atmosphereComposition: 'Khí quyển đối lưu Plasma đỏ khổng lồ giàu bụi silicat',
    surfaceGravity: '0.0008 g',
    surfaceTemp: '3.660 K',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#fb923c',
    axialTiltRad: 0.18,
    atmosphereColorHex: '#ef4444',
    radiusScale: 1.54,
  },
  'star-betelgeuse': {
    archetypeId: 9,
    designation: 'Betelgeuse (M1-2Ia · 642 ly)',
    planetTypeVi: 'Siêu Khổng Lồ Đỏ Chòm Lạp Hộ',
    realInspiration: 'NASA Hubble & VLBA (l=199.79°, b=-8.96°)',
    diameterKm: '1.064.000.000 km (764 R☉)',
    earthRadiusRatio: 83500,
    atmosphereComposition: 'Các tế bào đối lưu plasma khổng lồ & vỏ bụi đỏ',
    surfaceGravity: '0.0006 g',
    surfaceTemp: '3.600 K',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#f97316',
    axialTiltRad: 0.21,
    atmosphereColorHex: '#f97316',
    radiusScale: 1.58,
  },
  'star-rigel': {
    archetypeId: 9,
    designation: 'Rigel (B8Ia · 860 ly)',
    planetTypeVi: 'Siêu Khổng Lồ Xanh Cực Sáng (120.000 L☉)',
    realInspiration: 'ESA Gaia / VLBA (l=209.24°, b=-25.25°)',
    diameterKm: '109.800.000 km (79 R☉)',
    earthRadiusRatio: 8617,
    atmosphereComposition: 'Gió sao tử ngoại cực mạnh B8Ia',
    surfaceGravity: '0.09 g',
    surfaceTemp: '12.100 K',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#38bdf8',
    axialTiltRad: 0.11,
    atmosphereColorHex: '#38bdf8',
    radiusScale: 1.48,
  },
  'star-uy-scuti': {
    archetypeId: 9,
    designation: 'UY Scuti (M4Ia · 5.900 ly)',
    planetTypeVi: 'Cực Siêu Khổng Lồ Đỏ · Nhánh Scutum-Centaurus',
    realInspiration: 'ESA Gaia DR3 Revised (l=18.57°, b=-0.30°)',
    diameterKm: '1.260.000.000 km (~905 R☉)',
    earthRadiusRatio: 98880,
    atmosphereComposition: 'Vỏ khí-bụi đối lưu khổng lồ mất khối lượng mạnh',
    surfaceGravity: '0.0003 g',
    surfaceTemp: '3.365 K',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#dc2626',
    axialTiltRad: 0.22,
    atmosphereColorHex: '#dc2626',
    radiusScale: 1.65,
  },
  'small-moon': {
    archetypeId: 10,
    designation: 'The Moon (Earth I · 0.27 R⊕)',
    planetTypeVi: 'Vệ tinh Tự nhiên Đá Bazan & Cao nguyên',
    realInspiration: 'NASA LRO & Apollo / Artemis · Mặt Trăng',
    diameterKm: '3.475 km (0,27 R⊕)',
    earthRadiusRatio: 0.273,
    atmosphereComposition: 'Ngoại quyển siêu loãng He, Ar, Ne · Hố va chạm dày đặc',
    surfaceGravity: '0.165 g',
    surfaceTemp: '100 K – 390 K',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#cbd5e1',
    axialTiltRad: 0.116,
    atmosphereColorHex: '#94a3b8',
    radiusScale: 0.25,
  },
  'small-ganymede': {
    archetypeId: 10,
    designation: 'Ganymede (Jupiter III · 0.41 R⊕)',
    planetTypeVi: 'Vệ tinh Lớn Nhất Hệ Mặt Trời (Có Từ Trường)',
    realInspiration: 'NASA Juno & ESA JUICE · Ganymede',
    diameterKm: '5.268 km (0,41 R⊕)',
    earthRadiusRatio: 0.413,
    atmosphereComposition: 'O₂ siêu loãng, vỏ băng rãnh sáng tối + đại dương ngầm',
    surfaceGravity: '0.146 g',
    surfaceTemp: '110 K (-163°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#cbd5e1',
    axialTiltRad: 0.03,
    atmosphereColorHex: '#cbd5e1',
    radiusScale: 0.29,
  },
  'small-pluto': {
    archetypeId: 10,
    designation: '134340 Pluto (39.48 AU · 0.19 R⊕)',
    planetTypeVi: 'Hành tinh Lùn Vành đai Kuiper · Băng Nitơ',
    realInspiration: 'NASA New Horizons · Sputnik Planitia',
    diameterKm: '2.377 km (0,19 R⊕)',
    earthRadiusRatio: 0.1865,
    atmosphereComposition: 'N₂, CH₄, CO mỏng tạo sương mù quang hóa xanh lam',
    surfaceGravity: '0.063 g',
    surfaceTemp: '44 K (-229°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#e2d4c0',
    axialTiltRad: 2.138, // 122.53 deg
    atmosphereColorHex: '#93c5fd',
    radiusScale: 0.22,
  },
  'small-eris': {
    archetypeId: 4,
    designation: '136199 Eris (67.9 AU · 0.18 R⊕)',
    planetTypeVi: 'Hành tinh Lùn Băng Methane Siêu Phản Chiếu',
    realInspiration: 'NASA JPL SSD & JWST 2024 · Eris',
    diameterKm: '2.326 km (0,18 R⊕)',
    earthRadiusRatio: 0.1825,
    atmosphereComposition: 'Băng CH₄ & N₂ đóng tuyết cực trắng (albedo 0.96)',
    surfaceGravity: '0.084 g',
    surfaceTemp: '42 K (-231°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#e0f2fe',
    axialTiltRad: 0.76,
    atmosphereColorHex: '#bae6fd',
    radiusScale: 0.21,
  },
  'small-ceres': {
    archetypeId: 10,
    designation: '1 Ceres (2.77 AU · 0.074 R⊕)',
    planetTypeVi: 'Hành tinh Lùn Vành đai Tiểu hành tinh',
    realInspiration: 'NASA Dawn Mission · Hố muối Occator',
    diameterKm: '939,4 km (0,074 R⊕)',
    earthRadiusRatio: 0.0737,
    atmosphereComposition: 'Hơi nước siêu mỏng cục bộ, vỏ đất sét ngậm nước & muối',
    surfaceGravity: '0.029 g',
    surfaceTemp: '168 K (-105°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#94a3b8',
    axialTiltRad: 0.07,
    atmosphereColorHex: '#94a3b8',
    radiusScale: 0.19,
  },
  'small-vesta': {
    archetypeId: 10,
    designation: '4 Vesta (2.36 AU · 525 km)',
    planetTypeVi: 'Tiểu hành tinh Đá Tiền Hành Tinh (Bất quy tắc)',
    realInspiration: 'NASA Dawn Mission · Đỉnh Rheasilvia 22 km',
    diameterKm: '525,4 km (573 × 557 × 446 km)',
    earthRadiusRatio: 0.0412,
    atmosphereComposition: 'Không khí quyển · Vỏ bazan phân dị & lõi sắt-niken',
    surfaceGravity: '0.025 g',
    surfaceTemp: '180 K (-93°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#a8a29e',
    axialTiltRad: 0.506,
    atmosphereColorHex: '#a8a29e',
    radiusScale: 0.17,
  },
  'small-bennu': {
    archetypeId: 10,
    designation: '101955 Bennu (1.13 AU · 490 m)',
    planetTypeVi: 'Tiểu hành tinh Carbon Cận Trái Đất (Loại B)',
    realInspiration: 'NASA OSIRIS-REx Sample Return (2023)',
    diameterKm: '0,49 km (490 mét · 500×490×460 m)',
    earthRadiusRatio: 0.0000385,
    atmosphereComposition: 'Không khí quyển · Đống đá rời giàu carbon & khoáng nước',
    surfaceGravity: '0.000008 g',
    surfaceTemp: '270 K (-3°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#78716c',
    axialTiltRad: 3.106,
    atmosphereColorHex: '#78716c',
    radiusScale: 0.14,
  },
  'small-halley': {
    archetypeId: 11,
    designation: '1P/Halley (0.58–35.3 AU · 11 km)',
    planetTypeVi: 'Sao chổi Hoạt động · Lõi Băng & Đuôi Ion',
    realInspiration: 'ESA Giotto & NASA JPL · Sao chổi Halley',
    diameterKm: '11 km (lõi 15 × 8 × 8 km)',
    earthRadiusRatio: 0.000863,
    atmosphereComposition: 'Bầu Coma H₂O 80%, CO 10%, bụi hữu cơ & đuôi ion xanh',
    surfaceGravity: '0.00003 g',
    surfaceTemp: '170 K – 360 K (cận nhật)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#38bdf8',
    axialTiltRad: 0.42,
    atmosphereColorHex: '#38bdf8',
    radiusScale: 0.16,
  },
  'small-oumuamua': {
    archetypeId: 10,
    designation: '1I/ʻOumuamua (Interstellar · 230 m)',
    planetTypeVi: 'Vật thể Liên sao Hình Thoi Dài (e = 1.20)',
    realInspiration: 'Pan-STARRS / NASA JPL · 1I/2017 U1',
    diameterKm: '0,23 km (230 × 35 mét)',
    earthRadiusRatio: 0.000018,
    atmosphereComposition: 'Thoát khí nhẹ H₂ / N₂ tạo gia tốc phi hấp dẫn',
    surfaceGravity: '0.000001 g',
    surfaceTemp: '200 K',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#b45309',
    axialTiltRad: 0.92,
    atmosphereColorHex: '#d97706',
    radiusScale: 0.14,
  },
};

/**
 * Complete scientific astrometry metadata lookup for all 48 NASA/Gaia Milky Way objects
 */
export const SCIENTIFIC_ASTROMETRY: Record<string, ScientificAstrometry> = {
  // === 9 REAL GAIA DR3 STARS ===
  'star-sol': {
    objectClass: 'star',
    diameterKmNumeric: 1392700,
    spectralOrType: 'G2V Main-Sequence Star',
    galacticLonDeg: 0.0,
    galacticLatDeg: 0.0,
    distanceFromSunLy: 0.0,
    orbitalPeriodLabel: '230 triệu năm (Quanh Sgr A*)',
    massLabel: '1.00 M☉ (1,989 × 10³⁰ kg)',
    sourceCitation: 'ESA Gaia DR3 / NASA SDO (R₀ = 8.18 kpc)',
  },
  'star-alpha-cen': {
    objectClass: 'star',
    diameterKmNumeric: 1702000,
    spectralOrType: 'G2V + K1V + M5.5Ve Triple',
    galacticLonDeg: 315.72,
    galacticLatDeg: -0.67,
    distanceFromSunLy: 4.37,
    orbitalPeriodLabel: '79,9 năm (nhị phân A-B)',
    massLabel: '1.10 M☉ (A) + 0.91 M☉ (B)',
    sourceCitation: 'ESA Gaia DR3 Astrometry',
  },
  'star-sirius': {
    objectClass: 'star',
    diameterKmNumeric: 2380000,
    spectralOrType: 'A1V + DA2 Binary',
    galacticLonDeg: 227.11,
    galacticLatDeg: -8.89,
    distanceFromSunLy: 8.6,
    orbitalPeriodLabel: '50,13 năm (với Sirius B)',
    massLabel: '2.063 M☉',
    sourceCitation: 'ESA Gaia DR3 Parallax',
  },
  'star-vega': {
    objectClass: 'star',
    diameterKmNumeric: 3280000,
    spectralOrType: 'A0Va Standard Calibrator',
    galacticLonDeg: 67.44,
    galacticLatDeg: 19.24,
    distanceFromSunLy: 25.04,
    orbitalPeriodLabel: '12,5 giờ (tự quay cực nhanh)',
    massLabel: '2.135 M☉',
    sourceCitation: 'ESA Gaia DR3 & JWST 2024',
  },
  'star-polaris': {
    objectClass: 'star',
    diameterKmNumeric: 52200000,
    spectralOrType: 'F7Ib Classical Cepheid',
    galacticLonDeg: 123.28,
    galacticLatDeg: 26.46,
    distanceFromSunLy: 446,
    orbitalPeriodLabel: '3,97 ngày (biến quang)',
    massLabel: '5.13 M☉',
    sourceCitation: 'ESA Gaia DR3 & CHARA Array',
  },
  'star-antares': {
    objectClass: 'star',
    diameterKmNumeric: 946000000,
    spectralOrType: 'M1.5Iab Red Supergiant',
    galacticLonDeg: 351.95,
    galacticLatDeg: 15.06,
    distanceFromSunLy: 550,
    orbitalPeriodLabel: '~1.200 năm (với Antares B)',
    massLabel: '12 – 15 M☉',
    sourceCitation: 'ESO VLTI & Upper Scorpius OB Survey',
  },
  'star-betelgeuse': {
    objectClass: 'star',
    diameterKmNumeric: 1064000000,
    spectralOrType: 'M1–M2Ia-ab Red Supergiant',
    galacticLonDeg: 199.79,
    galacticLatDeg: -8.96,
    distanceFromSunLy: 642,
    orbitalPeriodLabel: '400 ngày (chu kỳ mạch đập)',
    massLabel: '16.5 – 19 M☉',
    sourceCitation: 'VLBA Radio Parallax / NASA Hubble',
  },
  'star-rigel': {
    objectClass: 'star',
    diameterKmNumeric: 109800000,
    spectralOrType: 'B8Ia Blue Supergiant',
    galacticLonDeg: 209.24,
    galacticLatDeg: -25.25,
    distanceFromSunLy: 860,
    orbitalPeriodLabel: 'Hệ 4 sao Orion OB1',
    massLabel: '21 M☉',
    sourceCitation: 'ESA Gaia DR3 / Hipparcos',
  },
  'star-uy-scuti': {
    objectClass: 'star',
    diameterKmNumeric: 1260000000,
    spectralOrType: 'M4Ia Red Hypergiant',
    galacticLonDeg: 18.57,
    galacticLatDeg: -0.3,
    distanceFromSunLy: 5900,
    orbitalPeriodLabel: '740 ngày (biến quang bán đều)',
    massLabel: '7 – 10 M☉',
    sourceCitation: 'ESA Gaia DR3 Revised Distance (1.8 kpc)',
  },

  // === 8 SOLAR SYSTEM PLANETS (NASA JPL SSD / HORIZONS) ===
  'astro-bh-06': {
    objectClass: 'planet',
    diameterKmNumeric: 4879,
    spectralOrType: 'Terrestrial Planet (Sol I)',
    galacticLonDeg: 0,
    galacticLatDeg: 0,
    distanceFromSunLy: 0.000006,
    semiMajorAxisAu: 0.39,
    perihelionAu: 0.31,
    aphelionAu: 0.47,
    orbitalPeriodLabel: '87,97 ngày',
    massLabel: '0.055 M⊕',
    sourceCitation: 'NASA JPL Solar System Dynamics (SSD)',
  },
  'astro-lava-06': {
    objectClass: 'planet',
    diameterKmNumeric: 12104,
    spectralOrType: 'Terrestrial Planet (Sol II)',
    galacticLonDeg: 0,
    galacticLatDeg: 0,
    distanceFromSunLy: 0.000011,
    semiMajorAxisAu: 0.72,
    perihelionAu: 0.718,
    aphelionAu: 0.728,
    orbitalPeriodLabel: '224,7 ngày',
    massLabel: '0.815 M⊕',
    sourceCitation: 'NASA JPL SSD / Magellan',
  },
  'astro-ocean-01': {
    objectClass: 'planet',
    diameterKmNumeric: 12742,
    spectralOrType: 'Terrestrial Ocean Planet (Sol III)',
    galacticLonDeg: 0,
    galacticLatDeg: 0,
    distanceFromSunLy: 0.0000158,
    semiMajorAxisAu: 1.0,
    perihelionAu: 0.983,
    aphelionAu: 1.017,
    orbitalPeriodLabel: '365,256 ngày',
    massLabel: '1.00 M⊕ (5,972 × 10²⁴ kg)',
    sourceCitation: 'NASA JPL Horizons / IAU Reference',
  },
  'astro-ice-01': {
    objectClass: 'planet',
    diameterKmNumeric: 6779,
    spectralOrType: 'Terrestrial Planet (Sol IV)',
    galacticLonDeg: 0,
    galacticLatDeg: 0,
    distanceFromSunLy: 0.000024,
    semiMajorAxisAu: 1.52,
    perihelionAu: 1.38,
    aphelionAu: 1.67,
    orbitalPeriodLabel: '686,98 ngày',
    massLabel: '0.107 M⊕',
    sourceCitation: 'NASA JPL SSD / MRO & Perseverance',
  },
  'astro-gas-03': {
    objectClass: 'planet',
    diameterKmNumeric: 139820,
    spectralOrType: 'Gas Giant (Sol V)',
    galacticLonDeg: 0,
    galacticLatDeg: 0,
    distanceFromSunLy: 0.000082,
    semiMajorAxisAu: 5.2,
    perihelionAu: 4.95,
    aphelionAu: 5.46,
    orbitalPeriodLabel: '11,86 năm',
    massLabel: '317.8 M⊕',
    sourceCitation: 'NASA JPL SSD / Juno',
  },
  'astro-gas-02': {
    objectClass: 'planet',
    diameterKmNumeric: 116460,
    spectralOrType: 'Ringed Gas Giant (Sol VI)',
    galacticLonDeg: 0,
    galacticLatDeg: 0,
    distanceFromSunLy: 0.000151,
    semiMajorAxisAu: 9.54,
    perihelionAu: 9.04,
    aphelionAu: 10.12,
    orbitalPeriodLabel: '29,45 năm',
    massLabel: '95.16 M⊕',
    sourceCitation: 'NASA JPL SSD / Cassini-Huygens',
  },
  'astro-ice-03': {
    objectClass: 'planet',
    diameterKmNumeric: 50724,
    spectralOrType: 'Ice Giant (Sol VII)',
    galacticLonDeg: 0,
    galacticLatDeg: 0,
    distanceFromSunLy: 0.000303,
    semiMajorAxisAu: 19.19,
    perihelionAu: 18.29,
    aphelionAu: 20.1,
    orbitalPeriodLabel: '84,02 năm',
    massLabel: '14.54 M⊕',
    sourceCitation: 'NASA JPL SSD / Voyager 2 & JWST',
  },
  'astro-ice-02': {
    objectClass: 'planet',
    diameterKmNumeric: 49244,
    spectralOrType: 'Ice Giant (Sol VIII)',
    galacticLonDeg: 0,
    galacticLatDeg: 0,
    distanceFromSunLy: 0.000475,
    semiMajorAxisAu: 30.06,
    perihelionAu: 29.81,
    aphelionAu: 30.33,
    orbitalPeriodLabel: '164,8 năm',
    massLabel: '17.15 M⊕',
    sourceCitation: 'NASA JPL SSD / Voyager 2 & JWST',
  },

  // === DWARF PLANETS, ASTEROIDS, COMETS & MOONS ===
  'small-moon': {
    objectClass: 'moon',
    diameterKmNumeric: 3474.8,
    spectralOrType: 'Natural Satellite (Earth I)',
    galacticLonDeg: 0,
    galacticLatDeg: 0,
    distanceFromSunLy: 0.0000158,
    semiMajorAxisAu: 1.0,
    orbitalPeriodLabel: '27,32 ngày (quanh Trái Đất)',
    massLabel: '0.0123 M⊕',
    sourceCitation: 'NASA JPL SSD / LRO',
  },
  'small-ganymede': {
    objectClass: 'moon',
    diameterKmNumeric: 5268,
    spectralOrType: 'Galilean Moon (Jupiter III)',
    galacticLonDeg: 0,
    galacticLatDeg: 0,
    distanceFromSunLy: 0.000082,
    semiMajorAxisAu: 5.2,
    orbitalPeriodLabel: '7,15 ngày (quanh Sao Mộc)',
    massLabel: '0.0248 M⊕',
    sourceCitation: 'NASA JPL SSD / ESA JUICE',
  },
  'astro-lava-04': {
    objectClass: 'moon',
    diameterKmNumeric: 3643,
    spectralOrType: 'Volcanic Moon (Jupiter I)',
    galacticLonDeg: 0,
    galacticLatDeg: 0,
    distanceFromSunLy: 0.000082,
    semiMajorAxisAu: 5.2,
    orbitalPeriodLabel: '1,77 ngày (quanh Sao Mộc)',
    massLabel: '0.015 M⊕',
    sourceCitation: 'NASA JPL / Juno 2024',
  },
  'astro-ice-04': {
    objectClass: 'moon',
    diameterKmNumeric: 3122,
    spectralOrType: 'Icy Ocean Moon (Jupiter II)',
    galacticLonDeg: 0,
    galacticLatDeg: 0,
    distanceFromSunLy: 0.000082,
    semiMajorAxisAu: 5.2,
    orbitalPeriodLabel: '3,55 ngày (quanh Sao Mộc)',
    massLabel: '0.008 M⊕',
    sourceCitation: 'NASA Europa Clipper / JPL',
  },
  'astro-ice-05': {
    objectClass: 'moon',
    diameterKmNumeric: 5150,
    spectralOrType: 'Atmospheric Moon (Saturn VI)',
    galacticLonDeg: 0,
    galacticLatDeg: 0,
    distanceFromSunLy: 0.000151,
    semiMajorAxisAu: 9.54,
    orbitalPeriodLabel: '15,95 ngày (quanh Sao Thổ)',
    massLabel: '0.0225 M⊕',
    sourceCitation: 'NASA Cassini-Huygens / Dragonfly',
  },
  'small-pluto': {
    objectClass: 'dwarf-planet',
    diameterKmNumeric: 2376.6,
    spectralOrType: 'Kuiper Belt Dwarf Planet',
    galacticLonDeg: 0,
    galacticLatDeg: 0,
    distanceFromSunLy: 0.000624,
    semiMajorAxisAu: 39.48,
    perihelionAu: 29.66,
    aphelionAu: 49.31,
    orbitalPeriodLabel: '247,94 năm',
    massLabel: '0.00218 M⊕',
    sourceCitation: 'NASA JPL SSD / New Horizons',
  },
  'small-eris': {
    objectClass: 'dwarf-planet',
    diameterKmNumeric: 2326,
    spectralOrType: 'Scattered-Disc Dwarf Planet',
    galacticLonDeg: 0,
    galacticLatDeg: 0,
    distanceFromSunLy: 0.00107,
    semiMajorAxisAu: 67.9,
    perihelionAu: 37.9,
    aphelionAu: 97.5,
    orbitalPeriodLabel: '559 năm',
    massLabel: '0.0028 M⊕',
    sourceCitation: 'NASA JPL SSD / JWST',
  },
  'small-ceres': {
    objectClass: 'dwarf-planet',
    diameterKmNumeric: 939.4,
    spectralOrType: 'Main-Belt Dwarf Planet',
    galacticLonDeg: 0,
    galacticLatDeg: 0,
    distanceFromSunLy: 0.000044,
    semiMajorAxisAu: 2.77,
    perihelionAu: 2.55,
    aphelionAu: 2.98,
    orbitalPeriodLabel: '4,60 năm',
    massLabel: '0.000157 M⊕',
    sourceCitation: 'NASA JPL SSD / Dawn',
  },
  'small-vesta': {
    objectClass: 'asteroid',
    diameterKmNumeric: 525.4,
    spectralOrType: 'V-Type Main-Belt Asteroid',
    galacticLonDeg: 0,
    galacticLatDeg: 0,
    distanceFromSunLy: 0.000037,
    semiMajorAxisAu: 2.36,
    perihelionAu: 2.15,
    aphelionAu: 2.57,
    orbitalPeriodLabel: '3,63 năm',
    massLabel: '2,59 × 10²⁰ kg',
    irregularShape: [1.12, 0.86, 1.06],
    sourceCitation: 'NASA JPL SSD / Dawn',
  },
  'small-bennu': {
    objectClass: 'asteroid',
    diameterKmNumeric: 0.49,
    spectralOrType: 'B-Type Near-Earth Asteroid',
    galacticLonDeg: 0,
    galacticLatDeg: 0,
    distanceFromSunLy: 0.000018,
    semiMajorAxisAu: 1.13,
    perihelionAu: 0.9,
    aphelionAu: 1.36,
    orbitalPeriodLabel: '1,20 năm (436,6 ngày)',
    massLabel: '7,33 × 10¹⁰ kg',
    irregularShape: [1.05, 0.92, 1.02],
    sourceCitation: 'NASA OSIRIS-REx / JPL Horizons',
  },
  'small-halley': {
    objectClass: 'comet',
    diameterKmNumeric: 11.0,
    spectralOrType: 'Periodic Comet (Halley-type)',
    galacticLonDeg: 0,
    galacticLatDeg: 0,
    distanceFromSunLy: 0.00028,
    semiMajorAxisAu: 17.9,
    perihelionAu: 0.58,
    aphelionAu: 35.3,
    orbitalPeriodLabel: '75,3 năm (Cận nhật 2061)',
    massLabel: '2,2 × 10¹⁴ kg',
    irregularShape: [1.45, 0.78, 0.8],
    hasCometTail: true,
    sourceCitation: 'NASA JPL SSD / ESA Giotto',
  },
  'small-oumuamua': {
    objectClass: 'asteroid',
    diameterKmNumeric: 0.23,
    spectralOrType: 'Interstellar Hyperbolic Object',
    galacticLonDeg: 67.0,
    galacticLatDeg: 18.5,
    distanceFromSunLy: 0.0005,
    orbitalPeriodLabel: 'Không chu kỳ (e = 1,20)',
    massLabel: '~10⁸ kg',
    irregularShape: [2.25, 0.42, 0.52],
    sourceCitation: 'Pan-STARRS / NASA JPL CNEOS',
  },

  // === REAL MILKY WAY BLACK HOLES & EXOPLANETS ===
  'astro-bh-02': {
    objectClass: 'black-hole',
    diameterKmNumeric: 86000,
    spectralOrType: 'Stellar Black Hole Binary (21.2 M☉)',
    galacticLonDeg: 71.33,
    galacticLatDeg: 3.07,
    distanceFromSunLy: 7300,
    orbitalPeriodLabel: '5,6 ngày (với HDE 226868)',
    massLabel: '21.2 M☉',
    sourceCitation: 'VLBA / ESA Gaia DR3 (Miller-Jones et al. 2021)',
  },
  'astro-bh-03': {
    objectClass: 'exoplanet',
    diameterKmNumeric: 13630,
    spectralOrType: 'Terrestrial Exoplanet (M5.5Ve)',
    galacticLonDeg: 313.92,
    galacticLatDeg: -1.92,
    distanceFromSunLy: 4.24,
    orbitalPeriodLabel: '11,186 ngày',
    massLabel: '≥ 1.07 M⊕',
    sourceCitation: 'ESO Pale Red Dot / NASA Exoplanet Archive',
  },
  'astro-bh-04': {
    objectClass: 'black-hole',
    diameterKmNumeric: 25400000,
    spectralOrType: 'Supermassive Black Hole (Galactic Core)',
    galacticLonDeg: 0.0,
    galacticLatDeg: 0.0,
    distanceFromSunLy: 26670,
    orbitalPeriodLabel: 'Tâm Dải Ngân Hà (0, 0, 0)',
    massLabel: '4.300.000 M☉',
    sourceCitation: 'Event Horizon Telescope (EHT 2022) / GRAVITY',
  },
  'astro-ocean-02': {
    objectClass: 'exoplanet',
    diameterKmNumeric: 20770,
    spectralOrType: 'Super-Earth (Habitable Zone)',
    galacticLonDeg: 76.1,
    galacticLatDeg: 13.5,
    distanceFromSunLy: 1400,
    orbitalPeriodLabel: '384,8 ngày',
    massLabel: '~5 M⊕',
    sourceCitation: 'NASA Kepler / Exoplanet Archive',
  },
  'astro-ocean-03': {
    objectClass: 'exoplanet',
    diameterKmNumeric: 11720,
    spectralOrType: 'Terrestrial Exoplanet (TRAPPIST-1)',
    galacticLonDeg: 69.7,
    galacticLatDeg: -56.6,
    distanceFromSunLy: 40.7,
    orbitalPeriodLabel: '6,10 ngày',
    massLabel: '0.692 M⊕',
    sourceCitation: 'NASA Spitzer & JWST',
  },
  'astro-ocean-04': {
    objectClass: 'exoplanet',
    diameterKmNumeric: 33250,
    spectralOrType: 'Hycean Sub-Neptune',
    galacticLonDeg: 254.6,
    galacticLatDeg: 58.6,
    distanceFromSunLy: 124,
    orbitalPeriodLabel: '32,94 ngày',
    massLabel: '8.63 M⊕',
    sourceCitation: 'NASA JWST NIRISS/NIRSpec (2023)',
  },
  'astro-ocean-05': {
    objectClass: 'exoplanet',
    diameterKmNumeric: 30325,
    spectralOrType: 'Ocean Super-Earth',
    galacticLonDeg: 79.3,
    galacticLatDeg: 14.5,
    distanceFromSunLy: 635,
    orbitalPeriodLabel: '289,9 ngày',
    massLabel: '< 9.1 M⊕',
    sourceCitation: 'NASA Kepler Mission',
  },
  'astro-ocean-06': {
    objectClass: 'exoplanet',
    diameterKmNumeric: 14908,
    spectralOrType: 'Earth-Size Exoplanet',
    galacticLonDeg: 76.2,
    galacticLatDeg: 11.7,
    distanceFromSunLy: 580,
    orbitalPeriodLabel: '129,9 ngày',
    massLabel: '~1.4 M⊕',
    sourceCitation: 'NASA Ames / Kepler',
  },
  'astro-gas-01': {
    objectClass: 'exoplanet',
    diameterKmNumeric: 191000,
    spectralOrType: 'Ringed Giant / Brown Dwarf',
    galacticLonDeg: 320.4,
    galacticLatDeg: 18.8,
    distanceFromSunLy: 451,
    orbitalPeriodLabel: '~11 năm',
    massLabel: '~13 – 26 MJ',
    sourceCitation: 'SuperWASP / Leiden Observatory',
  },
  'astro-gas-04': {
    objectClass: 'exoplanet',
    diameterKmNumeric: 161800,
    spectralOrType: 'Hot Jupiter',
    galacticLonDeg: 60.9,
    galacticLatDeg: -3.9,
    distanceFromSunLy: 64.5,
    orbitalPeriodLabel: '2,22 ngày',
    massLabel: '1.13 MJ',
    sourceCitation: 'NASA Hubble & JWST',
  },
  'astro-gas-05': {
    objectClass: 'exoplanet',
    diameterKmNumeric: 247000,
    spectralOrType: 'Ultra-Hot Jupiter',
    galacticLonDeg: 183.7,
    galacticLatDeg: 7.5,
    distanceFromSunLy: 1410,
    orbitalPeriodLabel: '1,09 ngày',
    massLabel: '1.47 MJ',
    sourceCitation: 'NASA Hubble COS / TESS',
  },
  'astro-gas-06': {
    objectClass: 'exoplanet',
    diameterKmNumeric: 144000,
    spectralOrType: 'Gas Giant (8-Planet System)',
    galacticLonDeg: 79.8,
    galacticLatDeg: 19.3,
    distanceFromSunLy: 2840,
    orbitalPeriodLabel: '331,6 ngày',
    massLabel: '~1.2 MJ',
    sourceCitation: 'NASA Kepler Exoplanet Archive',
  },
  'astro-lava-01': {
    objectClass: 'exoplanet',
    diameterKmNumeric: 23830,
    spectralOrType: 'Magma Super-Earth',
    galacticLonDeg: 196.8,
    galacticLatDeg: 37.7,
    distanceFromSunLy: 41.1,
    orbitalPeriodLabel: '17,7 giờ',
    massLabel: '7.99 M⊕',
    sourceCitation: 'NASA JWST MIRI (2024)',
  },
  'astro-lava-02': {
    objectClass: 'exoplanet',
    diameterKmNumeric: 19240,
    spectralOrType: 'Ultra-Short Period Lava Planet',
    galacticLonDeg: 58.6,
    galacticLatDeg: -51.7,
    distanceFromSunLy: 202,
    orbitalPeriodLabel: '6,7 giờ',
    massLabel: '5.08 M⊕',
    sourceCitation: 'NASA K2 / Spitzer',
  },
  'astro-lava-03': {
    objectClass: 'exoplanet',
    diameterKmNumeric: 242000,
    spectralOrType: 'Ultra-Hot Gas Giant (4.600 K)',
    galacticLonDeg: 78.6,
    galacticLatDeg: 1.5,
    distanceFromSunLy: 670,
    orbitalPeriodLabel: '1,48 ngày',
    massLabel: '2.88 MJ',
    sourceCitation: 'NASA TESS & Spitzer',
  },
  'astro-lava-05': {
    objectClass: 'exoplanet',
    diameterKmNumeric: 19100,
    spectralOrType: 'Pulsar Planet (Poltergeist)',
    galacticLonDeg: 311.3,
    galacticLatDeg: 75.4,
    distanceFromSunLy: 2300,
    orbitalPeriodLabel: '66,54 ngày',
    massLabel: '4.3 M⊕',
    sourceCitation: 'Wolszczan & Frail (Arecibo 1992)',
  },
  'astro-ice-06': {
    objectClass: 'exoplanet',
    diameterKmNumeric: 22300,
    spectralOrType: 'Cold Super-Earth (Galactic Bulge)',
    galacticLonDeg: 358.2,
    galacticLatDeg: -2.4,
    distanceFromSunLy: 21500,
    orbitalPeriodLabel: '~10 năm',
    massLabel: '5.5 M⊕',
    sourceCitation: 'ESO / OGLE Microlensing',
  },
};

export function getScientificAstrometry(
  nodeId: string,
  fallbackRadiusRatio = 1.0
): ScientificAstrometry {
  if (SCIENTIFIC_ASTROMETRY[nodeId]) {
    return SCIENTIFIC_ASTROMETRY[nodeId];
  }
  return {
    objectClass: 'exoplanet',
    diameterKmNumeric: Math.round(fallbackRadiusRatio * 12742),
    spectralOrType: 'Milky Way Celestial Object',
    galacticLonDeg: 45,
    galacticLatDeg: 2,
    distanceFromSunLy: 1200,
    orbitalPeriodLabel: 'Quỹ đạo Ngân Hà',
    massLabel: 'NASA / Gaia Estimate',
    sourceCitation: 'NASA Exoplanet Archive / ESA Gaia DR3',
  };
}
