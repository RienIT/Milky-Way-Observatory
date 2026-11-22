'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  CircleDot,
  Compass,
  Globe,
  LayoutGrid,
  Plus,
  Scaling,
  SlidersHorizontal,
  Telescope,
} from 'lucide-react';
import {
  LanguageCode,
  SUPPORTED_LANGUAGES,
  UI_STRINGS,
} from '../lib/i18n';
import { SimulationScaleMode } from '../lib/scientific-catalog';
import { ResolutionScaleOption } from '../lib/graphics-settings';
import { UNIVERSE_HUD_COPY } from '../lib/universe-i18n';

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
}: TopNavBarProps) {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
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
    <header className="relative z-40 h-12 shrink-0 bg-[#0a0c10] border-b border-white/[0.09] px-3 lg:px-4 flex items-center justify-between gap-2.5">
      {/* Zone 1: Clean Brand Wordmark */}
      <button
        type="button"
        onClick={onSelectExplorer}
        className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-[-0.01em] text-[#ECEAE4] hover:text-white transition-colors whitespace-nowrap shrink-0"
      >
        <span className="w-6 h-6 rounded-[2px] bg-[#E88B38] text-[#050608] inline-flex items-center justify-center shrink-0">
          <Telescope className="w-3.5 h-3.5" />
        </span>
        <span>{t.brandTitle}</span>
      </button>

      {/* Zone 2: Navigation Tabs */}
      <nav
        aria-label="Primary navigation"
        className="flex items-center gap-1 overflow-x-auto no-scrollbar"
      >
        <button
          type="button"
          onClick={onSelectExplorer}
          data-testid="nav-explorer-btn"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 ${
            isExplorerActive
              ? 'bg-white/[0.09] text-[#ECEAE4]'
              : 'text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.05]'
          }`}
        >
          <Compass
            className={`w-3.5 h-3.5 shrink-0 ${
              isExplorerActive ? 'text-[#E88B38]' : 'text-[#6B707B]'
            }`}
          />
          <span>{t.navExplorer}</span>
        </button>

        <button
          type="button"
          onClick={onSelectBlackHoleLab}
          data-testid="inspect-blackhole-btn"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 ${
            isBlackHoleActive
              ? 'bg-[#E88B38]/18 text-[#E88B38] border border-[#E88B38]/40'
              : 'text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.05] border border-transparent'
          }`}
        >
          <CircleDot
            className={`w-3.5 h-3.5 shrink-0 ${
              isBlackHoleActive ? 'text-[#E88B38]' : 'text-[#8A8D96]'
            }`}
          />
          <span>{t.navBlackHole}</span>
        </button>

        <button
          type="button"
          onClick={onSelectCatalog}
          data-testid="nav-catalog-btn"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 ${
            isCatalogActive
              ? 'bg-white/[0.09] text-[#ECEAE4]'
              : 'text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.05]'
          }`}
        >
          <LayoutGrid
            className={`w-3.5 h-3.5 shrink-0 ${
              isCatalogActive ? 'text-[#E88B38]' : 'text-[#6B707B]'
            }`}
          />
          <span>{t.navCatalog}</span>
        </button>

        <button
          type="button"
          onClick={onOpenSimulator}
          data-testid="nav-simulator-btn"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-[12px] font-medium text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.05] transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-[#E88B38] shrink-0" />
          <span>{hud.worldLabLabel}</span>
        </button>
      </nav>

      {/* Zone 3: Scale + Graphics + Language */}
      <div className="relative flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          data-testid="scale-mode-toggle"
          aria-pressed={isTrue1To1}
          onClick={onToggleScaleMode}
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-[2px] text-[11px] font-mono border transition-colors whitespace-nowrap shrink-0 ${
            isTrue1To1
              ? 'bg-[#E88B38] border-[#E88B38] text-[#050608] font-semibold'
              : 'bg-white/[0.05] hover:bg-white/[0.09] border-white/[0.09] text-[#ECEAE4]'
          }`}
        >
          <Scaling className="w-3 h-3 shrink-0" />
          <span>{isTrue1To1 ? extraCopy.true1to1 : extraCopy.atlas}</span>
        </button>

        <button
          type="button"
          data-testid="open-graphics-settings-btn"
          onClick={onOpenGraphicsSettings}
          aria-label={extraCopy.graphics}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[2px] bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.09] text-[11px] font-mono text-[#ECEAE4] transition-colors whitespace-nowrap shrink-0"
        >
          <SlidersHorizontal className="w-3 h-3 text-[#E88B38] shrink-0" />
          <span className="hidden md:inline">{extraCopy.graphics}</span>
          <span className="text-[#E88B38]">{resolutionScale}x</span>
        </button>

        <div className="relative">
          <button
            type="button"
            data-testid="lang-dropdown-trigger"
            onClick={() => setLangMenuOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[2px] bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.09] text-[11px] font-mono text-[#ECEAE4] transition-colors whitespace-nowrap shrink-0"
          >
            <Globe className="w-3 h-3 text-[#E88B38]" />
            <span>{activeLangOption.shortCode}</span>
            <ChevronDown className="w-3 h-3 text-[#8A8D96]" />
          </button>

          {langMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 rounded-[4px] bg-[#0a0c10] border border-white/[0.12] shadow-2xl p-1 z-50">
              {SUPPORTED_LANGUAGES.map((opt) => {
                const active = opt.code === lang;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    data-testid={`lang-option-${opt.code}`}
                    onClick={() => {
                      onChangeLang(opt.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-[2px] text-xs font-medium flex items-center justify-between transition-colors ${
                      active
                        ? 'bg-[#E88B38]/15 text-[#E88B38]'
                        : 'text-[#C8C6C0] hover:bg-white/[0.06]'
                    }`}
                  >
                    <span>{opt.nativeLabel}</span>
                    <span className="font-mono text-[10px] text-[#6B707B]">
                      {opt.shortCode}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
