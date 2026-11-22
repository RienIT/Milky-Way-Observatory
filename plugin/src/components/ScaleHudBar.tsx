'use client';

import React from 'react';
import {
  Eye,
  EyeOff,
  Grid,
  Network,
  Orbit,
  Sparkles,
  Tag,
  Wind,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  formatLightTravelTime,
  getLatestPhotonMilestone,
  WAVELENGTH_BAND_ORDER,
  WAVELENGTH_BAND_SPECS,
  WavelengthBandId,
} from '../lib/astrophysics-science';
import { AU_IN_METERS } from '../lib/constants';
import { LanguageCode } from '../lib/i18n';
import { ScaleLayerId, ScaleBarReadout } from '../lib/scale-engine';
import { ScalePresetId, UNIVERSE_HUD_COPY } from '../lib/universe-i18n';

export type ProvenanceMode = 'measured' | 'illustrative' | 'mixed';

export interface ScaleHudBarProps {
  lang: LanguageCode;
  activePreset: ScalePresetId | null;
  dominantLayer: ScaleLayerId;
  targetName: string;
  distanceLabel: string;
  isSurfaceAltitude: boolean;
  scaleBar: ScaleBarReadout;
  provenance: ProvenanceMode;
  logDistM: number;
  minLogDistM: number;
  maxLogDistM: number;
  onLogZoomSliderChange: (nextLogM: number) => void;
  onZoomStep: (deltaLog: number) => void;
  onSelectPreset: (preset: ScalePresetId) => void;
  showOrbits: boolean;
  onToggleOrbits: () => void;
  showTrails: boolean;
  onToggleTrails: () => void;
  clusterMode: boolean;
  onToggleClusterMode: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showGalaxies: boolean;
  onToggleGalaxies: () => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  wavelengthBand: WavelengthBandId;
  onChangeWavelengthBand: (band: WavelengthBandId) => void;
  photonPulseActive: boolean;
  photonElapsedSec: number;
  photonRadiusM: number;
  onTogglePhotonPulse: () => void;
  onToggleCinemaMode: () => void;
}

const PRESET_ORDER: ScalePresetId[] = [
  'earth',
  'solar-system',
  'nearby-stars',
  'milky-way',
  'sgr-a',
  'local-group',
];

export default function ScaleHudBar({
  lang,
  activePreset,
  dominantLayer,
  targetName,
  distanceLabel,
  isSurfaceAltitude,
  scaleBar,
  provenance,
  logDistM,
  minLogDistM,
  maxLogDistM,
  onLogZoomSliderChange,
  onZoomStep,
  onSelectPreset,
  showOrbits,
  onToggleOrbits,
  showTrails,
  onToggleTrails,
  clusterMode,
  onToggleClusterMode,
  showLabels,
  onToggleLabels,
  showGrid,
  onToggleGrid,
  showGalaxies,
  onToggleGalaxies,
  reducedMotion,
  onToggleReducedMotion,
  wavelengthBand,
  onChangeWavelengthBand,
  photonPulseActive,
  photonElapsedSec,
  photonRadiusM,
  onTogglePhotonPulse,
  onToggleCinemaMode,
}: ScaleHudBarProps) {
  const copy = UNIVERSE_HUD_COPY[lang];
  const activeBandSpec = WAVELENGTH_BAND_SPECS[wavelengthBand];

  const provenanceText =
    provenance === 'measured'
      ? copy.provenanceMeasured
      : provenance === 'illustrative'
        ? copy.provenanceIllustrative
        : copy.provenanceMixed;

  const photonAu = photonRadiusM / AU_IN_METERS;
  const photonMilestone = getLatestPhotonMilestone(photonRadiusM);

  return (
    <div
      data-testid="scale-hud-bar"
      className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex flex-col gap-2"
    >
      {/* Row 1: Telemetry Readout + Multi-Wavelength Switcher + Speed-of-Light Pulse + Zoom */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        {/* Left: Target Distance + Scale Bar + Provenance */}
        <div className="pointer-events-auto rounded-[4px] bg-[#0a0c10]/95 border border-white/[0.09] px-3 py-2 flex flex-wrap items-center gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#ECEAE4] truncate max-w-[168px]">
                {targetName}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-[0.06em] text-[#E88B38]">
                {copy.layers[dominantLayer]}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-mono tabular-nums text-[#C8C6C0]">
              <span className="text-[#6B707B]">
                {isSurfaceAltitude ? copy.altitudeAboveSurface : copy.distanceToTarget}:
              </span>
              <span data-testid="hud-distance-readout" className="text-[#ECEAE4] font-semibold">
                {distanceLabel}
              </span>
            </div>
          </div>

          {/* Dynamic Auto-Unit Scale Bar */}
          <div
            aria-label={copy.scaleBarAria}
            data-testid="hud-scale-bar"
            className="flex flex-col items-start gap-1 pl-3 border-l border-white/[0.08]"
          >
            <span className="text-[10px] font-mono tabular-nums text-[#C8C6C0]">
              {scaleBar.label}
            </span>
            <div
              className="h-1.5 border-b border-l border-r border-[#E88B38] transition-[width] duration-150"
              style={{ width: `${scaleBar.widthPx}px` }}
            />
          </div>

          {/* Data Provenance (Hard Rule #2 — plain monospaced telemetry, zero pill badge) */}
          <span
            data-testid="hud-provenance-badge"
            className="hidden xl:inline-block pl-3 border-l border-white/[0.08] text-[10px] font-mono text-[#8A8D96] whitespace-nowrap"
          >
            {provenanceText}
          </span>
        </div>

        {/* Center/Right: 4-Band Spectral Switcher + Light Pulse (c) + Logarithmic Zoom */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 4-Band Multi-Wavelength Observation Switcher */}
          <div
            data-testid="wavelength-switcher"
            className="pointer-events-auto rounded-[4px] bg-[#0a0c10]/95 border border-white/[0.09] p-1 flex items-center gap-0.5"
            title={`${activeBandSpec.labels[lang]} (${activeBandSpec.wavelengthRange}) — ${activeBandSpec.observatoryRef}`}
          >
            <span className="hidden lg:inline px-1.5 text-[10px] font-mono uppercase tracking-[0.06em] text-[#6B707B]">
              {copy.wavelengthLabel}
            </span>
            {WAVELENGTH_BAND_ORDER.map((bandId) => {
              const band = WAVELENGTH_BAND_SPECS[bandId];
              const active = band.id === wavelengthBand;
              return (
                <button
                  key={band.id}
                  type="button"
                  data-testid={`wavelength-btn-${band.id}`}
                  aria-pressed={active}
                  onClick={() => onChangeWavelengthBand(band.id)}
                  title={`${band.labels[lang]} · ${band.wavelengthRange} (${band.observatoryRef})`}
                  className={`px-2 py-1 rounded-[2px] text-[10px] font-mono transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#E88B38] text-[#050608] font-semibold'
                      : 'text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.06]'
                  }`}
                >
                  {band.shortLabels[lang]}
                </button>
              );
            })}
            <span className="hidden 2xl:inline px-1.5 text-[10px] font-mono text-[#8A8D96] border-l border-white/[0.08] ml-0.5">
              {activeBandSpec.wavelengthRange}
            </span>
          </div>

          {/* Speed-of-Light Photon Pulse (c = 299,792,458 m/s) */}
          <div className="pointer-events-auto rounded-[4px] bg-[#0a0c10]/95 border border-white/[0.09] p-1 flex items-center gap-1.5">
            <button
              type="button"
              data-testid="photon-pulse-btn"
              aria-pressed={photonPulseActive}
              onClick={onTogglePhotonPulse}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-[2px] text-[10px] font-mono transition-colors whitespace-nowrap ${
                photonPulseActive
                  ? 'bg-[#E88B38] text-[#050608] font-semibold'
                  : 'text-[#C8C6C0] hover:text-[#ECEAE4] hover:bg-white/[0.06]'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>{photonPulseActive ? copy.photonStopBtn : copy.photonPulseBtn}</span>
            </button>
            {photonPulseActive && (
              <span
                data-testid="photon-pulse-readout"
                className="pr-1.5 text-[10px] font-mono tabular-nums text-[#E88B38] whitespace-nowrap"
              >
                {formatLightTravelTime(photonElapsedSec)} ·{' '}
                {photonAu < 0.01 ? `${(photonRadiusM / 1e6).toFixed(1)} Mm` : `${photonAu.toFixed(2)} AU`}
                {photonMilestone ? ` · ${photonMilestone.label}` : ''}
              </span>
            )}
          </div>

          {/* Logarithmic Zoom Controls */}
          <div className="pointer-events-auto rounded-[4px] bg-[#0a0c10]/95 border border-white/[0.09] px-2 py-1 flex items-center gap-1.5">
            <button
              type="button"
              data-testid="zoom-in-btn"
              onClick={() => onZoomStep(-0.35)}
              aria-label="Zoom in"
              className="p-1 rounded-[2px] text-[#C8C6C0] hover:text-[#ECEAE4] hover:bg-white/[0.06] transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              aria-label={copy.zoomSliderAria}
              data-testid="log-zoom-slider"
              min={minLogDistM}
              max={maxLogDistM}
              step={0.05}
              value={Math.max(minLogDistM, Math.min(maxLogDistM, logDistM))}
              onChange={(e) => onLogZoomSliderChange(Number(e.target.value))}
              className="w-20 sm:w-28 accent-[#E88B38] cursor-pointer h-1"
            />
            <button
              type="button"
              data-testid="zoom-out-btn"
              onClick={() => onZoomStep(0.35)}
              aria-label="Zoom out"
              className="p-1 rounded-[2px] text-[#C8C6C0] hover:text-[#ECEAE4] hover:bg-white/[0.06] transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Scale Presets + Layer Toggles + Cinema Mode */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Multi-Scale Presets Bar */}
        <nav
          aria-label={copy.scalePresetsTitle}
          className="pointer-events-auto rounded-[4px] bg-[#0a0c10]/95 border border-white/[0.09] p-1 flex items-center gap-0.5 overflow-x-auto max-w-full"
        >
          {PRESET_ORDER.map((preset) => {
            const isActive = activePreset === preset;
            return (
              <button
                key={preset}
                type="button"
                data-testid={`preset-btn-${preset}`}
                onClick={() => onSelectPreset(preset)}
                className={`px-2.5 py-1 rounded-[2px] text-[11px] font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#E88B38] text-[#050608] font-semibold'
                    : 'text-[#C8C6C0] hover:text-[#ECEAE4] hover:bg-white/[0.06]'
                }`}
              >
                {copy.presets[preset]}
              </button>
            );
          })}
        </nav>

        {/* Layer Toggles + Cinema Mode */}
        <div className="pointer-events-auto rounded-[4px] bg-[#0a0c10]/95 border border-white/[0.09] p-1 flex items-center gap-0.5 overflow-x-auto max-w-full">
          <button
            type="button"
            data-testid="toggle-orbits-btn"
            aria-pressed={showOrbits}
            onClick={onToggleOrbits}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-[2px] text-[11px] font-medium transition-colors whitespace-nowrap ${
              showOrbits
                ? 'bg-white/[0.09] text-[#ECEAE4]'
                : 'text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.05]'
            }`}
          >
            <Orbit className={`w-3 h-3 ${showOrbits ? 'text-[#E88B38]' : ''}`} />
            <span className="hidden md:inline">{copy.layerToggles.orbits}</span>
          </button>

          <button
            type="button"
            data-testid="toggle-trails-btn"
            aria-pressed={showTrails}
            onClick={onToggleTrails}
            title={copy.layerToggles.trails}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-[2px] text-[11px] font-medium transition-colors whitespace-nowrap ${
              showTrails
                ? 'bg-white/[0.09] text-[#ECEAE4]'
                : 'text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.05]'
            }`}
          >
            <Wind className={`w-3 h-3 ${showTrails ? 'text-[#E88B38]' : ''}`} />
            <span className="hidden md:inline">{copy.layerToggles.trails}</span>
          </button>

          <button
            type="button"
            data-testid="toggle-clusters-btn"
            aria-pressed={clusterMode}
            onClick={onToggleClusterMode}
            title={copy.layerToggles.clusters}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-[2px] text-[11px] font-medium transition-colors whitespace-nowrap ${
              clusterMode
                ? 'bg-white/[0.09] text-[#ECEAE4]'
                : 'text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.05]'
            }`}
          >
            <Network className={`w-3 h-3 ${clusterMode ? 'text-[#E88B38]' : ''}`} />
            <span className="hidden md:inline">{copy.layerToggles.clusters}</span>
          </button>

          <button
            type="button"
            data-testid="toggle-labels-btn"
            aria-pressed={showLabels}
            onClick={onToggleLabels}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-[2px] text-[11px] font-medium transition-colors whitespace-nowrap ${
              showLabels
                ? 'bg-white/[0.09] text-[#ECEAE4]'
                : 'text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.05]'
            }`}
          >
            <Tag className={`w-3 h-3 ${showLabels ? 'text-[#E88B38]' : ''}`} />
            <span className="hidden md:inline">{copy.layerToggles.labels}</span>
          </button>

          <button
            type="button"
            data-testid="toggle-grid-btn"
            aria-pressed={showGrid}
            onClick={onToggleGrid}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-[2px] text-[11px] font-medium transition-colors whitespace-nowrap ${
              showGrid
                ? 'bg-white/[0.09] text-[#ECEAE4]'
                : 'text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.05]'
            }`}
          >
            <Grid className={`w-3 h-3 ${showGrid ? 'text-[#E88B38]' : ''}`} />
            <span className="hidden md:inline">{copy.layerToggles.grid}</span>
          </button>

          <button
            type="button"
            data-testid="toggle-galaxies-btn"
            aria-pressed={showGalaxies}
            onClick={onToggleGalaxies}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-[2px] text-[11px] font-medium transition-colors whitespace-nowrap ${
              showGalaxies
                ? 'bg-white/[0.09] text-[#ECEAE4]'
                : 'text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.05]'
            }`}
          >
            <Sparkles className={`w-3 h-3 ${showGalaxies ? 'text-[#E88B38]' : ''}`} />
            <span className="hidden md:inline">{copy.layerToggles.galaxies}</span>
          </button>

          <button
            type="button"
            data-testid="toggle-reduced-motion-btn"
            aria-pressed={reducedMotion}
            onClick={onToggleReducedMotion}
            title={copy.layerToggles.reducedMotion}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-[2px] text-[11px] font-medium transition-colors whitespace-nowrap ${
              reducedMotion
                ? 'bg-white/[0.09] text-[#E88B38]'
                : 'text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.05]'
            }`}
          >
            <Eye className="w-3 h-3" />
          </button>

          <span className="mx-0.5 h-3.5 w-px bg-white/[0.10]" aria-hidden="true" />

          <button
            type="button"
            data-testid="cinema-mode-btn"
            onClick={onToggleCinemaMode}
            title={copy.cinemaMode}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-[2px] text-[11px] font-mono text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.06] transition-colors whitespace-nowrap"
          >
            <EyeOff className="w-3 h-3" />
            <span className="hidden xl:inline">{copy.cinemaMode}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
