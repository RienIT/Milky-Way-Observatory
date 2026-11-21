'use client';

import React from 'react';
import {
  Eye,
  Grid,
  Network,
  Orbit,
  Sparkles,
  Tag,
  Wind,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { LanguageCode } from '@/lib/i18n';
import { ScaleLayerId, ScaleBarReadout } from '@/lib/scale-engine';
import { ScalePresetId, UNIVERSE_HUD_COPY } from '@/lib/universe-i18n';

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
}: ScaleHudBarProps) {
  const copy = UNIVERSE_HUD_COPY[lang];

  const provenanceText =
    provenance === 'measured'
      ? copy.provenanceMeasured
      : provenance === 'illustrative'
        ? copy.provenanceIllustrative
        : copy.provenanceMixed;

  const provenanceColor =
    provenance === 'measured'
      ? 'text-[#34d399] border-[#34d399]/30 bg-[#0d1f1a]'
      : provenance === 'illustrative'
        ? 'text-[#fbbf24] border-[#fbbf24]/30 bg-[#1f190e]'
        : 'text-[#60a5fa] border-[#60a5fa]/30 bg-[#0f1928]';

  return (
    <div
      data-testid="scale-hud-bar"
      className="pointer-events-none absolute inset-x-2.5 bottom-2.5 z-20 flex flex-col gap-2"
    >
      {/* Row 1: Distance Telemetry + Dynamic Scale Bar + Provenance Badge */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        {/* Target Distance & Scale Bar */}
        <div className="pointer-events-auto rounded-[10px] bg-[#111318]/95 border border-white/[0.10] px-3 py-2 shadow-2xl flex flex-wrap items-center gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#f3f4f6] truncate max-w-[160px]">
                {targetName}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#54a8ff]">
                {copy.layers[dominantLayer]}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-mono tabular-nums text-[#d1d5db]">
              <span className="text-[#6b7280]">
                {isSurfaceAltitude ? copy.altitudeAboveSurface : copy.distanceToTarget}:
              </span>
              <span data-testid="hud-distance-readout" className="text-white font-semibold">
                {distanceLabel}
              </span>
            </div>
          </div>

          {/* Dynamic Auto-Unit Scale Bar */}
          <div
            aria-label={copy.scaleBarAria}
            data-testid="hud-scale-bar"
            className="flex flex-col items-start gap-1 pl-2 border-l border-white/[0.08]"
          >
            <span className="text-[10px] font-mono tabular-nums text-[#d1d5db]">
              {scaleBar.label}
            </span>
            <div
              className="h-2 border-b-2 border-l border-r border-[#54a8ff]/90 transition-[width] duration-150"
              style={{ width: `${scaleBar.widthPx}px` }}
            />
          </div>

          {/* Data Provenance Badge (Hard Rule #2) */}
          <span
            data-testid="hud-provenance-badge"
            className={`hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] border text-[10px] font-medium whitespace-nowrap ${provenanceColor}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                provenance === 'measured'
                  ? 'bg-[#34d399]'
                  : provenance === 'illustrative'
                    ? 'bg-[#fbbf24]'
                    : 'bg-[#60a5fa]'
              }`}
            />
            {provenanceText}
          </span>
        </div>

        {/* Logarithmic Zoom Controls */}
        <div className="pointer-events-auto rounded-[10px] bg-[#111318]/95 border border-white/[0.10] px-2.5 py-1.5 shadow-2xl flex items-center gap-2">
          <button
            type="button"
            data-testid="zoom-in-btn"
            onClick={() => onZoomStep(-0.35)}
            aria-label="Zoom in"
            className="p-1 rounded-[6px] text-[#d1d5db] hover:text-white hover:bg-[#1f2430] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0082fb] transition-colors"
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
            className="w-24 sm:w-32 accent-[#0082fb] cursor-pointer h-1.5"
          />
          <button
            type="button"
            data-testid="zoom-out-btn"
            onClick={() => onZoomStep(0.35)}
            aria-label="Zoom out"
            className="p-1 rounded-[6px] text-[#d1d5db] hover:text-white hover:bg-[#1f2430] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0082fb] transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 2: Scale Presets + Layer Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Multi-Scale Presets Bar */}
        <nav
          aria-label={copy.scalePresetsTitle}
          className="pointer-events-auto rounded-[10px] bg-[#111318]/95 border border-white/[0.10] p-1 shadow-2xl flex items-center gap-1 overflow-x-auto max-w-full"
        >
          {PRESET_ORDER.map((preset) => {
            const isActive = activePreset === preset;
            return (
              <button
                key={preset}
                type="button"
                data-testid={`preset-btn-${preset}`}
                onClick={() => onSelectPreset(preset)}
                className={`px-2.5 py-1 rounded-[7px] text-[11px] font-medium whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0082fb] ${
                  isActive
                    ? 'bg-[#0082fb] text-white font-semibold'
                    : 'text-[#d1d5db] hover:text-white hover:bg-[#1b202b]'
                }`}
              >
                {copy.presets[preset]}
              </button>
            );
          })}
        </nav>

        {/* Layer Toggles */}
        <div className="pointer-events-auto rounded-[10px] bg-[#111318]/95 border border-white/[0.10] p-1 shadow-2xl flex items-center gap-1 overflow-x-auto max-w-full">
          <button
            type="button"
            data-testid="toggle-orbits-btn"
            aria-pressed={showOrbits}
            onClick={onToggleOrbits}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-[7px] text-[11px] font-medium transition-colors whitespace-nowrap ${
              showOrbits
                ? 'bg-[#1f2430] text-[#54a8ff] border border-[#0082fb]/35'
                : 'text-[#9ca3af] hover:text-white hover:bg-[#181b22] border border-transparent'
            }`}
          >
            <Orbit className="w-3 h-3" />
            <span className="hidden md:inline">{copy.layerToggles.orbits}</span>
          </button>

          <button
            type="button"
            data-testid="toggle-trails-btn"
            aria-pressed={showTrails}
            onClick={onToggleTrails}
            title={copy.layerToggles.trails}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-[7px] text-[11px] font-medium transition-colors whitespace-nowrap ${
              showTrails
                ? 'bg-[#1f2430] text-[#38bdf8] border border-[#38bdf8]/35'
                : 'text-[#9ca3af] hover:text-white hover:bg-[#181b22] border border-transparent'
            }`}
          >
            <Wind className="w-3 h-3" />
            <span className="hidden md:inline">{copy.layerToggles.trails}</span>
          </button>

          <button
            type="button"
            data-testid="toggle-clusters-btn"
            aria-pressed={clusterMode}
            onClick={onToggleClusterMode}
            title={copy.layerToggles.clusters}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-[7px] text-[11px] font-medium transition-colors whitespace-nowrap ${
              clusterMode
                ? 'bg-[#1f2430] text-[#fbbf24] border border-[#fbbf24]/35'
                : 'text-[#9ca3af] hover:text-white hover:bg-[#181b22] border border-transparent'
            }`}
          >
            <Network className="w-3 h-3" />
            <span className="hidden md:inline">{copy.layerToggles.clusters}</span>
          </button>

          <button
            type="button"
            data-testid="toggle-labels-btn"
            aria-pressed={showLabels}
            onClick={onToggleLabels}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-[7px] text-[11px] font-medium transition-colors whitespace-nowrap ${
              showLabels
                ? 'bg-[#1f2430] text-[#54a8ff] border border-[#0082fb]/35'
                : 'text-[#9ca3af] hover:text-white hover:bg-[#181b22] border border-transparent'
            }`}
          >
            <Tag className="w-3 h-3" />
            <span className="hidden md:inline">{copy.layerToggles.labels}</span>
          </button>

          <button
            type="button"
            data-testid="toggle-grid-btn"
            aria-pressed={showGrid}
            onClick={onToggleGrid}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-[7px] text-[11px] font-medium transition-colors whitespace-nowrap ${
              showGrid
                ? 'bg-[#1f2430] text-[#54a8ff] border border-[#0082fb]/35'
                : 'text-[#9ca3af] hover:text-white hover:bg-[#181b22] border border-transparent'
            }`}
          >
            <Grid className="w-3 h-3" />
            <span className="hidden md:inline">{copy.layerToggles.grid}</span>
          </button>

          <button
            type="button"
            data-testid="toggle-galaxies-btn"
            aria-pressed={showGalaxies}
            onClick={onToggleGalaxies}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-[7px] text-[11px] font-medium transition-colors whitespace-nowrap ${
              showGalaxies
                ? 'bg-[#1f2430] text-[#54a8ff] border border-[#0082fb]/35'
                : 'text-[#9ca3af] hover:text-white hover:bg-[#181b22] border border-transparent'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden md:inline">{copy.layerToggles.galaxies}</span>
          </button>

          <button
            type="button"
            data-testid="toggle-reduced-motion-btn"
            aria-pressed={reducedMotion}
            onClick={onToggleReducedMotion}
            title={copy.layerToggles.reducedMotion}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-[7px] text-[11px] font-medium transition-colors whitespace-nowrap ${
              reducedMotion
                ? 'bg-[#1f2430] text-[#fbbf24] border border-[#fbbf24]/35'
                : 'text-[#9ca3af] hover:text-white hover:bg-[#181b22] border border-transparent'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span className="hidden lg:inline">{copy.layerToggles.reducedMotion}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
