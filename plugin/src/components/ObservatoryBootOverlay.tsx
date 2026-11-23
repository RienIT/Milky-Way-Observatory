'use client';

import React from 'react';
import { Card, ProgressBar, Separator } from '@heroui/react';
import { Check, Circle, Loader2 } from 'lucide-react';
import ObservatoryLogo from './ObservatoryLogo';
import SunsetStripeBand from './SunsetStripeBand';
import {
  BOOT_MILESTONES,
  BOOT_STAGE_PROGRESS,
  BootStageId,
  getBootCopy,
  getBootMilestoneStatus,
} from '../lib/boot-sequence';
import { LanguageCode } from '../lib/i18n';

export interface ObservatoryBootOverlayProps {
  stage: BootStageId;
  progress?: number;
  lang?: LanguageCode;
  isFadingOut?: boolean;
  assetBasePath?: string;
}

/**
 * Mistral-editorial dark studio startup overlay for the WebGL2 observatory.
 * Features ObservatoryLogo, Playfair Display editorial title, Sunset Stripe accent,
 * and monotonic HeroUI v3 ProgressBar.
 */
export default function ObservatoryBootOverlay({
  stage,
  progress,
  lang = 'en',
  isFadingOut = false,
  assetBasePath = '',
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
      <Card className="w-full max-w-[440px] rounded-[12px] bg-[#141416] border border-[#FFF8E7]/12 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.45)] p-0 overflow-hidden">
        <SunsetStripeBand variant="hairline" />
        <Card.Content className="p-6 sm:p-7 space-y-5">
          {/* Header & Brand Logo Mark */}
          <div className="flex items-center gap-3.5">
            <ObservatoryLogo size={42} assetBasePath={assetBasePath} />
            <div className="min-w-0">
              <h2 className="font-display text-[20px] font-normal tracking-[-0.015em] text-[#FFF8E7] truncate">
                {copy.title}
              </h2>
              <p className="text-[12px] text-[#A19F99] mt-0.5 truncate">
                {copy.subtitle}
              </p>
            </div>
          </div>

          {/* Active Stage & Sunset-Gradient HeroUI ProgressBar */}
          <div className="space-y-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <span
                data-testid="boot-stage-label"
                className="text-[13px] font-medium text-[#F5F2EB] truncate"
              >
                {activeStageLabel}
              </span>
              <span
                data-testid="boot-progress-percent"
                className="shrink-0 font-mono text-[13px] font-semibold text-[#FA500F] tabular-nums"
              >
                {clampedProgress}%
              </span>
            </div>

            <ProgressBar
              aria-label={copy.title}
              value={clampedProgress}
              minValue={0}
              maxValue={100}
              className="w-full"
            >
              <ProgressBar.Track className="h-1.5 rounded-[4px] bg-white/[0.08] overflow-hidden">
                <ProgressBar.Fill
                  className="rounded-[4px]"
                  style={{
                    background:
                      'linear-gradient(90deg, #E10500 0%, #FA500F 45%, #FFAF00 80%, #FFD800 100%)',
                  }}
                />
              </ProgressBar.Track>
            </ProgressBar>
          </div>

          <Separator className="bg-[#FFF8E7]/10" />

          {/* Real Engine Initialization Milestones */}
          <ul className="grid grid-cols-1 gap-2.5">
            {BOOT_MILESTONES.map((milestoneId) => {
              const status = getBootMilestoneStatus(stage, milestoneId);
              return (
                <li
                  key={milestoneId}
                  data-milestone={milestoneId}
                  data-status={status}
                  className="flex items-center gap-2.5 text-[13px]"
                >
                  {status === 'done' ? (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] bg-[#FA500F] text-white">
                      <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                    </span>
                  ) : status === 'active' ? (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[#FFAF00]">
                      <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
                    </span>
                  ) : (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[#525252]">
                      <Circle className="h-2.5 w-2.5" strokeWidth={2} />
                    </span>
                  )}
                  <span
                    className={
                      status === 'done'
                        ? 'text-[#D6D3CB]'
                        : status === 'active'
                          ? 'text-[#FFF8E7] font-medium'
                          : 'text-[#7C7A74]'
                    }
                  >
                    {copy.milestones[milestoneId]}
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="text-[12px] leading-relaxed text-[#7C7A74]">{copy.reassurance}</p>
        </Card.Content>
      </Card>
    </div>
  );
}
