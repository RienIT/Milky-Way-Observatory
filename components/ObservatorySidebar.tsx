'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CircleDot,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import {
  ALL_CATEGORIES,
  CATEGORY_CONFIG,
  getPlanetSpecForNode,
  MemoryCategory,
  MemoryNode,
} from '@/lib/memory-types';
import { LanguageCode, UI_STRINGS } from '@/lib/i18n';
import { getLocalizedNode } from '@/lib/celestial-translations';
import { UNIVERSE_HUD_COPY } from '@/lib/universe-i18n';
import { EXTRAGALACTIC_CATALOG } from '@/lib/extragalactic-catalog';

interface ObservatorySidebarProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  memories: MemoryNode[];
  matchedIds: Set<string>;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: MemoryCategory | 'ALL';
  onCategoryChange: (cat: MemoryCategory | 'ALL') => void;
  selectedId: string | null;
  onSelectNode: (id: string) => void;
  onRestoreDefaults: () => void;
  lang: LanguageCode;
}

export default function ObservatorySidebar({
  isOpen,
  onToggleOpen,
  memories,
  matchedIds,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedId,
  onSelectNode,
  onRestoreDefaults,
  lang,
}: ObservatorySidebarProps) {
  const t = UI_STRINGS[lang];
  const visibleNodes = memories.filter((m) => matchedIds.has(m.id));
  const isFilterActive =
    searchQuery.trim().length > 0 || selectedCategory !== 'ALL';

  if (!isOpen) {
    return (
      <div className="absolute left-3 top-3 z-20">
        <button
          type="button"
          onClick={onToggleOpen}
          data-testid="expand-sidebar-btn"
          className="inline-flex items-center gap-2 rounded-[2px] bg-[#0a0c10]/95 hover:bg-[#12151c] border border-white/[0.12] px-3.5 py-2 text-xs font-semibold text-[#ECEAE4] shadow-xl transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-[#E88B38]" />
          <span>
            {t.showSidebar} ({memories.length})
          </span>
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label={t.sidebarTitle}
      data-testid="observatory-sidebar"
      className="relative z-20 w-72 lg:w-[308px] shrink-0 h-full bg-[#0a0c10] border-r border-white/[0.08] flex flex-col overflow-hidden"
    >
      {/* Sidebar Header */}
      <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-[#ECEAE4] truncate">
            {t.sidebarTitle}
          </h2>
          <span
            data-testid="matched-star-count"
            className="text-[11px] font-mono tabular-nums text-[#6B707B] shrink-0"
          >
            {visibleNodes.length}/{memories.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleOpen}
          aria-label={t.hideSidebar}
          title={t.hideSidebar}
          className="p-1.5 rounded-[2px] text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.06] transition-colors shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="p-3 border-b border-white/[0.08] space-y-2.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#6B707B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="memory-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            autoComplete="off"
            spellCheck={false}
            suppressHydrationWarning
            className="w-full rounded-[2px] bg-[#12151c] border border-white/[0.09] pl-9 pr-8 py-2 text-xs text-[#ECEAE4] placeholder:text-[#6B707B] focus:outline-none focus:border-[#E88B38] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-[2px] text-[#8A8D96] hover:text-[#ECEAE4]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => onCategoryChange('ALL')}
            className={`px-2.5 py-1 rounded-[2px] text-[11px] font-medium transition-colors whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-[#E88B38] text-[#050608] font-semibold'
                : 'bg-[#12151c] text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.07]'
            }`}
          >
            {t.allCategories}
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            const catText = t.categories[cat]?.shortLabel || cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(active ? 'ALL' : cat)}
                className={`px-2.5 py-1 rounded-[2px] text-[11px] font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#E88B38]/18 text-[#E88B38] font-semibold border border-[#E88B38]/45'
                    : 'bg-[#12151c] text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.07] border border-transparent'
                }`}
              >
                {catText}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pinned Sagittarius A* Galactic Core Card */}
      <div className="px-3 pt-3 pb-2 space-y-2">
        <button
          type="button"
          onClick={() => onSelectNode('BLACK_HOLE_CORE')}
          className={`w-full text-left rounded-[4px] p-3 border transition-colors flex items-center justify-between gap-2 ${
            selectedId === 'BLACK_HOLE_CORE'
              ? 'bg-[#E88B38]/14 border-[#E88B38]/50'
              : 'bg-[#12151c] hover:bg-[#191d26] border-white/[0.08]'
          }`}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#ECEAE4]">
              <CircleDot className="w-3.5 h-3.5 text-[#E88B38] shrink-0" />
              <span className="truncate">{t.featuredBlackHoleTitle}</span>
            </div>
            <p className="text-[11px] text-[#8A8D96] truncate mt-0.5">
              {t.featuredBlackHoleSubtitle}
            </p>
          </div>
          <span className="text-[11px] font-mono font-medium text-[#E88B38] shrink-0">
            {t.inspectCoreAction} →
          </span>
        </button>

        {/* Local Group & Nearby Clusters Quick-Jump */}
        <div className="rounded-[4px] bg-[#12151c] border border-white/[0.07] p-2">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#8A8D96] mb-1.5">
            {UNIVERSE_HUD_COPY[lang].extragalacticSection}
          </p>
          <div className="flex flex-wrap gap-1">
            {EXTRAGALACTIC_CATALOG.filter((g) =>
              ['m31', 'lmc', 'smc', 'm33', 'virgo-cluster', 'coma-cluster'].includes(g.id)
            ).map((gal) => {
              const active = selectedId === gal.id;
              return (
                <button
                  key={gal.id}
                  type="button"
                  data-testid={`sidebar-jump-${gal.id}`}
                  onClick={() => onSelectNode(gal.id)}
                  className={`px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#E88B38] text-[#050608] font-semibold'
                      : 'bg-[#0a0c10] text-[#C8C6C0] hover:text-[#ECEAE4] hover:bg-white/[0.08]'
                  }`}
                >
                  {gal.id === 'virgo-cluster'
                    ? 'Virgo (16.5 Mpc)'
                    : gal.id === 'coma-cluster'
                      ? 'Coma (99 Mpc)'
                      : gal.id === 'm31'
                        ? 'M31 (778 kpc)'
                        : gal.id === 'm33'
                          ? 'M33'
                          : gal.id.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scrollable NASA Milky Way Celestial Directory with Real Physical Diameters */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {visibleNodes.length === 0 ? (
          <div className="py-8 px-3 text-center space-y-2">
            <p className="text-xs text-[#8A8D96]">{t.noSearchResults}</p>
            {isFilterActive && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  onCategoryChange('ALL');
                }}
                className="text-xs font-medium text-[#E88B38] hover:text-[#f09b4e]"
              >
                {t.resetFilters}
              </button>
            )}
          </div>
        ) : (
          visibleNodes.map((rawNode) => {
            const node = getLocalizedNode(rawNode, lang);
            const meta =
              CATEGORY_CONFIG[rawNode.category] ||
              CATEGORY_CONFIG['Hố đen & Hiện tượng Thiên hà'];
            const catShort =
              t.categories[rawNode.category]?.shortLabel || meta.shortLabel;
            const planetSpec = getPlanetSpecForNode(rawNode);
            const isSelected = selectedId === rawNode.id;

            return (
              <button
                key={rawNode.id}
                type="button"
                onClick={() => onSelectNode(rawNode.id)}
                className={`w-full text-left rounded-[2px] px-3 py-2 border transition-colors ${
                  isSelected
                    ? 'bg-[#E88B38]/14 border-[#E88B38]/45'
                    : 'bg-transparent hover:bg-white/[0.05] border-transparent'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-medium text-[#ECEAE4] truncate">
                    {node.title}
                  </p>
                  <span className="text-[10px] font-mono tabular-nums text-[#8A8D96] shrink-0">
                    {planetSpec.earthRadiusRatio < 0.01
                      ? '<0.01 R⊕'
                      : planetSpec.earthRadiusRatio >= 1000
                        ? `${(planetSpec.earthRadiusRatio / 1000).toFixed(1)}k R⊕`
                        : planetSpec.earthRadiusRatio >= 100
                          ? `${planetSpec.earthRadiusRatio.toFixed(0)} R⊕`
                          : `${planetSpec.earthRadiusRatio.toFixed(2)} R⊕`}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B707B] truncate mt-0.5">
                  <span className={meta.textColorClass}>{catShort}</span>
                  <span className="mx-1.5" aria-hidden="true">
                    ·
                  </span>
                  <span className="font-mono tabular-nums text-[#8A8D96]">
                    {planetSpec.diameterKm.split(' (')[0]}
                  </span>
                </p>
              </button>
            );
          })
        )}
      </div>

      {/* Footer Utility Action */}
      <div className="px-3.5 py-2.5 border-t border-white/[0.08] flex items-center justify-between">
        <button
          type="button"
          onClick={onRestoreDefaults}
          className="inline-flex items-center gap-1.5 text-[11px] text-[#8A8D96] hover:text-[#ECEAE4] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.restoreAtlas}</span>
        </button>
      </div>
    </aside>
  );
}
