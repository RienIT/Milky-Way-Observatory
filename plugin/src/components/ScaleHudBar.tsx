'use client';

import React from 'react';
import { Button, Card, Separator, Slider, Tooltip } from '@heroui/react';
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
import { OBSERVATORY_EXTRA_COPY } from '../lib/localized-telemetry';
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
  const extra = OBSERVATORY_EXTRA_COPY[lang];
  const activeBandSpec = WAVELENGTH_BAND_SPECS[wavelengthBand];

  const provenanceText =
    provenance === 'measured'
      ? copy.provenanceMeasured
      : provenance === 'illustrative'
        ? copy.provenanceIllustrative
        : copy.provenanceMixed;

  const photonAu = photonRadiusM / AU_IN_METERS;
  const photonMilestone = getLatestPhotonMilestone(photonRadiusM);
  const clampedLogDist = Math.max(minLogDistM, Math.min(maxLogDistM, logDistM));

  return (
    <div
      data-testid="scale-hud-bar"
      className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex flex-col gap-2"
    >
      {/* Row 1: Telemetry Readout + Multi-Wavelength Switcher + Speed-of-Light Pulse + Zoom */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        {/* Left: Target Distance + Scale Bar + Provenance */}
        <Card className="pointer-events-auto rounded-[12px] bg-[#141416]/95 border border-[#FFF8E7]/12 shadow-[0_12px_24px_-4px_rgba(0,0,0,0.35)] p-0">
          <Card.Content className="px-3.5 py-2 flex flex-row flex-wrap items-center gap-3 overflow-visible">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-[#FFF8E7] truncate max-w-[168px]">
                  {targetName}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-[0.06em] text-[#FFAF00]">
                  {copy.layers[dominantLayer]}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-mono tabular-nums text-[#D6D3CB]">
                <span className="text-[#8F8D87]">
                  {isSurfaceAltitude ? copy.altitudeAboveSurface : copy.distanceToTarget}:
                </span>
                <span data-testid="hud-distance-readout" className="text-[#FFF8E7] font-semibold">
                  {distanceLabel}
                </span>
              </div>
            </div>

            {/* Dynamic Auto-Unit Scale Bar */}
            <div
              aria-label={copy.scaleBarAria}
              data-testid="hud-scale-bar"
              className="flex flex-col items-start gap-1 pl-3 border-l border-[#FFF8E7]/10"
            >
              <span className="text-[10px] font-mono tabular-nums text-[#D6D3CB]">
                {scaleBar.label}
              </span>
              <div
                className="h-1.5 border-b border-l border-r border-[#FA500F] transition-[width] duration-150"
                style={{ width: `${scaleBar.widthPx}px` }}
              />
            </div>

            {/* Data Provenance */}
            <span
              data-testid="hud-provenance-badge"
              className="hidden xl:inline-block pl-3 border-l border-[#FFF8E7]/10 text-[10px] font-mono text-[#A19F99] whitespace-nowrap"
            >
              {provenanceText}
            </span>
          </Card.Content>
        </Card>

        {/* Center/Right: 4-Band Spectral Switcher + Light Pulse (c) + Logarithmic Zoom */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 4-Band Multi-Wavelength Observation Switcher */}
          <Card
            data-testid="wavelength-switcher"
            className="pointer-events-auto rounded-[12px] bg-[#141416]/95 border border-[#FFF8E7]/12 shadow-[0_12px_24px_-4px_rgba(0,0,0,0.35)] p-0"
          >
            <Card.Content className="p-1.5 flex flex-row items-center gap-1 overflow-visible">
              <span className="hidden lg:inline px-1.5 text-[10px] font-mono uppercase tracking-[0.06em] text-[#8F8D87]">
                {copy.wavelengthLabel}
              </span>
              {WAVELENGTH_BAND_ORDER.map((bandId) => {
                const band = WAVELENGTH_BAND_SPECS[bandId];
                const active = band.id === wavelengthBand;
                return (
                  <Tooltip key={band.id} delay={250}>
                    <Button
                      size="sm"
                      variant={active ? 'primary' : 'ghost'}
                      data-testid={`wavelength-btn-${band.id}`}
                      aria-pressed={active}
                      onPress={() => onChangeWavelengthBand(band.id)}
                      className={`h-7 min-w-0 rounded-[8px] px-2.5 text-[11px] font-mono whitespace-nowrap ${
                        active
                          ? 'bg-[#FA500F] text-white font-semibold'
                          : 'text-[#A19F99] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.08]'
                      }`}
                    >
                      {band.shortLabels[lang]}
                    </Button>
                    <Tooltip.Content
                      placement="top"
                      className="bg-[#141416] border border-[#FFF8E7]/14 text-[#FFF8E7] text-[11px] font-mono rounded-[8px] px-2.5 py-1.5"
                    >
                      {`${band.labels[lang]} · ${band.wavelengthRange} (${band.observatoryRef})`}
                    </Tooltip.Content>
                  </Tooltip>
                );
              })}
              <span className="hidden 2xl:inline px-1.5 text-[10px] font-mono text-[#A19F99] border-l border-[#FFF8E7]/10 ml-0.5">
                {activeBandSpec.wavelengthRange}
              </span>
            </Card.Content>
          </Card>

          {/* Speed-of-Light Photon Pulse (c = 299,792,458 m/s) */}
          <Card className="pointer-events-auto rounded-[12px] bg-[#141416]/95 border border-[#FFF8E7]/12 shadow-[0_12px_24px_-4px_rgba(0,0,0,0.35)] p-0">
            <Card.Content className="p-1.5 flex flex-row items-center gap-1.5 overflow-visible">
              <Button
                size="sm"
                variant={photonPulseActive ? 'primary' : 'ghost'}
                data-testid="photon-pulse-btn"
                aria-pressed={photonPulseActive}
                onPress={onTogglePhotonPulse}
                className={`h-7 min-w-0 rounded-[8px] px-2.5 text-[11px] font-mono gap-1.5 whitespace-nowrap ${
                  photonPulseActive
                    ? 'bg-[#FA500F] text-white font-semibold'
                    : 'text-[#F5F2EB] hover:bg-[#FFF8E7]/[0.08]'
                }`}
              >
                <Zap className="w-3 h-3 text-[#FFD800] shrink-0" />
                <span>{photonPulseActive ? copy.photonStopBtn : copy.photonPulseBtn}</span>
              </Button>
              {photonPulseActive && (
                <span
                  data-testid="photon-pulse-readout"
                  className="pr-1.5 text-[10px] font-mono tabular-nums text-[#FFAF00] whitespace-nowrap"
                >
                  {formatLightTravelTime(photonElapsedSec)} ·{' '}
                  {photonAu < 0.01 ? `${(photonRadiusM / 1e6).toFixed(1)} Mm` : `${photonAu.toFixed(2)} AU`}
                  {photonMilestone ? ` · ${photonMilestone.label}` : ''}
                </span>
              )}
            </Card.Content>
          </Card>

          {/* Logarithmic Zoom Controls */}
          <Card className="pointer-events-auto rounded-[12px] bg-[#141416]/95 border border-[#FFF8E7]/12 shadow-[0_12px_24px_-4px_rgba(0,0,0,0.35)] p-0">
            <Card.Content className="px-2.5 py-1.5 flex flex-row items-center gap-1.5 overflow-visible">
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                data-testid="zoom-in-btn"
                onPress={() => onZoomStep(-0.35)}
                aria-label={extra.zoomInAria}
                className="w-7 h-7 min-w-7 rounded-[8px] p-0 text-[#D6D3CB] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.08]"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </Button>
              <Slider
                aria-label={copy.zoomSliderAria}
                data-testid="log-zoom-slider"
                minValue={minLogDistM}
                maxValue={maxLogDistM}
                step={0.05}
                value={clampedLogDist}
                onChange={(val) =>
                  onLogZoomSliderChange(Array.isArray(val) ? val[0] : val)
                }
                className="w-20 sm:w-28"
              >
                <Slider.Track className="h-1 bg-[#FFF8E7]/14 rounded-[4px]">
                  <Slider.Fill className="bg-[#FA500F] rounded-[4px]" />
                  <Slider.Thumb className="w-3.5 h-3.5 rounded-[4px] bg-[#FA500F] border border-[#FFF8E7]" />
                </Slider.Track>
              </Slider>
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                data-testid="zoom-out-btn"
                onPress={() => onZoomStep(0.35)}
                aria-label={extra.zoomOutAria}
                className="w-7 h-7 min-w-7 rounded-[8px] p-0 text-[#D6D3CB] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.08]"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </Button>
            </Card.Content>
          </Card>
        </div>
      </div>

      {/* Row 2: Scale Presets + Layer Toggles + Cinema Mode */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Multi-Scale Presets Bar */}
        <Card className="pointer-events-auto rounded-[12px] bg-[#141416]/95 border border-[#FFF8E7]/12 shadow-[0_12px_24px_-4px_rgba(0,0,0,0.35)] max-w-full p-0">
          <Card.Content className="p-1.5 flex flex-row items-center gap-0.5 overflow-x-auto">
            <nav aria-label={copy.scalePresetsTitle} className="flex items-center gap-1">
              {PRESET_ORDER.map((preset) => {
                const isActive = activePreset === preset;
                return (
                  <Button
                    key={preset}
                    size="sm"
                    variant={isActive ? 'primary' : 'ghost'}
                    data-testid={`preset-btn-${preset}`}
                    onPress={() => onSelectPreset(preset)}
                    className={`h-7 min-w-0 rounded-[8px] px-3 text-[12px] font-medium whitespace-nowrap ${
                      isActive
                        ? 'bg-[#FA500F] text-white font-semibold'
                        : 'text-[#D6D3CB] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.08]'
                    }`}
                  >
                    {copy.presets[preset]}
                  </Button>
                );
              })}
            </nav>
          </Card.Content>
        </Card>

        {/* Layer Toggles + Cinema Mode */}
        <Card className="pointer-events-auto rounded-[12px] bg-[#141416]/95 border border-[#FFF8E7]/12 shadow-[0_12px_24px_-4px_rgba(0,0,0,0.35)] max-w-full p-0">
          <Card.Content className="p-1.5 flex flex-row items-center gap-0.5 overflow-x-auto">
            <Button
              size="sm"
              variant="ghost"
              data-testid="toggle-orbits-btn"
              aria-pressed={showOrbits}
              onPress={onToggleOrbits}
              className={`h-7 min-w-0 rounded-[8px] px-2.5 text-[11px] font-medium gap-1 whitespace-nowrap ${
                showOrbits
                  ? 'bg-[#FFF8E7]/[0.10] text-[#FFF8E7]'
                  : 'text-[#A19F99] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.06]'
              }`}
            >
              <Orbit className={`w-3 h-3 shrink-0 ${showOrbits ? 'text-[#FA500F]' : ''}`} />
              <span className="hidden md:inline">{copy.layerToggles.orbits}</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              data-testid="toggle-trails-btn"
              aria-pressed={showTrails}
              onPress={onToggleTrails}
              aria-label={copy.layerToggles.trails}
              className={`h-7 min-w-0 rounded-[8px] px-2.5 text-[11px] font-medium gap-1 whitespace-nowrap ${
                showTrails
                  ? 'bg-[#FFF8E7]/[0.10] text-[#FFF8E7]'
                  : 'text-[#A19F99] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.06]'
              }`}
            >
              <Wind className={`w-3 h-3 shrink-0 ${showTrails ? 'text-[#FA500F]' : ''}`} />
              <span className="hidden md:inline">{copy.layerToggles.trails}</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              data-testid="toggle-clusters-btn"
              aria-pressed={clusterMode}
              onPress={onToggleClusterMode}
              aria-label={copy.layerToggles.clusters}
              className={`h-7 min-w-0 rounded-[8px] px-2.5 text-[11px] font-medium gap-1 whitespace-nowrap ${
                clusterMode
                  ? 'bg-[#FFF8E7]/[0.10] text-[#FFF8E7]'
                  : 'text-[#A19F99] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.06]'
              }`}
            >
              <Network className={`w-3 h-3 shrink-0 ${clusterMode ? 'text-[#FA500F]' : ''}`} />
              <span className="hidden md:inline">{copy.layerToggles.clusters}</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              data-testid="toggle-labels-btn"
              aria-pressed={showLabels}
              onPress={onToggleLabels}
              className={`h-7 min-w-0 rounded-[8px] px-2.5 text-[11px] font-medium gap-1 whitespace-nowrap ${
                showLabels
                  ? 'bg-[#FFF8E7]/[0.10] text-[#FFF8E7]'
                  : 'text-[#A19F99] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.06]'
              }`}
            >
              <Tag className={`w-3 h-3 shrink-0 ${showLabels ? 'text-[#FA500F]' : ''}`} />
              <span className="hidden md:inline">{copy.layerToggles.labels}</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              data-testid="toggle-grid-btn"
              aria-pressed={showGrid}
              onPress={onToggleGrid}
              className={`h-7 min-w-0 rounded-[8px] px-2.5 text-[11px] font-medium gap-1 whitespace-nowrap ${
                showGrid
                  ? 'bg-[#FFF8E7]/[0.10] text-[#FFF8E7]'
                  : 'text-[#A19F99] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.06]'
              }`}
            >
              <Grid className={`w-3 h-3 shrink-0 ${showGrid ? 'text-[#FA500F]' : ''}`} />
              <span className="hidden md:inline">{copy.layerToggles.grid}</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              data-testid="toggle-galaxies-btn"
              aria-pressed={showGalaxies}
              onPress={onToggleGalaxies}
              className={`h-7 min-w-0 rounded-[8px] px-2.5 text-[11px] font-medium gap-1 whitespace-nowrap ${
                showGalaxies
                  ? 'bg-[#FFF8E7]/[0.10] text-[#FFF8E7]'
                  : 'text-[#A19F99] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.06]'
              }`}
            >
              <Sparkles className={`w-3 h-3 shrink-0 ${showGalaxies ? 'text-[#FA500F]' : ''}`} />
              <span className="hidden md:inline">{copy.layerToggles.galaxies}</span>
            </Button>

            <Tooltip delay={250}>
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                data-testid="toggle-reduced-motion-btn"
                aria-pressed={reducedMotion}
                aria-label={copy.layerToggles.reducedMotion}
                onPress={onToggleReducedMotion}
                className={`w-7 h-7 min-w-7 rounded-[8px] p-0 ${
                  reducedMotion
                    ? 'bg-[#FFF8E7]/[0.10] text-[#FA500F]'
                    : 'text-[#A19F99] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.06]'
                }`}
              >
                <Eye className="w-3 h-3" />
              </Button>
              <Tooltip.Content
                placement="top"
                className="bg-[#141416] border border-[#FFF8E7]/14 text-[#FFF8E7] text-[11px] rounded-[8px] px-2.5 py-1"
              >
                {copy.layerToggles.reducedMotion}
              </Tooltip.Content>
            </Tooltip>

            <Separator orientation="vertical" className="mx-0.5 h-4 bg-[#FFF8E7]/12" />

            <Button
              size="sm"
              variant="ghost"
              data-testid="cinema-mode-btn"
              onPress={onToggleCinemaMode}
              aria-label={copy.cinemaMode}
              className="h-7 min-w-0 rounded-[8px] px-2.5 text-[11px] font-mono text-[#A19F99] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.08] gap-1 whitespace-nowrap"
            >
              <EyeOff className="w-3 h-3 shrink-0" />
              <span className="hidden xl:inline">{copy.cinemaMode}</span>
            </Button>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
