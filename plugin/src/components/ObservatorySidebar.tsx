'use client';

import React from 'react';
import { Button, Card, Input } from '@heroui/react';
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
  MemoryCategory,
  MemoryNode,
} from '../lib/memory-types';
import { LanguageCode, UI_STRINGS } from '../lib/i18n';
import { getLocalizedNode } from '../lib/celestial-translations';
import {
  getLocalizedPlanetSpec,
  OBSERVATORY_EXTRA_COPY,
} from '../lib/localized-telemetry';
import { UNIVERSE_HUD_COPY } from '../lib/universe-i18n';
import { EXTRAGALACTIC_CATALOG } from '../lib/extragalactic-catalog';

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
  const extra = OBSERVATORY_EXTRA_COPY[lang];
  const visibleNodes = memories.filter((m) => matchedIds.has(m.id));
  const isFilterActive =
    searchQuery.trim().length > 0 || selectedCategory !== 'ALL';

  if (!isOpen) {
    return (
      <div className="absolute left-3 top-[60px] z-20">
        <Button
          size="sm"
          variant="outline"
          onPress={onToggleOpen}
          data-testid="expand-sidebar-btn"
          className="rounded-[8px] bg-[#0a0c10]/95 hover:bg-[#12151c] border-white/[0.12] px-3 gap-1.5 text-xs font-semibold text-[#ECEAE4] shadow-xl"
        >
          <ChevronRight className="w-4 h-4 text-[#FA500F] shrink-0" />
          <span>
            {t.showSidebar} ({memories.length})
          </span>
        </Button>
      </div>
    );
  }

  return (
    <aside
      aria-label={t.sidebarTitle}
      data-testid="observatory-sidebar"
      className="absolute inset-y-0 left-0 z-40 @[960px]/root:relative @[960px]/root:z-20 w-[min(288px,calc(100%-24px))] @[960px]/root:w-72 @[1200px]/root:w-[308px] shrink-0 h-full bg-[#0a0c10] border-r border-white/[0.08] shadow-2xl @[960px]/root:shadow-none flex flex-col overflow-hidden"
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
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          onPress={onToggleOpen}
          aria-label={t.hideSidebar}
          className="w-7 h-7 min-w-7 rounded-[8px] p-0 text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.06] shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Search & Category Filter */}
      <div className="p-3 border-b border-white/[0.08] space-y-2.5">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-[#6B707B] absolute left-2.5 pointer-events-none z-10" />
          <Input
            id="memory-search-input"
            aria-label={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            autoComplete="off"
            fullWidth
            className="h-8 rounded-[8px] bg-[#12151c] border border-white/[0.09] hover:border-white/[0.20] focus:border-[#FA500F] pl-8 pr-7 text-xs text-[#ECEAE4] placeholder:text-[#6B707B]"
          />
          {searchQuery && (
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              aria-label={extra.clearSearch}
              onPress={() => onSearchChange('')}
              className="absolute right-1 w-6 h-6 min-w-6 rounded-[8px] p-0 text-[#8A8D96] hover:text-[#ECEAE4]"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          <Button
            size="sm"
            variant={selectedCategory === 'ALL' ? 'primary' : 'secondary'}
            onPress={() => onCategoryChange('ALL')}
            className={`h-6 min-w-0 rounded-[8px] px-2.5 text-[11px] font-medium whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-[#FA500F] text-white font-semibold'
                : 'bg-[#12151c] text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.07]'
            }`}
          >
            {t.allCategories}
          </Button>
          {ALL_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            const catText = t.categories[cat]?.shortLabel || cat;
            return (
              <Button
                key={cat}
                size="sm"
                variant={active ? 'outline' : 'secondary'}
                onPress={() => onCategoryChange(active ? 'ALL' : cat)}
                className={`h-6 min-w-0 rounded-[8px] px-2.5 text-[11px] font-medium whitespace-nowrap ${
                  active
                    ? 'bg-[#FA500F]/18 text-[#FA500F] font-semibold border-[#FA500F]/45'
                    : 'bg-[#12151c] text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.07]'
                }`}
              >
                {catText}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Pinned Sagittarius A* Galactic Core Card */}
      <div className="px-3 pt-3 pb-2 space-y-2">
        <button
          type="button"
          onClick={() => onSelectNode('BLACK_HOLE_CORE')}
          className={`w-full text-left rounded-[12px] border p-3 flex items-center justify-between gap-2 transition-colors ${
            selectedId === 'BLACK_HOLE_CORE'
              ? 'bg-[#FA500F]/14 border-[#FA500F]/50'
              : 'bg-[#12151c] hover:bg-[#191d26] border-white/[0.08]'
          }`}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#ECEAE4]">
              <CircleDot className="w-3.5 h-3.5 text-[#FA500F] shrink-0" />
              <span className="truncate">{t.featuredBlackHoleTitle}</span>
            </div>
            <p className="text-[11px] text-[#8A8D96] truncate mt-0.5">
              {t.featuredBlackHoleSubtitle}
            </p>
          </div>
          <span className="text-[11px] font-mono font-medium text-[#FA500F] shrink-0">
            {t.inspectCoreAction} →
          </span>
        </button>

        {/* Local Group & Nearby Clusters Quick-Jump */}
        <Card className="rounded-[12px] bg-[#12151c] border border-white/[0.07] shadow-none p-0">
          <Card.Content className="p-2">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#8A8D96] mb-1.5">
              {UNIVERSE_HUD_COPY[lang].extragalacticSection}
            </p>
            <div className="flex flex-wrap gap-1">
              {EXTRAGALACTIC_CATALOG.filter((g) =>
                ['m31', 'lmc', 'smc', 'm33', 'virgo-cluster', 'coma-cluster'].includes(g.id)
              ).map((gal) => {
                const active = selectedId === gal.id;
                return (
                  <Button
                    key={gal.id}
                    size="sm"
                    variant={active ? 'primary' : 'secondary'}
                    data-testid={`sidebar-jump-${gal.id}`}
                    onPress={() => onSelectNode(gal.id)}
                    className={`h-6 min-w-0 rounded-[8px] px-2 text-[10px] font-mono font-medium whitespace-nowrap ${
                      active
                        ? 'bg-[#FA500F] text-white font-semibold'
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
                  </Button>
                );
              })}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Scrollable NASA Milky Way Celestial Directory */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {visibleNodes.length === 0 ? (
          <div className="py-8 px-3 text-center space-y-2">
            <p className="text-xs text-[#8A8D96]">{t.noSearchResults}</p>
            {isFilterActive && (
              <Button
                size="sm"
                variant="ghost"
                onPress={() => {
                  onSearchChange('');
                  onCategoryChange('ALL');
                }}
                className="rounded-[8px] text-xs font-medium text-[#FA500F]"
              >
                {t.resetFilters}
              </Button>
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
            const locSpec = getLocalizedPlanetSpec(rawNode, lang);
            const isSelected = selectedId === rawNode.id;

            return (
              <button
                key={rawNode.id}
                type="button"
                onClick={() => onSelectNode(rawNode.id)}
                className={`w-full text-left rounded-[8px] px-3 py-2 border transition-colors ${
                  isSelected
                    ? 'bg-[#FA500F]/14 border-[#FA500F]/45'
                    : 'bg-transparent hover:bg-white/[0.05] border-transparent'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-medium text-[#ECEAE4] truncate">
                    {node.title}
                  </p>
                  <span className="text-[10px] font-mono tabular-nums text-[#8A8D96] shrink-0">
                    {locSpec.earthRadiusRatio < 0.01
                      ? '<0.01 R⊕'
                      : locSpec.earthRadiusRatio >= 1000
                        ? `${(locSpec.earthRadiusRatio / 1000).toFixed(1)}k R⊕`
                        : locSpec.earthRadiusRatio >= 100
                          ? `${locSpec.earthRadiusRatio.toFixed(0)} R⊕`
                          : `${locSpec.earthRadiusRatio.toFixed(2)} R⊕`}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B707B] truncate mt-0.5">
                  <span className={meta.textColorClass}>{catShort}</span>
                  <span className="mx-1.5" aria-hidden="true">
                    ·
                  </span>
                  <span className="font-mono tabular-nums text-[#8A8D96]">
                    {locSpec.diameterKm.split(' (')[0]}
                  </span>
                </p>
              </button>
            );
          })
        )}
      </div>

      {/* Footer Utility Action */}
      <div className="px-3.5 py-2.5 border-t border-white/[0.08] flex items-center justify-between">
        <Button
          size="sm"
          variant="ghost"
          onPress={onRestoreDefaults}
          className="h-7 rounded-[8px] px-2 gap-1.5 text-[11px] text-[#8A8D96] hover:text-[#ECEAE4]"
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          <span>{t.restoreAtlas}</span>
        </Button>
      </div>
    </aside>
  );
}
