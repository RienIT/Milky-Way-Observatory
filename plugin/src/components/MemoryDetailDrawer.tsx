'use client';

import React, { useState } from 'react';
import { Button, Card, Separator } from '@heroui/react';
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
import SunsetStripeBand from './SunsetStripeBand';
import {
  CATEGORY_CONFIG,
  ConstellationLink,
  MemoryNode,
} from '../lib/memory-types';
import { LanguageCode, UI_STRINGS } from '../lib/i18n';
import { MILKY_WAY_I18N } from '../lib/milky-way-i18n';
import { getLocalizedNode } from '../lib/celestial-translations';
import {
  getLocalizedOrbitalPeriod,
  getLocalizedPlanetSpec,
  OBSERVATORY_EXTRA_COPY,
} from '../lib/localized-telemetry';
import { getScientificAstrometry } from '../lib/scientific-catalog';
import { getMilkyWayLandmarkById } from '../lib/milky-way-landmarks';
import { EXTRAGALACTIC_CATALOG } from '../lib/extragalactic-catalog';

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

const LANDMARK_UI_COPY: Record<
  LanguageCode,
  {
    galCenterDist: string;
    diameter: string;
    region: string;
    population: string;
    coordinates: string;
    equatorialCoords: string;
    morphology: string;
    mass: string;
    backToMilkyWay: string;
    extragalacticBadge: string;
  }
> = {
  en: {
    galCenterDist: 'Distance from Sgr A*',
    diameter: 'Physical Span',
    region: 'Galactic Region',
    population: 'Stellar Population / Mass',
    coordinates: 'Galactic Coords (l, b)',
    equatorialCoords: 'Equatorial J2000 (RA, Dec)',
    morphology: 'Morphology',
    mass: 'Estimated Mass',
    backToMilkyWay: 'Close inspector',
    extragalacticBadge: 'Extragalactic Catalog · Measured Astrometry',
  },
  vi: {
    galCenterDist: 'Khoảng cách tới Sgr A*',
    diameter: 'Đường kính vật lý',
    region: 'Vùng trong Ngân Hà',
    population: 'Quần thể sao / Khối lượng',
    coordinates: 'Tọa độ Thiên hà (l, b)',
    equatorialCoords: 'Tọa độ Xích đạo J2000 (RA, Dec)',
    morphology: 'Hình thái thiên hà',
    mass: 'Khối lượng ước tính',
    backToMilkyWay: 'Đóng bảng thông tin',
    extragalacticBadge: 'Danh mục Ngoài Ngân Hà · Đo đạc thực',
  },
  ja: {
    galCenterDist: '銀心 (Sgr A*) からの距離',
    diameter: '物理直径',
    region: '銀河領域',
    population: '恒星数・質量',
    coordinates: '銀経・銀緯 (l, b)',
    equatorialCoords: '赤道座標 J2000 (RA, Dec)',
    morphology: '銀河形態',
    mass: '推定質量',
    backToMilkyWay: 'インスペクターを閉じる',
    extragalacticBadge: '銀河外カタログ・実測位置',
  },
  zh: {
    galCenterDist: '距银心 (Sgr A*) 距离',
    diameter: '物理尺度',
    region: '银河区域',
    population: '恒星数量 / 质量',
    coordinates: '银道坐标 (l, b)',
    equatorialCoords: '赤道坐标 J2000 (RA, Dec)',
    morphology: '星系形态',
    mass: '估算质量',
    backToMilkyWay: '关闭详情面板',
    extragalacticBadge: '河外星系目录 · 实测天体测量',
  },
  ko: {
    galCenterDist: '은하 중심(Sgr A*) 거리',
    diameter: '물리적 크기',
    region: '은하 영역',
    population: '항성 수 / 질량',
    coordinates: '은하 좌표 (l, b)',
    equatorialCoords: '적도 좌표 J2000 (RA, Dec)',
    morphology: '은하 형태',
    mass: '추정 질량',
    backToMilkyWay: '패널 닫기',
    extragalacticBadge: '외부은하 목록 · 실측 위치천문학',
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
  const extra = OBSERVATORY_EXTRA_COPY[lang];

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
        className="absolute inset-x-3 top-[60px] bottom-[152px] @[680px]/obs:left-auto @[680px]/obs:right-3 @[680px]/obs:top-[146px] @[680px]/obs:bottom-[124px] @[680px]/obs:w-[min(396px,calc(100%-24px))] @[1220px]/obs:top-[96px] @[1220px]/obs:w-[396px] z-35 flex flex-col overflow-hidden"
      >
        <Card className="h-full rounded-[12px] bg-[#141416]/95 border border-[#FFF8E7]/14 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.5)] p-0 flex flex-col overflow-hidden">
          <SunsetStripeBand variant="hairline" />
          <Card.Content className="p-0 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-4 pt-4 pb-3.5 border-b border-[#FFF8E7]/10 flex items-start justify-between gap-3 shrink-0">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.06em] text-[#FFAF00]">
                  <CircleDot className="w-3.5 h-3.5 text-[#FA500F] shrink-0" />
                  <span className="truncate">{t.bhBadge}</span>
                </div>
                <h2 className="font-display text-[20px] font-normal tracking-[-0.015em] text-[#FFF8E7] leading-snug">
                  {t.bhHeadline}
                </h2>
              </div>

              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                onPress={onClose}
                aria-label={t.closeInspector}
                className="w-7 h-7 min-w-7 rounded-[8px] p-0 text-[#A19F99] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.08] shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-4">
              {/* NASA Milky Way Barred Spiral Architecture */}
              <section className="space-y-2.5">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-[#FA500F]">
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
                    <span className="font-mono tabular-nums text-[#FA500F] font-medium">
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
                              arm.id === 'orion-spur' ? 'text-[#FA500F]' : 'text-[#8A8D96]'
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

              <Separator className="bg-white/[0.08]" />

              {/* Interactive Real Black Hole Comparison Switcher */}
              <section className="space-y-2.5">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.06em] text-[#8A8D96]">
                  {t.bhCompareLabel}
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {t.famousBlackHoles.map((bh) => {
                    const isActive = bh.id === activeBh.id;
                    return (
                      <Button
                        key={bh.id}
                        size="sm"
                        fullWidth
                        variant="outline"
                        onPress={() => setActiveBhId(bh.id)}
                        className={`w-full h-7 min-w-0 max-w-full overflow-hidden rounded-[8px] justify-start px-2.5 text-xs font-medium ${
                          isActive
                            ? 'bg-[#FA500F] border-[#FA500F] text-[#FFFFFF] font-semibold'
                            : 'bg-[#101012] hover:bg-white/[0.05] border-white/[0.08] text-[#C8C6C0]'
                        }`}
                      >
                        <span className="truncate">{bh.name.split(' (')[0]}</span>
                      </Button>
                    );
                  })}
                </div>

                <div className="rounded-[8px] bg-[#101012] border border-white/[0.08] p-3 space-y-2.5">
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
                      <span className="font-mono tabular-nums text-[#FA500F]">
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

              <Separator className="bg-white/[0.08]" />

              {/* 4-Layer Optical Anatomy */}
              <section className="space-y-2">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.06em] text-[#8A8D96]">
                  {t.bhAnatomyHeading}
                </h3>
                <div className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
                  {t.blackHoleAnatomy.map((part) => (
                    <div key={part.code} className="py-2 space-y-0.5">
                      <p className="text-xs font-semibold text-[#ECEAE4]">
                        <span className="font-mono text-[#FA500F] mr-1.5">{part.code}.</span>
                        {part.title}
                      </p>
                      <p className="text-xs text-[#8A8D96] leading-relaxed">{part.detail}</p>
                    </div>
                  ))}
                </div>
              </section>

              <Separator className="bg-white/[0.08]" />

              {/* Closest Orbiting Worlds */}
              <section className="space-y-2">
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
                        <span className="text-[11px] font-mono tabular-nums text-[#FA500F] shrink-0">
                          {rawPlanet.orbitRadius.toFixed(1)} AU →
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          </Card.Content>
        </Card>
      </aside>
    );
  }

  // ===========================================================================
  // MODE 1B: REAL MILKY WAY STAR CLUSTER / H-II COMPLEX / SPIRAL ARM INSPECTOR
  // ===========================================================================
  const mwLandmark = getMilkyWayLandmarkById(selectedId);
  if (mwLandmark) {
    const lCopy = LANDMARK_UI_COPY[lang];
    const astroCopy = ASTRO_LABELS[lang];
    const distFromCoreKpc = Math.hypot(
      mwLandmark.posKpc[0],
      mwLandmark.posKpc[1],
      mwLandmark.posKpc[2]
    );
    return (
      <aside
        aria-label={mwLandmark.name[lang]}
        data-testid="memory-detail-drawer"
        className="absolute inset-x-3 top-[60px] bottom-[152px] @[680px]/obs:left-auto @[680px]/obs:right-3 @[680px]/obs:top-[146px] @[680px]/obs:bottom-[124px] @[680px]/obs:w-[min(396px,calc(100%-24px))] @[1220px]/obs:top-[96px] @[1220px]/obs:w-[396px] z-35 flex flex-col overflow-hidden"
      >
        <Card className="h-full rounded-[12px] bg-[#141416]/95 border border-[#FFF8E7]/14 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.5)] p-0 flex flex-col overflow-hidden">
          <SunsetStripeBand variant="hairline" />
          <Card.Content className="p-0 flex flex-col h-full overflow-hidden">
            <div className="px-4 pt-4 pb-3.5 border-b border-[#FFF8E7]/10 flex items-start justify-between gap-3 shrink-0">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.05em] text-[#A19F99]">
                  <span className="text-[#FFAF00] truncate">{mwLandmark.classLabel[lang]}</span>
                  <span aria-hidden="true">/</span>
                  <span className="shrink-0 truncate max-w-[160px]">{mwLandmark.designation}</span>
                </div>
                <h2 className="font-display text-[20px] font-normal tracking-[-0.015em] text-[#FFF8E7] leading-snug">
                  {mwLandmark.name[lang]}
                </h2>
              </div>

              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                onPress={onClose}
                aria-label={t.closeInspector}
                className="w-7 h-7 min-w-7 rounded-[8px] p-0 text-[#A19F99] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.08] shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              <p className="text-[13px] leading-relaxed text-[#D6D3CB]">
                {mwLandmark.description[lang]}
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-[10px] bg-white/[0.03] border border-[#FFF8E7]/10 p-2.5 space-y-0.5">
                  <p className="text-[10px] font-mono uppercase text-[#8A867C]">
                    {astroCopy.distSun}
                  </p>
                  <p className="text-[13px] font-mono font-semibold text-[#FFF8E7] tabular-nums">
                    {mwLandmark.distanceFromSunKpc.toFixed(2)} kpc
                  </p>
                  <p className="text-[10px] font-mono text-[#A19F99] tabular-nums">
                    ~{Math.round(mwLandmark.distanceFromSunKpc * 3261.56).toLocaleString()} ly
                  </p>
                </div>

                <div className="rounded-[10px] bg-white/[0.03] border border-[#FFF8E7]/10 p-2.5 space-y-0.5">
                  <p className="text-[10px] font-mono uppercase text-[#8A867C]">
                    {lCopy.galCenterDist}
                  </p>
                  <p className="text-[13px] font-mono font-semibold text-[#FFAF00] tabular-nums">
                    {distFromCoreKpc.toFixed(2)} kpc
                  </p>
                  <p className="text-[10px] font-mono text-[#A19F99] tabular-nums">
                    ~{Math.round(distFromCoreKpc * 3261.56).toLocaleString()} ly
                  </p>
                </div>

                <div className="rounded-[10px] bg-white/[0.03] border border-[#FFF8E7]/10 p-2.5 space-y-0.5">
                  <p className="text-[10px] font-mono uppercase text-[#8A867C]">
                    {lCopy.region}
                  </p>
                  <p className="text-[12px] font-medium text-[#FFF8E7]">
                    {mwLandmark.regionLabel[lang]}
                  </p>
                </div>

                <div className="rounded-[10px] bg-white/[0.03] border border-[#FFF8E7]/10 p-2.5 space-y-0.5">
                  <p className="text-[10px] font-mono uppercase text-[#8A867C]">
                    {lCopy.diameter}
                  </p>
                  <p className="text-[12px] font-mono font-semibold text-[#FFF8E7] tabular-nums">
                    ~{mwLandmark.diameterLy.toLocaleString()} ly
                  </p>
                </div>
              </div>

              <div className="rounded-[10px] bg-white/[0.03] border border-[#FFF8E7]/10 p-3 space-y-2 text-[11px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[#8A867C]">{lCopy.coordinates}</span>
                  <span className="font-mono text-[#FFF8E7] tabular-nums">
                    l {mwLandmark.galacticLonDeg.toFixed(2)}° · b {mwLandmark.galacticLatDeg >= 0 ? '+' : ''}
                    {mwLandmark.galacticLatDeg.toFixed(2)}°
                  </span>
                </div>
                <Separator className="bg-[#FFF8E7]/10" />
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[#8A867C]">{lCopy.population}</span>
                  <span className="font-mono text-[#FFF8E7]">{mwLandmark.populationLabel}</span>
                </div>
                <Separator className="bg-[#FFF8E7]/10" />
                <div className="space-y-0.5">
                  <span className="font-mono text-[#8A867C]">{astroCopy.source}</span>
                  <p className="text-[#D6D3CB]">{mwLandmark.source}</p>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-[#FFF8E7]/10 flex items-center justify-end shrink-0">
              <Button
                size="sm"
                variant="secondary"
                onPress={onClose}
                className="h-8 rounded-[8px] px-3 text-xs font-medium bg-white/[0.06] text-[#FFF8E7] hover:bg-white/[0.12]"
              >
                {lCopy.backToMilkyWay}
              </Button>
            </div>
          </Card.Content>
        </Card>
      </aside>
    );
  }

  // ===========================================================================
  // MODE 1C: REAL EXTRAGALACTIC GALAXY / DWARF SATELLITE / CLUSTER INSPECTOR
  // ===========================================================================
  const extraGal = selectedId
    ? EXTRAGALACTIC_CATALOG.find((g) => g.id === selectedId)
    : undefined;
  if (extraGal) {
    const lCopy = LANDMARK_UI_COPY[lang];
    const astroCopy = ASTRO_LABELS[lang];
    const distDisplay =
      extraGal.distanceMpc < 1
        ? `${Math.round(extraGal.distanceMpc * 1000).toLocaleString()} kpc`
        : `${extraGal.distanceMpc.toFixed(2)} Mpc`;
    const distLyDisplay =
      extraGal.distanceMpc < 1
        ? `${Math.round(extraGal.distanceMpc * 3_261_560).toLocaleString()} ly`
        : `${(extraGal.distanceMpc * 3.26156).toFixed(2)} Mly`;

    return (
      <aside
        aria-label={extraGal.name}
        data-testid="memory-detail-drawer"
        className="absolute inset-x-3 top-[60px] bottom-[152px] @[680px]/obs:left-auto @[680px]/obs:right-3 @[680px]/obs:top-[146px] @[680px]/obs:bottom-[124px] @[680px]/obs:w-[min(396px,calc(100%-24px))] @[1220px]/obs:top-[96px] @[1220px]/obs:w-[396px] z-35 flex flex-col overflow-hidden"
      >
        <Card className="h-full rounded-[12px] bg-[#141416]/95 border border-[#FFF8E7]/14 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.5)] p-0 flex flex-col overflow-hidden">
          <SunsetStripeBand variant="hairline" />
          <Card.Content className="p-0 flex flex-col h-full overflow-hidden">
            <div className="px-4 pt-4 pb-3.5 border-b border-[#FFF8E7]/10 flex items-start justify-between gap-3 shrink-0">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.05em] text-[#FFAF00]">
                  <span className="truncate">{lCopy.extragalacticBadge}</span>
                </div>
                <h2 className="font-display text-[20px] font-normal tracking-[-0.015em] text-[#FFF8E7] leading-snug">
                  {extraGal.name}
                </h2>
                <p className="text-[11px] font-mono text-[#A19F99]">{extraGal.designation}</p>
              </div>

              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                onPress={onClose}
                aria-label={t.closeInspector}
                className="w-7 h-7 min-w-7 rounded-[8px] p-0 text-[#A19F99] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.08] shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-[10px] bg-white/[0.03] border border-[#FFF8E7]/10 p-2.5 space-y-0.5">
                  <p className="text-[10px] font-mono uppercase text-[#8A867C]">
                    {astroCopy.distSun}
                  </p>
                  <p className="text-[13px] font-mono font-semibold text-[#FFF8E7] tabular-nums">
                    {distDisplay}
                  </p>
                  <p className="text-[10px] font-mono text-[#A19F99] tabular-nums">
                    ~{distLyDisplay}
                  </p>
                </div>

                <div className="rounded-[10px] bg-white/[0.03] border border-[#FFF8E7]/10 p-2.5 space-y-0.5">
                  <p className="text-[10px] font-mono uppercase text-[#8A867C]">
                    {lCopy.diameter}
                  </p>
                  <p className="text-[13px] font-mono font-semibold text-[#FFAF00] tabular-nums">
                    {extraGal.diameterKpc >= 100
                      ? `${(extraGal.diameterKpc / 1000).toFixed(2)} Mpc`
                      : `${extraGal.diameterKpc.toFixed(1)} kpc`}
                  </p>
                </div>

                <div className="rounded-[10px] bg-white/[0.03] border border-[#FFF8E7]/10 p-2.5 space-y-0.5">
                  <p className="text-[10px] font-mono uppercase text-[#8A867C]">
                    {lCopy.morphology}
                  </p>
                  <p className="text-[12px] font-mono text-[#FFF8E7] uppercase">
                    {extraGal.morphology}
                  </p>
                </div>

                <div className="rounded-[10px] bg-white/[0.03] border border-[#FFF8E7]/10 p-2.5 space-y-0.5">
                  <p className="text-[10px] font-mono uppercase text-[#8A867C]">
                    {lCopy.mass}
                  </p>
                  <p className="text-[12px] font-mono text-[#FFF8E7]">{extraGal.massLabel}</p>
                </div>
              </div>

              <div className="rounded-[10px] bg-white/[0.03] border border-[#FFF8E7]/10 p-3 space-y-2 text-[11px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[#8A867C]">{lCopy.equatorialCoords}</span>
                  <span className="font-mono text-[#FFF8E7] tabular-nums">
                    RA {extraGal.raDeg.toFixed(2)}° · Dec {extraGal.decDeg >= 0 ? '+' : ''}
                    {extraGal.decDeg.toFixed(2)}°
                  </span>
                </div>
                <Separator className="bg-[#FFF8E7]/10" />
                <div className="space-y-0.5">
                  <span className="font-mono text-[#8A867C]">{astroCopy.source}</span>
                  <p className="text-[#D6D3CB]">{extraGal.source}</p>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-[#FFF8E7]/10 flex items-center justify-end shrink-0">
              <Button
                size="sm"
                variant="secondary"
                onPress={onClose}
                className="h-8 rounded-[8px] px-3 text-xs font-medium bg-white/[0.06] text-[#FFF8E7] hover:bg-white/[0.12]"
              >
                {lCopy.backToMilkyWay}
              </Button>
            </div>
          </Card.Content>
        </Card>
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
  const locSpec = getLocalizedPlanetSpec(memory, lang);
  const astrometry = getScientificAstrometry(memory.id, locSpec.earthRadiusRatio);
  const localizedPeriod = getLocalizedOrbitalPeriod(
    memory.id,
    astrometry.orbitalPeriodLabel,
    lang
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
      (item): item is { node: MemoryNode; sharedTags: string[] } => item !== null
    )
    .slice(0, 6);

  return (
    <aside
      aria-label={localized.title}
      data-testid="memory-detail-drawer"
      className="absolute inset-x-3 top-[60px] bottom-[152px] @[680px]/obs:left-auto @[680px]/obs:right-3 @[680px]/obs:top-[146px] @[680px]/obs:bottom-[124px] @[680px]/obs:w-[min(396px,calc(100%-24px))] @[1220px]/obs:top-[96px] @[1220px]/obs:w-[396px] z-35 flex flex-col overflow-hidden"
    >
      <Card className="h-full rounded-[12px] bg-[#141416]/95 border border-[#FFF8E7]/14 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.5)] p-0 flex flex-col overflow-hidden">
        <SunsetStripeBand variant="hairline" />
        <Card.Content className="p-0 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="px-4 pt-4 pb-3.5 border-b border-[#FFF8E7]/10 flex items-start justify-between gap-3 shrink-0">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.05em] text-[#A19F99]">
                <span className="text-[#FFAF00] truncate">{catLabel}</span>
                <span aria-hidden="true">/</span>
                <span className="shrink-0 truncate max-w-[180px]">{locSpec.designation}</span>
              </div>
              <h2 className="font-display text-[20px] font-normal tracking-[-0.015em] text-[#FFF8E7] leading-snug">
                {localized.title}
              </h2>
            </div>

            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              onPress={onClose}
              aria-label={t.closeInspector}
              className="w-7 h-7 min-w-7 rounded-[8px] p-0 text-[#A19F99] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.08] shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-4">
            {/* Physical Telemetry Grid */}
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.06em] text-[#ECEAE4]">
                  <Globe2 className="w-3.5 h-3.5 text-[#FA500F] shrink-0" />
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
                    className="font-mono tabular-nums text-[13px] font-semibold text-[#FA500F]"
                  >
                    {locSpec.diameterKm}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="text-[#6B707B] block text-[10px] font-mono uppercase">
                    {t.planetClassLabel}
                  </span>
                  <span className="text-[#ECEAE4] font-medium">
                    {locSpec.planetType}
                  </span>
                </div>

                <div>
                  <span className="text-[#6B707B] block text-[10px] font-mono uppercase">
                    {t.planetTempLabel}
                  </span>
                  <span className="font-mono tabular-nums text-[#ECEAE4] font-medium">
                    {locSpec.surfaceTemp}
                  </span>
                </div>

                <div>
                  <span className="text-[#6B707B] block text-[10px] font-mono uppercase">
                    {t.planetGravityLabel}
                  </span>
                  <span className="font-mono tabular-nums text-[#ECEAE4] font-medium">
                    {locSpec.surfaceGravity}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="text-[#6B707B] block text-[10px] font-mono uppercase">
                    {t.planetAtmoLabel}
                  </span>
                  <span className="text-[#C8C6C0]">
                    {locSpec.atmosphereComposition}
                  </span>
                </div>

                <div>
                  <span className="text-[#6B707B] block text-[10px] font-mono uppercase">
                    {t.planetRingsLabel}
                  </span>
                  <span className="text-[#C8C6C0]">
                    {locSpec.hasRings ? t.planetRingsYes : t.planetRingsNo}
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
                <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-[#FA500F]">
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
                          : extra.solOrigin}
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
                      {localizedPeriod}
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

            {/* Precision Astrophysics Diagrams */}
            <AstrophysicsCharts
              nodeId={memory.id}
              title={localized.title}
              planetSpec={locSpec.base}
              astrometry={astrometry}
              lang={lang}
            />

            <Separator className="bg-white/[0.08]" />

            {/* 3 Core Scientific Highlights */}
            <section className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.06em] text-[#ECEAE4]">
                <Sparkles className="w-3.5 h-3.5 text-[#FA500F]" />
                <span>{t.planetKeyFindings}</span>
              </div>
              <ul className="space-y-1.5">
                {localized.summary.map((bullet, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-[12px] text-[#C8C6C0] leading-relaxed"
                  >
                    <span className="font-mono text-[11px] text-[#FA500F] mt-0.5 shrink-0">
                      0{idx + 1}.
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </section>

            <Separator className="bg-white/[0.08]" />

            {/* Detailed Scientific Overview */}
            <section className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.06em] text-[#8A8D96]">
                <Compass className="w-3.5 h-3.5" />
                <span>{t.planetOverviewHeading}</span>
              </div>
              <p className="text-[12px] text-[#9A9DA6] leading-relaxed whitespace-pre-line">
                {localized.content}
              </p>
            </section>

            <Separator className="bg-white/[0.08]" />

            {/* Spectral Tags */}
            <section className="space-y-2">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.06em] text-[#8A8D96]">
                {t.planetTagsHeading}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {memory.tags.map((tag) => (
                  <Button
                    key={tag}
                    size="sm"
                    variant="outline"
                    onPress={() => onSelectTag(tag)}
                    className="h-6 min-w-0 rounded-[8px] px-2.5 bg-[#101012] hover:bg-[#FA500F]/15 border-white/[0.09] hover:border-[#FA500F]/40 text-[11px] font-mono text-[#C8C6C0] hover:text-[#FFAF00]"
                  >
                    #{tag}
                  </Button>
                ))}
              </div>
            </section>

            {/* Related Celestial Objects */}
            {connectedNodes.length > 0 && (
              <>
                <Separator className="bg-white/[0.08]" />
                <section className="space-y-2">
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
                          <span className="text-xs font-mono text-[#FA500F] shrink-0">→</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-[#FFF8E7]/10 flex flex-wrap items-center justify-between gap-2 bg-[#101012] shrink-0">
            <Button
              size="sm"
              variant="danger-soft"
              onPress={() => onDeleteNode(memory.id)}
              className="h-8 min-w-0 rounded-[8px] px-2.5 gap-1.5 bg-transparent hover:bg-rose-500/12 text-[11px] font-mono text-rose-400/90 hover:text-rose-300"
            >
              <Trash2 className="w-3 h-3 shrink-0" />
              <span className="truncate">{t.deleteObjectBtn}</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onPress={onClose}
              className="h-8 min-w-0 rounded-[8px] px-3 bg-[#FFF8E7]/[0.08] hover:bg-[#FFF8E7]/[0.14] border-[#FFF8E7]/12 text-[12px] font-medium text-[#FFF8E7] shrink-0"
            >
              {t.closeInspector}
            </Button>
          </div>
        </Card.Content>
      </Card>
    </aside>
  );
}
