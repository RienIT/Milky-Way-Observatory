'use client';

import React, { useState } from 'react';
import { ChevronDown, Clock, Eclipse, Pause, Play, RotateCcw } from 'lucide-react';
import {
  SOLAR_ECLIPSE_PRESETS,
  SolarEclipsePreset,
} from '@/lib/astrophysics-science';
import { LanguageCode } from '@/lib/i18n';
import { UNIVERSE_HUD_COPY } from '@/lib/universe-i18n';

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
  onTogglePlay: () => void;
  onChangeSpeed: (secondsPerSec: number) => void;
  onResetToNow: () => void;
  onJumpToEclipse?: (preset: SolarEclipsePreset) => void;
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
  onTogglePlay,
  onChangeSpeed,
  onResetToNow,
  onJumpToEclipse,
}: TimeControlPanelProps) {
  const [eclipseMenuOpen, setEclipseMenuOpen] = useState(false);
  const copy = UNIVERSE_HUD_COPY[lang];
  const moonPct = Math.round(Math.max(0, Math.min(1, moonPhaseFraction)) * 100);

  return (
    <div
      data-testid="time-control-panel"
      className="pointer-events-auto absolute top-3 right-3 z-20 rounded-[4px] bg-[#0a0c10]/95 border border-white/[0.09] px-3 py-2 flex flex-col gap-1.5 max-w-[348px]"
    >
      {/* Top Line: Ephemeris Date + Moon Illumination + Eclipse Jump + Reset to Now */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Clock className="w-3.5 h-3.5 text-[#E88B38] shrink-0" />
          <span
            data-testid="sim-date-readout"
            className="text-[11px] font-mono tabular-nums font-semibold text-[#ECEAE4] whitespace-nowrap"
          >
            {formatUtcTimestamp(simDateMs)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {eclipseActive ? (
            <span
              data-testid="eclipse-active-indicator"
              className="text-[10px] font-mono text-[#E88B38] whitespace-nowrap"
            >
              {copy.eclipseActiveBadge}
            </span>
          ) : (
            <span
              className="hidden sm:inline text-[10px] font-mono tabular-nums text-[#8A8D96]"
              title={copy.moonPhaseLabel}
            >
              {copy.moonPhaseLabel} {moonPct}%
            </span>
          )}
          <button
            type="button"
            data-testid="time-reset-now-btn"
            onClick={onResetToNow}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-white/[0.06] hover:bg-white/[0.11] text-[10px] font-mono text-[#C8C6C0] hover:text-[#ECEAE4] transition-colors"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>{copy.resetToNow}</span>
          </button>
        </div>
      </div>

      {/* Bottom Line: Play/Pause + Speed Presets + Solar Eclipse Quick-Jump */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          data-testid="time-play-pause-btn"
          onClick={onTogglePlay}
          aria-label={isPlaying ? copy.pause : copy.play}
          className="inline-flex items-center justify-center w-6 h-6 rounded-[2px] bg-[#E88B38] hover:bg-[#f09b4e] text-[#050608] transition-colors shrink-0"
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>

        <div className="flex items-center gap-0.5 flex-1">
          {TIME_SPEED_PRESETS.map((preset) => {
            const active = Math.abs(speedSecondsPerSec - preset.secondsPerSecond) < 0.5;
            return (
              <button
                key={preset.id}
                type="button"
                data-testid={`time-speed-${preset.id}`}
                onClick={() => onChangeSpeed(preset.secondsPerSecond)}
                className={`flex-1 px-1.5 py-1 rounded-[2px] text-[10px] font-mono transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-white/[0.10] text-[#E88B38] font-semibold border border-[#E88B38]/40'
                    : 'text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.06] border border-transparent'
                }`}
              >
                {copy.timeSpeeds[preset.id]}
              </button>
            );
          })}
        </div>

        {/* Timeless Real Solar Eclipse Presets Dropdown */}
        {onJumpToEclipse && (
          <div className="relative">
            <button
              type="button"
              data-testid="eclipse-presets-trigger"
              onClick={() => setEclipseMenuOpen((v) => !v)}
              className={`inline-flex items-center gap-1 px-1.5 py-1 rounded-[2px] text-[10px] font-mono border transition-colors whitespace-nowrap ${
                eclipseActive || eclipseMenuOpen
                  ? 'bg-[#E88B38]/18 text-[#E88B38] border-[#E88B38]/45'
                  : 'bg-white/[0.05] text-[#C8C6C0] hover:text-[#ECEAE4] border-white/[0.08]'
              }`}
            >
              <Eclipse className="w-3 h-3" />
              <span className="hidden sm:inline">{copy.eclipseBtn}</span>
              <ChevronDown className="w-2.5 h-2.5" />
            </button>

            {eclipseMenuOpen && (
              <div
                data-testid="eclipse-presets-menu"
                className="absolute right-0 top-full mt-1.5 w-64 rounded-[4px] bg-[#0a0c10] border border-white/[0.12] shadow-2xl divide-y divide-white/[0.06] z-40"
              >
                {SOLAR_ECLIPSE_PRESETS.map((preset) => {
                  const mins = Math.floor(preset.durationSec / 60);
                  const secs = String(preset.durationSec % 60).padStart(2, '0');
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      data-testid={`eclipse-preset-${preset.id}`}
                      onClick={() => {
                        onJumpToEclipse(preset);
                        setEclipseMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-white/[0.06] transition-colors space-y-0.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono font-medium text-[#ECEAE4]">
                          {preset.shortLabel}
                        </span>
                        <span className="text-[10px] font-mono text-[#E88B38] tabular-nums">
                          {mins}m {secs}s
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8A8D96]">{preset.region[lang]}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
