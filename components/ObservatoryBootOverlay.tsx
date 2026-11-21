'use client';

import React from 'react';
import { Check, Circle, Loader2, Orbit } from 'lucide-react';
import {
  BOOT_MILESTONES,
  BOOT_STAGE_PROGRESS,
  BootStageId,
  getBootCopy,
  getBootMilestoneStatus,
} from '@/lib/boot-sequence';
import { LanguageCode } from '@/lib/i18n';

export interface ObservatoryBootOverlayProps {
  stage: BootStageId;
  progress?: number;
  lang?: LanguageCode;
  isFadingOut?: boolean;
}

/**
 * Clean, compositor-friendly startup loading overlay for the WebGL2 observatory.
 * Uses solid/opaque surfaces (zero backdrop-blur over WebGL) and transform/opacity
 * transitions so startup progress paints smoothly without freezing or visual flicker.
 */
export default function ObservatoryBootOverlay({
  stage,
  progress,
  lang = 'en',
  isFadingOut = false,
}: ObservatoryBootOverlayProps) {
  const copy = getBootCopy(lang);
  const clampedProgress = Math.min(
    100,
    Math.max(0, Math.round(progress ?? BOOT_STAGE_PROGRESS[stage]))
  );
  const activeStageLabel = copy.stages[stage];

  return (
    <div
      data-testid="observatory-boot-overlay"
      data-boot-stage={stage}
      role="status"
      aria-live="polite"
      aria-busy={stage !== 'ready'}
      className={`absolute inset-0 z-50 flex items-center justify-center bg-[#05060a] px-4 transition-opacity duration-500 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
    >
      <div className="w-full max-w-[420px] rounded-[16px] bg-[#0d1017] border border-white/[0.08] p-6 sm:p-7 shadow-2xl">
        {/* Header & Subtle Orbital Emblem */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#131824] border border-white/[0.09]">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full border border-transparent border-t-[#3b82f6] border-r-[#3b82f6]/40 animate-spin motion-reduce:animate-none"
              style={{ animationDuration: '4.5s' }}
            />
            <Orbit className="h-5 w-5 text-[#60a5fa]" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold tracking-tight text-[#f3f4f6] truncate">
              {copy.title}
            </h2>
            <p className="text-xs text-[#9ca3af] mt-0.5 truncate">{copy.subtitle}</p>
          </div>
        </div>

        {/* Active Stage & Monotonic Progress Bar */}
        <div className="mt-6">
          <div className="flex items-baseline justify-between gap-3">
            <span
              data-testid="boot-stage-label"
              className="text-xs font-medium text-[#e5e7eb] truncate"
            >
              {activeStageLabel}
            </span>
            <span
              data-testid="boot-progress-percent"
              className="shrink-0 font-mono text-xs font-medium text-[#60a5fa] tabular-nums"
            >
              {clampedProgress}%
            </span>
          </div>

          <div
            role="progressbar"
            aria-label={copy.title}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={clampedProgress}
            className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]"
          >
            <div
              className="h-full w-full origin-left rounded-full bg-[#0082fb] transition-transform duration-300 ease-out"
              style={{ transform: `scaleX(${clampedProgress / 100})` }}
            />
          </div>
        </div>

        {/* Real Engine Initialization Milestones */}
        <ul className="mt-5 grid grid-cols-1 gap-2 border-t border-white/[0.06] pt-4">
          {BOOT_MILESTONES.map((milestoneId) => {
            const status = getBootMilestoneStatus(stage, milestoneId);
            return (
              <li
                key={milestoneId}
                data-milestone={milestoneId}
                data-status={status}
                className="flex items-center gap-2.5 text-xs"
              >
                {status === 'done' ? (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0082fb]/20 text-[#60a5fa]">
                    <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                  </span>
                ) : status === 'active' ? (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[#60a5fa]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
                  </span>
                ) : (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[#4b5563]">
                    <Circle className="h-2.5 w-2.5" strokeWidth={2} />
                  </span>
                )}
                <span
                  className={
                    status === 'done'
                      ? 'text-[#d1d5db]'
                      : status === 'active'
                        ? 'text-[#f9fafb] font-medium'
                        : 'text-[#6b7280]'
                  }
                >
                  {copy.milestones[milestoneId]}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-[11px] leading-relaxed text-[#6b7280]">{copy.reassurance}</p>
      </div>
    </div>
  );
}
