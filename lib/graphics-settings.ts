import { LanguageCode } from './i18n';

export type QualityTierId = 'potato' | 'low' | 'medium' | 'high' | 'ultra' | 'custom';

export type ResolutionScaleOption = 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 2.0;

export interface GraphicsSettings {
  tier: QualityTierId;
  resolutionScale: ResolutionScaleOption;
  starfieldCount: number;
  asteroidBeltCount: number;
  planetSegments: number;
  blackHoleRaySteps: number;
  antialias: boolean;
  showAtmosphereAndNebulae: boolean;
  fpsCap: 30 | 60 | 0; // 0 = uncapped
}

export interface HardwareProfile {
  gpuRenderer: string;
  gpuVendor: string;
  isSoftwareGl: boolean;
  webgl2Supported: boolean;
  maxTextureSize: number;
  cpuCores: number;
  deviceMemoryGb: number | null;
  devicePixelRatio: number;
  screenWidth: number;
  screenHeight: number;
}

export interface HardwareRecommendation {
  score: number; // 0 - 100
  recommendedTier: Exclude<QualityTierId, 'custom'>;
  recommendedSettings: GraphicsSettings;
  gpuClass: 'software' | 'integrated-weak' | 'integrated-modern' | 'discrete-mid' | 'discrete-high';
  summaryByLang: Record<LanguageCode, string>;
}

export const GRAPHICS_PRESETS: Record<
  Exclude<QualityTierId, 'custom'>,
  GraphicsSettings
> = {
  potato: {
    tier: 'potato',
    resolutionScale: 0.5,
    starfieldCount: 6000,
    asteroidBeltCount: 0,
    planetSegments: 20,
    blackHoleRaySteps: 24,
    antialias: false,
    showAtmosphereAndNebulae: false,
    fpsCap: 30,
  },
  low: {
    tier: 'low',
    resolutionScale: 0.75,
    starfieldCount: 16000,
    asteroidBeltCount: 1500,
    planetSegments: 28,
    blackHoleRaySteps: 36,
    antialias: false,
    showAtmosphereAndNebulae: true,
    fpsCap: 30,
  },
  medium: {
    tier: 'medium',
    resolutionScale: 1.0,
    starfieldCount: 40000,
    asteroidBeltCount: 4500,
    planetSegments: 40,
    blackHoleRaySteps: 52,
    antialias: true,
    showAtmosphereAndNebulae: true,
    fpsCap: 60,
  },
  high: {
    tier: 'high',
    resolutionScale: 1.25,
    starfieldCount: 80000,
    asteroidBeltCount: 10000,
    planetSegments: 56,
    blackHoleRaySteps: 72,
    antialias: true,
    showAtmosphereAndNebulae: true,
    fpsCap: 60,
  },
  ultra: {
    tier: 'ultra',
    resolutionScale: 2.0,
    starfieldCount: 140000,
    asteroidBeltCount: 20000,
    planetSegments: 80,
    blackHoleRaySteps: 96,
    antialias: true,
    showAtmosphereAndNebulae: true,
    fpsCap: 0,
  },
};

export const RESOLUTION_OPTIONS: {
  scale: ResolutionScaleOption;
  badge: string;
}[] = [
  { scale: 0.5, badge: '0.5x (540p)' },
  { scale: 0.75, badge: '0.75x (720p)' },
  { scale: 1.0, badge: '1.0x (1080p)' },
  { scale: 1.25, badge: '1.25x (1440p)' },
  { scale: 1.5, badge: '1.5x (QHD+)' },
  { scale: 2.0, badge: '2.0x (4K HiDPI)' },
];

export const STAR_COUNT_OPTIONS = [6000, 16000, 40000, 80000, 140000] as const;
export const ASTEROID_COUNT_OPTIONS = [0, 1500, 4500, 10000, 20000] as const;
export const TESSELLATION_OPTIONS = [20, 28, 40, 56, 80] as const;
export const RAYMARCH_STEP_OPTIONS = [24, 36, 52, 72, 96] as const;
export const FPS_CAP_OPTIONS: (30 | 60 | 0)[] = [30, 60, 0];

/**
 * Pure deterministic hardware profiler & quality tier recommender.
 * Classifies real GPU strings, software GL renderers, CPU cores, RAM, and max texture size
 * into a 0-100 hardware score and exact optimal GraphicsSettings preset.
 */
export function scoreHardwareAndRecommend(
  profile: HardwareProfile
): HardwareRecommendation {
  const gpuLower = `${profile.gpuRenderer} ${profile.gpuVendor}`.toLowerCase();

  let gpuClass: HardwareRecommendation['gpuClass'] = 'integrated-modern';
  let gpuScore = 46;

  if (
    profile.isSoftwareGl ||
    /swiftshader|llvmpipe|softpipe|basic render|mesa offscreen|angle \(google/i.test(
      gpuLower
    )
  ) {
    gpuClass = 'software';
    gpuScore = 10;
  } else if (
    /rtx\s?(30[7-9]0|40[6-9]0|50[6-9]0)|rx\s?(6[89]00|7[7-9]00|9070)|apple\s?m[234]\s?(pro|max|ultra)|a100|h100|quadro\s?rtx/i.test(
      gpuLower
    )
  ) {
    gpuClass = 'discrete-high';
    gpuScore = 62;
  } else if (
    /rtx\s?(20|3050|3060|4050)|gtx\s?(10[6-8]0|16[56]0)|rx\s?(5[67]00|6[5-7]00|7600)|apple\s?m[1-4]|arc\s?a[57]|radeon pro/i.test(
      gpuLower
    )
  ) {
    gpuClass = 'discrete-mid';
    gpuScore = 52;
  } else if (
    /intel(?:\(r\))?\s*(?:uhd|hd graphics|celeron|pentium)|mali-g[35]|adreno\s?[45]|powervr|geforce\s?(mx|gt\s?[67])/i.test(
      gpuLower
    )
  ) {
    gpuClass = 'integrated-weak';
    gpuScore = 24;
  } else if (/iris|radeon|vega|adreno\s?[678]|apple gpu/i.test(gpuLower)) {
    gpuClass = 'integrated-modern';
    gpuScore = 40;
  }

  // CPU score (0..18)
  const cores = Math.max(1, profile.cpuCores || 4);
  const cpuScore =
    cores >= 16 ? 18 : cores >= 10 ? 15 : cores >= 6 ? 12 : cores >= 4 ? 8 : 4;

  // RAM score (0..12)
  const mem = profile.deviceMemoryGb ?? (cores >= 8 ? 8 : 4);
  const ramScore = mem >= 16 ? 12 : mem >= 8 ? 9 : mem >= 4 ? 5 : 2;

  // WebGL capabilities score (0..8)
  const glScore =
    (profile.webgl2Supported ? 4 : 0) +
    (profile.maxTextureSize >= 16384
      ? 4
      : profile.maxTextureSize >= 8192
        ? 3
        : profile.maxTextureSize >= 4096
          ? 2
          : 0);

  const score = Math.max(5, Math.min(100, gpuScore + cpuScore + ramScore + glScore));

  let recommendedTier: Exclude<QualityTierId, 'custom'>;
  if (gpuClass === 'software') {
    recommendedTier = cores >= 4 && mem >= 4 ? 'low' : 'potato';
  } else if (score >= 86) {
    recommendedTier = 'ultra';
  } else if (score >= 68) {
    recommendedTier = 'high';
  } else if (score >= 48) {
    recommendedTier = 'medium';
  } else if (score >= 28) {
    recommendedTier = 'low';
  } else {
    recommendedTier = 'potato';
  }

  // Respect native DPR cap so Ultra doesn't needlessly oversample 1x displays unless chosen manually
  const basePreset = { ...GRAPHICS_PRESETS[recommendedTier] };
  if (recommendedTier === 'ultra' && profile.devicePixelRatio <= 1.1) {
    basePreset.resolutionScale = 1.5;
  } else if (recommendedTier === 'high' && profile.devicePixelRatio <= 1.0) {
    basePreset.resolutionScale = 1.0;
  }

  const memLabel = profile.deviceMemoryGb ? `${profile.deviceMemoryGb} GB RAM` : 'RAM N/A';

  const summaryByLang: Record<LanguageCode, string> = {
    vi:
      gpuClass === 'software'
        ? `Phát hiện trình dựng đồ họa phần mềm (${profile.gpuRenderer}) · ${cores} nhân CPU. Khuyến nghị mức ${recommendedTier.toUpperCase()} (${basePreset.resolutionScale}x) để giữ tốc độ mượt mà.`
        : `Phát hiện ${profile.gpuRenderer} · ${cores} nhân CPU · ${memLabel} (Điểm ${score}/100). Khuyến nghị mức ${recommendedTier.toUpperCase()} với độ phân giải ${basePreset.resolutionScale}x.`,
    en:
      gpuClass === 'software'
        ? `Software WebGL renderer detected (${profile.gpuRenderer}) · ${cores} CPU threads. Recommended ${recommendedTier.toUpperCase()} (${basePreset.resolutionScale}x) for smooth navigation.`
        : `Detected ${profile.gpuRenderer} · ${cores} CPU threads · ${memLabel} (Score ${score}/100). Recommended ${recommendedTier.toUpperCase()} at ${basePreset.resolutionScale}x render scale.`,
    ja:
      gpuClass === 'software'
        ? `ソフトウェアWebGLレンダラーを検出（${profile.gpuRenderer}）・${cores}スレッド。快適な操作のため ${recommendedTier.toUpperCase()}（${basePreset.resolutionScale}x）を推奨します。`
        : `${profile.gpuRenderer}・${cores}スレッド・${memLabel}（スコア ${score}/100）を検出。${recommendedTier.toUpperCase()}（${basePreset.resolutionScale}x）が最適です。`,
    zh:
      gpuClass === 'software'
        ? `检测到软件 WebGL 渲染器 (${profile.gpuRenderer}) · ${cores} 线程。建议使用 ${recommendedTier.toUpperCase()} (${basePreset.resolutionScale}x) 以保持流畅。`
        : `检测到 ${profile.gpuRenderer} · ${cores} 线程 · ${memLabel}（评分 ${score}/100）。推荐使用 ${recommendedTier.toUpperCase()} (${basePreset.resolutionScale}x) 预设。`,
    ko:
      gpuClass === 'software'
        ? `소프트웨어 WebGL 렌더러 감지(${profile.gpuRenderer}) · ${cores} 스레드. 원활한 탐색을 위해 ${recommendedTier.toUpperCase()}(${basePreset.resolutionScale}x)를 권장합니다.`
        : `${profile.gpuRenderer} · ${cores} 스레드 · ${memLabel}(점수 ${score}/100) 감지. ${recommendedTier.toUpperCase()}(${basePreset.resolutionScale}x) 프리셋을 권장합니다.`,
  };

  return {
    score,
    recommendedTier,
    recommendedSettings: basePreset,
    gpuClass,
    summaryByLang,
  };
}

/**
 * Browser-side hardware capability probe (safe for SSR & restricted iframe contexts).
 */
export function detectClientHardwareProfile(): HardwareProfile {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      gpuRenderer: 'Unknown GPU',
      gpuVendor: 'Unknown',
      isSoftwareGl: false,
      webgl2Supported: true,
      maxTextureSize: 8192,
      cpuCores: 4,
      deviceMemoryGb: 8,
      devicePixelRatio: 1,
      screenWidth: 1440,
      screenHeight: 900,
    };
  }

  let gpuRenderer = 'WebGL GPU';
  let gpuVendor = 'Unknown';
  let webgl2Supported = false;
  let maxTextureSize = 4096;

  try {
    const canvas = document.createElement('canvas');
    const gl2 = canvas.getContext('webgl2');
    const gl = gl2 || canvas.getContext('webgl');
    webgl2Supported = Boolean(gl2);

    if (gl) {
      maxTextureSize = Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || 4096;
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpuRenderer =
          String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)) ||
          gpuRenderer;
        gpuVendor =
          String(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)) || gpuVendor;
      } else {
        gpuRenderer = String(gl.getParameter(gl.RENDERER)) || gpuRenderer;
        gpuVendor = String(gl.getParameter(gl.VENDOR)) || gpuVendor;
      }
      const loseCtx = gl.getExtension('WEBGL_lose_context');
      if (loseCtx) loseCtx.loseContext();
    }
  } catch {
    // Graceful fallback
  }

  const isSoftwareGl =
    /swiftshader|llvmpipe|softpipe|mesa offscreen|basic render/i.test(
      gpuRenderer
    );

  const nav = navigator as Navigator & { deviceMemory?: number };
  return {
    gpuRenderer,
    gpuVendor,
    isSoftwareGl,
    webgl2Supported,
    maxTextureSize,
    cpuCores: nav.hardwareConcurrency || 4,
    deviceMemoryGb: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null,
    devicePixelRatio: window.devicePixelRatio || 1,
    screenWidth: window.screen?.width || window.innerWidth || 1440,
    screenHeight: window.screen?.height || window.innerHeight || 900,
  };
}

export const GRAPHICS_SETTINGS_STORAGE_KEY = 'milkyway_graphics_settings_v1';
