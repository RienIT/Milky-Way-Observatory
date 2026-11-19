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
} from '@/lib/i18n';
import { SimulationScaleMode } from '@/lib/scientific-catalog';
import { ResolutionScaleOption } from '@/lib/graphics-settings';

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
  const extraCopy = SCALE_LABELS[lang];
  const activeLangOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  const isExplorerActive = activeView === 'explorer' && !isInspectingBlackHole;
  const isBlackHoleActive = activeView === 'explorer' && isInspectingBlackHole;
  const isCatalogActive = activeView === 'catalog';
  const isTrue1To1 = scaleMode === 'true-1to1';

  return (
    <header className="relative z-40 h-14 shrink-0 bg-[#111318] border-b border-white/[0.08] px-3 lg:px-4 flex items-center justify-between gap-2.5">
      {/* Zone 1: Astryx Clean Brand Wordmark */}
      <button
        type="button"
        onClick={onSelectExplorer}
        className="inline-flex items-center gap-2 text-[14px] font-semibold tracking-[-0.015em] text-[#f3f4f6] hover:text-white transition-colors whitespace-nowrap shrink-0"
      >
        <span className="w-7 h-7 rounded-[8px] bg-[#0082fb] text-white inline-flex items-center justify-center shrink-0">
          <Telescope className="w-4 h-4" />
        </span>
        <span>{t.brandTitle}</span>
      </button>

      {/* Zone 2: Astryx Neutral Navigation Tabs */}
      <nav
        aria-label="Primary navigation"
        className="flex items-center gap-1 overflow-x-auto no-scrollbar"
      >
        <button
          type="button"
          onClick={onSelectExplorer}
          data-testid="nav-explorer-btn"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 ${
            isExplorerActive
              ? 'bg-[#1f2430] text-[#f3f4f6] border border-white/[0.10]'
              : 'text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#181b22] border border-transparent'
          }`}
        >
          <Compass
            className={`w-3.5 h-3.5 shrink-0 ${
              isExplorerActive ? 'text-[#54a8ff]' : 'text-[#6b7280]'
            }`}
          />
          <span>{t.navExplorer}</span>
        </button>

        <button
          type="button"
          onClick={onSelectBlackHoleLab}
          data-testid="inspect-blackhole-btn"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 ${
            isBlackHoleActive
              ? 'bg-[#0082fb]/15 text-[#54a8ff] border border-[#0082fb]/40'
              : 'text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#181b22] border border-transparent'
          }`}
        >
          <CircleDot
            className={`w-3.5 h-3.5 shrink-0 ${
              isBlackHoleActive ? 'text-[#54a8ff]' : 'text-[#f59e0b]'
            }`}
          />
          <span>{t.navBlackHole}</span>
        </button>

        <button
          type="button"
          onClick={onSelectCatalog}
          data-testid="nav-catalog-btn"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 ${
            isCatalogActive
              ? 'bg-[#1f2430] text-[#f3f4f6] border border-white/[0.10]'
              : 'text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#181b22] border border-transparent'
          }`}
        >
          <LayoutGrid
            className={`w-3.5 h-3.5 shrink-0 ${
              isCatalogActive ? 'text-[#54a8ff]' : 'text-[#6b7280]'
            }`}
          />
          <span>{t.navCatalog}</span>
        </button>

        <button
          type="button"
          onClick={onOpenSimulator}
          data-testid="nav-simulator-btn"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-[13px] font-medium text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#181b22] border border-transparent transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-[#54a8ff] shrink-0" />
          <span>{t.navSimulator}</span>
        </button>
      </nav>

      {/* Zone 3: True 1:1 Scale Mode + Graphics Settings + 5-Language Switcher */}
      <div className="relative flex items-center gap-1.5 shrink-0">
        {/* True 1:1 Scale Switcher */}
        <button
          type="button"
          data-testid="scale-mode-toggle"
          aria-pressed={isTrue1To1}
          onClick={onToggleScaleMode}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
            isTrue1To1
              ? 'bg-[#0082fb] border-[#0082fb] text-white font-semibold'
              : 'bg-[#181b22] hover:bg-[#1f232c] border-white/[0.10] text-[#e5e7eb]'
          }`}
        >
          <Scaling className="w-3.5 h-3.5 shrink-0" />
          <span>{isTrue1To1 ? extraCopy.true1to1 : extraCopy.atlas}</span>
        </button>

        {/* Graphics & Resolution Settings Trigger */}
        <button
          type="button"
          data-testid="open-graphics-settings-btn"
          onClick={onOpenGraphicsSettings}
          aria-label={extraCopy.graphics}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] bg-[#181b22] hover:bg-[#1f232c] border border-white/[0.10] text-xs font-medium text-[#e5e7eb] transition-colors whitespace-nowrap shrink-0"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#54a8ff] shrink-0" />
          <span className="hidden md:inline">{extraCopy.graphics}</span>
          <span className="font-mono text-[11px] text-[#54a8ff]">
            {resolutionScale}x
          </span>
        </button>

        {/* Compact Astryx 5-Language Dropdown */}
        <div className="relative">
          <button
            type="button"
            data-testid="lang-dropdown-trigger"
            onClick={() => setLangMenuOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] bg-[#181b22] hover:bg-[#1f232c] border border-white/[0.10] text-xs font-medium text-[#f3f4f6] transition-colors whitespace-nowrap shrink-0"
          >
            <Globe className="w-3.5 h-3.5 text-[#54a8ff]" />
            <span>{activeLangOption.shortCode}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#9ca3af]" />
          </button>

          {langMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 rounded-[12px] bg-[#111318] border border-white/[0.12] shadow-2xl p-1 z-50">
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
                    className={`w-full text-left px-3 py-1.5 rounded-[8px] text-xs font-medium flex items-center justify-between transition-colors ${
                      active
                        ? 'bg-[#0082fb]/15 text-[#54a8ff]'
                        : 'text-[#d1d5db] hover:bg-[#181b22]'
                    }`}
                  >
                    <span>{opt.nativeLabel}</span>
                    <span className="font-mono text-[10px] text-[#6b7280]">
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
