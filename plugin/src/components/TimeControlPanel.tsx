'use client';

import React from 'react';
import { Button, Card, Chip, Dropdown } from '@heroui/react';
import { ChevronDown, Clock, Eclipse, Pause, Play, RotateCcw } from 'lucide-react';
import {
  SOLAR_ECLIPSE_PRESETS,
  SolarEclipsePreset,
} from '../lib/astrophysics-science';
import { LanguageCode } from '../lib/i18n';
import { UNIVERSE_HUD_COPY } from '../lib/universe-i18n';

export interface TimeSpeedPreset {
  id: 'realtime' | 'hourPerSec' | 'dayPerSec' | 'monthPerSec' | 'yearPerSec';
  secondsPerSecond: number;
}

export const TIME_SPEED_PRESETS: readonly TimeSpeedPreset[] = [
  { id: 'realtime', secondsPerSecond: 1 },
  { id: 'hourPerSec', secondsPerSecond: 3_600 },
  { id: 'dayPerSec', secondsPerSecond: 86_400 },
  { id: 'monthPerSec', secondsPerSecond: 30 * 86_400 },
  { id: 'yearPerSec', secondsPerSecond: 365.25 * 86_400 },
];

export interface TimeControlPanelProps {
  lang: LanguageCode;
  simDateMs: number;
  isPlaying: boolean;
  speedSecondsPerSec: number;
  moonPhaseFraction: number;
  eclipseActive?: boolean;
  eclipseStudioOpen?: boolean;
  onTogglePlay: () => void;
  onChangeSpeed: (secondsPerSec: number) => void;
  onResetToNow: () => void;
  onJumpToEclipse?: (preset: SolarEclipsePreset) => void;
  onOpenEclipseStudio?: () => void;
}

function formatUtcTimestamp(ms: number): string {
  const d = new Date(ms);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min} UTC`;
}

export default function TimeControlPanel({
  lang,
  simDateMs,
  isPlaying,
  speedSecondsPerSec,
  moonPhaseFraction,
  eclipseActive = false,
  eclipseStudioOpen = false,
  onTogglePlay,
  onChangeSpeed,
  onResetToNow,
  onJumpToEclipse,
  onOpenEclipseStudio,
}: TimeControlPanelProps) {
  const copy = UNIVERSE_HUD_COPY[lang];
  const moonPct = Math.round(Math.max(0, Math.min(1, moonPhaseFraction)) * 100);

  return (
    <Card
      data-testid="time-control-panel"
      className="pointer-events-auto absolute top-[60px] inset-x-3 @[540px]/obs:left-auto @[540px]/obs:right-3 @[1220px]/obs:top-3 z-20 rounded-[12px] bg-[#141416]/95 border border-[#FFF8E7]/12 shadow-[0_12px_24px_-4px_rgba(0,0,0,0.35)] max-w-[calc(100%-24px)] @[540px]/obs:max-w-[420px] p-0 overflow-hidden"
    >
      <Card.Content className="px-3 py-2 @[540px]/obs:px-3.5 @[540px]/obs:py-2.5 flex flex-col gap-1.5 @[540px]/obs:gap-2 overflow-visible">
        {/* Top Line: Ephemeris Date + Moon Illumination + Reset to Now */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <Clock className="w-3.5 h-3.5 text-[#FA500F] shrink-0" />
            <span
              data-testid="sim-date-readout"
              className="text-[11px] font-mono tabular-nums font-semibold text-[#FFF8E7] whitespace-nowrap truncate"
            >
              {formatUtcTimestamp(simDateMs)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {eclipseActive ? (
              <button
                type="button"
                onClick={onOpenEclipseStudio}
                className="cursor-pointer"
              >
                <Chip
                  data-testid="eclipse-active-indicator"
                  size="sm"
                  variant="soft"
                  color="accent"
                  className="h-5 rounded-full bg-[#FA500F] px-2 text-[10px] font-mono font-semibold text-white"
                >
                  {copy.eclipseActiveBadge}
                </Chip>
              </button>
            ) : (
              <span
                className="hidden @[440px]/obs:inline text-[10px] font-mono tabular-nums text-[#A19F99] whitespace-nowrap"
                title={copy.moonPhaseLabel}
              >
                {copy.moonPhaseLabel} {moonPct}%
              </span>
            )}
            <Button
              size="sm"
              variant="secondary"
              data-testid="time-reset-now-btn"
              onPress={onResetToNow}
              className="h-6 min-w-0 rounded-[8px] px-2 bg-[#FFF8E7]/[0.08] hover:bg-[#FFF8E7]/[0.14] text-[10px] font-mono text-[#F5F2EB] gap-1 shrink-0"
            >
              <RotateCcw className="w-2.5 h-2.5 shrink-0" />
              <span>{copy.resetToNow}</span>
            </Button>
          </div>
        </div>

        {/* Bottom Line: Play/Pause + Speed Presets + Solar Eclipse Quick-Jump */}
        <div className="flex items-center gap-1 min-w-0">
          <Button
            isIconOnly
            size="sm"
            variant="primary"
            data-testid="time-play-pause-btn"
            onPress={onTogglePlay}
            aria-label={isPlaying ? copy.pause : copy.play}
            className="w-7 h-7 min-w-7 rounded-[8px] bg-[#FA500F] hover:bg-[#D93D04] text-white shrink-0 p-0 inline-flex items-center justify-center leading-none"
          >
            {isPlaying ? <Pause className="w-3 h-3 shrink-0 block" /> : <Play className="w-3 h-3 shrink-0 block" />}
          </Button>

          <div className="grid grid-cols-5 gap-0.5 flex-1 min-w-0">
            {TIME_SPEED_PRESETS.map((preset) => {
              const active = Math.abs(speedSecondsPerSec - preset.secondsPerSecond) < 0.5;
              return (
                <Button
                  key={preset.id}
                  size="sm"
                  fullWidth
                  variant={active ? 'outline' : 'ghost'}
                  data-testid={`time-speed-${preset.id}`}
                  onPress={() => onChangeSpeed(preset.secondsPerSecond)}
                  className={`w-full h-7 min-w-0 max-w-full overflow-hidden rounded-[8px] px-0.5 @[540px]/obs:px-1.5 text-[10px] font-mono whitespace-nowrap ${
                    active
                      ? 'bg-[#FA500F]/18 text-[#FFD800] font-semibold border-[#FA500F]/60'
                      : 'text-[#A19F99] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.07] border-transparent'
                  }`}
                >
                  <span className="truncate">{copy.timeSpeeds[preset.id]}</span>
                </Button>
              );
            })}
          </div>

          {/* Timeless Real Solar Eclipse Presets Dropdown */}
          {onJumpToEclipse && (
            <Dropdown>
              <Button
                size="sm"
                variant="outline"
                data-testid="eclipse-presets-trigger"
                aria-label={copy.eclipseBtn}
                className={`h-7 min-w-0 rounded-[8px] px-1.5 @[540px]/obs:px-2 text-[10px] font-mono gap-1 whitespace-nowrap shrink-0 ${
                  eclipseActive || eclipseStudioOpen
                    ? 'bg-[#FA500F]/20 text-[#FFD800] border-[#FA500F]/60'
                    : 'bg-[#FFF8E7]/[0.06] text-[#F5F2EB] hover:bg-[#FFF8E7]/[0.12] border-[#FFF8E7]/12'
                }`}
              >
                <Eclipse className="w-3 h-3 text-[#FFAF00] shrink-0" />
                <span className="hidden @[440px]/obs:inline">{copy.eclipseBtn}</span>
                <ChevronDown className="w-2.5 h-2.5 shrink-0" />
              </Button>
              <Dropdown.Popover
                placement="bottom end"
                data-theme="dark"
                data-mw-observatory="true"
                className="dark z-[99999] bg-[#141416] border border-[#FFF8E7]/14 rounded-[12px] p-1.5 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.45)] min-w-[272px] max-w-[calc(100vw-24px)]"
              >
                <Dropdown.Menu
                  aria-label={copy.eclipseBtn}
                  data-testid="eclipse-presets-menu"
                  onAction={(key) => {
                    const found = SOLAR_ECLIPSE_PRESETS.find((p) => p.id === String(key));
                    if (found) onJumpToEclipse(found);
                  }}
                >
                  {SOLAR_ECLIPSE_PRESETS.map((preset) => {
                    const mins = Math.floor(preset.durationSec / 60);
                    const secs = String(preset.durationSec % 60).padStart(2, '0');
                    return (
                      <Dropdown.Item
                        key={preset.id}
                        id={preset.id}
                        data-testid={`eclipse-preset-${preset.id}`}
                        textValue={`${preset.shortLabel} ${preset.region[lang]}`}
                        className="rounded-[8px] px-3 py-2 data-[hovered=true]:bg-[#FFF8E7]/[0.07]"
                      >
                        <div className="space-y-0.5 w-full">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-mono font-medium text-[#FFF8E7]">
                              {preset.shortLabel}
                            </span>
                            <span className="text-[10px] font-mono text-[#FFAF00] tabular-nums">
                              {mins}m {secs}s
                            </span>
                          </div>
                          <p className="text-[11px] text-[#A19F99]">{preset.region[lang]}</p>
                        </div>
                      </Dropdown.Item>
                    );
                  })}
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          )}
        </div>
      </Card.Content>
    </Card>
  );
}
