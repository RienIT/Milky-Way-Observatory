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
      className="flex-1 overflow-y-auto bg-[#090a0d]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Astryx Editorial Header Surface */}
        <section className="rounded-[14px] bg-[#111318] border border-white/[0.08] p-6 lg:p-7 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-semibold text-[#54a8ff]">
              {t.catalogHeroKicker}
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-[#f3f4f6]">
              {t.catalogHeroTitle}
            </h1>
            <p className="text-sm text-[#9ca3af] leading-relaxed">
              {t.catalogHeroSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenBlackHoleLab}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#0082fb] hover:bg-[#1a91ff] text-white font-semibold text-sm transition-colors whitespace-nowrap"
            >
              <CircleDot className="w-4 h-4" />
              <span>{t.catalogOpenBhLab}</span>
            </button>
            <button
              type="button"
              onClick={onOpenSimulator}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#181b22] hover:bg-[#222631] border border-white/[0.10] text-[#f3f4f6] font-medium text-sm transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-[#54a8ff]" />
              <span>{t.catalogAddAiBtn}</span>
            </button>
          </div>
        </section>

        {/* Search & Category Filter Toolbar */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              autoComplete="off"
              spellCheck={false}
              suppressHydrationWarning
              className="w-full rounded-[10px] bg-[#111318] border border-white/[0.10] pl-10 pr-9 py-2.5 text-sm text-[#f3f4f6] placeholder:text-[#6b7280] focus:outline-none focus:border-[#0082fb] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-[6px] text-[#9ca3af] hover:text-[#f3f4f6]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onCategoryChange('ALL')}
              className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === 'ALL'
                  ? 'bg-[#0082fb] text-white font-semibold'
                  : 'bg-[#111318] border border-white/[0.08] text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#181b22]'
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
                  className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#262b36] text-[#f3f4f6] font-semibold border border-white/[0.12]'
                      : 'bg-[#111318] border border-white/[0.08] text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#181b22]'
                  }`}
                >
                  {catLabel} ({count})
                </button>
              );
            })}
          </div>
        </section>

        {/* Results Count */}
        <div className="flex items-center justify-between text-xs text-[#6b7280]">
          <p className="font-mono tabular-nums">
            {t.catalogShowingText} {visibleNodes.length} / {memories.length}{' '}
            {t.objectsCountUnit}
          </p>
        </div>

        {/* Astryx 3-Column NASA Encyclopedia Grid */}
        {visibleNodes.length === 0 ? (
          <div className="rounded-[14px] bg-[#111318] border border-white/[0.08] p-12 text-center space-y-3">
            <p className="text-sm text-[#9ca3af]">{t.noSearchResults}</p>
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onCategoryChange('ALL');
              }}
              className="px-4 py-2 rounded-[8px] bg-[#181b22] hover:bg-[#222631] border border-white/[0.10] text-xs font-medium text-[#54a8ff] transition-colors"
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
                  className="rounded-[14px] bg-[#111318] border border-white/[0.08] hover:border-white/[0.16] p-5 flex flex-col justify-between gap-4 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs text-[#6b7280]">
                      <span className={`font-medium ${meta.textColorClass}`}>
                        {catLabel}
                      </span>
                      <span className="font-mono text-[11px] text-[#6b7280] truncate">
                        {node.createdAt}
                      </span>
                    </div>

                    <h2 className="text-[15px] font-semibold tracking-[-0.015em] text-[#f3f4f6] leading-snug">
                      {node.title}
                    </h2>

                    <p className="text-xs text-[#9ca3af] leading-relaxed line-clamp-3">
                      {node.summary[0]}
                    </p>

                    {/* Clean Key NASA Telemetry Grid */}
                    <div className="pt-3 border-t border-white/[0.08] grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                      <div className="col-span-2">
                        <span className="text-[#6b7280] block text-[11px]">
                          {DIAMETER_SHORT[lang]}
                        </span>
                        <span className="font-mono tabular-nums text-[#54a8ff] font-semibold">
                          {planetSpec.diameterKm}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#6b7280] block text-[11px]">
                          {t.planetTempLabel}
                        </span>
                        <span className="font-mono tabular-nums text-[#f3f4f6] font-medium">
                          {planetSpec.surfaceTemp}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#6b7280] block text-[11px]">
                          {t.planetGravityLabel}
                        </span>
                        <span className="font-mono tabular-nums text-[#d1d5db] font-medium">
                          {planetSpec.surfaceGravity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-[#6b7280] truncate">
                      {specOverride?.designation || planetSpec.designation}
                    </span>
                    <button
                      type="button"
                      onClick={() => onInspectIn3D(rawNode.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#181b22] hover:bg-[#0082fb] text-[#f3f4f6] text-xs font-medium transition-colors whitespace-nowrap shrink-0"
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
