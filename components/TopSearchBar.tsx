'use client';

import React from 'react';
import { Button, Dropdown } from '@heroui/react';
import {
  ChevronDown,
  CircleDot,
  Compass,
  Globe,
  LayoutGrid,
  Plus,
  Scaling,
  SlidersHorizontal,
} from 'lucide-react';
import ObservatoryLogo from '@/components/ObservatoryLogo';
import {
  LanguageCode,
  SUPPORTED_LANGUAGES,
  UI_STRINGS,
} from '@/lib/i18n';
import { SimulationScaleMode } from '@/lib/scientific-catalog';
import { ResolutionScaleOption } from '@/lib/graphics-settings';
import { UNIVERSE_HUD_COPY } from '@/lib/universe-i18n';

export type ActiveWebView = 'explorer' | 'catalog';

interface TopNavBarProps {
  activeView: ActiveWebView;
  isInspectingBlackHole: boolean;
  onSelectExplorer: () => void;
  onSelectBlackHoleLab: () => void;
  onSelectCatalog: () => void;
  onOpenSimulator: () => void;
  scaleMode: SimulationScaleMode;
  onToggleScaleMode: () => void;
  resolutionScale: ResolutionScaleOption;
  onOpenGraphicsSettings: () => void;
  lang: LanguageCode;
  onChangeLang: (lang: LanguageCode) => void;
  assetBasePath?: string;
}

const SCALE_LABELS: Record<
  LanguageCode,
  { atlas: string; true1to1: string; graphics: string }
> = {
  vi: {
    atlas: 'Tỷ lệ Khám phá',
    true1to1: '1:1 Thực tế',
    graphics: 'Đồ họa',
  },
  en: {
    atlas: 'Atlas Scale',
    true1to1: '1:1 True Scale',
    graphics: 'Graphics',
  },
  ja: {
    atlas: '探索スケール',
    true1to1: '1:1 実寸モード',
    graphics: '画質',
  },
  zh: {
    atlas: '星图比例',
    true1to1: '1:1 真实比例',
    graphics: '画质',
  },
  ko: {
    atlas: '탐험 비율',
    true1to1: '1:1 실제 비율',
    graphics: '그래픽',
  },
};

export default function TopSearchBar({
  activeView,
  isInspectingBlackHole,
  onSelectExplorer,
  onSelectBlackHoleLab,
  onSelectCatalog,
  onOpenSimulator,
  scaleMode,
  onToggleScaleMode,
  resolutionScale,
  onOpenGraphicsSettings,
  lang,
  onChangeLang,
  assetBasePath = '',
}: TopNavBarProps) {
  const t = UI_STRINGS[lang];
  const hud = UNIVERSE_HUD_COPY[lang];
  const extraCopy = SCALE_LABELS[lang];
  const activeLangOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  const isExplorerActive = activeView === 'explorer' && !isInspectingBlackHole;
  const isBlackHoleActive = activeView === 'explorer' && isInspectingBlackHole;
  const isCatalogActive = activeView === 'catalog';
  const isTrue1To1 = scaleMode === 'true-1to1';

  return (
    <header className="mistral-editorial-light relative z-40 shrink-0 bg-[#FFFFFF] border-b border-[#EFECE4] text-[#111111]">
      <div className="h-14 @[640px]/root:h-16 px-3 @[640px]/root:px-4 @[1060px]/root:px-8 flex items-center justify-between gap-2 @[640px]/root:gap-4">
        {/* Zone 1: Brand Mark + Editorial Wordmark */}
        <Button
          size="sm"
          variant="ghost"
          onPress={onSelectExplorer}
          className="h-9 @[640px]/root:h-10 min-w-0 rounded-[8px] px-1.5 @[640px]/root:px-2 gap-2 text-[15px] font-semibold tracking-[-0.015em] text-[#111111] hover:bg-[#FAF7F0] whitespace-nowrap shrink-0"
        >
          <ObservatoryLogo size={26} assetBasePath={assetBasePath} />
          <span className="hidden @[440px]/root:inline font-display text-[16px] @[640px]/root:text-[18px] font-medium tracking-[-0.01em] text-[#111111]">
            {t.brandTitle}
          </span>
        </Button>

        {/* Zone 2: Inline Editorial Segmented Navigation Links (Wide Containers >= 900px) */}
        <nav
          aria-label="Primary navigation"
          className="hidden @[900px]/root:flex items-center gap-1 overflow-x-auto no-scrollbar"
        >
          <Button
            size="sm"
            variant="ghost"
            onPress={onSelectExplorer}
            data-testid="nav-explorer-btn"
            className={`h-10 rounded-[8px] px-3.5 gap-1.5 text-[14px] font-medium whitespace-nowrap shrink-0 ${
              isExplorerActive
                ? 'text-[#FA500F] bg-[#FFF8E7]'
                : 'text-[#525252] hover:text-[#111111] hover:bg-[#FAF7F0]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span>{t.navExplorer}</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onPress={onSelectBlackHoleLab}
            data-testid="inspect-blackhole-btn"
            className={`h-10 rounded-[8px] px-3.5 gap-1.5 text-[14px] font-medium whitespace-nowrap shrink-0 ${
              isBlackHoleActive
                ? 'text-[#FA500F] bg-[#FFF8E7]'
                : 'text-[#525252] hover:text-[#111111] hover:bg-[#FAF7F0]'
            }`}
          >
            <CircleDot className="w-3.5 h-3.5 shrink-0" />
            <span>{t.navBlackHole}</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onPress={onSelectCatalog}
            data-testid="nav-catalog-btn"
            className={`h-10 rounded-[8px] px-3.5 gap-1.5 text-[14px] font-medium whitespace-nowrap shrink-0 ${
              isCatalogActive
                ? 'text-[#FA500F] bg-[#FFF8E7] font-semibold'
                : 'text-[#525252] hover:text-[#111111] hover:bg-[#FAF7F0]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
            <span>{t.navCatalog}</span>
          </Button>
        </nav>

        {/* Zone 3: Scale + Graphics + Language + Editorial Dark Primary CTA */}
        <div className="relative flex items-center gap-1.5 @[640px]/root:gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            data-testid="scale-mode-toggle"
            aria-pressed={isTrue1To1}
            aria-label={isTrue1To1 ? extraCopy.true1to1 : extraCopy.atlas}
            onPress={onToggleScaleMode}
            className={`h-8 @[640px]/root:h-9 min-w-0 rounded-[8px] px-2 @[640px]/root:px-3 gap-1.5 text-[11px] @[640px]/root:text-[12px] font-mono whitespace-nowrap shrink-0 ${
              isTrue1To1
                ? 'bg-[#FFF8E7] border-[#E9DFC6] text-[#FA500F] font-semibold'
                : 'bg-[#FFFFFF] border-[#D4CFC3] text-[#262626] hover:bg-[#FAF7F0]'
            }`}
          >
            <Scaling className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden @[720px]/root:inline">
              {isTrue1To1 ? extraCopy.true1to1 : extraCopy.atlas}
            </span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            data-testid="open-graphics-settings-btn"
            onPress={onOpenGraphicsSettings}
            aria-label={extraCopy.graphics}
            className="h-8 @[640px]/root:h-9 min-w-0 rounded-[8px] px-2 @[640px]/root:px-3 bg-[#FFFFFF] hover:bg-[#FAF7F0] border-[#D4CFC3] text-[11px] @[640px]/root:text-[12px] font-mono text-[#262626] whitespace-nowrap shrink-0 gap-1"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#FA500F] shrink-0" />
            <span className="hidden @[1120px]/root:inline">{extraCopy.graphics}</span>
            <span className="text-[#FA500F] font-semibold">{resolutionScale}x</span>
          </Button>

          <Dropdown>
            <Button
              size="sm"
              variant="outline"
              data-testid="lang-dropdown-trigger"
              className="h-8 @[640px]/root:h-9 min-w-0 rounded-[8px] px-2 @[640px]/root:px-3 bg-[#FFFFFF] hover:bg-[#FAF7F0] border-[#D4CFC3] text-[11px] @[640px]/root:text-[12px] font-mono text-[#262626] whitespace-nowrap shrink-0 gap-1"
            >
              <Globe className="w-3.5 h-3.5 text-[#FA500F] shrink-0" />
              <span>{activeLangOption.shortCode}</span>
              <ChevronDown className="w-3 h-3 text-[#737373] shrink-0" />
            </Button>
            <Dropdown.Popover
              placement="bottom end"
              data-theme="light"
              data-mw-observatory="true"
              className="mistral-editorial-light z-[99999] bg-[#FFFFFF] border border-[#E5E0D5] rounded-[12px] p-1.5 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.16)] min-w-[184px]"
            >
              <Dropdown.Menu
                aria-label="Language"
                selectionMode="single"
                selectedKeys={new Set([lang])}
                onAction={(key) => onChangeLang(String(key) as LanguageCode)}
              >
                {SUPPORTED_LANGUAGES.map((opt) => (
                  <Dropdown.Item
                    key={opt.code}
                    id={opt.code}
                    data-testid={`lang-option-${opt.code}`}
                    textValue={opt.nativeLabel}
                    className={`rounded-[8px] px-3 py-2 data-[hovered=true]:bg-[#FAF7F0] ${
                      opt.code === lang
                        ? 'bg-[#FFF8E7] text-[#FA500F] font-semibold'
                        : 'text-[#262626]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="text-[13px]">{opt.nativeLabel}</span>
                      <span className="font-mono text-[11px] text-[#737373]">
                        {opt.shortCode}
                      </span>
                    </div>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>

          <Button
            size="sm"
            variant="primary"
            onPress={onOpenSimulator}
            data-testid="nav-simulator-btn"
            aria-label={hud.worldLabLabel}
            className="h-8 @[640px]/root:h-9 min-w-0 rounded-[8px] px-2.5 @[640px]/root:px-4 gap-1.5 bg-[#111111] hover:bg-[#262626] text-white text-[12px] @[640px]/root:text-[13px] font-medium whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-[#FFD800] shrink-0" />
            <span className="hidden @[520px]/root:inline">{hud.worldLabLabel}</span>
          </Button>
        </div>
      </div>

      {/* Compact Secondary Navigation Bar for Narrow Windows & Embedded Plugin Cards (< 900px) */}
      <nav
        aria-label="Compact navigation"
        data-testid="compact-catalog-nav"
        className="flex @[900px]/root:hidden items-center gap-1 px-3 py-1.5 border-t border-[#EFECE4] bg-[#FAF7F0] overflow-x-auto no-scrollbar"
      >
        <Button
          size="sm"
          variant="ghost"
          onPress={onSelectExplorer}
          data-testid="compact-nav-explorer-btn"
          className={`h-8 rounded-[8px] px-2.5 gap-1.5 text-[12px] font-medium whitespace-nowrap shrink-0 ${
            isExplorerActive
              ? 'text-[#FA500F] bg-[#FFF8E7] border border-[#E9DFC6]'
              : 'text-[#525252] hover:text-[#111111] hover:bg-[#FFFFFF]'
          }`}
        >
          <Compass className="w-3.5 h-3.5 shrink-0" />
          <span>{t.navExplorer}</span>
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onPress={onSelectBlackHoleLab}
          data-testid="compact-inspect-blackhole-btn"
          className={`h-8 rounded-[8px] px-2.5 gap-1.5 text-[12px] font-medium whitespace-nowrap shrink-0 ${
            isBlackHoleActive
              ? 'text-[#FA500F] bg-[#FFF8E7] border border-[#E9DFC6]'
              : 'text-[#525252] hover:text-[#111111] hover:bg-[#FFFFFF]'
          }`}
        >
          <CircleDot className="w-3.5 h-3.5 shrink-0" />
          <span>{t.navBlackHole}</span>
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onPress={onSelectCatalog}
          data-testid="compact-nav-catalog-btn"
          className={`h-8 rounded-[8px] px-2.5 gap-1.5 text-[12px] font-medium whitespace-nowrap shrink-0 ${
            isCatalogActive
              ? 'text-[#FA500F] bg-[#FFF8E7] border border-[#E9DFC6] font-semibold'
              : 'text-[#525252] hover:text-[#111111] hover:bg-[#FFFFFF]'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
          <span>{t.navCatalog}</span>
        </Button>
      </nav>
    </header>
  );
}
