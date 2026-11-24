import { AU_IN_METERS, EARTH_MEAN_RADIUS_M, LIGHT_YEAR_METERS } from './constants';
import { LanguageCode } from './i18n';
import { Vec3d } from './scale-engine';

export type WavelengthBandId = 'optical' | 'infrared' | 'radio' | 'xray';

export const WAVELENGTH_BAND_ORDER: readonly WavelengthBandId[] = [
  'optical',
  'infrared',
  'radio',
  'xray',
] as const;

export const WAVELENGTH_BAND_INDEX: Record<WavelengthBandId, number> = {
  optical: 0,
  infrared: 1,
  radio: 2,
  xray: 3,
};

export interface WavelengthBandSpec {
  id: WavelengthBandId;
  wavelengthRange: string;
  observatoryRef: string;
  accentHex: string;
  labels: Record<LanguageCode, string>;
  shortLabels: Record<LanguageCode, string>;
  descriptions: Record<LanguageCode, string>;
}

export const WAVELENGTH_BAND_SPECS: Record<WavelengthBandId, WavelengthBandSpec> = {
  optical: {
    id: 'optical',
    wavelengthRange: '380–750 nm',
    observatoryRef: 'Gaia DR3 · Hubble',
    accentHex: '#ECEAE4',
    labels: {
      en: 'Optical',
      vi: 'Khả kiến',
      ja: '可視光',
      zh: '可见光',
      ko: '가시광',
    },
    shortLabels: {
      en: 'OPT',
      vi: 'OPT',
      ja: '可視',
      zh: '可见',
      ko: '가시',
    },
    descriptions: {
      en: 'Visible starlight and dark interstellar dust absorption',
      vi: 'Ánh sáng khả kiến và các dải bụi tối hấp thụ ánh sáng',
      ja: '可視光と暗黒星間塵の吸収構造',
      zh: '可见星光与暗星际尘埃吸收带',
      ko: '가시광선 별빛과 암흑 성간 먼지 흡수대',
    },
  },
  infrared: {
    id: 'infrared',
    wavelengthRange: '3.6–24 µm',
    observatoryRef: 'Spitzer · JWST',
    accentHex: '#E88B38',
    labels: {
      en: 'Infrared',
      vi: 'Hồng ngoại',
      ja: '赤外線',
      zh: '红外波段',
      ko: '적외선',
    },
    shortLabels: {
      en: 'IR',
      vi: 'IR',
      ja: '赤外',
      zh: '红外',
      ko: '적외',
    },
    descriptions: {
      en: 'Pierces dust lanes to reveal the Milky Way central bar and warm dust filaments',
      vi: 'Xuyên qua lớp bụi tối, làm lộ rõ thanh ngang lõi Ngân Hà và sợi bụi ấm',
      ja: '星間塵を透過し銀河中心棒構造と高温塵を描出',
      zh: '穿透尘埃带，清晰呈现银河系中央棒结构与热尘埃丝',
      ko: '성간 먼지를 투과해 우리은하 중심 막대와 온난 먼지 필라멘트를 노출',
    },
  },
  radio: {
    id: 'radio',
    wavelengthRange: '21 cm · 1.42 GHz',
    observatoryRef: 'HI 21cm · ALMA',
    accentHex: '#56B6C2',
    labels: {
      en: 'Radio 21cm',
      vi: 'Vô tuyến 21cm',
      ja: '電波 21cm',
      zh: '射电 21cm',
      ko: '전파 21cm',
    },
    shortLabels: {
      en: 'HI',
      vi: 'HI',
      ja: '電波',
      zh: '射电',
      ko: '전파',
    },
    descriptions: {
      en: 'Neutral atomic hydrogen (HI) tracing extended outer spiral arms',
      vi: 'Khí Hydro trung hòa (HI) làm nổi bật các nhánh xoắn ốc mở rộng',
      ja: '中性水素ガス（HI）が描く外縁渦状腕',
      zh: '中性氢（HI）21厘米谱线勾勒延展外旋臂',
      ko: '중성 수소(HI) 21cm 방출선으로 외곽 나선팔 추적',
    },
  },
  xray: {
    id: 'xray',
    wavelengthRange: '0.5–100 GeV',
    observatoryRef: 'Fermi-LAT · Chandra',
    accentHex: '#C678DD',
    labels: {
      en: 'X-Ray / γ',
      vi: 'Tia X / Gamma',
      ja: 'X線・γ線',
      zh: 'X射线/γ',
      ko: 'X선/감마',
    },
    shortLabels: {
      en: 'X/γ',
      vi: 'X/γ',
      ja: 'X/γ',
      zh: 'X/γ',
      ko: 'X/γ',
    },
    descriptions: {
      en: 'High-energy Galactic Core and bipolar 50,000-ly Fermi Bubbles',
      vi: 'Lõi thiên hà năng lượng cao và hai bọt khí Fermi khổng lồ cao 50.000 năm ánh sáng',
      ja: '高エネルギー銀河中心と双極5万光年のフェルミ・バブル',
      zh: '高能银心与跨度5万光年的双极费米气泡',
      ko: '고에너지 은하 중심과 5만 광년 쌍극 페르미 버블',
    },
  },
};

// ============================================================================
// Timeless Total Solar Eclipse Presets (Orbital Mechanics — Never Stale)
// ============================================================================

export interface SolarEclipsePreset {
  id: string;
  isoUtc: string;
  dateMs: number;
  region: Record<LanguageCode, string>;
  shortLabel: string;
  durationSec: number;
}

export const SOLAR_ECLIPSE_PRESETS: readonly SolarEclipsePreset[] = [
  {
    id: 'eclipse-2026',
    isoUtc: '2026-08-12T17:47:06Z',
    dateMs: Date.parse('2026-08-12T17:47:06Z'),
    shortLabel: '2026-08-12',
    durationSec: 138,
    region: {
      en: 'Total Solar Eclipse · Greenland / Iceland / Spain',
      vi: 'Nhật thực toàn phần · Greenland / Iceland / Tây Ban Nha',
      ja: '皆既日食・グリーンランド / アイスランド / スペイン',
      zh: '日全食 · 格陵兰 / 冰岛 / 西班牙',
      ko: '개기일식 · 그린란드 / 아이슬란드 / 스페인',
    },
  },
  {
    id: 'eclipse-2027',
    isoUtc: '2027-08-02T10:07:50Z',
    dateMs: Date.parse('2027-08-02T10:07:50Z'),
    shortLabel: '2027-08-02',
    durationSec: 383,
    region: {
      en: 'Total Solar Eclipse · North Africa / Luxor (6m 23s)',
      vi: 'Nhật thực toàn phần · Bắc Phi / Luxor (6p 23g)',
      ja: '皆既日食・北アフリカ / ルクソール（6分23秒）',
      zh: '日全食 · 北非 / 卢克索（6分23秒）',
      ko: '개기일식 · 북아프리카 / 룩소르 (6분 23초)',
    },
  },
  {
    id: 'eclipse-2028',
    isoUtc: '2028-07-22T02:56:40Z',
    dateMs: Date.parse('2028-07-22T02:56:40Z'),
    shortLabel: '2028-07-22',
    durationSec: 310,
    region: {
      en: 'Total Solar Eclipse · Australia / Sydney / New Zealand (5m 10s)',
      vi: 'Nhật thực toàn phần · Úc / Sydney / New Zealand (5p 10g)',
      ja: '皆既日食・オーストラリア / シドニー / ニュージーランド（5分10秒）',
      zh: '日全食 · 澳大利亚 / 悉尼 / 新西兰（5分10秒）',
      ko: '개기일식 · 호주 / 시드니 / 뉴질랜드 (5분 10초)',
    },
  },
  {
    id: 'eclipse-2030',
    isoUtc: '2030-11-25T06:51:37Z',
    dateMs: Date.parse('2030-11-25T06:51:37Z'),
    shortLabel: '2030-11-25',
    durationSec: 224,
    region: {
      en: 'Total Solar Eclipse · Southern Africa / Australia (3m 44s)',
      vi: 'Nhật thực toàn phần · Nam Phi / Úc (3p 44g)',
      ja: '皆既日食・南部アフリカ / オーストラリア（3分44秒）',
      zh: '日全食 · 非洲南部 / 澳大利亚（3分44秒）',
      ko: '개기일식 · 남아프리카 / 호주 (3분 44초)',
    },
  },
  {
    id: 'eclipse-2024',
    isoUtc: '2024-04-08T18:18:29Z',
    dateMs: Date.parse('2024-04-08T18:18:29Z'),
    shortLabel: '2024-04-08',
    durationSec: 268,
    region: {
      en: 'Total Solar Eclipse · North America',
      vi: 'Nhật thực toàn phần · Bắc Mỹ',
      ja: '皆既日食・北アメリカ',
      zh: '日全食 · 北美洲',
      ko: '개기일식 · 북아메리카',
    },
  },
] as const;

export interface LunarEclipseShadowState {
  /** True when the Moon lies near the Earth-Sun line and casts an umbral/penumbral shadow onto Earth. */
  isActive: boolean;
  /** Moon position relative to Earth expressed in Earth-radius units (Earth center = origin). */
  moonRelEarthRadii: Vec3d;
  /** Moon-to-Earth center distance in meters. */
  moonDistM: number;
  /** Sun-to-Earth center distance in meters. */
  sunDistM: number;
  /** Angular separation between Sun and Moon as seen from Earth center (degrees). */
  alignmentAngleDeg: number;
  /** Closest distance from Earth's center to the Sun->Moon shadow axis, in Earth radii. */
  shadowAxisImpactEarthRadii: number;
}

const MOON_RADIUS_M = 1_737_400;
const SUN_RADIUS_M = 695_700_000;

/**
 * Pure analytical 3D eclipse shadow geometry from real heliocentric positions.
 * Works identically for any historical or future UTC date.
 */
export function computeLunarShadowOnEarth(
  earthHelioM: Vec3d,
  moonHelioM: Vec3d,
  sunHelioM: Vec3d = [0, 0, 0]
): LunarEclipseShadowState {
  const toSun: Vec3d = [
    sunHelioM[0] - earthHelioM[0],
    sunHelioM[1] - earthHelioM[1],
    sunHelioM[2] - earthHelioM[2],
  ];
  const toMoon: Vec3d = [
    moonHelioM[0] - earthHelioM[0],
    moonHelioM[1] - earthHelioM[1],
    moonHelioM[2] - earthHelioM[2],
  ];

  const sunDistM = Math.hypot(toSun[0], toSun[1], toSun[2]);
  const moonDistM = Math.hypot(toMoon[0], toMoon[1], toMoon[2]);

  if (sunDistM <= 1e6 || moonDistM <= 1e5) {
    return {
      isActive: false,
      moonRelEarthRadii: [0, 0, 0],
      moonDistM,
      sunDistM,
      alignmentAngleDeg: 180,
      shadowAxisImpactEarthRadii: 999,
    };
  }

  const sunDir: Vec3d = [toSun[0] / sunDistM, toSun[1] / sunDistM, toSun[2] / sunDistM];
  const moonDir: Vec3d = [toMoon[0] / moonDistM, toMoon[1] / moonDistM, toMoon[2] / moonDistM];

  const cosAng = Math.max(-1, Math.min(1, sunDir[0] * moonDir[0] + sunDir[1] * moonDir[1] + sunDir[2] * moonDir[2]));
  const alignmentAngleDeg = (Math.acos(cosAng) * 180) / Math.PI;

  // Perpendicular distance from Earth's center to the shadow axis passing through Moon parallel to Sun->Moon
  const proj = toMoon[0] * sunDir[0] + toMoon[1] * sunDir[1] + toMoon[2] * sunDir[2];
  const perpX = toMoon[0] - sunDir[0] * proj;
  const perpY = toMoon[1] - sunDir[1] * proj;
  const perpZ = toMoon[2] - sunDir[2] * proj;
  const impactM = Math.hypot(perpX, perpY, perpZ);
  const shadowAxisImpactEarthRadii = impactM / EARTH_MEAN_RADIUS_M;

  // Penumbra cone radius at Earth distance: R_pen ~ R_moon + moonDist * (R_sun + R_moon) / sunDist
  const penumbraRadiusAtEarthM =
    MOON_RADIUS_M + (moonDistM * (SUN_RADIUS_M + MOON_RADIUS_M)) / sunDistM;
  const maxImpactM = EARTH_MEAN_RADIUS_M + penumbraRadiusAtEarthM * 1.15;

  const isActive = proj > 0 && impactM <= maxImpactM;

  return {
    isActive,
    moonRelEarthRadii: [
      toMoon[0] / EARTH_MEAN_RADIUS_M,
      toMoon[1] / EARTH_MEAN_RADIUS_M,
      toMoon[2] / EARTH_MEAN_RADIUS_M,
    ],
    moonDistM,
    sunDistM,
    alignmentAngleDeg,
    shadowAxisImpactEarthRadii,
  };
}

// ============================================================================
// Speed-of-Light Photon Pulse (Exact c = 299,792,458 m/s)
// ============================================================================

export const SPEED_OF_LIGHT_MPS = 299_792_458;

export interface PhotonMilestone {
  id: string;
  radiusM: number;
  label: string;
}

export const PHOTON_MILESTONES: readonly PhotonMilestone[] = [
  { id: 'mercury', radiusM: 0.387 * AU_IN_METERS, label: 'Mercury · 3.2m' },
  { id: 'venus', radiusM: 0.723 * AU_IN_METERS, label: 'Venus · 6.0m' },
  { id: 'earth', radiusM: 1.0 * AU_IN_METERS, label: 'Earth · 8m 20s' },
  { id: 'mars', radiusM: 1.524 * AU_IN_METERS, label: 'Mars · 12m 40s' },
  { id: 'jupiter', radiusM: 5.203 * AU_IN_METERS, label: 'Jupiter · 43m 16s' },
  { id: 'saturn', radiusM: 9.537 * AU_IN_METERS, label: 'Saturn · 1h 19m' },
  { id: 'uranus', radiusM: 19.191 * AU_IN_METERS, label: 'Uranus · 2h 40m' },
  { id: 'neptune', radiusM: 30.069 * AU_IN_METERS, label: 'Neptune · 4h 10m' },
  { id: 'proxima', radiusM: 4.2465 * LIGHT_YEAR_METERS, label: 'Proxima Cen · 4.25 ly' },
] as const;

export function computePhotonPulseRadiusM(elapsedSimSeconds: number): number {
  return Math.max(0, elapsedSimSeconds) * SPEED_OF_LIGHT_MPS;
}

export function formatLightTravelTime(seconds: number): string {
  const s = Math.max(0, seconds);
  if (s < 60) return `${s.toFixed(1)} s`;
  if (s < 3600) {
    const mins = Math.floor(s / 60);
    const remS = Math.floor(s % 60);
    return `${mins}m ${String(remS).padStart(2, '0')}s`;
  }
  if (s < 86400) {
    const hrs = Math.floor(s / 3600);
    const remM = Math.floor((s % 3600) / 60);
    return `${hrs}h ${String(remM).padStart(2, '0')}m`;
  }
  const days = s / 86400;
  if (days < 365.25) return `${days.toFixed(1)} d`;
  return `${(days / 365.25).toFixed(2)} yr`;
}

export function getLatestPhotonMilestone(radiusM: number): PhotonMilestone | null {
  let latest: PhotonMilestone | null = null;
  for (const m of PHOTON_MILESTONES) {
    if (radiusM >= m.radiusM) {
      latest = m;
    } else {
      break;
    }
  }
  return latest;
}

// ============================================================================
// Blackbody Radiation & Hertzsprung-Russell (H-R) Diagram Physics
// ============================================================================

const WIEN_DISPLACEMENT_NM_K = 2_897_771.955;
const SOLAR_TEMP_K = 5778;
const SOLAR_RADIUS_EARTH_RATIOS = 109.1;

/**
 * Parses a human-readable surface temperature string ("5,778 K", "15 °C", "-180 °C", "12,100 K")
 * into Kelvin. Falls back cleanly to `fallbackK` when unparseable.
 */
export function parseSurfaceTemperatureK(raw: string, fallbackK = 288): number {
  if (!raw || typeof raw !== 'string') return fallbackK;
  // Normalize commas and European/Vietnamese dot thousands separators (e.g. "12.100 K" -> "12100 K", "5.778 K" -> "5778 K")
  const cleaned = raw
    .replace(/,/g, '')
    .replace(/−/g, '-')
    .replace(/\b(\d{1,3})\.(\d{3})(?!\d)/g, '$1$2');
  const kelvinMatch = cleaned.match(/(-?\d+(?:\.\d+)?)\s*K\b/i);
  if (kelvinMatch) {
    const val = Number(kelvinMatch[1]);
    if (Number.isFinite(val) && val > 0) return val;
  }
  const celsiusMatch = cleaned.match(/(-?\d+(?:\.\d+)?)\s*°?\s*C\b/i);
  if (celsiusMatch) {
    const c = Number(celsiusMatch[1]);
    if (Number.isFinite(c)) return Math.round(Math.max(3, c + 273.15) * 100) / 100;
  }
  return fallbackK;
}

/**
 * Wien's Displacement Law: peak spectral radiance wavelength in nanometers.
 */
export function wienPeakWavelengthNm(tempK: number): number {
  const safeT = Math.max(2.725, tempK);
  return WIEN_DISPLACEMENT_NM_K / safeT;
}

/**
 * Physically-grounded blackbody chromaticity approximation (Tanner Helland / CIE Planckian locus)
 * returning a CSS hex color string.
 */
export function kelvinToBlackbodyHex(tempK: number): string {
  const t = Math.max(1000, Math.min(40000, tempK)) / 100;
  let r: number;
  let g: number;
  let b: number;

  if (t <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(t) - 161.1195681661;
    b = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492);
    b = 255;
  }

  const clampByte = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const hex = (v: number) => clampByte(v).toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

/**
 * Normalized Planck spectral radiance curve B(lambda, T) / B_max for plotting on [300 nm .. 2400 nm].
 */
export function sampleNormalizedPlanckCurve(
  tempK: number,
  wavelengthsNm: readonly number[]
): number[] {
  const safeT = Math.max(150, tempK);
  // h*c / k_B in nm*K = 1.438776877e7
  const hcOverKb = 1.438776877e7;
  const raw = wavelengthsNm.map((lam) => {
    const x = hcOverKb / (Math.max(10, lam) * safeT);
    if (x > 600) return 0;
    const denom = Math.pow(lam, 5) * (Math.exp(x) - 1);
    return denom > 0 && Number.isFinite(denom) ? 1 / denom : 0;
  });
  const maxVal = raw.reduce((m, v) => (v > m ? v : m), 0);
  if (maxVal <= 0) return raw.map(() => 0);
  return raw.map((v) => v / maxVal);
}

export interface HrDiagramPoint {
  id: string;
  label: string;
  tempK: number;
  luminositySolar: number;
  /** Normalized X in [0..1] where 0 = 40,000 K (hot O-type left) and 1 = 2,500 K (cool M-type right). */
  normX: number;
  /** Normalized Y in [0..1] where 0 = 10^6 L_sun (top) and 1 = 10^-4 L_sun (bottom). */
  normY: number;
  colorHex: string;
}

const LOG_T_MAX = Math.log10(42000);
const LOG_T_MIN = Math.log10(2400);
const LOG_L_MAX = 6.2;
const LOG_L_MIN = -4.2;

export function mapTempLumToHrNorm(tempK: number, luminositySolar: number): { normX: number; normY: number } {
  const logT = Math.log10(Math.max(2400, Math.min(42000, tempK)));
  const logL = Math.log10(Math.max(1e-4, Math.min(1.6e6, luminositySolar)));
  const normX = Math.max(0, Math.min(1, (LOG_T_MAX - logT) / (LOG_T_MAX - LOG_T_MIN)));
  const normY = Math.max(0, Math.min(1, (LOG_L_MAX - logL) / (LOG_L_MAX - LOG_L_MIN)));
  return { normX, normY };
}

export const HR_BENCHMARK_STARS: readonly HrDiagramPoint[] = [
  { id: 'star-rigel', label: 'Rigel', tempK: 12100, luminositySolar: 120000 },
  { id: 'star-uy-scuti', label: 'UY Scuti', tempK: 3365, luminositySolar: 340000 },
  { id: 'star-betelgeuse', label: 'Betelgeuse', tempK: 3600, luminositySolar: 126000 },
  { id: 'star-antares', label: 'Antares', tempK: 3660, luminositySolar: 75900 },
  { id: 'star-polaris', label: 'Polaris', tempK: 6015, luminositySolar: 1260 },
  { id: 'star-vega', label: 'Vega', tempK: 9602, luminositySolar: 40.1 },
  { id: 'star-sirius-a', label: 'Sirius A', tempK: 9940, luminositySolar: 25.4 },
  { id: 'star-alpha-centauri', label: 'α Cen A', tempK: 5790, luminositySolar: 1.52 },
  { id: 'star-sun', label: 'Sun', tempK: 5778, luminositySolar: 1.0 },
  { id: 'star-proxima', label: 'Proxima', tempK: 3042, luminositySolar: 0.0017 },
].map((s) => {
  const { normX, normY } = mapTempLumToHrNorm(s.tempK, s.luminositySolar);
  return {
    ...s,
    normX,
    normY,
    colorHex: kelvinToBlackbodyHex(s.tempK),
  };
});

/**
 * Computes exact Stefan-Boltzmann H-R locus for any star node:
 * L / L_sun = (R / R_sun)^2 * (T / T_sun)^4
 */
export function computeStarHrPoint(
  id: string,
  label: string,
  tempK: number,
  earthRadiusRatio: number
): HrDiagramPoint {
  const benchmark = HR_BENCHMARK_STARS.find((b) => b.id === id);
  if (benchmark) return benchmark;

  const rSolar = Math.max(0.08, earthRadiusRatio / SOLAR_RADIUS_EARTH_RATIOS);
  const safeT = Math.max(2400, Math.min(42000, tempK));
  const luminositySolar = rSolar * rSolar * Math.pow(safeT / SOLAR_TEMP_K, 4);
  const { normX, normY } = mapTempLumToHrNorm(safeT, luminositySolar);
  return {
    id,
    label,
    tempK: safeT,
    luminositySolar,
    normX,
    normY,
    colorHex: kelvinToBlackbodyHex(safeT),
  };
}

// ============================================================================
// URL Deep-Linking State Codec (Shareable Cosmic Coordinates)
// ============================================================================

export interface ObservatoryHashState {
  target?: string;
  band?: WavelengthBandId;
  dateIso?: string;
  logDist?: number;
}

const SAFE_TARGET_RE = /^[a-zA-Z0-9_-]{1,64}$/;

export function serializeObservatoryHash(state: ObservatoryHashState): string {
  const params = new URLSearchParams();
  if (state.target && SAFE_TARGET_RE.test(state.target)) {
    params.set('target', state.target);
  }
  if (state.band && state.band !== 'optical' && WAVELENGTH_BAND_ORDER.includes(state.band)) {
    params.set('band', state.band);
  }
  if (state.dateIso && Number.isFinite(Date.parse(state.dateIso))) {
    params.set('date', state.dateIso);
  }
  if (typeof state.logDist === 'number' && Number.isFinite(state.logDist)) {
    params.set('logd', state.logDist.toFixed(2));
  }
  const encoded = params.toString();
  return encoded ? `#${encoded}` : '';
}

export function parseObservatoryHash(hash: string): ObservatoryHashState {
  if (!hash) return {};
  const stripped = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!stripped) return {};
  const params = new URLSearchParams(stripped);
  const out: ObservatoryHashState = {};

  const target = params.get('target');
  if (target && SAFE_TARGET_RE.test(target)) {
    out.target = target;
  }
  const band = params.get('band') as WavelengthBandId | null;
  if (band && WAVELENGTH_BAND_ORDER.includes(band)) {
    out.band = band;
  }
  const dateIso = params.get('date');
  if (dateIso && Number.isFinite(Date.parse(dateIso))) {
    out.dateIso = dateIso;
  }
  const logdRaw = params.get('logd');
  if (logdRaw !== null) {
    const parsed = Number(logdRaw);
    if (Number.isFinite(parsed) && parsed >= 6 && parsed <= 26) {
      out.logDist = parsed;
    }
  }
  return out;
}
