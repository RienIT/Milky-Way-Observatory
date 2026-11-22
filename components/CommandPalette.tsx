'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CircleDot,
  CornerDownLeft,
  Eclipse,
  Globe2,
  Orbit,
  Radio,
  Search,
  Sparkles,
  Sun,
  X,
  Zap,
} from 'lucide-react';
import {
  SOLAR_ECLIPSE_PRESETS,
  SolarEclipsePreset,
  WavelengthBandId,
} from '@/lib/astrophysics-science';
import { getLocalizedNode } from '@/lib/celestial-translations';
import { EXTRAGALACTIC_CATALOG } from '@/lib/extragalactic-catalog';
import { LanguageCode } from '@/lib/i18n';
import { MemoryNode } from '@/lib/memory-types';
import { ScalePresetId, UNIVERSE_HUD_COPY } from '@/lib/universe-i18n';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryNode[];
  lang: LanguageCode;
  onSelectObject: (id: string) => void;
  onJumpToEclipse: (preset: SolarEclipsePreset) => void;
  onSelectWavelength: (band: WavelengthBandId) => void;
  onTriggerPhotonPulse: () => void;
  onSelectScalePreset: (preset: ScalePresetId) => void;
}

type FilterTab = 'all' | 'events' | 'catalog' | 'galaxies';

interface PaletteEntry {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  group: FilterTab;
  kind: 'object' | 'eclipse' | 'spectral' | 'photon' | 'preset';
  objectId?: string;
  eclipse?: SolarEclipsePreset;
  band?: WavelengthBandId;
  preset?: ScalePresetId;
}

const PALETTE_COPY: Record<
  LanguageCode,
  {
    placeholder: string;
    tabs: Record<FilterTab, string>;
    empty: string;
    hints: string;
    sgrSubtitle: string;
    fermiTitle: string;
    fermiSubtitle: string;
    photonTitle: string;
    photonSubtitle: string;
    galaxyMeta: string;
  }
> = {
  en: {
    placeholder: 'Jump to star, planet, galaxy, eclipse, or wavelength…',
    tabs: {
      all: 'All',
      events: 'Events & Spectra',
      catalog: 'Catalog (48+)',
      galaxies: 'Local Group',
    },
    empty: 'No matching celestial objects or commands.',
    hints: '↑↓ Navigate · Enter Select · Esc Close',
    sgrSubtitle: 'Supermassive Black Hole · 4.15 × 10⁶ M☉ · Galactic Core',
    fermiTitle: 'Milky Way — X-Ray & Fermi Bubbles',
    fermiSubtitle: 'Fermi-LAT / eROSITA bipolar gamma-ray lobes (±8.5 kpc)',
    photonTitle: 'Emit Speed-of-Light Photon Pulse (c)',
    photonSubtitle: '299,792,458 m/s wavefront expanding from the Sun',
    galaxyMeta: 'Extragalactic',
  },
  vi: {
    placeholder: 'Đi tới ngôi sao, hành tinh, thiên hà, nhật thực hoặc bước sóng…',
    tabs: {
      all: 'Tất cả',
      events: 'Hiện tượng & Phổ',
      catalog: 'Danh mục (48+)',
      galaxies: 'Nhóm Địa phương',
    },
    empty: 'Không tìm thấy thiên thể hoặc lệnh phù hợp.',
    hints: '↑↓ Chọn · Enter Đi tới · Esc Đóng',
    sgrSubtitle: 'Hố đen Siêu khối lượng · 4,15 × 10⁶ M☉ · Tâm Ngân Hà',
    fermiTitle: 'Ngân Hà — Tia X & Bong bóng Fermi',
    fermiSubtitle: 'Cặp thùy tia gamma lưỡng cực Fermi-LAT / eROSITA (±8,5 kpc)',
    photonTitle: 'Phát Xung Ánh sáng Tốc độ thực (c)',
    photonSubtitle: 'Mặt sóng 299.792.458 m/s lan truyền từ Mặt Trời',
    galaxyMeta: 'Ngoài thiên hà',
  },
  ja: {
    placeholder: '恒星・惑星・銀河・日食・観測波長へ移動…',
    tabs: {
      all: 'すべて',
      events: '現象・波長',
      catalog: 'カタログ (48+)',
      galaxies: '局所銀河群',
    },
    empty: '一致する天体またはコマンドがありません。',
    hints: '↑↓ 移動 · Enter 決定 · Esc 閉じる',
    sgrSubtitle: '超大質量ブラックホール · 4.15 × 10⁶ M☉ · 銀河中心',
    fermiTitle: '天の川銀河 — X線・フェルミバブル',
    fermiSubtitle: 'Fermi-LAT / eROSITA 双極ガンマ線ローブ (±8.5 kpc)',
    photonTitle: '光速パルス放出 (c)',
    photonSubtitle: '太陽から 299,792,458 m/s で広がる光波面',
    galaxyMeta: '銀河外',
  },
  zh: {
    placeholder: '跳转至恒星、行星、星系、日食或观测波段…',
    tabs: {
      all: '全部',
      events: '天象与波段',
      catalog: '星表 (48+)',
      galaxies: '本星系群',
    },
    empty: '未找到匹配的天体或指令。',
    hints: '↑↓ 导航 · Enter 选择 · Esc 关闭',
    sgrSubtitle: '超大质量黑洞 · 4.15 × 10⁶ M☉ · 银河系中心',
    fermiTitle: '银河系 — X射线与费米气泡',
    fermiSubtitle: 'Fermi-LAT / eROSITA 双极伽马射线泡 (±8.5 kpc)',
    photonTitle: '发射真实光速脉冲 (c)',
    photonSubtitle: '从太阳以 299,792,458 m/s 向外传播的光波前',
    galaxyMeta: '河外星系',
  },
  ko: {
    placeholder: '항성, 행성, 은하, 일식 또는 관측 파장으로 이동…',
    tabs: {
      all: '전체',
      events: '천문 현상 · 파장',
      catalog: '카탈로그 (48+)',
      galaxies: '국부은하군',
    },
    empty: '일치하는 천체나 명령이 없습니다.',
    hints: '↑↓ 이동 · Enter 선택 · Esc 닫기',
    sgrSubtitle: '초대질량 블랙홀 · 4.15 × 10⁶ M☉ · 은하 중심',
    fermiTitle: '우리은하 — X선 · 페르미 버블',
    fermiSubtitle: 'Fermi-LAT / eROSITA 양극 감마선 로브 (±8.5 kpc)',
    photonTitle: '광속 펄스 방출 (c)',
    photonSubtitle: '태양에서 299,792,458 m/s로 확산되는 빛 파면',
    galaxyMeta: '외부은하',
  },
};

export default function CommandPalette({
  isOpen,
  onClose,
  memories,
  lang,
  onSelectObject,
  onJumpToEclipse,
  onSelectWavelength,
  onTriggerPhotonPulse,
  onSelectScalePreset,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const copy = PALETTE_COPY[lang];
  const hud = UNIVERSE_HUD_COPY[lang];

  useEffect(() => {
    if (!isOpen) return;
    const id = window.requestAnimationFrame(() => {
      setQuery('');
      setCursor(0);
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [isOpen]);

  const allEntries = useMemo<PaletteEntry[]>(() => {
    const entries: PaletteEntry[] = [
      {
        id: 'cmd-sgr-a',
        title: 'Sagittarius A* (Sgr A*)',
        subtitle: copy.sgrSubtitle,
        meta: '26,670 ly',
        group: 'events',
        kind: 'object',
        objectId: 'BLACK_HOLE_CORE',
      },
      ...SOLAR_ECLIPSE_PRESETS.map((preset) => {
        const mins = Math.floor(preset.durationSec / 60);
        const secs = String(preset.durationSec % 60).padStart(2, '0');
        return {
          id: `cmd-${preset.id}`,
          title: `${preset.shortLabel} · ${preset.region[lang]}`,
          subtitle: preset.isoUtc.replace('T', ' ').replace('Z', ' UTC'),
          meta: `${mins}m ${secs}s`,
          group: 'events' as const,
          kind: 'eclipse' as const,
          eclipse: preset,
        };
      }),
      {
        id: 'cmd-fermi-bubbles',
        title: copy.fermiTitle,
        subtitle: copy.fermiSubtitle,
        meta: '0.5–100 GeV',
        group: 'events',
        kind: 'spectral',
        band: 'xray',
      },
      {
        id: 'cmd-photon-pulse',
        title: copy.photonTitle,
        subtitle: copy.photonSubtitle,
        meta: 'c = 299,792 km/s',
        group: 'events',
        kind: 'photon',
      },
    ];

    for (const node of memories) {
      const loc = getLocalizedNode(node, lang);
      entries.push({
        id: `obj-${node.id}`,
        title: loc.title,
        subtitle: loc.summary[0] || node.category,
        meta: node.tags.slice(0, 2).join(' · '),
        group: 'catalog',
        kind: 'object',
        objectId: node.id,
      });
    }

    for (const gal of EXTRAGALACTIC_CATALOG) {
      entries.push({
        id: `gal-${gal.id}`,
        title: gal.name,
        subtitle: `${gal.designation} · ${gal.morphology}`,
        meta: `${(gal.distanceMpc * 3.26156).toFixed(2)} Mly`,
        group: 'galaxies',
        kind: 'preset',
        preset: 'local-group',
      });
    }

    return entries;
  }, [copy, lang, memories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allEntries
      .filter((entry) => {
        if (activeTab !== 'all' && entry.group !== activeTab) return false;
        if (!q) return true;
        return (
          entry.title.toLowerCase().includes(q) ||
          entry.subtitle.toLowerCase().includes(q) ||
          entry.meta.toLowerCase().includes(q)
        );
      })
      .slice(0, 32);
  }, [activeTab, allEntries, query]);

  const safeCursor = Math.min(cursor, Math.max(0, filtered.length - 1));

  const executeEntry = (entry: PaletteEntry) => {
    if (entry.kind === 'object' && entry.objectId) {
      onSelectObject(entry.objectId);
    } else if (entry.kind === 'eclipse' && entry.eclipse) {
      onJumpToEclipse(entry.eclipse);
    } else if (entry.kind === 'spectral' && entry.band) {
      onSelectWavelength(entry.band);
      onSelectScalePreset('milky-way');
    } else if (entry.kind === 'photon') {
      onTriggerPhotonPulse();
    } else if (entry.kind === 'preset' && entry.preset) {
      onSelectScalePreset(entry.preset);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      data-testid="command-palette-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-[11vh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={hud.searchTrigger}
        data-testid="command-palette-dialog"
        className="w-full max-w-[600px] rounded-[4px] bg-[#0a0c10] border border-white/[0.14] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Search Input Row */}
        <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-white/[0.09]">
          <Search className="w-4 h-4 text-[#E88B38] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            data-testid="command-palette-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setCursor((c) => Math.min(Math.max(0, filtered.length - 1), c + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setCursor((c) => Math.max(0, c - 1));
              } else if (e.key === 'Enter' && filtered[safeCursor]) {
                e.preventDefault();
                executeEntry(filtered[safeCursor]);
              }
            }}
            placeholder={copy.placeholder}
            className="flex-1 bg-transparent text-[13px] text-[#ECEAE4] placeholder-[#6B707B] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-[2px] text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 px-3 py-1.5 border-b border-white/[0.07] bg-[#07090d]">
          {(['all', 'events', 'catalog', 'galaxies'] as FilterTab[]).map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setCursor(0);
                }}
                className={`px-2 py-0.5 rounded-[2px] text-[11px] font-mono transition-colors ${
                  active
                    ? 'bg-[#E88B38]/18 text-[#E88B38] border border-[#E88B38]/40'
                    : 'text-[#8A8D96] hover:text-[#ECEAE4] border border-transparent'
                }`}
              >
                {copy.tabs[tab]}
              </button>
            );
          })}
        </div>

        {/* Result List */}
        <div className="max-h-[54vh] overflow-y-auto divide-y divide-white/[0.05]">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-[#8A8D96]">
              {copy.empty}
            </div>
          ) : (
            filtered.map((entry, idx) => {
              const active = idx === safeCursor;
              return (
                <button
                  key={entry.id}
                  type="button"
                  data-testid={`palette-item-${entry.id}`}
                  onMouseEnter={() => setCursor(idx)}
                  onClick={() => executeEntry(entry)}
                  className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                    active ? 'bg-[#141820]' : 'hover:bg-[#0f1218]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="shrink-0 text-[#E88B38]">
                      {entry.kind === 'eclipse' ? (
                        <Eclipse className="w-3.5 h-3.5" />
                      ) : entry.kind === 'spectral' ? (
                        <Radio className="w-3.5 h-3.5" />
                      ) : entry.kind === 'photon' ? (
                        <Zap className="w-3.5 h-3.5" />
                      ) : entry.objectId === 'BLACK_HOLE_CORE' ? (
                        <CircleDot className="w-3.5 h-3.5" />
                      ) : entry.group === 'galaxies' ? (
                        <Sparkles className="w-3.5 h-3.5 text-[#8A8D96]" />
                      ) : entry.title.toLowerCase().includes('sun') ? (
                        <Sun className="w-3.5 h-3.5 text-[#E88B38]" />
                      ) : entry.group === 'catalog' ? (
                        <Globe2 className="w-3.5 h-3.5 text-[#8A8D96]" />
                      ) : (
                        <Orbit className="w-3.5 h-3.5 text-[#8A8D96]" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`text-[13px] truncate ${
                          active ? 'text-[#ECEAE4] font-medium' : 'text-[#D6D4CE]'
                        }`}
                      >
                        {entry.title}
                      </p>
                      <p className="text-[11px] text-[#8A8D96] truncate">
                        {entry.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[10px] tabular-nums text-[#8A8D96]">
                      {entry.meta}
                    </span>
                    {active && <CornerDownLeft className="w-3 h-3 text-[#E88B38]" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hints */}
        <div className="px-3.5 py-1.5 border-t border-white/[0.07] bg-[#07090d] flex items-center justify-between text-[10px] font-mono text-[#6B707B]">
          <span>{copy.hints}</span>
          <span className="tabular-nums">{filtered.length}</span>
        </div>
      </div>
    </div>
  );
}
