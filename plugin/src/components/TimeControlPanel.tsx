'use client';

import React from 'react';
import { Clock, Pause, Play, RotateCcw } from 'lucide-react';
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
  onTogglePlay: () => void;
  onChangeSpeed: (secondsPerSec: number) => void;
  onResetToNow: () => void;
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
  onTogglePlay,
  onChangeSpeed,
  onResetToNow,
}: TimeControlPanelProps) {
  const copy = UNIVERSE_HUD_COPY[lang];
  const moonPct = Math.round(Math.max(0, Math.min(1, moonPhaseFraction)) * 100);

  return (
    <div
      data-testid="time-control-panel"
      className="pointer-events-auto absolute top-2.5 right-2.5 z-20 rounded-[10px] bg-[#111318]/95 border border-white/[0.10] px-3 py-2 shadow-2xl flex flex-col gap-1.5 max-w-[330px]"
    >
      {/* Top Line: Ephemeris Date + Moon Illumination + Reset to Now */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Clock className="w-3.5 h-3.5 text-[#54a8ff] shrink-0" />
          <span
            data-testid="sim-date-readout"
            className="text-[11px] font-mono tabular-nums font-semibold text-[#f3f4f6] whitespace-nowrap"
          >
            {formatUtcTimestamp(simDateMs)}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="hidden sm:inline text-[10px] font-mono tabular-nums text-[#9ca3af]"
            title={copy.moonPhaseLabel}
          >
            {copy.moonPhaseLabel} {moonPct}%
          </span>
          <button
            type="button"
            data-testid="time-reset-now-btn"
            onClick={onResetToNow}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[5px] bg-[#181b22] hover:bg-[#232834] text-[10px] font-medium text-[#d1d5db] hover:text-white transition-colors"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>{copy.resetToNow}</span>
          </button>
        </div>
      </div>

      {/* Bottom Line: Play/Pause + Speed Presets */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          data-testid="time-play-pause-btn"
          onClick={onTogglePlay}
          aria-label={isPlaying ? copy.pause : copy.play}
          className="inline-flex items-center justify-center w-6 h-6 rounded-[6px] bg-[#0082fb] hover:bg-[#1991ff] text-white transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          {isPlaying ? (
            <Pause className="w-3 h-3" />
          ) : (
            <Play className="w-3 h-3" />
          )}
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
                className={`flex-1 px-1.5 py-1 rounded-[5px] text-[10px] font-mono transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#1f2430] text-[#54a8ff] font-semibold border border-[#0082fb]/40'
                    : 'text-[#9ca3af] hover:text-white hover:bg-[#181b22] border border-transparent'
                }`}
              >
                {copy.timeSpeeds[preset.id]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
