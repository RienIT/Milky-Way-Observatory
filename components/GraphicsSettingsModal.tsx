'use client';

import React, { useEffect } from 'react';
import {
  Check,
  Cpu,
  Gauge,
  Monitor,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import {
  ASTEROID_COUNT_OPTIONS,
  FPS_CAP_OPTIONS,
  GRAPHICS_PRESETS,
  GraphicsSettings,
  HardwareProfile,
  HardwareRecommendation,
  QualityTierId,
  RAYMARCH_STEP_OPTIONS,
  RESOLUTION_OPTIONS,
  ResolutionScaleOption,
  STAR_COUNT_OPTIONS,
  TESSELLATION_OPTIONS,
} from '@/lib/graphics-settings';
import { LanguageCode } from '@/lib/i18n';

interface GraphicsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GraphicsSettings;
  onChangeSettings: (next: GraphicsSettings) => void;
  hardwareProfile: HardwareProfile;
  recommendation: HardwareRecommendation;
  lang: LanguageCode;
}

interface ModalLabels {
  title: string;
  subtitle: string;
  hardwareHeading: string;
  gpuLabel: string;
  cpuLabel: string;
  ramLabel: string;
  maxTexLabel: string;
  displayLabel: string;
  scoreLabel: string;
  recommendedBadge: string;
  applyRecommended: string;
  presetsHeading: string;
  tierNames: Record<Exclude<QualityTierId, 'custom'>, string>;
  tierDescs: Record<Exclude<QualityTierId, 'custom'>, string>;
  resolutionLabel: string;
  liveRenderSize: string;
  starCountLabel: string;
  asteroidCountLabel: string;
  tessellationLabel: string;
  rayStepsLabel: string;
  fpsCapLabel: string;
  fpsUncapped: string;
  antialiasLabel: string;
  antialiasHint: string;
  atmosphereLabel: string;
  atmosphereHint: string;
  enabled: string;
  disabled: string;
  closeBtn: string;
  customActive: string;
}

const LABELS: Record<LanguageCode, ModalLabels> = {
  vi: {
    title: 'Cài đặt Đồ họa & Độ phân giải',
    subtitle: 'Tùy chỉnh chi tiết cho máy yếu đến máy trạm 4K · Tự động đánh giá cấu hình máy hiện tại',
    hardwareHeading: 'Phân tích Phần cứng Thiết bị Hiện tại',
    gpuLabel: 'GPU / Trình dựng WebGL',
    cpuLabel: 'Luồng CPU',
    ramLabel: 'Bộ nhớ RAM',
    maxTexLabel: 'Max Texture',
    displayLabel: 'Màn hình / DPR',
    scoreLabel: 'Điểm Cấu hình',
    recommendedBadge: 'Khuyến nghị cho máy bạn',
    applyRecommended: 'Áp dụng Khuyến nghị',
    presetsHeading: 'Hồ sơ Chất lượng Nhanh (Máy yếu → 4K)',
    tierNames: {
      potato: 'Siêu nhẹ',
      low: 'Nhẹ',
      medium: 'Cân bằng',
      high: 'Cao',
      ultra: 'Cực đại 4K',
    },
    tierDescs: {
      potato: '0.5x · 6k sao · 24 bước',
      low: '0.75x · 16k sao · 36 bước',
      medium: '1.0x · 40k sao · 52 bước',
      high: '1.25x · 80k sao · 72 bước',
      ultra: '2.0x · 140k sao · 96 bước',
    },
    resolutionLabel: 'Tỷ lệ Độ phân giải Kết xuất (Render Scale)',
    liveRenderSize: 'Độ phân giải thực tế',
    starCountLabel: 'Số lượng Ngôi sao Dải Ngân Hà (Milky Way)',
    asteroidCountLabel: 'Vành đai Tiểu hành tinh & Vành đai Kuiper',
    tessellationLabel: 'Độ mịn Khối cầu Hành tinh (Segments)',
    rayStepsLabel: 'Bước Raymarch Hố đen Sagittarius A*',
    fpsCapLabel: 'Giới hạn Tốc độ Khung hình (FPS)',
    fpsUncapped: 'Không giới hạn',
    antialiasLabel: 'Khử răng cưa (MSAA Antialiasing)',
    antialiasHint: 'Làm mịn biên hành tinh & vành đai (tắt để tăng FPS máy yếu)',
    atmosphereLabel: 'Khí quyển Rayleigh & Tinh vân H-II',
    atmosphereHint: 'Hào quang khí quyển hành tinh và đám mây bụi Dải Ngân Hà',
    enabled: 'Bật',
    disabled: 'Tắt',
    closeBtn: 'Hoàn tất',
    customActive: 'Tùy chỉnh thủ công',
  },
  en: {
    title: 'Graphics & Resolution Settings',
    subtitle: 'Fine-tune fidelity from weak laptops to 4K workstations · Auto-recommended for your hardware',
    hardwareHeading: 'Detected Client Hardware Profile',
    gpuLabel: 'GPU / WebGL Renderer',
    cpuLabel: 'CPU Threads',
    ramLabel: 'Device Memory',
    maxTexLabel: 'Max Texture',
    displayLabel: 'Display / DPR',
    scoreLabel: 'Hardware Score',
    recommendedBadge: 'Recommended for this PC',
    applyRecommended: 'Apply Recommended',
    presetsHeading: 'Quality Presets (Low-End → 4K Ultra)',
    tierNames: {
      potato: 'Potato',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      ultra: 'Ultra 4K',
    },
    tierDescs: {
      potato: '0.5x · 6k stars · 24 steps',
      low: '0.75x · 16k stars · 36 steps',
      medium: '1.0x · 40k stars · 52 steps',
      high: '1.25x · 80k stars · 72 steps',
      ultra: '2.0x · 140k stars · 96 steps',
    },
    resolutionLabel: 'Render Resolution Scale',
    liveRenderSize: 'Active buffer',
    starCountLabel: 'Milky Way Galaxy Star Count',
    asteroidCountLabel: 'Main Asteroid Belt & Kuiper Belt Particles',
    tessellationLabel: 'Planet Geometry Tessellation (Segments)',
    rayStepsLabel: 'Sagittarius A* Raymarch Precision Steps',
    fpsCapLabel: 'Target Frame Rate Cap',
    fpsUncapped: 'Uncapped',
    antialiasLabel: 'MSAA Antialiasing',
    antialiasHint: 'Smooths planetary limbs & rings (disable on weak GPUs)',
    atmosphereLabel: 'Rayleigh Atmospheres & H-II Nebulae',
    atmosphereHint: 'Atmospheric scattering halos and galactic spiral dust clouds',
    enabled: 'On',
    disabled: 'Off',
    closeBtn: 'Done',
    customActive: 'Custom profile',
  },
  ja: {
    title: 'グラフィック・解像度設定',
    subtitle: '低スペックPCから4K環境まで詳細に最適化・現在のハードウェアから自動推奨',
    hardwareHeading: '検出されたハードウェア構成',
    gpuLabel: 'GPU / WebGL レンダラー',
    cpuLabel: 'CPU スレッド',
    ramLabel: 'メモリ',
    maxTexLabel: '最大テクスチャ',
    displayLabel: 'ディスプレイ / DPR',
    scoreLabel: '性能スコア',
    recommendedBadge: 'このPCへの推奨設定',
    applyRecommended: '推奨設定を適用',
    presetsHeading: '品質プリセット（超軽量 → 4K Ultra）',
    tierNames: {
      potato: '超軽量',
      low: '低',
      medium: '標準',
      high: '高',
      ultra: '最高 4K',
    },
    tierDescs: {
      potato: '0.5x・6千星・24ステップ',
      low: '0.75x・1.6万星・36ステップ',
      medium: '1.0x・4万星・52ステップ',
      high: '1.25x・8万星・72ステップ',
      ultra: '2.0x・14万星・96ステップ',
    },
    resolutionLabel: 'レンダリング解像度スケール',
    liveRenderSize: '描画バッファ',
    starCountLabel: '天の川銀河の恒星数',
    asteroidCountLabel: '小惑星帯・カイパーベルト粒子数',
    tessellationLabel: '惑星ジオメトリ分割数',
    rayStepsLabel: 'いて座A* レイマーチ精度ステップ',
    fpsCapLabel: 'フレームレート上限',
    fpsUncapped: '無制限',
    antialiasLabel: 'アンチエイリアス (MSAA)',
    antialiasHint: '惑星や環の輪郭を滑らかにします',
    atmosphereLabel: '大気散乱＆H-II星雲',
    atmosphereHint: '惑星大気ハローと銀河腕の星雲ガス表示',
    enabled: 'オン',
    disabled: 'オフ',
    closeBtn: '完了',
    customActive: 'カスタム設定',
  },
  zh: {
    title: '图形与分辨率设置',
    subtitle: '针对低配电脑到 4K 工作站精细调节 · 基于当前硬件自动推荐',
    hardwareHeading: '当前设备硬件检测',
    gpuLabel: 'GPU / WebGL 渲染器',
    cpuLabel: 'CPU 线程',
    ramLabel: '设备内存',
    maxTexLabel: '最大纹理',
    displayLabel: '屏幕 / DPR',
    scoreLabel: '硬件评分',
    recommendedBadge: '当前设备推荐',
    applyRecommended: '应用推荐配置',
    presetsHeading: '画质预设（极速 → 4K 极致）',
    tierNames: {
      potato: '极速',
      low: '流畅',
      medium: '均衡',
      high: '高清',
      ultra: '极致 4K',
    },
    tierDescs: {
      potato: '0.5x · 6千星 · 24步',
      low: '0.75x · 1.6万星 · 36步',
      medium: '1.0x · 4万星 · 52步',
      high: '1.25x · 8万星 · 72步',
      ultra: '2.0x · 14万星 · 96步',
    },
    resolutionLabel: '渲染分辨率缩放 (Render Scale)',
    liveRenderSize: '实时渲染像素',
    starCountLabel: '银河系恒星粒子数量',
    asteroidCountLabel: '主小行星带与柯伊伯带数量',
    tessellationLabel: '行星球体网格细分 (Segments)',
    rayStepsLabel: '人马座 A* 光线步进精度 (Steps)',
    fpsCapLabel: '目标帧率上限 (FPS)',
    fpsUncapped: '无限制',
    antialiasLabel: '多重采样抗锯齿 (MSAA)',
    antialiasHint: '平滑行星边缘与星环（低配机可关闭以提速）',
    atmosphereLabel: '瑞利大气散射与 H-II 星云',
    atmosphereHint: '行星大气光晕与银河系旋臂星际尘埃云',
    enabled: '开启',
    disabled: '关闭',
    closeBtn: '完成',
    customActive: '自定义配置',
  },
  ko: {
    title: '그래픽 및 해상도 설정',
    subtitle: '저사양 PC부터 4K 워크스테이션까지 세밀한 최적화 · 현재 하드웨어 자동 추천',
    hardwareHeading: '감지된 클라이언트 하드웨어 사양',
    gpuLabel: 'GPU / WebGL 렌더러',
    cpuLabel: 'CPU 스레드',
    ramLabel: '메모리',
    maxTexLabel: '최대 텍스처',
    displayLabel: '디스플레이 / DPR',
    scoreLabel: '하드웨어 점수',
    recommendedBadge: '현재 PC 권장',
    applyRecommended: '권장 설정 적용',
    presetsHeading: '품질 프리셋 (초저사양 → 4K 울트라)',
    tierNames: {
      potato: '초경량',
      low: '낮음',
      medium: '보통',
      high: '높음',
      ultra: '울트라 4K',
    },
    tierDescs: {
      potato: '0.5x · 별 6천 · 24스텝',
      low: '0.75x · 별 1.6만 · 36스텝',
      medium: '1.0x · 별 4만 · 52스텝',
      high: '1.25x · 별 8만 · 72스텝',
      ultra: '2.0x · 별 14만 · 96스텝',
    },
    resolutionLabel: '렌더링 해상도 배율 (Render Scale)',
    liveRenderSize: '실제 렌더 해상도',
    starCountLabel: '우리 은하 별 입자 수',
    asteroidCountLabel: '소행성대 및 카이퍼 벨트 입자 수',
    tessellationLabel: '행성 구체 세분화 (Segments)',
    rayStepsLabel: '궁수자리 A* 레이마칭 정밀도',
    fpsCapLabel: '목표 프레임 제한 (FPS)',
    fpsUncapped: '무제한',
    antialiasLabel: '안티앨리어싱 (MSAA)',
    antialiasHint: '행성과 고리 윤곽을 부드럽게 처리합니다',
    atmosphereLabel: '대기 산란 및 H-II 성운',
    atmosphereHint: '행성 대기광과 은하 나선팔 성운 효과',
    enabled: '켜짐',
    disabled: '꺼짐',
    closeBtn: '완료',
    customActive: '사용자 지정',
  },
};

const TIER_ORDER: Exclude<QualityTierId, 'custom'>[] = [
  'potato',
  'low',
  'medium',
  'high',
  'ultra',
];

export default function GraphicsSettingsModal({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
  hardwareProfile,
  recommendation,
  lang,
}: GraphicsSettingsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copy = LABELS[lang];
  const baseW =
    typeof window !== 'undefined' ? window.innerWidth : hardwareProfile.screenWidth;
  const baseH =
    typeof window !== 'undefined' ? window.innerHeight : hardwareProfile.screenHeight;
  const renderPxW = Math.round(baseW * settings.resolutionScale);
  const renderPxH = Math.round(baseH * settings.resolutionScale);

  const updateField = <K extends keyof GraphicsSettings>(
    key: K,
    value: GraphicsSettings[K]
  ) => {
    onChangeSettings({
      ...settings,
      tier: 'custom',
      [key]: value,
    });
  };

  const applyPreset = (tier: Exclude<QualityTierId, 'custom'>) => {
    onChangeSettings({ ...GRAPHICS_PRESETS[tier] });
  };

  const applyRecommended = () => {
    onChangeSettings({ ...recommendation.recommendedSettings });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.title}
      data-testid="graphics-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[780px] max-h-[90vh] rounded-[16px] bg-[#111318] border border-white/[0.10] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-start justify-between gap-4 bg-[#14171f]">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-[10px] bg-[#0082fb]/15 border border-[#0082fb]/35 text-[#54a8ff] inline-flex items-center justify-center shrink-0 mt-0.5">
              <SlidersHorizontal className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-[16px] font-semibold tracking-[-0.015em] text-[#f3f4f6]">
                {copy.title}
              </h2>
              <p className="text-xs text-[#9ca3af] mt-0.5">{copy.subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={copy.closeBtn}
            className="p-1.5 rounded-[8px] text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#1f2430] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* 1. Hardware Auto-Detection & Recommendation Banner */}
          <section
            data-testid="hardware-recommendation-card"
            className="rounded-[12px] bg-[#161922] border border-white/[0.08] p-4 space-y-3.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#54a8ff] shrink-0" />
                <h3 className="text-xs font-semibold text-[#f3f4f6]">
                  {copy.hardwareHeading}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#0082fb]/15 border border-[#0082fb]/35 text-[11px] font-semibold text-[#54a8ff]">
                  <Sparkles className="w-3 h-3" />
                  <span>
                    {copy.recommendedBadge}:{' '}
                    {copy.tierNames[recommendation.recommendedTier]}
                  </span>
                </span>
                <button
                  type="button"
                  data-testid="apply-recommended-graphics-btn"
                  onClick={applyRecommended}
                  className="px-3 py-1 rounded-[8px] bg-[#0082fb] hover:bg-[#0073e0] text-white text-xs font-semibold transition-colors"
                >
                  {copy.applyRecommended}
                </button>
              </div>
            </div>

            {/* Hardware Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
              <div className="col-span-2 sm:col-span-3 lg:col-span-2 rounded-[8px] bg-[#111318] border border-white/[0.06] px-3 py-2">
                <span className="text-[11px] text-[#6b7280] block">
                  {copy.gpuLabel}
                </span>
                <span
                  data-testid="detected-gpu-name"
                  className="font-mono text-[11px] text-[#f3f4f6] break-words line-clamp-2"
                >
                  {hardwareProfile.gpuRenderer}
                </span>
              </div>

              <div className="rounded-[8px] bg-[#111318] border border-white/[0.06] px-3 py-2">
                <span className="text-[11px] text-[#6b7280] block">
                  {copy.cpuLabel}
                </span>
                <span className="font-mono tabular-nums text-[#f3f4f6] font-semibold">
                  {hardwareProfile.cpuCores} threads
                </span>
              </div>

              <div className="rounded-[8px] bg-[#111318] border border-white/[0.06] px-3 py-2">
                <span className="text-[11px] text-[#6b7280] block">
                  {copy.ramLabel}
                </span>
                <span className="font-mono tabular-nums text-[#f3f4f6] font-semibold">
                  {hardwareProfile.deviceMemoryGb
                    ? `${hardwareProfile.deviceMemoryGb} GB`
                    : 'Auto'}
                </span>
              </div>

              <div className="rounded-[8px] bg-[#111318] border border-white/[0.06] px-3 py-2">
                <span className="text-[11px] text-[#6b7280] block">
                  {copy.displayLabel}
                </span>
                <span className="font-mono tabular-nums text-[#d1d5db]">
                  {hardwareProfile.screenWidth}×{hardwareProfile.screenHeight} ·{' '}
                  {hardwareProfile.devicePixelRatio.toFixed(1)}x
                </span>
              </div>
            </div>

            {/* Score Bar + Localized Explanation */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9ca3af] inline-flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-[#54a8ff]" />
                  <span>{copy.scoreLabel}</span>
                </span>
                <span
                  data-testid="hardware-score-value"
                  className="font-mono tabular-nums font-semibold text-[#f3f4f6]"
                >
                  {recommendation.score} / 100
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#0c0e13] overflow-hidden border border-white/[0.06]">
                <div
                  className="h-full rounded-full bg-[#0082fb] transition-all duration-300"
                  style={{ width: `${recommendation.score}%` }}
                />
              </div>
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                {recommendation.summaryByLang[lang]}
              </p>
            </div>
          </section>

          {/* 2. Quick Quality Tier Selector */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#9ca3af]">
                {copy.presetsHeading}
              </h3>
              {settings.tier === 'custom' && (
                <span className="text-[11px] font-mono text-[#54a8ff]">
                  {copy.customActive}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {TIER_ORDER.map((tierId) => {
                const isSelected = settings.tier === tierId;
                const isRecommended = recommendation.recommendedTier === tierId;
                return (
                  <button
                    key={tierId}
                    type="button"
                    data-testid={`preset-tier-${tierId}`}
                    onClick={() => applyPreset(tierId)}
                    className={`rounded-[10px] p-2.5 text-left border transition-colors relative ${
                      isSelected
                        ? 'bg-[#0082fb]/15 border-[#0082fb] text-white'
                        : 'bg-[#161922] hover:bg-[#1c202b] border-white/[0.08] text-[#d1d5db]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold">
                        {copy.tierNames[tierId]}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#54a8ff] shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-[#9ca3af] mt-1 leading-snug">
                      {copy.tierDescs[tierId]}
                    </p>
                    {isRecommended && (
                      <span className="inline-block mt-1.5 text-[10px] font-medium text-[#54a8ff]">
                        ★ Auto
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3. Render Resolution Scale */}
          <section className="rounded-[12px] bg-[#161922] border border-white/[0.08] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#f3f4f6]">
                <Monitor className="w-3.5 h-3.5 text-[#54a8ff]" />
                <span>{copy.resolutionLabel}</span>
              </div>
              <span
                data-testid="live-render-resolution"
                className="font-mono tabular-nums text-xs text-[#54a8ff] font-semibold"
              >
                {copy.liveRenderSize}: {renderPxW} × {renderPxH} px (
                {settings.resolutionScale}x)
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {RESOLUTION_OPTIONS.map((opt) => {
                const active = settings.resolutionScale === opt.scale;
                return (
                  <button
                    key={opt.scale}
                    type="button"
                    data-testid={`res-scale-${opt.scale}`}
                    onClick={() =>
                      updateField(
                        'resolutionScale',
                        opt.scale as ResolutionScaleOption
                      )
                    }
                    className={`px-2 py-2 rounded-[8px] text-center font-mono text-[11px] border transition-colors ${
                      active
                        ? 'bg-[#0082fb] border-[#0082fb] text-white font-semibold'
                        : 'bg-[#111318] hover:bg-[#1c202b] border-white/[0.08] text-[#d1d5db]'
                    }`}
                  >
                    {opt.badge}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 4. Granular GPU & Scene Complexity Controls */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Milky Way Star Count */}
            <div className="rounded-[12px] bg-[#161922] border border-white/[0.08] p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#f3f4f6]">
                  {copy.starCountLabel}
                </span>
                <span className="font-mono tabular-nums text-[#54a8ff]">
                  {(settings.starfieldCount / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {STAR_COUNT_OPTIONS.map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => updateField('starfieldCount', cnt)}
                    className={`py-1.5 rounded-[6px] font-mono text-[11px] border transition-colors ${
                      settings.starfieldCount === cnt
                        ? 'bg-[#0082fb] border-[#0082fb] text-white font-semibold'
                        : 'bg-[#111318] hover:bg-[#1c202b] border-white/[0.08] text-[#9ca3af]'
                    }`}
                  >
                    {cnt / 1000}k
                  </button>
                ))}
              </div>
            </div>

            {/* Asteroid & Kuiper Belt Particle Count */}
            <div className="rounded-[12px] bg-[#161922] border border-white/[0.08] p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#f3f4f6]">
                  {copy.asteroidCountLabel}
                </span>
                <span className="font-mono tabular-nums text-[#54a8ff]">
                  {settings.asteroidBeltCount === 0
                    ? copy.disabled
                    : `${(settings.asteroidBeltCount / 1000).toFixed(1)}k`}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {ASTEROID_COUNT_OPTIONS.map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => updateField('asteroidBeltCount', cnt)}
                    className={`py-1.5 rounded-[6px] font-mono text-[11px] border transition-colors ${
                      settings.asteroidBeltCount === cnt
                        ? 'bg-[#0082fb] border-[#0082fb] text-white font-semibold'
                        : 'bg-[#111318] hover:bg-[#1c202b] border-white/[0.08] text-[#9ca3af]'
                    }`}
                  >
                    {cnt === 0 ? '0' : `${cnt / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            {/* Planet Tessellation */}
            <div className="rounded-[12px] bg-[#161922] border border-white/[0.08] p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#f3f4f6]">
                  {copy.tessellationLabel}
                </span>
                <span className="font-mono tabular-nums text-[#54a8ff]">
                  {settings.planetSegments} seg
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {TESSELLATION_OPTIONS.map((seg) => (
                  <button
                    key={seg}
                    type="button"
                    onClick={() => updateField('planetSegments', seg)}
                    className={`py-1.5 rounded-[6px] font-mono text-[11px] border transition-colors ${
                      settings.planetSegments === seg
                        ? 'bg-[#0082fb] border-[#0082fb] text-white font-semibold'
                        : 'bg-[#111318] hover:bg-[#1c202b] border-white/[0.08] text-[#9ca3af]'
                    }`}
                  >
                    {seg}
                  </button>
                ))}
              </div>
            </div>

            {/* Black Hole Raymarch Steps */}
            <div className="rounded-[12px] bg-[#161922] border border-white/[0.08] p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#f3f4f6]">
                  {copy.rayStepsLabel}
                </span>
                <span className="font-mono tabular-nums text-[#54a8ff]">
                  {settings.blackHoleRaySteps} steps
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {RAYMARCH_STEP_OPTIONS.map((steps) => (
                  <button
                    key={steps}
                    type="button"
                    onClick={() => updateField('blackHoleRaySteps', steps)}
                    className={`py-1.5 rounded-[6px] font-mono text-[11px] border transition-colors ${
                      settings.blackHoleRaySteps === steps
                        ? 'bg-[#0082fb] border-[#0082fb] text-white font-semibold'
                        : 'bg-[#111318] hover:bg-[#1c202b] border-white/[0.08] text-[#9ca3af]'
                    }`}
                  >
                    {steps}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 5. Toggles & FPS Cap */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* FPS Cap */}
            <div className="rounded-[12px] bg-[#161922] border border-white/[0.08] p-3.5 space-y-2">
              <span className="text-xs font-medium text-[#f3f4f6] block">
                {copy.fpsCapLabel}
              </span>
              <div className="grid grid-cols-3 gap-1">
                {FPS_CAP_OPTIONS.map((fps) => (
                  <button
                    key={fps}
                    type="button"
                    onClick={() => updateField('fpsCap', fps)}
                    className={`py-1.5 rounded-[6px] font-mono text-[11px] border transition-colors ${
                      settings.fpsCap === fps
                        ? 'bg-[#0082fb] border-[#0082fb] text-white font-semibold'
                        : 'bg-[#111318] hover:bg-[#1c202b] border-white/[0.08] text-[#9ca3af]'
                    }`}
                  >
                    {fps === 0 ? copy.fpsUncapped : `${fps}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Antialiasing Toggle */}
            <div className="rounded-[12px] bg-[#161922] border border-white/[0.08] p-3.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#f3f4f6]">
                  {copy.antialiasLabel}
                </p>
                <p className="text-[10px] text-[#6b7280] leading-snug mt-0.5">
                  {copy.antialiasHint}
                </p>
              </div>
              <button
                type="button"
                aria-pressed={settings.antialias}
                onClick={() => updateField('antialias', !settings.antialias)}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold shrink-0 transition-colors ${
                  settings.antialias
                    ? 'bg-[#0082fb] text-white'
                    : 'bg-[#111318] border border-white/[0.10] text-[#9ca3af]'
                }`}
              >
                {settings.antialias ? copy.enabled : copy.disabled}
              </button>
            </div>

            {/* Atmosphere & Nebulae Toggle */}
            <div className="rounded-[12px] bg-[#161922] border border-white/[0.08] p-3.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#f3f4f6]">
                  {copy.atmosphereLabel}
                </p>
                <p className="text-[10px] text-[#6b7280] leading-snug mt-0.5">
                  {copy.atmosphereHint}
                </p>
              </div>
              <button
                type="button"
                aria-pressed={settings.showAtmosphereAndNebulae}
                onClick={() =>
                  updateField(
                    'showAtmosphereAndNebulae',
                    !settings.showAtmosphereAndNebulae
                  )
                }
                className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold shrink-0 transition-colors ${
                  settings.showAtmosphereAndNebulae
                    ? 'bg-[#0082fb] text-white'
                    : 'bg-[#111318] border border-white/[0.10] text-[#9ca3af]'
                }`}
              >
                {settings.showAtmosphereAndNebulae
                  ? copy.enabled
                  : copy.disabled}
              </button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] bg-[#0e1015] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#6b7280]">
            WebGL{hardwareProfile.webgl2Supported ? '2' : '1'} · MaxTex{' '}
            {hardwareProfile.maxTextureSize}px
          </span>
          <button
            type="button"
            data-testid="close-graphics-settings-btn"
            onClick={onClose}
            className="px-4 py-1.5 rounded-[8px] bg-[#0082fb] hover:bg-[#0073e0] text-white text-xs font-semibold transition-colors"
          >
            {copy.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
