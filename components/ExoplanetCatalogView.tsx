'use client';

import React from 'react';
import { Button, Card, Input, Separator } from '@heroui/react';
import {
  ArrowRight,
  CircleDot,
  Compass,
  Plus,
  Search,
  X,
} from 'lucide-react';
import ObservatoryLogo from '@/components/ObservatoryLogo';
import SunsetStripeBand from '@/components/SunsetStripeBand';
import {
  ALL_CATEGORIES,
  CATEGORY_CONFIG,
  MemoryCategory,
  MemoryNode,
} from '@/lib/memory-types';
import { LanguageCode, UI_STRINGS } from '@/lib/i18n';
import { getLocalizedNode } from '@/lib/celestial-translations';
import {
  getLocalizedPlanetSpec,
  OBSERVATORY_EXTRA_COPY,
} from '@/lib/localized-telemetry';

interface ExoplanetCatalogViewProps {
  memories: MemoryNode[];
  matchedIds: Set<string>;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: MemoryCategory | 'ALL';
  onCategoryChange: (cat: MemoryCategory | 'ALL') => void;
  onInspectIn3D: (id: string) => void;
  onOpenBlackHoleLab: () => void;
  onOpenSimulator: () => void;
  lang: LanguageCode;
  assetBasePath?: string;
}

interface CatalogEditorialCopy {
  diameterShort: string;
  statCatalogLabel: string;
  statScaleLabel: string;
  statBandsLabel: string;
  ctaHeading: string;
  ctaSubtitle: string;
  ctaLaunch3D: string;
  footerExplore: string;
  footerProvenance: string;
  footerNote: string;
  heroPhotoAlt: string;
}

const CATALOG_EDITORIAL_COPY: Record<LanguageCode, CatalogEditorialCopy> = {
  en: {
    diameterShort: 'Diameter',
    statCatalogLabel: 'Curated NASA, JPL & Gaia DR3 celestial worlds',
    statScaleLabel: 'Orders of magnitude from Earth surface to Coma Cluster',
    statBandsLabel: 'Multi-wavelength Galactic bands (Optical, IR, HI, X/γ)',
    ctaHeading: 'Explore the Milky Way in real 1:1 scale.',
    ctaSubtitle:
      'Launch the live WebGL2 observatory to inspect lunar eclipse umbra, speed-of-light photon pulses, and Schwarzschild lensing around Sagittarius A*.',
    ctaLaunch3D: 'Open 3D Observatory',
    footerExplore: 'Observatory',
    footerProvenance: 'Scientific Sources',
    footerNote: 'Peer-reviewed astronomical ephemeris & Gaia DR3 galactic atlas.',
    heroPhotoAlt: 'Mountain observatory under golden-orange twilight and Milky Way',
  },
  vi: {
    diameterShort: 'Đường kính',
    statCatalogLabel: 'Thiên thể thực tế tuyển chọn từ NASA, JPL & Gaia DR3',
    statScaleLabel: 'Bậc độ lớn liên tục từ mặt đất tới Cụm Thiên hà Coma',
    statBandsLabel: 'Dải quang phổ Ngân Hà (Khả kiến, Hồng ngoại, HI, X/γ)',
    ctaHeading: 'Khám phá Dải Ngân Hà ở tỷ lệ 1:1 thực tế.',
    ctaSubtitle:
      'Mở đài quan sát WebGL2 trực tiếp để theo dõi vùng tối nhật thực, xung ánh sáng tốc độ c và thấu kính hấp dẫn quanh Sagittarius A*.',
    ctaLaunch3D: 'Mở Đài quan sát 3D',
    footerExplore: 'Đài quan sát',
    footerProvenance: 'Nguồn dữ liệu khoa học',
    footerNote: 'Lịch thiên văn thực tế & bản đồ Ngân Hà chuẩn Gaia DR3.',
    heroPhotoAlt: 'Đài thiên văn đỉnh núi dưới ánh hoàng hôn cam vàng và Dải Ngân Hà',
  },
  ja: {
    diameterShort: '直径',
    statCatalogLabel: 'NASA・JPL・Gaia DR3 による厳選天体カタログ',
    statScaleLabel: '地表からかみのけ座銀河団まで 23 桁以上の連続スケール',
    statBandsLabel: '多波長銀河観測（可視光・赤外線・HI・X/γ線）',
    ctaHeading: '天の川銀河を 1:1 実寸スケールで探検する。',
    ctaSubtitle:
      'リアルタイム WebGL2 天文台を起動し、皆既日食本影、光速パルス、いて座 A* 重力レンズを直接観測できます。',
    ctaLaunch3D: '3D 天文台を開く',
    footerExplore: '天文台',
    footerProvenance: '科学的データ出典',
    footerNote: '査読済み天体暦および Gaia DR3 銀河アトラス。',
    heroPhotoAlt: '夕焼けの山頂天文台と天の川銀河',
  },
  zh: {
    diameterShort: '直径',
    statCatalogLabel: '精选自 NASA、JPL 与 Gaia DR3 的真实天体档案',
    statScaleLabel: '从地球地表到后发座星系团的 23+ 个数量级连续尺度',
    statBandsLabel: '多波段银河观测（可见光、红外、HI 射电、X/γ 射线）',
    ctaHeading: '以 1:1 真实尺度探索银河系。',
    ctaSubtitle:
      '进入实时 WebGL2 天文台，亲身观测日全食本影、真实光速脉冲以及人马座 A* 的史瓦西引力透镜。',
    ctaLaunch3D: '进入 3D 天文台',
    footerExplore: '天文台导航',
    footerProvenance: '科学数据来源',
    footerNote: '基于同行评审天体星历与 Gaia DR3 银河图谱。',
    heroPhotoAlt: '金色黄昏山峰天文台与银河系',
  },
  ko: {
    diameterShort: '지름',
    statCatalogLabel: 'NASA, JPL 및 Gaia DR3 기반 엄선 천체 아카이브',
    statScaleLabel: '지구 표면에서 머리털자리 은하단까지 23자리 이상 연속 스케일',
    statBandsLabel: '다파장 우리은하 관측 (가시광, 적외선, HI 전파, X/γ선)',
    ctaHeading: '우리은하를 1:1 실제 스케일로 탐험하세요.',
    ctaSubtitle:
      '실시간 WebGL2 천문대를 실행해 개기일식 본영, 광속 펄스, 궁수자리 A* 슈바르츠실트 중력 렌즈를 관측하세요.',
    ctaLaunch3D: '3D 천문대 열기',
    footerExplore: '천문대',
    footerProvenance: '과학 데이터 출처',
    footerNote: 'NASA JPL 천체력 및 ESA Gaia DR3 은하 아틀라스 기반.',
    heroPhotoAlt: '노을빛 고산 천문대와 은하수',
  },
};

export default function ExoplanetCatalogView({
  memories,
  matchedIds,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onInspectIn3D,
  onOpenBlackHoleLab,
  onOpenSimulator,
  lang,
  assetBasePath = '',
}: ExoplanetCatalogViewProps) {
  const t = UI_STRINGS[lang];
  const extra = OBSERVATORY_EXTRA_COPY[lang];
  const copy = CATALOG_EDITORIAL_COPY[lang];
  const visibleNodes = memories.filter((m) => matchedIds.has(m.id));
  const normalizedBase = assetBasePath ? assetBasePath.replace(/\/$/, '') : '';
  const heroPhotoSrc = `${normalizedBase}/sunset-hero.jpg`;

  return (
    <div
      data-testid="exoplanet-catalog-view"
      className="mistral-editorial-light flex-1 overflow-y-auto bg-[#FFFFFF] text-[#111111]"
    >
      {/* 1. Mistral Atmospheric Mountain-Sunset Editorial Hero Band */}
      <section
        className="w-full border-b border-[#E9DFC6]"
        style={{
          background:
            'linear-gradient(135deg, #FFF8E7 0%, #FFE84D26 48%, #FFAF0028 78%, #FA500F18 100%)',
        }}
      >
        <div className="max-w-[1280px] mx-auto px-4 @[640px]/root:px-6 @[1024px]/root:px-8 py-8 @[640px]/root:py-12 @[1024px]/root:py-16">
          <div className="grid grid-cols-1 @[960px]/root:grid-cols-12 gap-6 @[960px]/root:gap-10 items-stretch">
            {/* Hero Left: Editorial Near-Serif Display + Subtitle + Primary/Dark CTA Row */}
            <div className="@[960px]/root:col-span-6 flex flex-col justify-center space-y-4 @[640px]/root:space-y-5">
              <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#FA500F]">
                {t.catalogHeroKicker}
              </p>
              <h1 className="font-display text-[32px] @[640px]/root:text-[48px] @[1024px]/root:text-[60px] font-normal leading-[1.06] tracking-[-0.025em] text-[#111111] text-balance">
                {t.catalogHeroTitle}
              </h1>
              <p className="text-[15px] @[640px]/root:text-[17px] leading-[1.55] text-[#262626] max-w-xl">
                {t.catalogHeroSubtitle}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  onPress={onOpenBlackHoleLab}
                  className="h-11 rounded-[8px] px-5 bg-[#FA500F] hover:bg-[#D93D04] text-white font-medium text-[14px] whitespace-nowrap gap-2"
                >
                  <CircleDot className="w-4 h-4 shrink-0" />
                  <span>{t.catalogOpenBhLab}</span>
                </Button>
                <Button
                  variant="outline"
                  onPress={onOpenSimulator}
                  className="h-11 rounded-[8px] px-5 bg-[#111111] hover:bg-[#262626] border-[#111111] text-white font-medium text-[14px] whitespace-nowrap gap-2"
                >
                  <Plus className="w-4 h-4 text-[#FFD800] shrink-0" />
                  <span>{t.catalogAddAiBtn}</span>
                </Button>
              </div>
            </div>

            {/* Hero Right: Atmospheric Mountain-Sunset Observatory Photography */}
            <div className="@[960px]/root:col-span-6 flex">
              <div className="relative w-full min-h-[200px] @[640px]/root:min-h-[260px] @[960px]/root:min-h-[320px] rounded-[12px] overflow-hidden border border-[#E9DFC6] bg-[#141416] shadow-[0_12px_24px_-4px_rgba(0,0,0,0.08)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroPhotoSrc}
                  alt={copy.heroPhotoAlt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Editorial Stat Row (stat-display 56px Editorial Serif) */}
      <section className="max-w-[1280px] mx-auto px-4 @[640px]/root:px-6 @[1024px]/root:px-8 py-8 @[640px]/root:py-10 border-b border-[#EFECE4]">
        <div className="grid grid-cols-1 @[768px]/root:grid-cols-3 divide-y @[768px]/root:divide-y-0 @[768px]/root:divide-x divide-[#EFECE4]">
          <div className="py-4 @[768px]/root:py-0 @[768px]/root:pr-8 space-y-1.5">
            <p className="font-display text-[40px] @[640px]/root:text-[52px] font-normal leading-[1.08] tracking-[-1px] text-[#111111] tabular-nums">
              {memories.length}+
            </p>
            <p className="text-[14px] leading-[1.5] text-[#525252]">
              {copy.statCatalogLabel}
            </p>
          </div>
          <div className="py-4 @[768px]/root:py-0 @[768px]/root:px-8 space-y-1.5">
            <p className="font-display text-[40px] @[640px]/root:text-[52px] font-normal leading-[1.08] tracking-[-1px] text-[#111111] tabular-nums">
              23+
            </p>
            <p className="text-[14px] leading-[1.5] text-[#525252]">
              {copy.statScaleLabel}
            </p>
          </div>
          <div className="py-4 @[768px]/root:py-0 @[768px]/root:pl-8 space-y-1.5">
            <p className="font-display text-[40px] @[640px]/root:text-[52px] font-normal leading-[1.08] tracking-[-1px] text-[#111111] tabular-nums">
              4
            </p>
            <p className="text-[14px] leading-[1.5] text-[#525252]">
              {copy.statBandsLabel}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Main Catalog Workspace */}
      <div className="max-w-[1280px] mx-auto px-4 @[640px]/root:px-6 @[1024px]/root:px-8 py-8 @[640px]/root:py-10 space-y-8">
        {/* Warm Cream Filter Panel (card-cream) */}
        <Card className="rounded-[12px] bg-[#FFF8E7] border border-[#E9DFC6] shadow-none p-0 overflow-hidden">
          <Card.Content className="p-4 @[640px]/root:p-6 space-y-4">
            <div className="flex flex-col @[768px]/root:flex-row @[768px]/root:items-center justify-between gap-4">
              <div className="relative w-full @[768px]/root:w-[400px] flex items-center">
                <Search className="w-4 h-4 text-[#737373] absolute left-3.5 pointer-events-none z-10" />
                <Input
                  aria-label={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  autoComplete="off"
                  fullWidth
                  className="h-11 rounded-[8px] bg-[#FFFFFF] border border-[#D4CFC3] hover:border-[#A19F99] focus:border-[#FA500F] pl-10 pr-9 text-[14px] text-[#111111] placeholder:text-[#737373]"
                />
                {searchQuery && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    aria-label={extra.clearSearch}
                    onPress={() => onSearchChange('')}
                    className="absolute right-2 w-7 h-7 min-w-7 rounded-[6px] p-0 text-[#525252] hover:text-[#111111]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>

              <p className="text-[13px] font-mono tabular-nums text-[#525252]">
                {t.catalogShowingText} {visibleNodes.length} / {memories.length}{' '}
                {t.objectsCountUnit}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={selectedCategory === 'ALL' ? 'primary' : 'outline'}
                onPress={() => onCategoryChange('ALL')}
                className={`h-9 rounded-[8px] px-3.5 text-[13px] font-medium whitespace-nowrap ${
                  selectedCategory === 'ALL'
                    ? 'bg-[#FA500F] text-white font-medium border-[#FA500F]'
                    : 'bg-[#FFFFFF] border-[#E9DFC6] text-[#262626] hover:bg-[#FAF7F0]'
                }`}
              >
                {t.allCategories} ({memories.length})
              </Button>
              {ALL_CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                const count = memories.filter((m) => m.category === cat).length;
                const catLabel = t.categories[cat]?.shortLabel || cat;
                return (
                  <Button
                    key={cat}
                    size="sm"
                    variant={active ? 'primary' : 'outline'}
                    onPress={() => onCategoryChange(active ? 'ALL' : cat)}
                    className={`h-9 rounded-[8px] px-3.5 text-[13px] font-medium whitespace-nowrap ${
                      active
                        ? 'bg-[#FA500F] text-white font-medium border-[#FA500F]'
                        : 'bg-[#FFFFFF] border-[#E9DFC6] text-[#262626] hover:bg-[#FAF7F0]'
                    }`}
                  >
                    {catLabel} ({count})
                  </Button>
                );
              })}
            </div>
          </Card.Content>
        </Card>

        {/* 3-Column Editorial Catalog Grid (card-base: 12px radius, hairline-soft border) */}
        {visibleNodes.length === 0 ? (
          <Card className="rounded-[12px] bg-[#FFFDF5] border border-[#E9DFC6] shadow-none p-0">
            <Card.Content className="p-14 text-center flex flex-col items-center space-y-4">
              <p className="text-[15px] text-[#525252]">{t.noSearchResults}</p>
              <Button
                size="sm"
                variant="primary"
                onPress={() => {
                  onSearchChange('');
                  onCategoryChange('ALL');
                }}
                className="h-10 rounded-[8px] px-4 bg-[#FA500F] hover:bg-[#D93D04] text-white text-[13px] font-medium"
              >
                {t.resetFilters}
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <div className="grid grid-cols-1 @[680px]/root:grid-cols-2 @[1024px]/root:grid-cols-3 gap-5 @[680px]/root:gap-6">
            {visibleNodes.map((rawNode) => {
              const node = getLocalizedNode(rawNode, lang);
              const meta =
                CATEGORY_CONFIG[rawNode.category] ||
                CATEGORY_CONFIG['Hố đen & Hiện tượng Thiên hà'];
              const catLabel =
                t.categories[rawNode.category]?.shortLabel || meta.shortLabel;
              const locSpec = getLocalizedPlanetSpec(rawNode, lang);

              return (
                <article key={rawNode.id} className="h-full min-w-0">
                  <Card className="h-full rounded-[12px] bg-[#FFFFFF] border border-[#EFECE4] hover:border-[#FA500F]/50 shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-colors p-0 overflow-hidden">
                    <Card.Content className="p-6 h-full flex flex-col justify-between gap-5">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 text-[12px] text-[#737373]">
                          <span className="font-semibold text-[#FA500F]">
                            {catLabel}
                          </span>
                          <span className="font-mono text-[11px] text-[#737373] truncate">
                            {node.createdAt}
                          </span>
                        </div>

                        <h2 className="font-display text-[22px] font-normal leading-[1.25] tracking-[-0.01em] text-[#111111]">
                          {node.title}
                        </h2>

                        <p className="text-[14px] text-[#525252] leading-[1.55] line-clamp-3">
                          {node.summary[0]}
                        </p>

                        <Separator className="bg-[#EFECE4]" />

                        {/* Clean Tabular Telemetry Block */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[13px]">
                          <div className="col-span-2">
                            <span className="text-[#737373] block text-[11px] font-medium">
                              {copy.diameterShort}
                            </span>
                            <span className="font-mono tabular-nums text-[#FA500F] font-semibold">
                              {locSpec.diameterKm}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#737373] block text-[11px] font-medium">
                              {t.planetTempLabel}
                            </span>
                            <span className="font-mono tabular-nums text-[#111111] font-medium">
                              {locSpec.surfaceTemp}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#737373] block text-[11px] font-medium">
                              {t.planetGravityLabel}
                            </span>
                            <span className="font-mono tabular-nums text-[#262626] font-medium">
                              {locSpec.surfaceGravity}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Action (8px editorial dark button) */}
                      <div className="pt-4 border-t border-[#EFECE4] flex items-center justify-between gap-2.5 min-w-0">
                        <span className="text-[11px] font-mono text-[#737373] truncate min-w-0">
                          {locSpec.designation}
                        </span>
                        <Button
                          size="sm"
                          variant="primary"
                          onPress={() => onInspectIn3D(rawNode.id)}
                          className="h-9 rounded-[8px] px-3 gap-1.5 bg-[#111111] hover:bg-[#FA500F] text-white text-[12px] @[640px]/root:text-[13px] font-medium whitespace-nowrap shrink-0 transition-colors"
                        >
                          <Compass className="w-3.5 h-3.5 shrink-0" />
                          <span>{t.viewIn3DBtn}</span>
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        </Button>
                      </div>
                    </Card.Content>
                  </Card>
                </article>
              );
            })}
          </div>
        )}

        {/* 4. Mistral Warm Cream Page-Bottom CTA Banner (cta-banner-cream) */}
        <section className="pt-4">
          <Card className="rounded-[12px] bg-[#FFF8E7] border border-[#E9DFC6] shadow-none p-0">
            <Card.Content className="p-6 @[640px]/root:p-10 flex flex-col @[960px]/root:flex-row @[960px]/root:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <h2 className="font-display text-[28px] @[640px]/root:text-[42px] font-normal leading-[1.12] tracking-[-0.02em] text-[#111111] text-balance">
                  {copy.ctaHeading}
                </h2>
                <p className="text-[15px] leading-[1.55] text-[#525252]">
                  {copy.ctaSubtitle}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Button
                  variant="primary"
                  onPress={() => onInspectIn3D('astro-ocean-01')}
                  className="h-11 rounded-[8px] px-5 bg-[#FA500F] hover:bg-[#D93D04] text-white text-[14px] font-medium whitespace-nowrap gap-2"
                >
                  <Compass className="w-4 h-4 shrink-0" />
                  <span>{copy.ctaLaunch3D}</span>
                </Button>
                <Button
                  variant="outline"
                  onPress={onOpenBlackHoleLab}
                  className="h-11 rounded-[8px] px-5 bg-[#FFFFFF] hover:bg-[#FAF7F0] border-[#E9DFC6] text-[#111111] text-[14px] font-medium whitespace-nowrap"
                >
                  Sgr A*
                </Button>
              </div>
            </Card.Content>
          </Card>
        </section>
      </div>

      {/* 5. Signature Mistral Full-Width Sunset Stripe Closing Band */}
      <SunsetStripeBand variant="band" className="mt-8" />

      {/* 6. Warm Cream Multi-Column Observatory Footer */}
      <footer className="bg-[#FFF8E7] border-t border-[#E9DFC6] text-[#111111]">
        <div className="max-w-[1280px] mx-auto px-4 @[640px]/root:px-6 @[1024px]/root:px-8 py-10 @[640px]/root:py-12 grid grid-cols-1 @[768px]/root:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <ObservatoryLogo size={32} assetBasePath={assetBasePath} />
              <span className="font-display text-[20px] font-medium text-[#111111]">
                {t.brandTitle}
              </span>
            </div>
            <p className="text-[13px] leading-[1.55] text-[#525252] max-w-xs">
              {copy.footerNote}
            </p>
          </div>

          <div className="space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#737373]">
              {copy.footerExplore}
            </p>
            <div className="flex flex-col items-start gap-1.5 text-[14px]">
              <button
                type="button"
                onClick={() => onInspectIn3D('astro-ocean-01')}
                className="text-[#FA500F] hover:underline font-medium"
              >
                {t.navExplorer}
              </button>
              <button
                type="button"
                onClick={onOpenBlackHoleLab}
                className="text-[#FA500F] hover:underline font-medium"
              >
                {t.navBlackHole}
              </button>
              <button
                type="button"
                onClick={onOpenSimulator}
                className="text-[#FA500F] hover:underline font-medium"
              >
                {t.catalogAddAiBtn}
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#737373]">
              {copy.footerProvenance}
            </p>
            <ul className="space-y-1.5 text-[13px] text-[#525252] font-mono">
              <li>NASA JPL Horizons · IAU 2015</li>
              <li>ESA Gaia DR3 · Hipparcos HYG v3.8</li>
              <li>GRAVITY Collaboration (2022) · EHT</li>
              <li>Fermi-LAT / eROSITA · HI4PI</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#E9DFC6] py-4 px-4 @[640px]/root:px-6 @[1024px]/root:px-8">
          <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-2 text-[12px] font-medium text-[#737373]">
            <span>© 2026 Milky Way Observatory</span>
            <span className="font-mono">MIT License · WebGL2 Float64 Multi-Scale Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
