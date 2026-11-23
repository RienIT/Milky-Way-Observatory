'use client';

import React, { useMemo } from 'react';
import {
  computeStarHrPoint,
  HR_BENCHMARK_STARS,
  kelvinToBlackbodyHex,
  mapTempLumToHrNorm,
  parseSurfaceTemperatureK,
  sampleNormalizedPlanckCurve,
  wienPeakWavelengthNm,
} from '@/lib/astrophysics-science';
import { LanguageCode } from '@/lib/i18n';
import { PlanetSpec } from '@/lib/memory-types';
import { ScientificAstrometry } from '@/lib/scientific-catalog';

export interface AstrophysicsChartsProps {
  nodeId: string;
  title: string;
  planetSpec: PlanetSpec;
  astrometry: ScientificAstrometry;
  lang: LanguageCode;
}

const CHART_COPY: Record<
  LanguageCode,
  {
    hrTitle: string;
    hrSubtitle: string;
    luminosityAxis: string;
    tempAxis: string;
    planckTitle: string;
    wienPeak: string;
    visibleBand: string;
    structureTitle: string;
    sizeComparator: string;
    earthUnit: string;
    sunUnit: string;
    starLayers: [string, string, string];
    gasLayers: [string, string, string];
    rockyLayers: [string, string, string];
  }
> = {
  en: {
    hrTitle: 'Hertzsprung–Russell (H-R) Diagram',
    hrSubtitle: 'Stefan–Boltzmann L = (R/R☉)² (T/T☉)⁴',
    luminosityAxis: 'log₁₀(L / L☉)',
    tempAxis: 'Effective Temperature T_eff (K) ← hotter',
    planckTitle: 'Blackbody Spectral Radiance (Planck Law)',
    wienPeak: 'Wien λ_max',
    visibleBand: 'Visible 380–750 nm',
    structureTitle: 'Interior Cross-Section & Scale',
    sizeComparator: 'Relative Radius',
    earthUnit: 'R⊕',
    sunUnit: 'R☉',
    starLayers: ['Fusion Core', 'Radiative Zone', 'Convective Photosphere'],
    gasLayers: ['Rocky/Ice Core', 'Metallic H₂ Mantle', 'Molecular Envelope'],
    rockyLayers: ['Iron-Nickel Core', 'Silicate Mantle', 'Crust & Atmosphere'],
  },
  vi: {
    hrTitle: 'Biểu đồ Hertzsprung–Russell (H-R)',
    hrSubtitle: 'Stefan–Boltzmann L = (R/R☉)² (T/T☉)⁴',
    luminosityAxis: 'log₁₀(L / L☉)',
    tempAxis: 'Nhiệt độ hiệu dụng T_eff (K) ← nóng hơn',
    planckTitle: 'Phổ Bức xạ Vật đen (Định luật Planck)',
    wienPeak: 'Đỉnh Wien λ_max',
    visibleBand: 'Ánh sáng khả kiến 380–750 nm',
    structureTitle: 'Mặt cắt Cấu trúc & Tỷ lệ Kích thước',
    sizeComparator: 'Bán kính tương đối',
    earthUnit: 'R⊕',
    sunUnit: 'R☉',
    starLayers: ['Lõi Phản ứng Nhiệt hạch', 'Vùng Bức xạ', 'Quang cầu Đối lưu'],
    gasLayers: ['Lõi Đá / Băng', 'Lớp Hydro Kim loại', 'Khí quyển H₂ / He'],
    rockyLayers: ['Lõi Sắt-Niken', 'Lớp Manti Silicat', 'Vỏ & Khí quyển'],
  },
  ja: {
    hrTitle: 'ヘルツシュプルング・ラッセル図 (H-R図)',
    hrSubtitle: 'シュテファン＝ボルツマン L = (R/R☉)² (T/T☉)⁴',
    luminosityAxis: 'log₁₀(L / L☉)',
    tempAxis: '有効温度 T_eff (K) ← 高温',
    planckTitle: '黒体放射スペクトル（プランクの法則）',
    wienPeak: 'ウィーン λ_max',
    visibleBand: '可視光 380–750 nm',
    structureTitle: '内部構造断面・半径比較',
    sizeComparator: '相対半径',
    earthUnit: 'R⊕',
    sunUnit: 'R☉',
    starLayers: ['核融合コア', '放射層', '対流光球'],
    gasLayers: ['岩石/氷コア', '金属水素マントル', '分子水素外層'],
    rockyLayers: ['鉄ニッケル核', 'ケイ酸塩マントル', '地殻・大気'],
  },
  zh: {
    hrTitle: '赫罗图 (Hertzsprung–Russell)',
    hrSubtitle: '斯特藩-玻尔兹曼 L = (R/R☉)² (T/T☉)⁴',
    luminosityAxis: 'log₁₀(L / L☉)',
    tempAxis: '有效温度 T_eff (K) ← 更高',
    planckTitle: '黑体辐射光谱（普朗克定律）',
    wienPeak: '维恩峰值 λ_max',
    visibleBand: '可见光 380–750 nm',
    structureTitle: '内部结构剖面与尺寸对比',
    sizeComparator: '相对半径',
    earthUnit: 'R⊕',
    sunUnit: 'R☉',
    starLayers: ['核聚变核心', '辐射区', '对流光球层'],
    gasLayers: ['岩石/冰核', '金属氢幔层', '分子大气包层'],
    rockyLayers: ['铁镍核心', '硅酸盐地幔', '地壳与大气'],
  },
  ko: {
    hrTitle: '헤르츠스프룽-러셀도 (H-R 도표)',
    hrSubtitle: '슈테판-볼츠만 L = (R/R☉)² (T/T☉)⁴',
    luminosityAxis: 'log₁₀(L / L☉)',
    tempAxis: '유효 온도 T_eff (K) ← 고온',
    planckTitle: '흑체 복사 스펙트럼 (플랑크 법칙)',
    wienPeak: '빈 피크 λ_max',
    visibleBand: '가시광 380–750 nm',
    structureTitle: '내부 단면 및 크기 비교',
    sizeComparator: '상대 반지름',
    earthUnit: 'R⊕',
    sunUnit: 'R☉',
    starLayers: ['핵융합 코어', '복사층', '대류 광구'],
    gasLayers: ['암석/얼음 핵', '금속 수소 맨틀', '분자 대기층'],
    rockyLayers: ['철-니켈 핵', '규산염 맨틀', '지각 및 대기'],
  },
};

function hrSvgX(normX: number): number {
  return 28 + normX * 298;
}

function hrSvgY(normY: number): number {
  return 16 + normY * 120;
}

const PLANCK_WAVELENGTHS_NM: readonly number[] = Array.from(
  { length: 56 },
  (_, idx) => 200 + (idx / 55) * 2000
);

export default function AstrophysicsCharts({
  nodeId,
  title,
  planetSpec,
  astrometry,
  lang,
}: AstrophysicsChartsProps) {
  const copy = CHART_COPY[lang];
  const tempK = useMemo(
    () => parseSurfaceTemperatureK(planetSpec.surfaceTemp, 0),
    [planetSpec.surfaceTemp]
  );

  const isStarLike =
    planetSpec.archetypeId === 9 ||
    astrometry.objectClass === 'star' ||
    nodeId.startsWith('star-');

  const isGasLike =
    planetSpec.archetypeId === 1 ||
    planetSpec.archetypeId === 4 ||
    planetSpec.archetypeId === 5;

  const hrPoint = useMemo(() => {
    if (!isStarLike || tempK < 2000) return null;
    return computeStarHrPoint(nodeId, title, tempK, planetSpec.earthRadiusRatio);
  }, [isStarLike, nodeId, planetSpec.earthRadiusRatio, tempK, title]);

  const planckData = useMemo(() => {
    if (tempK < 450) return null;
    const minNm = 200;
    const maxNm = 2200;
    const intensities = sampleNormalizedPlanckCurve(tempK, PLANCK_WAVELENGTHS_NM);
    const points = PLANCK_WAVELENGTHS_NM.map((lam, i) => {
      const x = 14 + ((lam - minNm) / (maxNm - minNm)) * 316;
      const y = 76 - intensities[i] * 58;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    const areaPoints = `14,76 ${points} 330,76`;
    const peakNm = wienPeakWavelengthNm(tempK);
    const clampedPeakX =
      14 +
      ((Math.max(minNm, Math.min(maxNm, peakNm)) - minNm) / (maxNm - minNm)) * 316;
    const visStartX = 14 + ((380 - minNm) / (maxNm - minNm)) * 316;
    const visWidth = ((750 - 380) / (maxNm - minNm)) * 316;
    return {
      points,
      areaPoints,
      peakNm,
      clampedPeakX,
      visStartX,
      visWidth,
      swatchHex: kelvinToBlackbodyHex(tempK),
    };
  }, [tempK]);

  const layerLabels = isStarLike
    ? copy.starLayers
    : isGasLike
      ? copy.gasLayers
      : copy.rockyLayers;

  const layerColors = isStarLike
    ? ['#fff7ed', '#f59e0b', planetSpec.atmosphereColorHex || '#FA500F']
    : isGasLike
      ? ['#94a3b8', '#475569', planetSpec.atmosphereColorHex || '#d4a373']
      : ['#d97706', '#9a3412', planetSpec.atmosphereColorHex || '#3b82f6'];

  const radiusEarth = planetSpec.earthRadiusRatio;
  const radiusSolar = radiusEarth / 109.076;
  const radiusReadout =
    radiusEarth >= 20
      ? `${radiusSolar.toFixed(radiusSolar >= 10 ? 1 : 2)} ${copy.sunUnit}`
      : `${radiusEarth.toFixed(radiusEarth >= 10 ? 1 : 2)} ${copy.earthUnit}`;
  // Log scale width [0..100%] spanning 0.1 R_earth (Moon ~0.27) to 1500 R_sun (~1.6e5 R_earth)
  const logWidthPct = Math.max(
    6,
    Math.min(100, ((Math.log10(Math.max(0.1, radiusEarth)) - -1) / (5.3 - -1)) * 100)
  );

  return (
    <div data-testid="astrophysics-charts" className="space-y-4">
      {/* 1. Hertzsprung–Russell (H-R) Diagram (for Stars) */}
      {hrPoint && (
        <section
          data-testid="hr-diagram-card"
          className="border-t border-white/[0.08] pt-3.5 space-y-2"
        >
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.06em] text-[#ECEAE4]">
              {copy.hrTitle}
            </h3>
            <span className="text-[10px] font-mono tabular-nums text-[#FA500F]">
              {Math.round(hrPoint.tempK).toLocaleString()} K · L ={' '}
              {hrPoint.luminositySolar >= 100
                ? `${Math.round(hrPoint.luminositySolar).toLocaleString()} L☉`
                : `${hrPoint.luminositySolar.toFixed(2)} L☉`}
            </span>
          </div>

          <div className="rounded-[8px] bg-[#101012] border border-[#FFF8E7]/10 p-2">
            <svg
              viewBox="0 0 344 156"
              className="w-full h-auto block"
              role="img"
              aria-label={`${copy.hrTitle}: ${title}`}
            >
              {/* Subtle grid */}
              {[-3, 0, 3, 6].map((logL) => {
                const { normY } = mapTempLumToHrNorm(5778, Math.pow(10, logL));
                const y = hrSvgY(normY);
                return (
                  <g key={logL}>
                    <line
                      x1="28"
                      y1={y}
                      x2="326"
                      y2={y}
                      stroke="rgba(236,234,228,0.08)"
                      strokeDasharray="2 3"
                    />
                    <text
                      x="24"
                      y={y + 3}
                      textAnchor="end"
                      fill="#6B707B"
                      fontSize="8"
                      fontFamily="var(--font-mono), monospace"
                    >
                      {logL > 0 ? `+${logL}` : logL}
                    </text>
                  </g>
                );
              })}

              {/* Main Sequence diagonal guide band */}
              {(() => {
                const p0 = mapTempLumToHrNorm(35000, 2.5e5);
                const p1 = mapTempLumToHrNorm(7800, 15);
                const p2 = mapTempLumToHrNorm(2900, 0.0005);
                return (
                  <path
                    d={`M ${hrSvgX(p0.normX).toFixed(1)},${hrSvgY(p0.normY).toFixed(1)} Q ${hrSvgX(p1.normX).toFixed(1)},${hrSvgY(p1.normY).toFixed(1)} ${hrSvgX(p2.normX).toFixed(1)},${hrSvgY(p2.normY).toFixed(1)}`}
                    fill="none"
                    stroke="rgba(236,234,228,0.12)"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                );
              })()}

              {/* Benchmark Stars with collision-free label placement */}
              {HR_BENCHMARK_STARS.map((star) => {
                const x = hrSvgX(star.normX);
                const y = hrSvgY(star.normY);
                const offsets: Record<
                  string,
                  { dx: number; dy: number; anchor: 'start' | 'end' }
                > = {
                  'star-rigel': { dx: 6, dy: 3, anchor: 'start' },
                  'star-uy-scuti': { dx: -5, dy: -3, anchor: 'end' },
                  'star-betelgeuse': { dx: -5, dy: 3, anchor: 'end' },
                  'star-antares': { dx: -5, dy: 10, anchor: 'end' },
                  'star-polaris': { dx: 5, dy: 2.5, anchor: 'start' },
                  'star-vega': { dx: -5, dy: -3, anchor: 'end' },
                  'star-sirius-a': { dx: 5, dy: 4, anchor: 'start' },
                  'star-alpha-centauri': { dx: 5, dy: -2, anchor: 'start' },
                  'star-sun': { dx: -5, dy: 5, anchor: 'end' },
                  'star-proxima': { dx: -5, dy: 2.5, anchor: 'end' },
                };
                const off = offsets[star.id] ?? { dx: 5, dy: 2.5, anchor: 'start' };
                return (
                  <g key={star.id}>
                    <circle cx={x} cy={y} r="2.3" fill={star.colorHex} opacity="0.9" />
                    <text
                      x={x + off.dx}
                      y={y + off.dy}
                      textAnchor={off.anchor}
                      fill="#8A8D96"
                      fontSize="7.2"
                      fontFamily="var(--font-mono), monospace"
                    >
                      {star.label}
                    </text>
                  </g>
                );
              })}

              {/* Selected Star Crosshair */}
              {(() => {
                const sx = hrSvgX(hrPoint.normX);
                const sy = hrSvgY(hrPoint.normY);
                return (
                  <g>
                    <line
                      x1={sx}
                      y1="14"
                      x2={sx}
                      y2="138"
                      stroke="#FA500F"
                      strokeOpacity="0.35"
                      strokeDasharray="2 2"
                    />
                    <line
                      x1="28"
                      y1={sy}
                      x2="326"
                      y2={sy}
                      stroke="#FA500F"
                      strokeOpacity="0.35"
                      strokeDasharray="2 2"
                    />
                    <circle
                      cx={sx}
                      cy={sy}
                      r="5.5"
                      fill="none"
                      stroke="#FA500F"
                      strokeWidth="1.2"
                    />
                    <circle cx={sx} cy={sy} r="2.5" fill={hrPoint.colorHex} />
                  </g>
                );
              })()}

              {/* Spectral Class X-Axis ticks (O B A F G K M) */}
              {[
                { label: 'O', tempK: 35000 },
                { label: 'B', tempK: 18000 },
                { label: 'A', tempK: 9200 },
                { label: 'F', tempK: 6700 },
                { label: 'G', tempK: 5778 },
                { label: 'K', tempK: 4400 },
                { label: 'M', tempK: 3100 },
              ].map((sp) => {
                const { normX } = mapTempLumToHrNorm(sp.tempK, 1);
                return (
                  <text
                    key={sp.label}
                    x={hrSvgX(normX)}
                    y="150"
                    textAnchor="middle"
                    fill="#8A8D96"
                    fontSize="8.5"
                    fontFamily="var(--font-mono), monospace"
                  >
                    {sp.label}
                  </text>
                );
              })}
            </svg>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#6B707B] px-1 pt-1">
              <span>{copy.tempAxis}</span>
              <span>{copy.hrSubtitle}</span>
            </div>
          </div>
        </section>
      )}

      {/* 2. Blackbody Radiation Spectrum (Planck Law) */}
      {planckData && tempK !== null && (
        <section
          data-testid="planck-spectrum-card"
          className="border-t border-white/[0.08] pt-3.5 space-y-2"
        >
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.06em] text-[#ECEAE4]">
              {copy.planckTitle}
            </h3>
            <span className="text-[10px] font-mono tabular-nums text-[#FA500F]">
              {Math.round(tempK).toLocaleString()} K
            </span>
          </div>

          <div className="rounded-[8px] bg-[#101012] border border-[#FFF8E7]/10 p-2">
            <svg
              viewBox="0 0 344 92"
              className="w-full h-auto block"
              role="img"
              aria-label={`${copy.planckTitle}: ${Math.round(tempK)} K`}
            >
              <defs>
                <linearGradient id="visibleSpectrumBand" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
                  <stop offset="28%" stopColor="#38bdf8" stopOpacity="0.22" />
                  <stop offset="52%" stopColor="#22c55e" stopOpacity="0.20" />
                  <stop offset="76%" stopColor="#eab308" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.22" />
                </linearGradient>
              </defs>

              {/* Visible Light 380-750 nm band */}
              <rect
                x={planckData.visStartX}
                y="12"
                width={planckData.visWidth}
                height="64"
                fill="url(#visibleSpectrumBand)"
              />

              {/* Baseline */}
              <line x1="14" y1="76" x2="330" y2="76" stroke="rgba(236,234,228,0.16)" />

              {/* Planck Area + Curve */}
              <polygon points={planckData.areaPoints} fill={planckData.swatchHex} fillOpacity="0.14" />
              <polyline
                points={planckData.points}
                fill="none"
                stroke={planckData.swatchHex}
                strokeWidth="1.6"
              />

              {/* Wien Peak Marker */}
              <line
                x1={planckData.clampedPeakX}
                y1="12"
                x2={planckData.clampedPeakX}
                y2="76"
                stroke="#FA500F"
                strokeDasharray="2 2"
                strokeWidth="1"
              />

              {/* Wavelength labels */}
              {[
                { nm: 200, label: '200nm' },
                { nm: 750, label: '750nm' },
                { nm: 1500, label: '1.5µm' },
                { nm: 2200, label: '2.2µm' },
              ].map((tick) => {
                const x = 14 + ((tick.nm - 200) / 2000) * 316;
                return (
                  <text
                    key={tick.nm}
                    x={x}
                    y="88"
                    textAnchor={tick.nm === 200 ? 'start' : tick.nm === 2200 ? 'end' : 'middle'}
                    fill="#6B707B"
                    fontSize="8"
                    fontFamily="var(--font-mono), monospace"
                  >
                    {tick.label}
                  </text>
                );
              })}
            </svg>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#8A8D96] px-1 pt-1 tabular-nums">
              <span>{copy.visibleBand}</span>
              <span className="text-[#ECEAE4]">
                {copy.wienPeak}:{' '}
                {planckData.peakNm >= 1000
                  ? `${(planckData.peakNm / 1000).toFixed(2)} µm`
                  : `${Math.round(planckData.peakNm)} nm`}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* 3. Interior Structure Cross-Section & Logarithmic Size Comparator */}
      <section
        data-testid="structure-cross-section-card"
        className="border-t border-white/[0.08] pt-3.5 space-y-2.5"
      >
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-[11px] font-mono uppercase tracking-[0.06em] text-[#ECEAE4]">
            {copy.structureTitle}
          </h3>
          <span className="text-[10px] font-mono tabular-nums text-[#FA500F]">
            {radiusReadout}
          </span>
        </div>

        <div className="rounded-[8px] bg-[#101012] border border-[#FFF8E7]/10 p-3 flex items-center gap-3.5">
          <svg
            viewBox="0 0 84 84"
            className="w-[74px] h-[74px] shrink-0"
            role="img"
            aria-label={copy.structureTitle}
          >
            {/* Outer Envelope / Atmosphere */}
            <circle
              cx="42"
              cy="42"
              r="38"
              fill={layerColors[2]}
              fillOpacity="0.22"
              stroke={layerColors[2]}
              strokeWidth="1.2"
            />
            {/* Mantle / Radiative */}
            <circle
              cx="42"
              cy="42"
              r="26"
              fill={layerColors[1]}
              fillOpacity="0.34"
              stroke={layerColors[1]}
              strokeWidth="1"
            />
            {/* Core */}
            <circle
              cx="42"
              cy="42"
              r="12"
              fill={layerColors[0]}
              fillOpacity="0.85"
            />
            {/* Precision measurement crosshairs */}
            <line x1="42" y1="2" x2="42" y2="82" stroke="rgba(236,234,228,0.16)" strokeDasharray="2 2" />
            <line x1="2" y1="42" x2="82" y2="42" stroke="rgba(236,234,228,0.16)" strokeDasharray="2 2" />
          </svg>

          <div className="flex-1 min-w-0 space-y-2">
            <ul className="space-y-1 text-[11px]">
              {layerLabels.map((label, idx) => (
                <li key={label} className="flex items-center gap-2 text-[#C8C6C0]">
                  <span
                    className="w-2 h-2 rounded-[1px] shrink-0"
                    style={{ backgroundColor: layerColors[idx] }}
                  />
                  <span className="truncate">{label}</span>
                </li>
              ))}
            </ul>

            <div className="pt-1.5 border-t border-white/[0.07] space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8A8D96]">
                <span>{copy.sizeComparator}</span>
                <span className="tabular-nums text-[#ECEAE4]">{radiusReadout}</span>
              </div>
              <div className="h-1.5 w-full bg-white/[0.07] rounded-[1px] overflow-hidden">
                <div
                  className="h-full bg-[#FA500F]"
                  style={{ width: `${logWidthPct.toFixed(1)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
