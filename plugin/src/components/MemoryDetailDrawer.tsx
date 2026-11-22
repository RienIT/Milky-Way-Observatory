'use client';

import React, { useState } from 'react';
import {
  CircleDot,
  Compass,
  Globe2,
  Orbit,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import AstrophysicsCharts from './AstrophysicsCharts';
import {
  CATEGORY_CONFIG,
  ConstellationLink,
  getPlanetSpecForNode,
  MemoryNode,
} from '../lib/memory-types';
import { LanguageCode, UI_STRINGS } from '../lib/i18n';
import { MILKY_WAY_I18N } from '../lib/milky-way-i18n';
import { getLocalizedNode } from '../lib/celestial-translations';
import { getScientificAstrometry } from '../lib/scientific-catalog';

interface MemoryDetailDrawerProps {
  selectedId: string | null;
  memory: MemoryNode | null;
  allMemories: MemoryNode[];
  links: ConstellationLink[];
  onClose: () => void;
  onSelectNode: (id: string) => void;
  onSelectTag: (tag: string) => void;
  onDeleteNode: (id: string) => void;
  lang: LanguageCode;
  hiddenInCinemaMode?: boolean;
}

const DIAMETER_LABEL: Record<LanguageCode, string> = {
  vi: 'Đường kính thực (NASA)',
  en: 'Actual Diameter (NASA)',
  ja: '実直径 (NASA)',
  zh: '实际直径 (NASA)',
  ko: '실제 지름 (NASA)',
};

const ASTRO_LABELS: Record<
  LanguageCode,
  {
    heading: string;
    gaiaCoords: string;
    distSun: string;
    heliocentricAu: string;
    mass: string;
    period: string;
    spectral: string;
    source: string;
  }
> = {
  vi: {
    heading: 'Trắc lượng học ESA Gaia DR3 & NASA JPL',
    gaiaCoords: 'Tọa độ Thiên hà (l, b)',
    distSun: 'Khoảng cách từ Mặt Trời',
    heliocentricAu: 'Quỹ đạo Nhật tâm (Cận – Viễn nhật)',
    mass: 'Khối lượng',
    period: 'Chu kỳ quỹ đạo / Tự quay',
    spectral: 'Phân loại Quang phổ',
    source: 'Nguồn công bố',
  },
  en: {
    heading: 'ESA Gaia DR3 & NASA JPL Astrometry',
    gaiaCoords: 'Galactic Coordinates (l, b)',
    distSun: 'Distance from Sun',
    heliocentricAu: 'Heliocentric Orbit (Peri – Aph)',
    mass: 'Mass',
    period: 'Orbital / Spin Period',
    spectral: 'Spectral / Object Class',
    source: 'Published Source',
  },
  ja: {
    heading: 'ESA Gaia DR3・NASA JPL 位置天文学データ',
    gaiaCoords: '銀経・銀緯 (l, b)',
    distSun: '太陽からの距離',
    heliocentricAu: '太陽周回軌道 (近日点〜遠日点)',
    mass: '質量',
    period: '公転・自転周期',
    spectral: 'スペクトル分類',
    source: '出典データ',
  },
  zh: {
    heading: 'ESA Gaia DR3 与 NASA JPL 天体测量数据',
    gaiaCoords: '银道坐标 (l, b)',
    distSun: '距太阳距离',
    heliocentricAu: '日心轨道 (近日点 – 远日点)',
    mass: '质量',
    period: '公转 / 自转周期',
    spectral: '光谱 / 天体类型',
    source: '文献数据来源',
  },
  ko: {
    heading: 'ESA Gaia DR3 · NASA JPL 위치천문학 데이터',
    gaiaCoords: '은하 좌표 (l, b)',
    distSun: '태양으로부터의 거리',
    heliocentricAu: '태양 중심 궤도 (근일점–원일점)',
    mass: '질량',
    period: '공전 / 자전 주기',
    spectral: '분광형 / 천체 분류',
    source: '공식 출처',
  },
};

export default function MemoryDetailDrawer({
  selectedId,
  memory,
  allMemories,
  links,
  onClose,
  onSelectNode,
  onSelectTag,
  onDeleteNode,
  lang,
  hiddenInCinemaMode = false,
}: MemoryDetailDrawerProps) {
  const [activeBhId, setActiveBhId] = useState<string>('sgr-a');
  const t = UI_STRINGS[lang];
  const mw = MILKY_WAY_I18N[lang];

  if (hiddenInCinemaMode) return null;

  // ===========================================================================
  // MODE 1: NASA MILKY WAY & SAGITTARIUS A* GALACTIC CORE INSPECTOR
  // ===========================================================================
  if (selectedId === 'BLACK_HOLE_CORE') {
    const activeBh =
      t.famousBlackHoles.find((b) => b.id === activeBhId) ||
      t.famousBlackHoles[0];
    const innerOrbitPlanets = [...allMemories]
      .sort((a, b) => a.orbitRadius - b.orbitRadius)
      .slice(0, 5);

    return (
      <aside
        aria-label={t.bhHeadline}
        data-testid="memory-detail-drawer"
        className="absolute top-[84px] right-3 bottom-[96px] z-30 w-[calc(100%-24px)] md:w-[396px] rounded-[4px] bg-[#0a0c10]/95 border border-white/[0.11] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="px-4 pt-3.5 pb-3 border-b border-white/[0.09] flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.06em] text-[#E88B38]">
              <CircleDot className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{t.bhBadge}</span>
            </div>
            <h2 className="text-[15px] font-semibold tracking-[-0.015em] text-[#ECEAE4] leading-snug">
              {t.bhHeadline}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeInspector}
            className="p-1 rounded-[2px] text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.06] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-4">
          {/* NASA Milky Way Barred Spiral Architecture */}
          <section className="space-y-2.5">
            <div className="space-y-0.5">
              <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-[#E88B38]">
                {mw.nasaBadge}
              </p>
              <h3 className="text-[13px] font-semibold text-[#ECEAE4]">
                {mw.structureHeading}
              </h3>
              <p className="text-xs text-[#8A8D96] leading-relaxed">
                {mw.structureSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-2.5 border-t border-white/[0.08] text-xs">
              <div>
                <span className="text-[#6B707B] block text-[10px] font-mono uppercase">
                  {mw.typeLabel}
                </span>
                <span className="text-[#ECEAE4] font-medium">{mw.typeValue}</span>
              </div>
              <div>
                <span className="text-[#6B707B] block text-[10px] font-mono uppercase">
                  {mw.diameterLabel}
                </span>
                <span className="font-mono tabular-nums text-[#ECEAE4] font-semibold">
                  {mw.diameterValue}
                </span>
              </div>
              <div>
                <span className="text-[#6B707B] block text-[10px] font-mono uppercase">
                  {mw.starsLabel}
                </span>
                <span className="font-mono tabular-nums text-[#C8C6C0]">
                  {mw.starsValue}
                </span>
              </div>
              <div>
                <span className="text-[#6B707B] block text-[10px] font-mono uppercase">
                  {mw.barLabel}
                </span>
                <span className="font-mono tabular-nums text-[#C8C6C0]">
                  {mw.barValue}
                </span>
              </div>
              <div>
                <span className="text-[#6B707B] block text-[10px] font-mono uppercase">
                  {mw.sunDistanceLabel}
                </span>
                <span className="font-mono tabular-nums text-[#E88B38] font-medium">
                  {mw.sunDistanceValue}
                </span>
              </div>
              <div>
                <span className="text-[#6B707B] block text-[10px] font-mono uppercase">
                  {mw.galacticYearLabel}
                </span>
                <span className="font-mono tabular-nums text-[#C8C6C0]">
                  {mw.galacticYearValue}
                </span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-white/[0.08] space-y-1.5">
              <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-[#8A8D96]">
                {mw.armsHeading}
              </p>
              <div className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
                {mw.arms.map((arm) => (
                  <div key={arm.id} className="py-2 space-y-0.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#ECEAE4]">{arm.name}</span>
                      <span
                        className={`text-[10px] font-mono shrink-0 ${
                          arm.id === 'orion-spur' ? 'text-[#E88B38]' : 'text-[#8A8D96]'
                        }`}
                      >
                        {arm.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8A8D96] leading-relaxed">
                      {arm.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-[#6B707B]">{mw.zeroEnvNote}</p>
          </section>

          {/* Interactive Real Black Hole Comparison Switcher */}
          <section className="pt-3 border-t border-white/[0.08] space-y-2.5">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.06em] text-[#8A8D96]">
              {t.bhCompareLabel}
            </h3>
            <div className="grid grid-cols-2 gap-1">
              {t.famousBlackHoles.map((bh) => {
                const isActive = bh.id === activeBh.id;
                return (
                  <button
                    key={bh.id}
                    type="button"
                    onClick={() => setActiveBhId(bh.id)}
                    className={`px-2.5 py-1.5 rounded-[2px] text-left text-xs font-medium border transition-colors truncate ${
                      isActive
                        ? 'bg-[#E88B38]/15 border-[#E88B38]/50 text-[#E88B38] font-semibold'
                        : 'bg-[#07090d] hover:bg-white/[0.05] border-white/[0.08] text-[#C8C6C0]'
                    }`}
                  >
                    {bh.name.split(' (')[0]}
                  </button>
                );
              })}
            </div>

            <div className="rounded-[4px] bg-[#06080c] border border-white/[0.08] p-3 space-y-2.5">
              <div>
                <p className="text-[13px] font-semibold text-[#ECEAE4]">{activeBh.name}</p>
                <p className="text-[11px] font-mono text-[#8A8D96]">{activeBh.galaxy}</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/[0.07] text-xs">
                <div>
                  <span className="text-[#6B707B] block text-[10px] font-mono">
                    {t.bhMassLabel}
                  </span>
                  <span className="font-mono tabular-nums text-[#ECEAE4] font-semibold">
                    {activeBh.massSolar}
                  </span>
                </div>
                <div>
                  <span className="text-[#6B707B] block text-[10px] font-mono">
                    {t.bhHorizonLabel}
                  </span>
                  <span className="font-mono tabular-nums text-[#C8C6C0]">
                    {activeBh.eventHorizonRadius}
                  </span>
                </div>
                <div>
                  <span className="text-[#6B707B] block text-[10px] font-mono">
                    {t.bhSpinLabel}
                  </span>
                  <span className="font-mono tabular-nums text-[#E88B38]">
                    {activeBh.spinParameter}
                  </span>
                </div>
                <div>
                  <span className="text-[#6B707B] block text-[10px] font-mono">
                    {t.bhDistanceLabel}
                  </span>
                  <span className="font-mono tabular-nums text-[#C8C6C0]">
                    {activeBh.distanceFromEarth}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#8A8D96] leading-relaxed pt-2 border-t border-white/[0.07]">
                {activeBh.highlightFact}
              </p>
            </div>
          </section>

          {/* 4-Layer Optical Anatomy */}
          <section className="pt-3 border-t border-white/[0.08] space-y-2">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.06em] text-[#8A8D96]">
              {t.bhAnatomyHeading}
            </h3>
            <div className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
              {t.blackHoleAnatomy.map((part) => (
                <div key={part.code} className="py-2 space-y-0.5">
                  <p className="text-xs font-semibold text-[#ECEAE4]">
                    <span className="font-mono text-[#E88B38] mr-1.5">{part.code}.</span>
                    {part.title}
                  </p>
                  <p className="text-xs text-[#8A8D96] leading-relaxed">{part.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Closest Orbiting Worlds */}
          <section className="pt-3 border-t border-white/[0.08] space-y-2">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.06em] text-[#8A8D96]">
              {t.bhInnerPlanetsHeading}
            </h3>
            <div className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
              {innerOrbitPlanets.map((rawPlanet) => {
                const planet = getLocalizedNode(rawPlanet, lang);
                const meta =
                  CATEGORY_CONFIG[rawPlanet.category] ||
                  CATEGORY_CONFIG['Hố đen & Hiện tượng Thiên hà'];
                return (
                  <button
                    key={rawPlanet.id}
                    type="button"
                    onClick={() => onSelectNode(rawPlanet.id)}
                    className="w-full text-left py-2 hover:bg-white/[0.04] px-1.5 flex items-center justify-between gap-2 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#ECEAE4] truncate">
                        {planet.title}
                      </p>
                      <p className="text-[10px] font-mono text-[#8A8D96] truncate">
                        {t.categories[rawPlanet.category]?.shortLabel || meta.shortLabel}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono tabular-nums text-[#E88B38] shrink-0">
                      {rawPlanet.orbitRadius.toFixed(1)} AU →
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </aside>
    );
  }

  // ===========================================================================
  // MODE 2: NASA PLANET / STAR / EXOPLANET ASTROPHYSICAL INSPECTOR
  // ===========================================================================
  if (!memory) return null;

  const localized = getLocalizedNode(memory, lang);
  const catMeta =
    CATEGORY_CONFIG[memory.category] ||
    CATEGORY_CONFIG['Hố đen & Hiện tượng Thiên hà'];
  const catLabel = t.categories[memory.category]?.label || catMeta.label;
  const planetSpec = getPlanetSpecForNode(memory);
  const specOverride = t.planetSpecOverrides[planetSpec.designation];
  const astrometry = getScientificAstrometry(memory.id, planetSpec.earthRadiusRatio);
  const astroCopy = ASTRO_LABELS[lang];

  const connectedNodes = links
    .filter((l) => l.sourceId === memory.id || l.targetId === memory.id)
    .map((l) => {
      const otherId = l.sourceId === memory.id ? l.targetId : l.sourceId;
      const otherNode = allMemories.find((m) => m.id === otherId);
      return otherNode ? { node: otherNode, sharedTags: l.sharedTags } : null;
    })
    .filter(
      (item): item is { node: MemoryNode; sharedTags: string[] } => item !== null
    )
    .slice(0, 6);

  return (
    <aside
      aria-label={localized.title}
      data-testid="memory-detail-drawer"
      className="absolute top-[84px] right-3 bottom-[96px] z-30 w-[calc(100%-24px)] md:w-[396px] rounded-[4px] bg-[#0a0c10]/95 border border-white/[0.11] flex flex-col overflow-hidden shadow-2xl"
    >
      {/* Header */}
      <div className="px-4 pt-3.5 pb-3 border-b border-white/[0.09] flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.05em] text-[#8A8D96]">
            <span className="text-[#E88B38] truncate">{catLabel}</span>
            <span aria-hidden="true">/</span>
            <span className="shrink-0">{specOverride?.designation || planetSpec.designation}</span>
          </div>
          <h2 className="text-[15px] font-semibold tracking-[-0.015em] text-[#ECEAE4] leading-snug">
            {localized.title}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label={t.closeInspector}
          className="p-1 rounded-[2px] text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.06] transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-4">
        {/* Physical Telemetry Grid (flat instrument readout, hairline dividers) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.06em] text-[#ECEAE4]">
              <Globe2 className="w-3.5 h-3.5 text-[#E88B38] shrink-0" />
              <span>{t.planetSpecsHeading}</span>
            </div>
            <span className="text-[10px] font-mono text-[#6B707B]">{localized.createdAt}</span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs border-t border-white/[0.08] pt-2.5">
            <div className="col-span-2">
              <span className="text-[#6B707B] block text-[10px] font-mono uppercase">
                {DIAMETER_LABEL[lang]}
              </span>
              <span
                data-testid="planet-diameter-value"
                className="font-mono tabular-nums text-[13px] font-semibold text-[#E88B38]"
              >
                {planetSpec.diameterKm}
              </span>
            </div>

            <div className="col-span-2">
              <span className="text-[#6B707B] block text-[10px] font-mono uppercase">
                {t.planetClassLabel}
              </span>
              <span className="text-[#ECEAE4] font-medium">
                {specOverride?.planetType || planetSpec.planetTypeVi}
              </span>
            </div>

            <div>
              <span className="text-[#6B707B] block text-[10px] font-mono uppercase">
                {t.planetTempLabel}
              </span>
              <span className="font-mono tabular-nums text-[#ECEAE4] font-medium">
                {planetSpec.surfaceTemp}
              </span>
            </div>

            <div>
              <span className="text-[#6B707B] block text-[10px] font-mono uppercase">
                {t.planetGravityLabel}
              </span>
              <span className="font-mono tabular-nums text-[#ECEAE4] font-medium">
                {planetSpec.surfaceGravity}
              </span>
            </div>

            <div className="col-span-2">
              <span className="text-[#6B707B] block text-[10px] font-mono uppercase">
                {t.planetAtmoLabel}
              </span>
              <span className="text-[#C8C6C0]">
                {specOverride?.atmosphereComposition || planetSpec.atmosphereComposition}
              </span>
            </div>

            <div>
              <span className="text-[#6B707B] block text-[10px] font-mono uppercase">
                {t.planetRingsLabel}
              </span>
              <span className="text-[#C8C6C0]">
                {planetSpec.hasRings ? t.planetRingsYes : t.planetRingsNo}
              </span>
            </div>

            <div>
              <span className="text-[#6B707B] block text-[10px] font-mono uppercase">
                {t.planetOrbitLabel}
              </span>
              <span className="font-mono tabular-nums text-[#C8C6C0]">
                {astrometry.semiMajorAxisAu
                  ? `${astrometry.semiMajorAxisAu} AU`
                  : `${memory.orbitRadius.toFixed(1)} AU`}
              </span>
            </div>
          </div>

          {/* ESA Gaia DR3 & NASA JPL Astrometry Sub-Block */}
          <div
            data-testid="scientific-astrometry-card"
            className="pt-3 border-t border-white/[0.08] space-y-2"
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-[#E88B38]">
              {astroCopy.heading}
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
              <div>
                <span className="text-[#6B707B] block text-[10px] font-mono">
                  {astroCopy.gaiaCoords}
                </span>
                <span className="font-mono tabular-nums text-[#ECEAE4]">
                  l {astrometry.galacticLonDeg.toFixed(2)}° · b{' '}
                  {astrometry.galacticLatDeg >= 0 ? '+' : ''}
                  {astrometry.galacticLatDeg.toFixed(2)}°
                </span>
              </div>

              <div>
                <span className="text-[#6B707B] block text-[10px] font-mono">
                  {astroCopy.distSun}
                </span>
                <span className="font-mono tabular-nums text-[#ECEAE4]">
                  {astrometry.distanceFromSunLy >= 0.01
                    ? `${astrometry.distanceFromSunLy.toLocaleString()} ly`
                    : astrometry.semiMajorAxisAu
                      ? `${astrometry.semiMajorAxisAu} AU`
                      : '0.00 ly (Sol)'}
                </span>
              </div>

              <div>
                <span className="text-[#6B707B] block text-[10px] font-mono">
                  {astroCopy.mass}
                </span>
                <span className="font-mono tabular-nums text-[#C8C6C0]">
                  {astrometry.massLabel}
                </span>
              </div>

              <div>
                <span className="text-[#6B707B] block text-[10px] font-mono">
                  {astroCopy.period}
                </span>
                <span className="font-mono text-[#C8C6C0]">
                  {astrometry.orbitalPeriodLabel}
                </span>
              </div>

              <div className="col-span-2">
                <span className="text-[#6B707B] block text-[10px] font-mono">
                  {astroCopy.spectral}
                </span>
                <span className="text-[#ECEAE4] font-medium">
                  {astrometry.spectralOrType}
                </span>
              </div>

              <div className="col-span-2 pt-1 border-t border-white/[0.06]">
                <span className="text-[10px] font-mono text-[#6B707B]">
                  {astroCopy.source}:{' '}
                </span>
                <span className="text-[10px] font-mono text-[#8A8D96]">
                  {astrometry.sourceCitation}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Precision Astrophysics Diagrams: H-R Diagram, Planck Blackbody Spectrum, Interior Cross-Section */}
        <AstrophysicsCharts
          nodeId={memory.id}
          title={localized.title}
          planetSpec={planetSpec}
          astrometry={astrometry}
          lang={lang}
        />

        {/* 3 Core Scientific Highlights */}
        <section className="space-y-2 pt-3 border-t border-white/[0.08]">
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.06em] text-[#ECEAE4]">
            <Sparkles className="w-3.5 h-3.5 text-[#E88B38]" />
            <span>{t.planetKeyFindings}</span>
          </div>
          <ul className="space-y-1.5">
            {localized.summary.map((bullet, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-[12px] text-[#C8C6C0] leading-relaxed"
              >
                <span className="font-mono text-[11px] text-[#E88B38] mt-0.5 shrink-0">
                  0{idx + 1}.
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Detailed Scientific Overview */}
        <section className="space-y-1.5 pt-3 border-t border-white/[0.08]">
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.06em] text-[#8A8D96]">
            <Compass className="w-3.5 h-3.5" />
            <span>{t.planetOverviewHeading}</span>
          </div>
          <p className="text-[12px] text-[#9A9DA6] leading-relaxed whitespace-pre-line">
            {localized.content}
          </p>
        </section>

        {/* Spectral Tags */}
        <section className="space-y-2 pt-3 border-t border-white/[0.08]">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.06em] text-[#8A8D96]">
            {t.planetTagsHeading}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {memory.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSelectTag(tag)}
                className="px-2 py-0.5 rounded-[2px] bg-[#06080c] hover:bg-white/[0.07] border border-white/[0.09] text-[11px] font-mono text-[#C8C6C0] hover:text-[#E88B38] transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </section>

        {/* Related Celestial Objects */}
        {connectedNodes.length > 0 && (
          <section className="space-y-2 pt-3 border-t border-white/[0.08]">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.06em] text-[#8A8D96]">
              <Orbit className="w-3.5 h-3.5" />
              <span>
                {t.planetRelatedHeading} ({connectedNodes.length})
              </span>
            </div>
            <div className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
              {connectedNodes.map(({ node: rawNode }) => {
                const rel = getLocalizedNode(rawNode, lang);
                const meta =
                  CATEGORY_CONFIG[rawNode.category] ||
                  CATEGORY_CONFIG['Hố đen & Hiện tượng Thiên hà'];
                return (
                  <button
                    key={rawNode.id}
                    type="button"
                    onClick={() => onSelectNode(rawNode.id)}
                    className="w-full text-left py-2 px-1.5 hover:bg-white/[0.04] flex items-center justify-between gap-2 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#ECEAE4] truncate">
                        {rel.title}
                      </p>
                      <p className="text-[10px] font-mono text-[#8A8D96] truncate">
                        {t.categories[rawNode.category]?.shortLabel || meta.shortLabel}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-[#E88B38] shrink-0">→</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-white/[0.09] flex items-center justify-between bg-[#07090d]">
        <button
          type="button"
          onClick={() => onDeleteNode(memory.id)}
          className="inline-flex items-center gap-1.5 text-[11px] font-mono text-rose-400/90 hover:text-rose-300 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          <span>{t.deleteObjectBtn}</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="px-2.5 py-1 rounded-[2px] bg-white/[0.06] hover:bg-white/[0.11] border border-white/[0.09] text-[11px] font-mono text-[#ECEAE4] transition-colors"
        >
          {t.closeInspector}
        </button>
      </div>
    </aside>
  );
}
