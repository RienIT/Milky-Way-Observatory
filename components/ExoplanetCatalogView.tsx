'use client';

import React from 'react';
import {
  ArrowRight,
  CircleDot,
  Compass,
  Plus,
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
}

const DIAMETER_SHORT: Record<LanguageCode, string> = {
  vi: 'Đường kính',
  en: 'Diameter',
  ja: '直径',
  zh: '直径',
  ko: '지름',
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
}: ExoplanetCatalogViewProps) {
  const t = UI_STRINGS[lang];
  const visibleNodes = memories.filter((m) => matchedIds.has(m.id));

  return (
    <div
      data-testid="exoplanet-catalog-view"
      className="flex-1 overflow-y-auto bg-[#030406] pt-14"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Precision Aerospace Editorial Header Surface */}
        <section className="rounded-[4px] bg-[#0a0c10] border border-white/[0.09] p-6 lg:p-7 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-mono uppercase tracking-[0.06em] font-semibold text-[#E88B38]">
              {t.catalogHeroKicker}
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-[#ECEAE4]">
              {t.catalogHeroTitle}
            </h1>
            <p className="text-sm text-[#8A8D96] leading-relaxed">
              {t.catalogHeroSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenBlackHoleLab}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[2px] bg-[#E88B38] hover:bg-[#f09b4e] text-[#050608] font-semibold text-sm transition-colors whitespace-nowrap"
            >
              <CircleDot className="w-4 h-4" />
              <span>{t.catalogOpenBhLab}</span>
            </button>
            <button
              type="button"
              onClick={onOpenSimulator}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[2px] bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.10] text-[#ECEAE4] font-medium text-sm transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-[#E88B38]" />
              <span>{t.catalogAddAiBtn}</span>
            </button>
          </div>
        </section>

        {/* Search & Category Filter Toolbar */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-[#6B707B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              autoComplete="off"
              spellCheck={false}
              suppressHydrationWarning
              className="w-full rounded-[2px] bg-[#0a0c10] border border-white/[0.10] pl-10 pr-9 py-2.5 text-sm text-[#ECEAE4] placeholder:text-[#6B707B] focus:outline-none focus:border-[#E88B38] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-[2px] text-[#8A8D96] hover:text-[#ECEAE4]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onCategoryChange('ALL')}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === 'ALL'
                  ? 'bg-[#E88B38] text-[#050608] font-semibold'
                  : 'bg-[#0a0c10] border border-white/[0.09] text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.05]'
              }`}
            >
              {t.allCategories} ({memories.length})
            </button>
            {ALL_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              const count = memories.filter((m) => m.category === cat).length;
              const catLabel = t.categories[cat]?.shortLabel || cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onCategoryChange(active ? 'ALL' : cat)}
                  className={`px-3 py-1.5 rounded-[2px] text-xs font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#E88B38]/18 text-[#E88B38] font-semibold border border-[#E88B38]/45'
                      : 'bg-[#0a0c10] border border-white/[0.09] text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.05]'
                  }`}
                >
                  {catLabel} ({count})
                </button>
              );
            })}
          </div>
        </section>

        {/* Results Count */}
        <div className="flex items-center justify-between text-xs text-[#6B707B]">
          <p className="font-mono tabular-nums">
            {t.catalogShowingText} {visibleNodes.length} / {memories.length}{' '}
            {t.objectsCountUnit}
          </p>
        </div>

        {/* 3-Column NASA Encyclopedia Grid */}
        {visibleNodes.length === 0 ? (
          <div className="rounded-[4px] bg-[#0a0c10] border border-white/[0.09] p-12 text-center space-y-3">
            <p className="text-sm text-[#8A8D96]">{t.noSearchResults}</p>
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onCategoryChange('ALL');
              }}
              className="px-4 py-2 rounded-[2px] bg-white/[0.05] hover:bg-[#E88B38]/14 border border-white/[0.10] hover:border-[#E88B38]/40 text-xs font-medium text-[#E88B38] transition-colors"
            >
              {t.resetFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleNodes.map((rawNode) => {
              const node = getLocalizedNode(rawNode, lang);
              const meta =
                CATEGORY_CONFIG[rawNode.category] ||
                CATEGORY_CONFIG['Hố đen & Hiện tượng Thiên hà'];
              const catLabel =
                t.categories[rawNode.category]?.shortLabel || meta.shortLabel;
              const planetSpec = getPlanetSpecForNode(rawNode);
              const specOverride =
                t.planetSpecOverrides[planetSpec.designation];

              return (
                <article
                  key={rawNode.id}
                  className="rounded-[4px] bg-[#0a0c10] border border-white/[0.09] hover:border-[#E88B38]/40 p-5 flex flex-col justify-between gap-4 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs text-[#6B707B]">
                      <span className={`font-medium ${meta.textColorClass}`}>
                        {catLabel}
                      </span>
                      <span className="font-mono text-[11px] text-[#6B707B] truncate">
                        {node.createdAt}
                      </span>
                    </div>

                    <h2 className="text-[15px] font-semibold tracking-[-0.015em] text-[#ECEAE4] leading-snug">
                      {node.title}
                    </h2>

                    <p className="text-xs text-[#8A8D96] leading-relaxed line-clamp-3">
                      {node.summary[0]}
                    </p>

                    {/* Clean Key NASA Telemetry Grid */}
                    <div className="pt-3 border-t border-white/[0.08] grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                      <div className="col-span-2">
                        <span className="text-[#6B707B] block text-[11px]">
                          {DIAMETER_SHORT[lang]}
                        </span>
                        <span className="font-mono tabular-nums text-[#E88B38] font-semibold">
                          {planetSpec.diameterKm}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#6B707B] block text-[11px]">
                          {t.planetTempLabel}
                        </span>
                        <span className="font-mono tabular-nums text-[#ECEAE4] font-medium">
                          {planetSpec.surfaceTemp}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#6B707B] block text-[11px]">
                          {t.planetGravityLabel}
                        </span>
                        <span className="font-mono tabular-nums text-[#C8C6C0] font-medium">
                          {planetSpec.surfaceGravity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-[#6B707B] truncate">
                      {specOverride?.designation || planetSpec.designation}
                    </span>
                    <button
                      type="button"
                      onClick={() => onInspectIn3D(rawNode.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-white/[0.06] hover:bg-[#E88B38] text-[#ECEAE4] hover:text-[#050608] text-xs font-medium transition-colors whitespace-nowrap shrink-0"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>{t.viewIn3DBtn}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
