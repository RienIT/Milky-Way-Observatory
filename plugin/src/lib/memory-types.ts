export type MemoryCategory =
  | 'Hành tinh Đại dương & Sự sống'
  | 'Khổng lồ Khí & Siêu Vành Đai'
  | 'Hành tinh Dung nham & Cực đoan'
  | 'Thế giới Băng giá & Kỳ dị'
  | 'Hố đen & Hiện tượng Thiên hà'
  | 'Ngôi sao Dải Ngân Hà'
  | 'Tiểu hành tinh, Hành tinh Lùn & Sao chổi';

export interface MemoryNode {
  id: string;
  title: string;
  category: MemoryCategory;
  summary: [string, string, string];
  tags: string[];
  content: string;
  createdAt: string;
  // 3D Orbital parameters around Sagittarius A* core
  orbitRadius: number;
  orbitAngle: number;
  orbitSpeed: number;
  orbitTilt: number;
  position: [number, number, number];
  starSize: number;
}

export interface ConstellationLink {
  id: string;
  sourceId: string;
  targetId: string;
  sharedTags: string[];
  sameCategory: boolean;
  strength: number;
}

export interface CategoryMeta {
  label: MemoryCategory;
  shortLabel: string;
  colorHex: string;
  emissiveHex: string;
  textColorClass: string;
  borderColorClass: string;
  description: string;
}

export const CATEGORY_CONFIG: Record<MemoryCategory, CategoryMeta> = {
  'Hành tinh Đại dương & Sự sống': {
    label: 'Hành tinh Đại dương & Sự sống',
    shortLabel: 'Đại dương & Sự sống',
    colorHex: '#38bdf8',
    emissiveHex: '#0284c7',
    textColorClass: 'text-sky-400',
    borderColorClass: 'border-sky-500/40',
    description:
      'Trái Đất và các ngoại hành tinh NASA/JWST nằm trong vùng sống được (Goldilocks Zone) của Dải Ngân Hà',
  },
  'Khổng lồ Khí & Siêu Vành Đai': {
    label: 'Khổng lồ Khí & Siêu Vành Đai',
    shortLabel: 'Khổng lồ Khí & Vành đai',
    colorHex: '#f59e0b',
    emissiveHex: '#d97706',
    textColorClass: 'text-amber-400',
    borderColorClass: 'border-amber-500/40',
    description:
      'Sao Mộc, Sao Thổ và các hành tinh khí khổng lồ có hệ thống vành đai vĩ đại trong Dải Ngân Hà',
  },
  'Hành tinh Dung nham & Cực đoan': {
    label: 'Hành tinh Dung nham & Cực đoan',
    shortLabel: 'Dung nham & Cực đoan',
    colorHex: '#fb7185',
    emissiveHex: '#e11d48',
    textColorClass: 'text-rose-400',
    borderColorClass: 'border-rose-500/40',
    description:
      'Sao Kim, mặt trăng Io và các ngoại hành tinh cực nóng có đại dương magma silicat & mưa đá nóng chảy',
  },
  'Thế giới Băng giá & Kỳ dị': {
    label: 'Thế giới Băng giá & Kỳ dị',
    shortLabel: 'Hành tinh Đá & Băng',
    colorHex: '#a78bfa',
    emissiveHex: '#7c3aed',
    textColorClass: 'text-violet-400',
    borderColorClass: 'border-violet-500/40',
    description:
      'Sao Hỏa, Sao Thiên Vương, Sao Hải Vương, mặt trăng băng Europa, Titan và hành tinh băng cực hàn',
  },
  'Hố đen & Hiện tượng Thiên hà': {
    label: 'Hố đen & Hiện tượng Thiên hà',
    shortLabel: 'Hố đen & Lõi Ngân Hà',
    colorHex: '#34d399',
    emissiveHex: '#059669',
    textColorClass: 'text-emerald-400',
    borderColorClass: 'border-emerald-500/40',
    description:
      'Sao Thủy, lõi Sagittarius A*, Cygnus X-1 và các hiện tượng vật lý tương đối tính trong Dải Ngân Hà',
  },
  'Ngôi sao Dải Ngân Hà': {
    label: 'Ngôi sao Dải Ngân Hà',
    shortLabel: 'Ngôi sao (Gaia DR3)',
    colorHex: '#fde047',
    emissiveHex: '#eab308',
    textColorClass: 'text-yellow-300',
    borderColorClass: 'border-yellow-400/40',
    description:
      'Mặt Trời, Alpha Centauri, Sirius, Vega, Polaris, Antares, Betelgeuse, Rigel và UY Scuti theo tọa độ ESA Gaia DR3',
  },
  'Tiểu hành tinh, Hành tinh Lùn & Sao chổi': {
    label: 'Tiểu hành tinh, Hành tinh Lùn & Sao chổi',
    shortLabel: 'Tiểu hành tinh & Sao chổi',
    colorHex: '#94a3b8',
    emissiveHex: '#64748b',
    textColorClass: 'text-slate-300',
    borderColorClass: 'border-slate-400/40',
    description:
      'Mặt Trăng, Ganymede, Pluto, Eris, Ceres, 4 Vesta, 101955 Bennu, Sao chổi 1P/Halley và 1I/ʻOumuamua theo NASA JPL',
  },
};

export const ALL_CATEGORIES: MemoryCategory[] = [
  'Ngôi sao Dải Ngân Hà',
  'Hành tinh Đại dương & Sự sống',
  'Khổng lồ Khí & Siêu Vành Đai',
  'Hành tinh Dung nham & Cực đoan',
  'Thế giới Băng giá & Kỳ dị',
  'Tiểu hành tinh, Hành tinh Lùn & Sao chổi',
  'Hố đen & Hiện tượng Thiên hà',
];

export type PlanetArchetypeId =
  | 0 // Deep Ocean / Hycean World (Kepler-22b, K2-18b)
  | 1 // Saturn / J1407b (Pale Golden Ringed Gas Giant)
  | 2 // Earth / Kepler-452b / TRAPPIST-1e (Habitable Terrestrial World)
  | 3 // 55 Cancri e / K2-141b / Io (Volcanic Magma World)
  | 4 // Neptune / Uranus / Europa / Cryo Ice World
  | 5 // Jupiter / Kepler-90h / HD 189733b (Banded Storm Gas Giant)
  | 6 // Mars (NASA Rusty Iron-Oxide Terrestrial + Polar CO2 Ice Caps)
  | 7 // Mercury (NASA Cratered Silver-Charcoal Rocky World)
  | 8 // Venus / Titan (Dense Creamy-Golden Sulfuric Cloud Atmosphere)
  | 9 // Photospheric Luminous Star (Sun, Sirius, Vega, Betelgeuse, Rigel, UY Scuti)
  | 10 // Cratered Rocky Asteroid / Dwarf Planet / Moon (Pluto, Ceres, Vesta, Bennu, Moon)
  | 11; // Active Icy Comet Nucleus (1P/Halley)

export interface PlanetSpec {
  archetypeId: PlanetArchetypeId;
  designation: string;
  planetTypeVi: string;
  realInspiration: string;
  diameterKm: string;
  earthRadiusRatio: number;
  atmosphereComposition: string;
  surfaceGravity: string;
  surfaceTemp: string;
  hasRings: boolean;
  ringInnerRadius: number;
  ringOuterRadius: number;
  ringColorHex: string;
  axialTiltRad: number;
  atmosphereColorHex: string;
  radiusScale: number;
}

/**
 * Computes a refined astronomical Explorer/Atlas visual scale from real NASA Earth-radius ratio (R⊕)
 * that preserves strict planet size hierarchy (Jupiter > Saturn > Uranus >= Neptune > Earth > Venus > Mars > Mercury > Europa)
 * while keeping every planet markedly smaller than Sagittarius A*'s 4.52-unit event horizon.
 */
export function computeAstronomicalVisualScale(earthRadiusRatio: number): number {
  const safeRatio = Math.max(0.18, Math.min(20, earthRadiusRatio));
  const scaled = 0.14 + 0.30 * Math.pow(safeRatio, 0.54);
  return Math.round(Math.max(0.18, Math.min(1.42, scaled)) * 100) / 100;
}

/**
 * Exact NASA / ESA / JWST / Kepler physical & visual specifications for all 30 real Milky Way bodies
 */
export const NASA_MILKY_WAY_PLANET_SPECS: Record<string, PlanetSpec> = {
  // === 1. ĐẠI DƯƠNG & SỰ SỐNG (6) ===
  'astro-ocean-01': {
    archetypeId: 2,
    designation: 'Earth (Sol III · 1.00 R⊕)',
    planetTypeVi: 'Hành tinh Địa cầu · Hệ Mặt Trời',
    realInspiration: 'NASA Blue Marble · Trái Đất (Hệ Mặt Trời)',
    diameterKm: '12.742 km (1,00 R⊕)',
    earthRadiusRatio: 1.0,
    atmosphereComposition: 'N₂ 78%, O₂ 21%, Ar 0.9%, mây hơi nước H₂O',
    surfaceGravity: '1.00 g (9.81 m/s²)',
    surfaceTemp: '288 K (15°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#38bdf8',
    axialTiltRad: 0.409, // 23.44 deg
    atmosphereColorHex: '#38bdf8',
    radiusScale: computeAstronomicalVisualScale(1.0),
  },
  'astro-ocean-02': {
    archetypeId: 2,
    designation: 'Kepler-452b (1.63 R⊕)',
    planetTypeVi: 'Siêu Trái Đất Đá & Đại dương',
    realInspiration: 'NASA Kepler Mission · Chòm sao Cygnus',
    diameterKm: '20.770 km (1,63 R⊕)',
    earthRadiusRatio: 1.63,
    atmosphereComposition: 'N₂, O₂, CO₂ dày, mây đối lưu H₂O',
    surfaceGravity: '1.88 g',
    surfaceTemp: '265 K (-8°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#60a5fa',
    axialTiltRad: 0.34,
    atmosphereColorHex: '#38bdf8',
    radiusScale: computeAstronomicalVisualScale(1.63),
  },
  'astro-ocean-03': {
    archetypeId: 2,
    designation: 'TRAPPIST-1e (0.92 R⊕)',
    planetTypeVi: 'Hành tinh Đá Vùng Sống Được',
    realInspiration: 'NASA Spitzer & JWST · Hệ TRAPPIST-1',
    diameterKm: '11.720 km (0,92 R⊕)',
    earthRadiusRatio: 0.92,
    atmosphereComposition: 'Khí quyển thứ cấp N₂ / CO₂ · Đại dương lỏng',
    surfaceGravity: '0.82 g',
    surfaceTemp: '251 K (-22°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#38bdf8',
    axialTiltRad: 0.05,
    atmosphereColorHex: '#60a5fa',
    radiusScale: computeAstronomicalVisualScale(0.92),
  },
  'astro-ocean-04': {
    archetypeId: 0,
    designation: 'K2-18b (Hycean · 2.61 R⊕)',
    planetTypeVi: 'Hành tinh Đại dương Hycean (Sub-Neptune)',
    realInspiration: 'NASA JWST NIRISS / NIRSpec · Chòm sao Leo',
    diameterKm: '33.250 km (2,61 R⊕)',
    earthRadiusRatio: 2.61,
    atmosphereComposition: 'H₂ giàu khí quyển, phát hiện CH₄ & CO₂',
    surfaceGravity: '1.26 g',
    surfaceTemp: '279 K (6°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#0ea5e9',
    axialTiltRad: 0.14,
    atmosphereColorHex: '#0ea5e9',
    radiusScale: computeAstronomicalVisualScale(2.61),
  },
  'astro-ocean-05': {
    archetypeId: 0,
    designation: 'Kepler-22b (Water World · 2.38 R⊕)',
    planetTypeVi: 'Thế giới Đại dương Toàn cầu',
    realInspiration: 'NASA Kepler Telescope · Chòm sao Cygnus',
    diameterKm: '30.325 km (2,38 R⊕)',
    earthRadiusRatio: 2.38,
    atmosphereComposition: 'Hơi nước dày đặc, N₂, mây xoáy đại dương',
    surfaceGravity: '1.50 g',
    surfaceTemp: '295 K (22°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#38bdf8',
    axialTiltRad: 0.22,
    atmosphereColorHex: '#22d3ee',
    radiusScale: computeAstronomicalVisualScale(2.38),
  },
  'astro-ocean-06': {
    archetypeId: 2,
    designation: 'Kepler-186f (1.17 R⊕)',
    planetTypeVi: 'Hành tinh Đá Cỡ Trái Đất Quanh Sao Lùn Đỏ',
    realInspiration: 'NASA Ames Research Center · Kepler-186',
    diameterKm: '14.908 km (1,17 R⊕)',
    earthRadiusRatio: 1.17,
    atmosphereComposition: 'N₂, CO₂ giàu hiệu ứng nhà kính ấm',
    surfaceGravity: '1.17 g',
    surfaceTemp: '188 K (-85°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#f59e0b',
    axialTiltRad: 0.18,
    atmosphereColorHex: '#fb923c',
    radiusScale: computeAstronomicalVisualScale(1.17),
  },

  // === 2. KHỔNG LỒ KHÍ & SIÊU VÀNH ĐAI (6) ===
  'astro-gas-01': {
    archetypeId: 1,
    designation: 'J1407b (Super-Saturn · 15.0 R⊕)',
    planetTypeVi: 'Khổng lồ Khí Hệ 37 Vành Đai Vĩ Đại',
    realInspiration: 'SuperWASP / Leiden Observatory · Nhân Mã',
    diameterKm: '191.000 km (~15 R⊕)',
    earthRadiusRatio: 15.0,
    atmosphereComposition: 'H₂ 90%, He 9%, đĩa tiền vệ tinh bụi-băng',
    surfaceGravity: '4.50 g',
    surfaceTemp: '1.000 K (727°C)',
    hasRings: true,
    ringInnerRadius: 1.38,
    ringOuterRadius: 2.85,
    ringColorHex: '#e8c48e',
    axialTiltRad: 0.44,
    atmosphereColorHex: '#f59e0b',
    radiusScale: computeAstronomicalVisualScale(15.0),
  },
  'astro-gas-02': {
    archetypeId: 1,
    designation: 'Saturn (Sol VI · 9.45 R⊕)',
    planetTypeVi: 'Khổng lồ Khí Vành Đai Băng · Hệ Mặt Trời',
    realInspiration: 'NASA Cassini-Huygens · Sao Thổ',
    diameterKm: '116.460 km (9,45 R⊕)',
    earthRadiusRatio: 9.45,
    atmosphereComposition: 'H₂ 96.3%, He 3.25%, tinh thể NH₃ vàng kem',
    surfaceGravity: '1.07 g',
    surfaceTemp: '134 K (-139°C)',
    hasRings: true,
    ringInnerRadius: 1.32,
    ringOuterRadius: 2.48,
    ringColorHex: '#f5deb3',
    axialTiltRad: 0.466, // 26.73 deg
    atmosphereColorHex: '#eab308',
    radiusScale: computeAstronomicalVisualScale(9.45),
  },
  'astro-gas-03': {
    archetypeId: 5,
    designation: 'Jupiter (Sol V · 11.21 R⊕)',
    planetTypeVi: 'Hành tinh Lớn Nhất Hệ Mặt Trời',
    realInspiration: 'NASA Juno & Hubble · Sao Mộc (Great Red Spot)',
    diameterKm: '139.820 km (11,21 R⊕)',
    earthRadiusRatio: 11.21,
    atmosphereComposition: 'H₂ 89.8%, He 10.2%, dải bão Amoniac & Vết Đỏ Lớn',
    surfaceGravity: '2.53 g',
    surfaceTemp: '165 K (-108°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#fcd34d',
    axialTiltRad: 0.054, // 3.13 deg
    atmosphereColorHex: '#f59e0b',
    radiusScale: computeAstronomicalVisualScale(11.21),
  },
  'astro-gas-04': {
    archetypeId: 4,
    designation: 'HD 189733b (Hot Jupiter · 12.7 R⊕)',
    planetTypeVi: 'Khổng lồ Khí Nóng Xanh Coban · Mưa Thủy Tinh',
    realInspiration: 'NASA Hubble & JWST · Chòm sao Vulpecula',
    diameterKm: '161.800 km (12,7 R⊕)',
    earthRadiusRatio: 12.7,
    atmosphereComposition: 'H₂, He, mây hạt thủy tinh silicat siêu thanh',
    surfaceGravity: '2.19 g',
    surfaceTemp: '1.200 K (927°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#3b82f6',
    axialTiltRad: 0.08,
    atmosphereColorHex: '#2563eb',
    radiusScale: computeAstronomicalVisualScale(12.7),
  },
  'astro-gas-05': {
    archetypeId: 3,
    designation: 'WASP-12b (Ultra-Hot Jupiter · 19.4 R⊕)',
    planetTypeVi: 'Khổng lồ Khí Siêu Nóng Biến Dạng Thủy Triều',
    realInspiration: 'NASA Hubble Cosmic Origins · Chòm sao Auriga',
    diameterKm: '247.000 km (19,4 R⊕)',
    earthRadiusRatio: 16.5,
    atmosphereComposition: 'H₂ nguyên tử, hơi kim loại nặng hấp thụ 94% ánh sáng',
    surfaceGravity: '1.02 g',
    surfaceTemp: '2.580 K (2.307°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#fb7185',
    axialTiltRad: 0.12,
    atmosphereColorHex: '#ef4444',
    radiusScale: computeAstronomicalVisualScale(16.5),
  },
  'astro-gas-06': {
    archetypeId: 5,
    designation: 'Kepler-90h (11.3 R⊕)',
    planetTypeVi: 'Khổng lồ Khí Hệ 8 Hành Tinh',
    realInspiration: 'NASA Kepler + Google AI Discovery · Draco',
    diameterKm: '144.000 km (11,3 R⊕)',
    earthRadiusRatio: 11.3,
    atmosphereComposition: 'H₂, He, tầng mây hơi nước và tinh thể NH₃',
    surfaceGravity: '2.20 g',
    surfaceTemp: '292 K (19°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#f59e0b',
    axialTiltRad: 0.11,
    atmosphereColorHex: '#fbbf24',
    radiusScale: computeAstronomicalVisualScale(11.3),
  },

  // === 3. DUNG NHAM & CỰC ĐOAN (6) ===
  'astro-lava-01': {
    archetypeId: 3,
    designation: '55 Cancri e (Janssen · 1.87 R⊕)',
    planetTypeVi: 'Siêu Trái Đất Biển Magma & Khí Quyển CO₂',
    realInspiration: 'NASA JWST 2024 Observation · Chòm sao Cancer',
    diameterKm: '23.830 km (1,87 R⊕)',
    earthRadiusRatio: 1.87,
    atmosphereComposition: 'CO, CO₂ thoát khí từ đại dương dung nham silicat',
    surfaceGravity: '2.28 g',
    surfaceTemp: '2.300 K (2.027°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#fb7185',
    axialTiltRad: 0.12,
    atmosphereColorHex: '#f97316',
    radiusScale: computeAstronomicalVisualScale(1.87),
  },
  'astro-lava-02': {
    archetypeId: 3,
    designation: 'K2-141b (Lava World · 1.51 R⊕)',
    planetTypeVi: 'Hành tinh Mưa Đá Silicat & Biển Lửa 100 km',
    realInspiration: 'NASA K2 & Spitzer · Chòm sao Bảo Bình',
    diameterKm: '19.240 km (1,51 R⊕)',
    earthRadiusRatio: 1.51,
    atmosphereComposition: 'Hơi đá Na, SiO, SiO₂ siêu thanh 5.000 km/h',
    surfaceGravity: '2.23 g',
    surfaceTemp: '3.000 K (2.727°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#f43f5e',
    axialTiltRad: 0.16,
    atmosphereColorHex: '#fb7185',
    radiusScale: computeAstronomicalVisualScale(1.51),
  },
  'astro-lava-03': {
    archetypeId: 3,
    designation: 'KELT-9b (Ultra-Hot Giant · 19.0 R⊕)',
    planetTypeVi: 'Hành tinh Khí Nóng Nhất Vũ Trụ Đã Biết',
    realInspiration: 'NASA Spitzer & TESS · Chòm sao Cygnus',
    diameterKm: '242.000 km (19,0 R⊕)',
    earthRadiusRatio: 16.0,
    atmosphereComposition: 'Hơi nguyên tử Sắt (Fe) & Titan (Ti) tự do 4.600 K',
    surfaceGravity: '2.02 g',
    surfaceTemp: '4.600 K (4.327°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#fb923c',
    axialTiltRad: 0.2,
    atmosphereColorHex: '#fb923c',
    radiusScale: computeAstronomicalVisualScale(16.0),
  },
  'astro-lava-04': {
    archetypeId: 3,
    designation: 'Io (Jupiter I · 0.286 R⊕)',
    planetTypeVi: 'Mặt trăng Núi Lửa · Hệ Sao Mộc',
    realInspiration: 'NASA Juno 2024 Flyby · Mặt trăng Io',
    diameterKm: '3.643 km (0,29 R⊕)',
    earthRadiusRatio: 0.286,
    atmosphereComposition: 'SO₂ mỏng từ 400 núi lửa hoạt động liên tục',
    surfaceGravity: '0.18 g',
    surfaceTemp: '130 K – 1.600 K (hồ magma)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#facc15',
    axialTiltRad: 0.04,
    atmosphereColorHex: '#eab308',
    radiusScale: computeAstronomicalVisualScale(0.286),
  },
  'astro-lava-05': {
    archetypeId: 7,
    designation: 'PSR B1257+12 c (Poltergeist · 1.50 R⊕)',
    planetTypeVi: 'Hành tinh Đá Quay Quanh Sao Neutron Pulsar',
    realInspiration: 'Arecibo Observatory 1992 · Chòm sao Xử Nữ',
    diameterKm: '19.100 km (~1,50 R⊕)',
    earthRadiusRatio: 1.5,
    atmosphereComposition: 'Bức xạ tia X & gió hạt tương đối tính từ sao Pulsar',
    surfaceGravity: '1.90 g',
    surfaceTemp: '600 K (327°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#a855f7',
    axialTiltRad: 0.19,
    atmosphereColorHex: '#a855f7',
    radiusScale: computeAstronomicalVisualScale(1.5),
  },
  'astro-lava-06': {
    archetypeId: 8,
    designation: 'Venus (Sol II · 0.95 R⊕)',
    planetTypeVi: 'Hành tinh Đá Nhà Kính Cực Đoan · Hệ Mặt Trời',
    realInspiration: 'NASA Magellan & JAXA Akatsuki · Sao Kim',
    diameterKm: '12.104 km (0,95 R⊕)',
    earthRadiusRatio: 0.95,
    atmosphereComposition: 'CO₂ 96.5%, N₂ 3.5%, tầng mây Axit Sunfuric (H₂SO₄)',
    surfaceGravity: '0.90 g',
    surfaceTemp: '737 K (464°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#fde047',
    axialTiltRad: 3.096, // 177.36 deg retrograde rotation!
    atmosphereColorHex: '#fbbf24',
    radiusScale: computeAstronomicalVisualScale(0.95),
  },

  // === 4. HÀNH TINH ĐÁ, BĂNG GIÁ & KỲ DỊ (6) ===
  'astro-ice-01': {
    archetypeId: 6,
    designation: 'Mars (Sol IV · 0.53 R⊕)',
    planetTypeVi: 'Hành tinh Đỏ · Hệ Mặt Trời',
    realInspiration: 'NASA Perseverance & MRO · Sao Hỏa',
    diameterKm: '6.779 km (0,53 R⊕)',
    earthRadiusRatio: 0.532,
    atmosphereComposition: 'CO₂ 95.3%, N₂ 2.6%, bụi oxit sắt & băng cực CO₂',
    surfaceGravity: '0.38 g',
    surfaceTemp: '210 K (-63°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#f97316',
    axialTiltRad: 0.439, // 25.19 deg
    atmosphereColorHex: '#ea580c',
    radiusScale: computeAstronomicalVisualScale(0.532),
  },
  'astro-ice-02': {
    archetypeId: 4,
    designation: 'Neptune (Sol VIII · 3.88 R⊕)',
    planetTypeVi: 'Khổng lồ Băng Methane · Hệ Mặt Trời',
    realInspiration: 'NASA Voyager 2 & JWST · Sao Hải Vương',
    diameterKm: '49.244 km (3,88 R⊕)',
    earthRadiusRatio: 3.88,
    atmosphereComposition: 'H₂ 80%, He 19%, CH₄ xanh dương & gió 2.100 km/h',
    surfaceGravity: '1.14 g',
    surfaceTemp: '72 K (-201°C)',
    hasRings: true,
    ringInnerRadius: 1.42,
    ringOuterRadius: 2.05,
    ringColorHex: '#93c5fd',
    axialTiltRad: 0.494, // 28.32 deg
    atmosphereColorHex: '#3b82f6',
    radiusScale: computeAstronomicalVisualScale(3.88),
  },
  'astro-ice-03': {
    archetypeId: 4,
    designation: 'Uranus (Sol VII · 4.01 R⊕)',
    planetTypeVi: 'Khổng lồ Băng Nghiêng 98° · Hệ Mặt Trời',
    realInspiration: 'NASA Voyager 2 & JWST 2023 Rings · Sao Thiên Vương',
    diameterKm: '50.724 km (4,01 R⊕)',
    earthRadiusRatio: 4.01,
    atmosphereComposition: 'H₂ 83%, He 15%, CH₄ 2.3% xanh ngọc lam',
    surfaceGravity: '0.89 g',
    surfaceTemp: '49 K (-224°C)',
    hasRings: true,
    ringInnerRadius: 1.38,
    ringOuterRadius: 2.15,
    ringColorHex: '#a5f3fc',
    axialTiltRad: 1.706, // Authentic 97.77 deg axial tilt!
    atmosphereColorHex: '#22d3ee',
    radiusScale: computeAstronomicalVisualScale(4.01),
  },
  'astro-ice-04': {
    archetypeId: 4,
    designation: 'Europa (Jupiter II · 0.245 R⊕)',
    planetTypeVi: 'Mặt trăng Băng Đại Dương Ngầm · Hệ Sao Mộc',
    realInspiration: 'NASA Europa Clipper Mission · Mặt trăng Europa',
    diameterKm: '3.122 km (0,25 R⊕)',
    earthRadiusRatio: 0.245,
    atmosphereComposition: 'O₂ siêu loãng, vỏ băng nứt Lineae phủ biển sâu 100 km',
    surfaceGravity: '0.13 g',
    surfaceTemp: '102 K (-171°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#bae6fd',
    axialTiltRad: 0.02,
    atmosphereColorHex: '#7dd3fc',
    radiusScale: computeAstronomicalVisualScale(0.245),
  },
  'astro-ice-05': {
    archetypeId: 8,
    designation: 'Titan (Saturn VI · 0.404 R⊕)',
    planetTypeVi: 'Mặt trăng Biển Methane Lỏng · Hệ Sao Thổ',
    realInspiration: 'NASA Cassini-Huygens & Dragonfly · Titan',
    diameterKm: '5.150 km (0,40 R⊕)',
    earthRadiusRatio: 0.404,
    atmosphereComposition: 'N₂ 95%, CH₄ 5%, sương mù hữu cơ Tholin màu hổ phách',
    surfaceGravity: '0.14 g',
    surfaceTemp: '94 K (-179°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#f59e0b',
    axialTiltRad: 0.05,
    atmosphereColorHex: '#f59e0b',
    radiusScale: computeAstronomicalVisualScale(0.404),
  },
  'astro-ice-06': {
    archetypeId: 4,
    designation: 'OGLE-2005-BLG-390Lb (1.75 R⊕)',
    planetTypeVi: 'Siêu Trái Đất Băng Cực Hàn Gần Tâm Ngân Hà',
    realInspiration: 'ESO / OGLE Microlensing · Vùng Phình Ngân Hà',
    diameterKm: '22.300 km (~1,75 R⊕)',
    earthRadiusRatio: 1.75,
    atmosphereComposition: 'N₂ & CH₄ đóng băng vĩnh cửu ở -220°C',
    surfaceGravity: '1.80 g',
    surfaceTemp: '53 K (-220°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#c4b5fd',
    axialTiltRad: 0.24,
    atmosphereColorHex: '#818cf8',
    radiusScale: computeAstronomicalVisualScale(1.75),
  },

  // === 5. HỐ ĐEN, SAO THỦY & HIỆN TƯỢNG THIÊN HÀ (6) ===
  'astro-bh-01': {
    archetypeId: 7,
    designation: 'S2 Orbit Beacon (Vùng Cận Sgr A*)',
    planetTypeVi: 'Mốc Quan Trắc Quỹ Đạo Cận Chân Trời Sự Kiện',
    realInspiration: 'ESO GRAVITY & EHT · Vùng Lõi Sagittarius A*',
    diameterKm: '18.500 km (Mốc quỹ đạo S-Star)',
    earthRadiusRatio: 1.45,
    atmosphereComposition: 'Plasma từ hóa & bức xạ đồng bộ vùng cận photon',
    surfaceGravity: '1.60 g',
    surfaceTemp: '480 K',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#34d399',
    axialTiltRad: 0.16,
    atmosphereColorHex: '#10b981',
    radiusScale: computeAstronomicalVisualScale(1.45),
  },
  'astro-bh-02': {
    archetypeId: 5,
    designation: 'Cygnus X-1 Companion (Đĩa Bồi Tụ Tia X)',
    planetTypeVi: 'Hệ Hố Đen Tia X Trong Nhánh Lạp Hộ',
    realInspiration: 'NASA Chandra X-ray Observatory · Chòm sao Cygnus',
    diameterKm: '86.000 km (Vùng dòng khí bồi tụ)',
    earthRadiusRatio: 6.75,
    atmosphereComposition: 'Dòng gió sao plasma bị hút vào hố đen 21,2 M☉',
    surfaceGravity: '2.10 g',
    surfaceTemp: '2.100 K',
    hasRings: true,
    ringInnerRadius: 1.38,
    ringOuterRadius: 2.25,
    ringColorHex: '#60a5fa',
    axialTiltRad: 0.31,
    atmosphereColorHex: '#38bdf8',
    radiusScale: computeAstronomicalVisualScale(6.75),
  },
  'astro-bh-03': {
    archetypeId: 0,
    designation: 'Proxima Centauri b (1.07 R⊕)',
    planetTypeVi: 'Ngoại Hành Tinh Gần Trái Đất Nhất (4,24 ly)',
    realInspiration: 'ESO Pale Red Dot · Hệ Alpha Centauri',
    diameterKm: '13.630 km (1,07 R⊕)',
    earthRadiusRatio: 1.07,
    atmosphereComposition: 'Khí quyển đá – đại dương chịu gió sao lùn đỏ',
    surfaceGravity: '1.12 g',
    surfaceTemp: '234 K (-39°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#34d399',
    axialTiltRad: 0.12,
    atmosphereColorHex: '#34d399',
    radiusScale: computeAstronomicalVisualScale(1.07),
  },
  'astro-bh-04': {
    archetypeId: 1,
    designation: 'Sagittarius A* Core Monitor (4.3M M☉)',
    planetTypeVi: 'Trái Tim Hố Đen Siêu Khối Lượng Dải Ngân Hà',
    realInspiration: 'Event Horizon Telescope (EHT 2022) · Sgr A*',
    diameterKm: '25,4 triệu km (Đường kính Chân trời Sgr A*)',
    earthRadiusRatio: 5.5,
    atmosphereComposition: 'Vòng plasma 10 tỷ K quay sát tốc độ ánh sáng',
    surfaceGravity: 'Cực đại tương đối tính',
    surfaceTemp: '10¹⁰ K (vòng plasma)',
    hasRings: true,
    ringInnerRadius: 1.4,
    ringOuterRadius: 2.3,
    ringColorHex: '#fbbf24',
    axialTiltRad: 0.22,
    atmosphereColorHex: '#f59e0b',
    radiusScale: computeAstronomicalVisualScale(5.5),
  },
  'astro-bh-05': {
    archetypeId: 5,
    designation: 'M87* Relativistic Jet Reference (6.5B M☉)',
    planetTypeVi: 'Đối Chiếu Hố Đen Siêu Khối Lượng Liên Thiên Hà',
    realInspiration: 'Event Horizon Telescope (EHT 2019) · Messier 87',
    diameterKm: '38 tỷ km (Đường kính Chân trời M87*)',
    earthRadiusRatio: 7.8,
    atmosphereComposition: 'Tia phản lực plasma dài 5.000 năm ánh sáng',
    surfaceGravity: 'Cực đại tương đối tính',
    surfaceTemp: '10¹⁰ K (tia phản lực)',
    hasRings: true,
    ringInnerRadius: 1.36,
    ringOuterRadius: 2.35,
    ringColorHex: '#93c5fd',
    axialTiltRad: 0.36,
    atmosphereColorHex: '#60a5fa',
    radiusScale: computeAstronomicalVisualScale(7.8),
  },
  'astro-bh-06': {
    archetypeId: 7,
    designation: 'Mercury (Sol I · 0.38 R⊕)',
    planetTypeVi: 'Hành tinh Nhỏ Nhất Hệ Mặt Trời',
    realInspiration: 'NASA MESSENGER & ESA BepiColombo · Sao Thủy',
    diameterKm: '4.879 km (0,38 R⊕)',
    earthRadiusRatio: 0.383,
    atmosphereComposition: 'Ngoại quyển siêu loãng O₂, Na, H₂ · Bề mặt đầy hố thiên thạch',
    surfaceGravity: '0.38 g',
    surfaceTemp: '100 K – 700 K (-173°C đến 427°C)',
    hasRings: false,
    ringInnerRadius: 0,
    ringOuterRadius: 0,
    ringColorHex: '#94a3b8',
    axialTiltRad: 0.0006, // 0.03 deg upright!
    atmosphereColorHex: '#94a3b8',
    radiusScale: computeAstronomicalVisualScale(0.383),
  },
};

export const PLANET_SPECS_BY_CATEGORY: Record<MemoryCategory, PlanetSpec[]> = {
  'Hành tinh Đại dương & Sự sống': [
    NASA_MILKY_WAY_PLANET_SPECS['astro-ocean-01'],
    NASA_MILKY_WAY_PLANET_SPECS['astro-ocean-05'],
  ],
  'Khổng lồ Khí & Siêu Vành Đai': [
    NASA_MILKY_WAY_PLANET_SPECS['astro-gas-02'],
    NASA_MILKY_WAY_PLANET_SPECS['astro-gas-03'],
  ],
  'Hành tinh Dung nham & Cực đoan': [
    NASA_MILKY_WAY_PLANET_SPECS['astro-lava-01'],
    NASA_MILKY_WAY_PLANET_SPECS['astro-lava-06'],
  ],
  'Thế giới Băng giá & Kỳ dị': [
    NASA_MILKY_WAY_PLANET_SPECS['astro-ice-01'],
    NASA_MILKY_WAY_PLANET_SPECS['astro-ice-02'],
  ],
  'Hố đen & Hiện tượng Thiên hà': [
    NASA_MILKY_WAY_PLANET_SPECS['astro-bh-06'],
    NASA_MILKY_WAY_PLANET_SPECS['astro-bh-04'],
  ],
  'Ngôi sao Dải Ngân Hà': [
    NASA_MILKY_WAY_PLANET_SPECS['astro-gas-03'],
  ],
  'Tiểu hành tinh, Hành tinh Lùn & Sao chổi': [
    NASA_MILKY_WAY_PLANET_SPECS['astro-bh-06'],
  ],
};

let extraSpecsRegistry: Record<string, PlanetSpec> = {};

export function registerExtraPlanetSpecs(specs: Record<string, PlanetSpec>) {
  extraSpecsRegistry = { ...extraSpecsRegistry, ...specs };
}

export function getPlanetSpecForNode(node: MemoryNode): PlanetSpec {
  const exact = NASA_MILKY_WAY_PLANET_SPECS[node.id] || extraSpecsRegistry[node.id];
  if (exact) return exact;

  const list =
    PLANET_SPECS_BY_CATEGORY[node.category] ||
    PLANET_SPECS_BY_CATEGORY['Khổng lồ Khí & Siêu Vành Đai'];
  let hash = 0;
  for (let i = 0; i < node.id.length; i++) {
    hash = (hash * 31 + node.id.charCodeAt(i)) >>> 0;
  }
  return list[hash % list.length];
}

export interface RealBlackHoleComparison {
  id: string;
  name: string;
  galaxy: string;
  massSolar: string;
  eventHorizonRadius: string;
  spinParameter: string;
  distanceFromEarth: string;
  highlightFact: string;
}

export const FAMOUS_BLACK_HOLES: RealBlackHoleComparison[] = [
  {
    id: 'sgr-a',
    name: 'Sagittarius A* (Sgr A*)',
    galaxy: 'Trung tâm Dải Ngân Hà (Milky Way)',
    massSolar: '4.300.000 M☉ (4,3 triệu lần Mặt Trời)',
    eventHorizonRadius: '12,7 triệu km (~18 lần bán kính Mặt Trời)',
    spinParameter: 'a* ≈ 0.84 – 0.90',
    distanceFromEarth: '26.670 năm ánh sáng',
    highlightFact:
      'Hố đen siêu khối lượng ở chính tâm thiên hà của chúng ta, được Kính thiên văn Chân trời Sự kiện (EHT) chụp ảnh trực tiếp năm 2022.',
  },
  {
    id: 'cygnus-x1',
    name: 'Cygnus X-1 (Hố đen sao trong Ngân Hà)',
    galaxy: 'Nhánh phụ Lạp Hộ — Dải Ngân Hà',
    massSolar: '21,2 M☉ (21,2 lần Mặt Trời)',
    eventHorizonRadius: '62,5 km',
    spinParameter: 'a* > 0.99 (Quay cận cực đại)',
    distanceFromEarth: '7.200 năm ánh sáng',
    highlightFact:
      'Hố đen đầu tiên trong lịch sử được xác nhận bằng quan sát tia X, đang hút vật chất từ ngôi sao siêu khổng lồ xanh HDE 226868.',
  },
  {
    id: 'm87-star',
    name: 'M87* (Powehi)',
    galaxy: 'Thiên hà Elip siêu khổng lồ Messier 87',
    massSolar: '6.500.000.000 M☉ (6,5 tỷ lần Mặt Trời)',
    eventHorizonRadius: '19 tỷ km (~127 AU — gấp 3 lần quỹ đạo Sao Diêm Vương)',
    spinParameter: 'a* ≈ 0.90',
    distanceFromEarth: '53,5 triệu năm ánh sáng',
    highlightFact:
      'Hố đen đầu tiên trong lịch sử nhân loại được chụp ảnh bóng Chân trời sự kiện (năm 2019), phóng ra tia phản lực plasma dài 5.000 năm ánh sáng.',
  },
  {
    id: 'ton-618',
    name: 'TON 618 (Hố đen Quasar Khổng lồ Nhất)',
    galaxy: 'Chuẩn tinh (Quasar) thuộc chòm sao Lạp Khuyển',
    massSolar: '66.000.000.000 M☉ (66 tỷ lần Mặt Trời)',
    eventHorizonRadius: '195 tỷ km (~1.300 AU)',
    spinParameter: 'a* > 0.95 (Đĩa bồi tụ siêu sáng)',
    distanceFromEarth: '10,4 tỷ năm ánh sáng',
    highlightFact:
      'Một trong những hố đen lớn nhất từng được biết đến trong vũ trụ; đĩa bồi tụ của nó sáng gấp 140 nghìn tỷ lần Mặt Trời.',
  },
];
