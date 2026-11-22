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
 * Precision aerospace monochrome surface (zero backdrop-blur over WebGL) with optical amber signal.
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
      className={`absolute inset-0 z-50 flex items-center justify-center bg-[#030406] px-4 transition-opacity duration-500 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
    >
      <div className="w-full max-w-[420px] rounded-[4px] bg-[#0a0c10] border border-white/[0.11] p-6 sm:p-7 shadow-2xl">
        {/* Header & Precision Orbital Emblem */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] bg-[#10131a] border border-white/[0.10]">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-[4px] border border-transparent border-t-[#E88B38] animate-spin motion-reduce:animate-none"
              style={{ animationDuration: '4.5s' }}
            />
            <Orbit className="h-4 w-4 text-[#E88B38]" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-[#ECEAE4] truncate">
              {copy.title}
            </h2>
            <p className="text-[11px] font-mono text-[#8A8D96] mt-0.5 truncate">
              {copy.subtitle}
            </p>
          </div>
        </div>

        {/* Active Stage & Monotonic Progress Bar */}
        <div className="mt-6">
          <div className="flex items-baseline justify-between gap-3">
            <span
              data-testid="boot-stage-label"
              className="text-xs font-medium text-[#ECEAE4] truncate"
            >
              {activeStageLabel}
            </span>
            <span
              data-testid="boot-progress-percent"
              className="shrink-0 font-mono text-xs font-medium text-[#E88B38] tabular-nums"
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
            className="mt-2.5 h-1 w-full overflow-hidden rounded-[1px] bg-white/[0.08]"
          >
            <div
              className="h-full w-full origin-left bg-[#E88B38] transition-transform duration-300 ease-out"
              style={{ transform: `scaleX(${clampedProgress / 100})` }}
            />
          </div>
        </div>

        {/* Real Engine Initialization Milestones */}
        <ul className="mt-5 grid grid-cols-1 gap-2 border-t border-white/[0.08] pt-4">
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
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] bg-[#E88B38]/18 text-[#E88B38]">
                    <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                  </span>
                ) : status === 'active' ? (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[#E88B38]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
                  </span>
                ) : (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[#4F5460]">
                    <Circle className="h-2.5 w-2.5" strokeWidth={2} />
                  </span>
                )}
                <span
                  className={
                    status === 'done'
                      ? 'text-[#C8C6C0]'
                      : status === 'active'
                        ? 'text-[#ECEAE4] font-medium'
                        : 'text-[#6B707B]'
                  }
                >
                  {copy.milestones[milestoneId]}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-[11px] leading-relaxed text-[#6B707B]">{copy.reassurance}</p>
      </div>
    </div>
  );
}
