'use client';

import React from 'react';
import {
  Button,
  Card,
  Chip,
  Modal,
  ProgressBar,
  Switch,
} from '@heroui/react';
import {
  Check,
  Cpu,
  Gauge,
  Monitor,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import SunsetStripeBand from '@/components/SunsetStripeBand';
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
import { OBSERVATORY_EXTRA_COPY } from '@/lib/localized-telemetry';

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
      rtx: 'RTX 3050–4050',
      ultra: 'Cực đại 4K',
    },
    tierDescs: {
      potato: '0.5x · 6k sao · 24 bước',
      low: '0.75x · 16k sao · 36 bước',
      medium: '1.0x · 40k sao · 52 bước',
      high: '1.25x · 80k sao · 72 bước',
      rtx: '4–8GB · 1.5x · 120k sao · 96 seg · 96 bước',
      ultra: '2.0x · 140k sao · 112 seg · 96 bước',
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
      rtx: 'RTX 3050–4050',
      ultra: 'Ultra 4K',
    },
    tierDescs: {
      potato: '0.5x · 6k stars · 24 steps',
      low: '0.75x · 16k stars · 36 steps',
      medium: '1.0x · 40k stars · 52 steps',
      high: '1.25x · 80k stars · 72 steps',
      rtx: '4–8GB · 1.5x · 120k stars · 96 seg · 96 steps',
      ultra: '2.0x · 140k stars · 112 seg · 96 steps',
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
      rtx: 'RTX 3050–4050',
      ultra: '最高 4K',
    },
    tierDescs: {
      potato: '0.5x・6千星・24ステップ',
      low: '0.75x・1.6万星・36ステップ',
      medium: '1.0x・4万星・52ステップ',
      high: '1.25x・8万星・72ステップ',
      rtx: '4–8GB・1.5x・12万星・96分割・96歩',
      ultra: '2.0x・14万星・112分割・96歩',
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
      rtx: 'RTX 3050–4050',
      ultra: '极致 4K',
    },
    tierDescs: {
      potato: '0.5x · 6千星 · 24步',
      low: '0.75x · 1.6万星 · 36步',
      medium: '1.0x · 4万星 · 52步',
      high: '1.25x · 8万星 · 72步',
      rtx: '4–8GB · 1.5x · 12万星 · 96细分 · 96步',
      ultra: '2.0x · 14万星 · 112细分 · 96步',
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
      rtx: 'RTX 3050–4050',
      ultra: '울트라 4K',
    },
    tierDescs: {
      potato: '0.5x · 별 6천 · 24스텝',
      low: '0.75x · 별 1.6만 · 36스텝',
      medium: '1.0x · 별 4만 · 52스텝',
      high: '1.25x · 별 8만 · 72스텝',
      rtx: '4–8GB · 1.5x · 별 12만 · 96세그 · 96스텝',
      ultra: '2.0x · 별 14만 · 112세그 · 96스텝',
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
  'rtx',
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
  const copy = LABELS[lang];
  const extra = OBSERVATORY_EXTRA_COPY[lang];
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
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      isDismissable
      className="bg-black/75 z-50"
    >
      <Modal.Container placement="center" size="lg" scroll="inside" className="px-3">
        <Modal.Dialog
          aria-label={copy.title}
          data-testid="graphics-settings-modal"
          data-theme="dark"
          data-mw-observatory="true"
          className="dark bg-[#141416] border border-[#FFF8E7]/14 rounded-[12px] shadow-[0_16px_48px_-8px_rgba(0,0,0,0.55)] max-w-[780px] w-full p-0 overflow-hidden"
        >
          <SunsetStripeBand variant="hairline" />
          <Modal.CloseTrigger className="top-4 right-4 text-[#A19F99] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.08] rounded-[8px]" />
          <Modal.Header className="px-6 py-4 border-b border-[#FFF8E7]/10 bg-[#101012] flex flex-row items-start gap-3">
            <span className="w-9 h-9 rounded-[8px] bg-[#FA500F]/15 border border-[#FA500F]/40 text-[#FA500F] inline-flex items-center justify-center shrink-0 mt-0.5">
              <SlidersHorizontal className="w-4 h-4" />
            </span>
            <div>
              <Modal.Heading className="font-display text-[22px] font-normal leading-[1.2] tracking-[-0.015em] text-[#FFF8E7]">
                {copy.title}
              </Modal.Heading>
              <p className="text-[12px] font-normal text-[#A19F99] mt-0.5">{copy.subtitle}</p>
            </div>
          </Modal.Header>

          <Modal.Body className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* 1. Hardware Auto-Detection & Recommendation Banner */}
            <Card
              data-testid="hardware-recommendation-card"
              className="rounded-[12px] bg-[#1B1B1F] border border-[#FFF8E7]/10 shadow-none p-0"
            >
              <Card.Content className="p-4 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#FA500F] shrink-0" />
                    <h3 className="text-[13px] font-semibold text-[#FFF8E7]">
                      {copy.hardwareHeading}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <Chip
                      size="sm"
                      variant="soft"
                      color="accent"
                      className="h-7 rounded-full bg-[#FA500F]/15 border border-[#FA500F]/40 px-2.5 text-[11px] font-mono font-semibold text-[#FFD800] gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-[#FFAF00] shrink-0" />
                      <span>
                        {copy.recommendedBadge}: {copy.tierNames[recommendation.recommendedTier]}
                      </span>
                    </Chip>
                    <Button
                      size="sm"
                      variant="primary"
                      data-testid="apply-recommended-graphics-btn"
                      onPress={applyRecommended}
                      className="h-8 rounded-[8px] px-3.5 bg-[#FA500F] hover:bg-[#D93D04] text-white text-[12px] font-medium"
                    >
                      {copy.applyRecommended}
                    </Button>
                  </div>
                </div>

                {/* Hardware Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
                  <div className="col-span-2 sm:col-span-3 lg:col-span-2 rounded-[8px] bg-[#141416] border border-[#FFF8E7]/08 px-3 py-2">
                    <span className="text-[11px] text-[#8F8D87] block">{copy.gpuLabel}</span>
                    <span
                      data-testid="detected-gpu-name"
                      className="font-mono text-[11px] text-[#FFF8E7] break-words line-clamp-2"
                    >
                      {hardwareProfile.gpuRenderer}
                    </span>
                  </div>

                  <div className="rounded-[8px] bg-[#141416] border border-[#FFF8E7]/08 px-3 py-2">
                    <span className="text-[11px] text-[#8F8D87] block">{copy.cpuLabel}</span>
                    <span className="font-mono tabular-nums text-[#FFF8E7] font-semibold">
                      {hardwareProfile.cpuCores} {extra.threadsUnit}
                    </span>
                  </div>

                  <div className="rounded-[8px] bg-[#141416] border border-[#FFF8E7]/08 px-3 py-2">
                    <span className="text-[11px] text-[#8F8D87] block">{copy.ramLabel}</span>
                    <span className="font-mono tabular-nums text-[#FFF8E7] font-semibold">
                      {hardwareProfile.deviceMemoryGb
                        ? `${hardwareProfile.deviceMemoryGb} GB`
                        : extra.autoLabel}
                    </span>
                  </div>

                  <div className="rounded-[8px] bg-[#141416] border border-[#FFF8E7]/08 px-3 py-2">
                    <span className="text-[11px] text-[#8F8D87] block">{copy.displayLabel}</span>
                    <span className="font-mono tabular-nums text-[#D6D3CB]">
                      {hardwareProfile.screenWidth}×{hardwareProfile.screenHeight} ·{' '}
                      {hardwareProfile.devicePixelRatio.toFixed(1)}x
                    </span>
                  </div>
                </div>

                {/* Score Bar + Localized Explanation */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#A19F99] inline-flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-[#FA500F]" />
                      <span>{copy.scoreLabel}</span>
                    </span>
                    <span
                      data-testid="hardware-score-value"
                      className="font-mono tabular-nums font-semibold text-[#FFF8E7]"
                    >
                      {recommendation.score} / 100
                    </span>
                  </div>
                  <ProgressBar
                    aria-label={copy.scoreLabel}
                    value={recommendation.score}
                    minValue={0}
                    maxValue={100}
                    className="w-full"
                  >
                    <ProgressBar.Track className="h-1.5 rounded-[4px] bg-[#101012] border border-[#FFF8E7]/08 overflow-hidden">
                      <ProgressBar.Fill
                        className="rounded-[4px]"
                        style={{
                          background:
                            'linear-gradient(90deg, #E10500 0%, #FA500F 45%, #FFAF00 80%, #FFD800 100%)',
                        }}
                      />
                    </ProgressBar.Track>
                  </ProgressBar>
                  <p className="text-xs text-[#A19F99] leading-relaxed">
                    {recommendation.summaryByLang[lang]}
                  </p>
                </div>
              </Card.Content>
            </Card>

            {/* 2. Quick Quality Tier Selector */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-semibold text-[#D6D3CB]">
                  {copy.presetsHeading}
                </h3>
                {settings.tier === 'custom' && (
                  <span className="text-[11px] font-mono text-[#FFAF00]">
                    {copy.customActive}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {TIER_ORDER.map((tierId) => {
                  const isSelected = settings.tier === tierId;
                  const isRecommended = recommendation.recommendedTier === tierId;
                  const isRtxTier = tierId === 'rtx';
                  return (
                    <button
                      key={tierId}
                      type="button"
                      data-testid={`preset-tier-${tierId}`}
                      onClick={() => applyPreset(tierId)}
                      className={`text-left rounded-[12px] border p-3 transition-colors ${
                        isSelected
                          ? 'bg-[#FA500F]/15 border-[#FA500F] text-[#FFF8E7]'
                          : isRtxTier
                            ? 'bg-[#1B1B1F] hover:bg-[#232328] border-[#FFAF00]/35 text-[#FFF8E7]'
                            : 'bg-[#1B1B1F] hover:bg-[#232328] border-[#FFF8E7]/10 text-[#D6D3CB]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[13px] font-semibold flex items-center gap-1.5">
                          <span>{copy.tierNames[tierId]}</span>
                          {isRtxTier && (
                            <span className="px-1.5 py-0.5 rounded-[4px] bg-[#FA500F]/20 text-[#FFD800] font-mono text-[9px] font-semibold">
                              4–8GB
                            </span>
                          )}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 shrink-0 text-[#FA500F]" />
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-[#A19F99] mt-1 leading-snug">
                        {copy.tierDescs[tierId]}
                      </p>
                      {isRecommended && (
                        <span className="inline-block mt-1.5 text-[10px] font-mono font-medium text-[#FFAF00]">
                          {extra.autoBadge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 3. Render Resolution Scale */}
            <Card className="rounded-[12px] bg-[#1B1B1F] border border-[#FFF8E7]/10 shadow-none p-0">
              <Card.Content className="p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-[#FFF8E7]">
                    <Monitor className="w-4 h-4 text-[#FA500F]" />
                    <span>{copy.resolutionLabel}</span>
                  </div>
                  <span
                    data-testid="live-render-resolution"
                    className="font-mono tabular-nums text-xs text-[#FFAF00] font-semibold"
                  >
                    {copy.liveRenderSize}: {renderPxW} × {renderPxH} px ({settings.resolutionScale}x)
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {RESOLUTION_OPTIONS.map((opt) => {
                    const active = settings.resolutionScale === opt.scale;
                    return (
                      <Button
                        key={opt.scale}
                        size="sm"
                        variant={active ? 'primary' : 'outline'}
                        data-testid={`res-scale-${opt.scale}`}
                        onPress={() =>
                          updateField('resolutionScale', opt.scale as ResolutionScaleOption)
                        }
                        className={`h-8 min-w-0 rounded-[8px] font-mono text-[11px] ${
                          active
                            ? 'bg-[#FA500F] text-white font-semibold'
                            : 'bg-[#141416] hover:bg-[#FFF8E7]/[0.07] border-[#FFF8E7]/10 text-[#D6D3CB]'
                        }`}
                      >
                        {opt.badge}
                      </Button>
                    );
                  })}
                </div>
              </Card.Content>
            </Card>

            {/* 4. Granular GPU & Scene Complexity Controls */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Milky Way Star Count */}
              <Card className="rounded-[12px] bg-[#1B1B1F] border border-[#FFF8E7]/10 shadow-none p-0">
                <Card.Content className="p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#FFF8E7]">{copy.starCountLabel}</span>
                    <span className="font-mono tabular-nums text-[#FFAF00]">
                      {(settings.starfieldCount / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                    {STAR_COUNT_OPTIONS.map((cnt) => {
                      const active = settings.starfieldCount === cnt;
                      return (
                        <Button
                          key={cnt}
                          size="sm"
                          variant={active ? 'primary' : 'outline'}
                          onPress={() => updateField('starfieldCount', cnt)}
                          className={`h-7 min-w-0 rounded-[8px] px-1 font-mono text-[11px] ${
                            active
                              ? 'bg-[#FA500F] text-white font-semibold'
                              : 'bg-[#141416] hover:bg-[#FFF8E7]/[0.07] border-[#FFF8E7]/10 text-[#A19F99]'
                          }`}
                        >
                          {cnt / 1000}k
                        </Button>
                      );
                    })}
                  </div>
                </Card.Content>
              </Card>

              {/* Asteroid & Kuiper Belt Particle Count */}
              <Card className="rounded-[12px] bg-[#1B1B1F] border border-[#FFF8E7]/10 shadow-none p-0">
                <Card.Content className="p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#FFF8E7]">{copy.asteroidCountLabel}</span>
                    <span className="font-mono tabular-nums text-[#FFAF00]">
                      {settings.asteroidBeltCount === 0
                        ? copy.disabled
                        : `${(settings.asteroidBeltCount / 1000).toFixed(1)}k`}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                    {ASTEROID_COUNT_OPTIONS.map((cnt) => {
                      const active = settings.asteroidBeltCount === cnt;
                      return (
                        <Button
                          key={cnt}
                          size="sm"
                          variant={active ? 'primary' : 'outline'}
                          onPress={() => updateField('asteroidBeltCount', cnt)}
                          className={`h-7 min-w-0 rounded-[8px] px-1 font-mono text-[11px] ${
                            active
                              ? 'bg-[#FA500F] text-white font-semibold'
                              : 'bg-[#141416] hover:bg-[#FFF8E7]/[0.07] border-[#FFF8E7]/10 text-[#A19F99]'
                          }`}
                        >
                          {cnt === 0 ? '0' : `${cnt / 1000}k`}
                        </Button>
                      );
                    })}
                  </div>
                </Card.Content>
              </Card>

              {/* Planet Tessellation */}
              <Card className="rounded-[12px] bg-[#1B1B1F] border border-[#FFF8E7]/10 shadow-none p-0">
                <Card.Content className="p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#FFF8E7]">{copy.tessellationLabel}</span>
                    <span className="font-mono tabular-nums text-[#FFAF00]">
                      {settings.planetSegments} {extra.segUnit}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                    {TESSELLATION_OPTIONS.map((seg) => {
                      const active = settings.planetSegments === seg;
                      return (
                        <Button
                          key={seg}
                          size="sm"
                          variant={active ? 'primary' : 'outline'}
                          onPress={() => updateField('planetSegments', seg)}
                          className={`h-7 min-w-0 rounded-[8px] px-1 font-mono text-[11px] ${
                            active
                              ? 'bg-[#FA500F] text-white font-semibold'
                              : 'bg-[#141416] hover:bg-[#FFF8E7]/[0.07] border-[#FFF8E7]/10 text-[#A19F99]'
                          }`}
                        >
                          {seg}
                        </Button>
                      );
                    })}
                  </div>
                </Card.Content>
              </Card>

              {/* Black Hole Raymarch Steps */}
              <Card className="rounded-[12px] bg-[#1B1B1F] border border-[#FFF8E7]/10 shadow-none p-0">
                <Card.Content className="p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#FFF8E7]">{copy.rayStepsLabel}</span>
                    <span className="font-mono tabular-nums text-[#FFAF00]">
                      {settings.blackHoleRaySteps} {extra.stepsUnit}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {RAYMARCH_STEP_OPTIONS.map((steps) => {
                      const active = settings.blackHoleRaySteps === steps;
                      return (
                        <Button
                          key={steps}
                          size="sm"
                          variant={active ? 'primary' : 'outline'}
                          onPress={() => updateField('blackHoleRaySteps', steps)}
                          className={`h-7 min-w-0 rounded-[8px] px-1 font-mono text-[11px] ${
                            active
                              ? 'bg-[#FA500F] text-white font-semibold'
                              : 'bg-[#141416] hover:bg-[#FFF8E7]/[0.07] border-[#FFF8E7]/10 text-[#A19F99]'
                          }`}
                        >
                          {steps}
                        </Button>
                      );
                    })}
                  </div>
                </Card.Content>
              </Card>
            </section>

            {/* 5. Toggles & FPS Cap */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* FPS Cap */}
              <Card className="rounded-[12px] bg-[#1B1B1F] border border-[#FFF8E7]/10 shadow-none p-0">
                <Card.Content className="p-3.5 space-y-2.5">
                  <span className="text-xs font-medium text-[#FFF8E7] block">
                    {copy.fpsCapLabel}
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {FPS_CAP_OPTIONS.map((fps) => {
                      const active = settings.fpsCap === fps;
                      return (
                        <Button
                          key={fps}
                          size="sm"
                          variant={active ? 'primary' : 'outline'}
                          onPress={() => updateField('fpsCap', fps)}
                          className={`h-7 min-w-0 rounded-[8px] px-1 font-mono text-[11px] ${
                            active
                              ? 'bg-[#FA500F] text-white font-semibold'
                              : 'bg-[#141416] hover:bg-[#FFF8E7]/[0.07] border-[#FFF8E7]/10 text-[#A19F99]'
                          }`}
                        >
                          {fps === 0 ? copy.fpsUncapped : `${fps}`}
                        </Button>
                      );
                    })}
                  </div>
                </Card.Content>
              </Card>

              {/* Antialiasing Switch */}
              <Card className="rounded-[12px] bg-[#1B1B1F] border border-[#FFF8E7]/10 shadow-none p-0">
                <Card.Content className="p-3.5 flex flex-row items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#FFF8E7]">{copy.antialiasLabel}</p>
                    <p className="text-[11px] text-[#8F8D87] leading-snug mt-0.5">
                      {copy.antialiasHint}
                    </p>
                  </div>
                  <Switch
                    aria-label={copy.antialiasLabel}
                    isSelected={settings.antialias}
                    onChange={(v) => updateField('antialias', v)}
                  >
                    <Switch.Control className="bg-[#141416] border border-[#FFF8E7]/16 data-[selected=true]:bg-[#FA500F]">
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch>
                </Card.Content>
              </Card>

              {/* Atmosphere & Nebulae Switch */}
              <Card className="rounded-[12px] bg-[#1B1B1F] border border-[#FFF8E7]/10 shadow-none p-0">
                <Card.Content className="p-3.5 flex flex-row items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#FFF8E7]">{copy.atmosphereLabel}</p>
                    <p className="text-[11px] text-[#8F8D87] leading-snug mt-0.5">
                      {copy.atmosphereHint}
                    </p>
                  </div>
                  <Switch
                    aria-label={copy.atmosphereLabel}
                    isSelected={settings.showAtmosphereAndNebulae}
                    onChange={(v) => updateField('showAtmosphereAndNebulae', v)}
                  >
                    <Switch.Control className="bg-[#141416] border border-[#FFF8E7]/16 data-[selected=true]:bg-[#FA500F]">
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch>
                </Card.Content>
              </Card>
            </section>
          </Modal.Body>

          <Modal.Footer className="px-6 py-4 border-t border-[#FFF8E7]/10 bg-[#101012] flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#8F8D87]">
              WebGL{hardwareProfile.webgl2Supported ? '2' : '1'} · MaxTex{' '}
              {hardwareProfile.maxTextureSize}px
            </span>
            <Button
              size="sm"
              variant="primary"
              data-testid="close-graphics-settings-btn"
              onPress={onClose}
              className="h-9 rounded-[8px] px-5 bg-[#FA500F] hover:bg-[#D93D04] text-white text-[13px] font-medium"
            >
              {copy.closeBtn}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
