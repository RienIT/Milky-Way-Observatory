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
}: MemoryDetailDrawerProps) {
  const [activeBhId, setActiveBhId] = useState<string>('sgr-a');
  const t = UI_STRINGS[lang];
  const mw = MILKY_WAY_I18N[lang];

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
        className="relative z-20 w-full md:w-[412px] shrink-0 h-full bg-[#111318] border-l border-white/[0.08] flex flex-col overflow-hidden"
      >
        {/* Astryx Drawer Header */}
        <div className="px-5 pt-4 pb-3.5 border-b border-white/[0.08] flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-[#54a8ff]">
              <CircleDot className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" />
              <span className="font-semibold truncate">{t.bhBadge}</span>
            </div>
            <h2 className="text-[15px] font-semibold tracking-[-0.015em] text-[#f3f4f6] leading-snug">
              {t.bhHeadline}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeInspector}
            className="p-1.5 rounded-[8px] text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#181b22] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* NASA Milky Way Barred Spiral Architecture Section */}
          <section className="rounded-[12px] bg-[#161922] border border-white/[0.08] p-4 space-y-3">
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-[#54a8ff]">
                {mw.nasaBadge}
              </p>
              <h3 className="text-sm font-semibold text-[#f3f4f6]">
                {mw.structureHeading}
              </h3>
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                {mw.structureSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.08] text-xs">
              <div>
                <span className="text-[#6b7280] block text-[11px]">
                  {mw.typeLabel}
                </span>
                <span className="text-[#f3f4f6] font-medium">
                  {mw.typeValue}
                </span>
              </div>
              <div>
                <span className="text-[#6b7280] block text-[11px]">
                  {mw.diameterLabel}
                </span>
                <span className="font-mono tabular-nums text-[#f3f4f6] font-semibold">
                  {mw.diameterValue}
                </span>
              </div>
              <div>
                <span className="text-[#6b7280] block text-[11px]">
                  {mw.starsLabel}
                </span>
                <span className="font-mono tabular-nums text-[#d1d5db]">
                  {mw.starsValue}
                </span>
              </div>
              <div>
                <span className="text-[#6b7280] block text-[11px]">
                  {mw.barLabel}
                </span>
                <span className="font-mono tabular-nums text-[#d1d5db]">
                  {mw.barValue}
                </span>
              </div>
              <div>
                <span className="text-[#6b7280] block text-[11px]">
                  {mw.sunDistanceLabel}
                </span>
                <span className="font-mono tabular-nums text-[#54a8ff] font-medium">
                  {mw.sunDistanceValue}
                </span>
              </div>
              <div>
                <span className="text-[#6b7280] block text-[11px]">
                  {mw.galacticYearLabel}
                </span>
                <span className="font-mono tabular-nums text-[#d1d5db]">
                  {mw.galacticYearValue}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] space-y-2">
              <p className="text-[11px] font-semibold text-[#9ca3af]">
                {mw.armsHeading}
              </p>
              <div className="space-y-1.5">
                {mw.arms.map((arm) => (
                  <div
                    key={arm.id}
                    className="rounded-[8px] bg-[#111318] border border-white/[0.06] px-3 py-2 space-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#f3f4f6]">
                        {arm.name}
                      </span>
                      <span
                        className={`text-[10px] font-medium shrink-0 ${
                          arm.id === 'orion-spur'
                            ? 'text-[#f59e0b]'
                            : 'text-[#54a8ff]'
                        }`}
                      >
                        {arm.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9ca3af] leading-relaxed">
                      {arm.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-[#6b7280] pt-2 border-t border-white/[0.08]">
              {mw.zeroEnvNote}
            </p>
          </section>

          {/* Interactive Real Black Hole Comparison Switcher */}
          <section className="space-y-2.5">
            <h3 className="text-xs font-semibold text-[#9ca3af]">
              {t.bhCompareLabel}
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {t.famousBlackHoles.map((bh) => {
                const isActive = bh.id === activeBh.id;
                return (
                  <button
                    key={bh.id}
                    type="button"
                    onClick={() => setActiveBhId(bh.id)}
                    className={`px-3 py-2 rounded-[8px] text-left text-xs font-medium border transition-colors truncate ${
                      isActive
                        ? 'bg-[#0082fb]/15 border-[#0082fb]/50 text-[#54a8ff] font-semibold'
                        : 'bg-[#161922] hover:bg-[#1c202b] border-white/[0.08] text-[#d1d5db]'
                    }`}
                  >
                    {bh.name.split(' (')[0]}
                  </button>
                );
              })}
            </div>

            <div className="rounded-[12px] bg-[#161922] border border-white/[0.08] p-3.5 space-y-2.5">
              <div>
                <p className="text-sm font-semibold text-[#f3f4f6]">
                  {activeBh.name}
                </p>
                <p className="text-xs text-[#9ca3af]">{activeBh.galaxy}</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-2.5 border-t border-white/[0.08] text-xs">
                <div>
                  <span className="text-[#6b7280] block text-[11px]">
                    {t.bhMassLabel}
                  </span>
                  <span className="font-mono tabular-nums text-[#f3f4f6] font-semibold">
                    {activeBh.massSolar}
                  </span>
                </div>
                <div>
                  <span className="text-[#6b7280] block text-[11px]">
                    {t.bhHorizonLabel}
                  </span>
                  <span className="font-mono tabular-nums text-[#d1d5db] font-medium">
                    {activeBh.eventHorizonRadius}
                  </span>
                </div>
                <div>
                  <span className="text-[#6b7280] block text-[11px]">
                    {t.bhSpinLabel}
                  </span>
                  <span className="font-mono tabular-nums text-[#54a8ff]">
                    {activeBh.spinParameter}
                  </span>
                </div>
                <div>
                  <span className="text-[#6b7280] block text-[11px]">
                    {t.bhDistanceLabel}
                  </span>
                  <span className="font-mono tabular-nums text-[#d1d5db]">
                    {activeBh.distanceFromEarth}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#9ca3af] leading-relaxed pt-2.5 border-t border-white/[0.08]">
                {activeBh.highlightFact}
              </p>
            </div>
          </section>

          {/* 4-Layer Optical Anatomy */}
          <section className="space-y-2.5">
            <h3 className="text-xs font-semibold text-[#9ca3af]">
              {t.bhAnatomyHeading}
            </h3>
            <div className="space-y-1.5">
              {t.blackHoleAnatomy.map((part) => (
                <div
                  key={part.code}
                  className="rounded-[10px] bg-[#161922] border border-white/[0.08] p-3 space-y-1"
                >
                  <p className="text-xs font-semibold text-[#f3f4f6]">
                    <span className="font-mono text-[#54a8ff] mr-1.5">
                      {part.code}.
                    </span>
                    {part.title}
                  </p>
                  <p className="text-xs text-[#9ca3af] leading-relaxed">
                    {part.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Closest Orbiting Worlds */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold text-[#9ca3af]">
              {t.bhInnerPlanetsHeading}
            </h3>
            <div className="space-y-1">
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
                    className="w-full text-left rounded-[8px] bg-[#161922] hover:bg-[#1c202b] border border-white/[0.08] px-3 py-2 flex items-center justify-between gap-2 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#f3f4f6] truncate">
                        {planet.title}
                      </p>
                      <p className={`text-[11px] truncate ${meta.textColorClass}`}>
                        {t.categories[rawPlanet.category]?.shortLabel ||
                          meta.shortLabel}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono tabular-nums text-[#54a8ff] shrink-0">
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
  // MODE 2: NASA PLANET / EXOPLANET ASTROPHYSICAL INSPECTOR
  // ===========================================================================
  if (!memory) return null;

  const localized = getLocalizedNode(memory, lang);
  const catMeta =
    CATEGORY_CONFIG[memory.category] ||
    CATEGORY_CONFIG['Hố đen & Hiện tượng Thiên hà'];
  const catLabel =
    t.categories[memory.category]?.label || catMeta.label;
  const planetSpec = getPlanetSpecForNode(memory);
  const specOverride = t.planetSpecOverrides[planetSpec.designation];
  const astrometry = getScientificAstrometry(
    memory.id,
    planetSpec.earthRadiusRatio
  );
  const astroCopy = ASTRO_LABELS[lang];

  const connectedNodes = links
    .filter((l) => l.sourceId === memory.id || l.targetId === memory.id)
    .map((l) => {
      const otherId = l.sourceId === memory.id ? l.targetId : l.sourceId;
      const otherNode = allMemories.find((m) => m.id === otherId);
      return otherNode ? { node: otherNode, sharedTags: l.sharedTags } : null;
    })
    .filter(
      (item): item is { node: MemoryNode; sharedTags: string[] } =>
        item !== null
    )
    .slice(0, 6);

  return (
    <aside
      aria-label={localized.title}
      data-testid="memory-detail-drawer"
      className="relative z-20 w-full md:w-[412px] shrink-0 h-full bg-[#111318] border-l border-white/[0.08] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-3.5 border-b border-white/[0.08] flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-[#6b7280]">
            <span className={`font-semibold truncate ${catMeta.textColorClass}`}>
              {catLabel}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px] shrink-0">
              {localized.createdAt}
            </span>
          </div>
          <h2 className="text-[16px] font-semibold tracking-[-0.015em] text-[#f3f4f6] leading-snug">
            {localized.title}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label={t.closeInspector}
          className="p-1.5 rounded-[8px] text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#181b22] transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* NASA Astrophysical Telemetry Card */}
        <section className="rounded-[12px] bg-[#161922] border border-white/[0.08] p-4 space-y-3">
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/[0.08]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#f3f4f6]">
              <Globe2 className="w-4 h-4 text-[#54a8ff] shrink-0" />
              <span>{t.planetSpecsHeading}</span>
            </div>
            <span className="text-[11px] font-mono text-[#9ca3af] truncate">
              {specOverride?.designation || planetSpec.designation}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs">
            <div className="col-span-2">
              <span className="text-[#6b7280] block text-[11px]">
                {DIAMETER_LABEL[lang]}
              </span>
              <span
                data-testid="planet-diameter-value"
                className="font-mono tabular-nums text-[13px] font-semibold text-[#54a8ff]"
              >
                {planetSpec.diameterKm}
              </span>
            </div>

            <div className="col-span-2">
              <span className="text-[#6b7280] block text-[11px]">
                {t.planetClassLabel}
              </span>
              <span className="text-[#f3f4f6] font-medium">
                {specOverride?.planetType || planetSpec.planetTypeVi}
              </span>
            </div>

            <div className="col-span-2">
              <span className="text-[#6b7280] block text-[11px]">
                {t.planetInspirationLabel}
              </span>
              <span className="text-[#d1d5db]">
                {specOverride?.realInspiration || planetSpec.realInspiration}
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
              <span className="font-mono tabular-nums text-[#f3f4f6] font-medium">
                {planetSpec.surfaceGravity}
              </span>
            </div>

            <div className="col-span-2">
              <span className="text-[#6b7280] block text-[11px]">
                {t.planetAtmoLabel}
              </span>
              <span className="text-[#d1d5db]">
                {specOverride?.atmosphereComposition ||
                  planetSpec.atmosphereComposition}
              </span>
            </div>

            <div>
              <span className="text-[#6b7280] block text-[11px]">
                {t.planetRingsLabel}
              </span>
              <span className="text-[#d1d5db]">
                {planetSpec.hasRings ? t.planetRingsYes : t.planetRingsNo}
              </span>
            </div>

            <div>
              <span className="text-[#6b7280] block text-[11px]">
                {t.planetOrbitLabel}
              </span>
              <span className="font-mono tabular-nums text-[#d1d5db]">
                {astrometry.semiMajorAxisAu
                  ? `${astrometry.semiMajorAxisAu} AU`
                  : `${memory.orbitRadius.toFixed(1)} AU`}
              </span>
            </div>
          </div>

          {/* ESA Gaia DR3 & NASA JPL Astrometry Sub-Block */}
          <div
            data-testid="scientific-astrometry-card"
            className="pt-3 border-t border-white/[0.08] space-y-2.5"
          >
            <p className="text-[11px] font-semibold text-[#54a8ff]">
              {astroCopy.heading}
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
              <div>
                <span className="text-[#6b7280] block text-[10px]">
                  {astroCopy.gaiaCoords}
                </span>
                <span className="font-mono tabular-nums text-[#f3f4f6]">
                  l {astrometry.galacticLonDeg.toFixed(2)}° · b{' '}
                  {astrometry.galacticLatDeg >= 0 ? '+' : ''}
                  {astrometry.galacticLatDeg.toFixed(2)}°
                </span>
              </div>

              <div>
                <span className="text-[#6b7280] block text-[10px]">
                  {astroCopy.distSun}
                </span>
                <span className="font-mono tabular-nums text-[#f3f4f6]">
                  {astrometry.distanceFromSunLy >= 0.01
                    ? `${astrometry.distanceFromSunLy.toLocaleString()} ly`
                    : astrometry.semiMajorAxisAu
                      ? `${astrometry.semiMajorAxisAu} AU`
                      : '0.00 ly (Sol)'}
                </span>
              </div>

              {astrometry.semiMajorAxisAu !== undefined && (
                <div className="col-span-2">
                  <span className="text-[#6b7280] block text-[10px]">
                    {astroCopy.heliocentricAu}
                  </span>
                  <span className="font-mono tabular-nums text-[#d1d5db]">
                    a = {astrometry.semiMajorAxisAu} AU
                    {astrometry.perihelionAu !== undefined &&
                    astrometry.aphelionAu !== undefined
                      ? ` (${astrometry.perihelionAu} – ${astrometry.aphelionAu} AU)`
                      : ''}
                  </span>
                </div>
              )}

              <div>
                <span className="text-[#6b7280] block text-[10px]">
                  {astroCopy.mass}
                </span>
                <span className="font-mono tabular-nums text-[#d1d5db]">
                  {astrometry.massLabel}
                </span>
              </div>

              <div>
                <span className="text-[#6b7280] block text-[10px]">
                  {astroCopy.period}
                </span>
                <span className="font-mono text-[#d1d5db]">
                  {astrometry.orbitalPeriodLabel}
                </span>
              </div>

              <div className="col-span-2">
                <span className="text-[#6b7280] block text-[10px]">
                  {astroCopy.spectral}
                </span>
                <span className="text-[#e5e7eb] font-medium">
                  {astrometry.spectralOrType}
                </span>
              </div>

              <div className="col-span-2 pt-1.5 border-t border-white/[0.06]">
                <span className="text-[10px] text-[#6b7280]">
                  {astroCopy.source}:{' '}
                </span>
                <span className="text-[11px] font-mono text-[#9ca3af]">
                  {astrometry.sourceCitation}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core Scientific Highlights */}
        <section className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#f3f4f6]">
            <Sparkles className="w-3.5 h-3.5 text-[#54a8ff]" />
            <span>{t.planetKeyFindings}</span>
          </div>
          <ul className="space-y-2">
            {localized.summary.map((bullet, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-[13px] text-[#d1d5db] leading-relaxed"
              >
                <span className="font-mono text-xs text-[#54a8ff] mt-0.5 shrink-0">
                  0{idx + 1}.
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Detailed Scientific Overview */}
        <section className="space-y-1.5 pt-3 border-t border-white/[0.08]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#9ca3af]">
            <Compass className="w-3.5 h-3.5" />
            <span>{t.planetOverviewHeading}</span>
          </div>
          <p className="text-[13px] text-[#9ca3af] leading-relaxed whitespace-pre-line">
            {localized.content}
          </p>
        </section>

        {/* Spectral Tags */}
        <section className="space-y-2 pt-3 border-t border-white/[0.08]">
          <h3 className="text-xs font-semibold text-[#9ca3af]">
            {t.planetTagsHeading}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {memory.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSelectTag(tag)}
                className="px-2.5 py-1 rounded-[6px] bg-[#161922] hover:bg-[#1f232c] border border-white/[0.08] text-xs font-mono text-[#54a8ff] transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </section>

        {/* Related Celestial Objects */}
        {connectedNodes.length > 0 && (
          <section className="space-y-2 pt-3 border-t border-white/[0.08]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#9ca3af]">
              <Orbit className="w-3.5 h-3.5" />
              <span>
                {t.planetRelatedHeading} ({connectedNodes.length})
              </span>
            </div>
            <div className="space-y-1">
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
                    className="w-full text-left rounded-[8px] bg-[#161922] hover:bg-[#1c202b] border border-white/[0.08] px-3 py-2 flex items-center justify-between gap-2 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#f3f4f6] truncate">
                        {rel.title}
                      </p>
                      <p className={`text-[11px] truncate ${meta.textColorClass}`}>
                        {t.categories[rawNode.category]?.shortLabel ||
                          meta.shortLabel}
                      </p>
                    </div>
                    <span className="text-xs text-[#54a8ff] shrink-0">→</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/[0.08] flex items-center justify-between bg-[#0e1015]">
        <button
          type="button"
          onClick={() => onDeleteNode(memory.id)}
          className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t.deleteObjectBtn}</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 rounded-[8px] bg-[#181b22] hover:bg-[#222631] border border-white/[0.08] text-xs font-medium text-[#f3f4f6] transition-colors"
        >
          {t.closeInspector}
        </button>
      </div>
    </aside>
  );
}
