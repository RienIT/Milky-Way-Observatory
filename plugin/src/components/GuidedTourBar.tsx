'use client';

import React, { useEffect } from 'react';
import { Button, Card, Chip, ProgressBar, Separator } from '@heroui/react';
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Pause,
  Play,
  X,
} from 'lucide-react';
import SunsetStripeBand from './SunsetStripeBand';
import { GuidedTourDefinition } from '../lib/guided-tours';
import { LanguageCode } from '../lib/i18n';

export interface GuidedTourBarProps {
  tour: GuidedTourDefinition;
  stopIndex: number;
  isAutoPlaying: boolean;
  lang: LanguageCode;
  hiddenInCinemaMode?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onJumpToStop: (index: number) => void;
  onToggleAutoPlay: () => void;
  onClose: () => void;
}

const TOUR_BAR_COPY: Record<
  LanguageCode,
  {
    expeditionLabel: string;
    prevAria: string;
    nextAria: string;
    playAuto: string;
    pauseAuto: string;
    exitTour: string;
    keysHint: string;
  }
> = {
  en: {
    expeditionLabel: 'GUIDED EXPEDITION',
    prevAria: 'Previous stop',
    nextAria: 'Next stop',
    playAuto: 'Auto',
    pauseAuto: 'Pause',
    exitTour: 'Exit tour',
    keysHint: '←/→ Chapter · Esc Exit',
  },
  vi: {
    expeditionLabel: 'CHUYẾN THÁM HIỂM KHOA HỌC',
    prevAria: 'Chặng trước',
    nextAria: 'Chặng tiếp theo',
    playAuto: 'Tự động',
    pauseAuto: 'Tạm dừng',
    exitTour: 'Thoát tour',
    keysHint: '←/→ Chuyển chặng · Esc Thoát',
  },
  ja: {
    expeditionLabel: '科学ガイドツアー',
    prevAria: '前のチャプター',
    nextAria: '次のチャプター',
    playAuto: '自動再生',
    pauseAuto: '一時停止',
    exitTour: 'ツアー終了',
    keysHint: '←/→ 移動 · Esc 終了',
  },
  zh: {
    expeditionLabel: '科学导览航程',
    prevAria: '上一站',
    nextAria: '下一站',
    playAuto: '自动',
    pauseAuto: '暂停',
    exitTour: '退出导览',
    keysHint: '←/→ 切换章节 · Esc 退出',
  },
  ko: {
    expeditionLabel: '과학 가이드 투어',
    prevAria: '이전 챕터',
    nextAria: '다음 챕터',
    playAuto: '자동',
    pauseAuto: '일시정지',
    exitTour: '투어 종료',
    keysHint: '←/→ 이동 · Esc 종료',
  },
};

export default function GuidedTourBar({
  tour,
  stopIndex,
  isAutoPlaying,
  lang,
  hiddenInCinemaMode = false,
  onPrev,
  onNext,
  onJumpToStop,
  onToggleAutoPlay,
  onClose,
}: GuidedTourBarProps) {
  const copy = TOUR_BAR_COPY[lang];
  const stop = tour.stops[stopIndex] ?? tour.stops[0];
  const total = tour.stops.length;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditing =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);
      if (isEditing || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, onNext, onPrev]);

  if (!stop || hiddenInCinemaMode) return null;

  const pct = total > 0 ? ((stopIndex + 1) / total) * 100 : 0;

  return (
    <aside
      aria-label={tour.title[lang]}
      data-testid="guided-tour-bar"
      className="pointer-events-auto absolute left-1/2 -translate-x-1/2 bottom-[144px] @[680px]/obs:bottom-[108px] z-30 w-[calc(100%-24px)] max-w-[580px]"
    >
      <Card className="rounded-[12px] bg-[#141416]/95 border border-[#FFF8E7]/14 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.5)] p-0 overflow-hidden">
        <SunsetStripeBand variant="hairline" />
        <Card.Content className="px-3.5 py-2.5 @[640px]/obs:px-5 @[640px]/obs:py-3.5 flex flex-col gap-2 @[640px]/obs:gap-2.5">
          {/* Top Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 @[640px]/obs:gap-2 min-w-0">
              <Compass className="w-3.5 h-3.5 text-[#FA500F] shrink-0" />
              <span className="text-[10px] font-mono uppercase tracking-[0.08em] text-[#FFAF00] truncate">
                {copy.expeditionLabel}
              </span>
              <span className="hidden @[500px]/obs:inline text-[#FFF8E7]/25 text-xs shrink-0">/</span>
              <span className="hidden @[500px]/obs:inline text-[12px] font-medium text-[#D6D3CB] truncate">
                {tour.title[lang]}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span
                data-testid="tour-step-counter"
                className="font-mono text-[11px] tabular-nums text-[#A19F99] mr-1"
              >
                {String(stopIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                data-testid="tour-prev-btn"
                onPress={onPrev}
                isDisabled={stopIndex === 0}
                aria-label={copy.prevAria}
                className="w-7 h-7 min-w-7 rounded-[8px] p-0 text-[#D6D3CB] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.08]"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="sm"
                variant={isAutoPlaying ? 'primary' : 'secondary'}
                data-testid="tour-autoplay-btn"
                aria-pressed={isAutoPlaying}
                onPress={onToggleAutoPlay}
                className={`h-7 min-w-0 rounded-[8px] px-2.5 text-[11px] font-mono gap-1 ${
                  isAutoPlaying
                    ? 'bg-[#FA500F] hover:bg-[#D93D04] text-white font-semibold'
                    : 'bg-[#FFF8E7]/[0.08] text-[#F5F2EB] hover:bg-[#FFF8E7]/[0.14]'
                }`}
              >
                {isAutoPlaying ? (
                  <Pause className="w-2.5 h-2.5 shrink-0" />
                ) : (
                  <Play className="w-2.5 h-2.5 shrink-0" />
                )}
                <span>{isAutoPlaying ? copy.pauseAuto : copy.playAuto}</span>
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                data-testid="tour-next-btn"
                onPress={onNext}
                aria-label={copy.nextAria}
                className="w-7 h-7 min-w-7 rounded-[8px] p-0 text-[#D6D3CB] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.08]"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                data-testid="tour-close-btn"
                onPress={onClose}
                aria-label={copy.exitTour}
                className="w-7 h-7 min-w-7 rounded-[8px] p-0 text-[#A19F99] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.08]"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <Separator className="bg-[#FFF8E7]/10" />

          {/* Chapter Title (Editorial Serif) + Physical Telemetry Metric Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3
              data-testid="tour-stop-title"
              className="font-display text-[16px] @[640px]/obs:text-[19px] font-normal leading-[1.2] text-[#FFF8E7] tracking-[-0.01em]"
            >
              {stop.title[lang]}
            </h3>
            <Chip
              size="sm"
              variant="soft"
              color="accent"
              className="h-6 rounded-full bg-[#FFF8E7]/[0.09] border border-[#FFAF00]/35 px-2.5 text-[10px] @[640px]/obs:text-[11px] font-mono tabular-nums text-[#FFD800]"
            >
              {stop.metricLabel}
            </Chip>
          </div>

          {/* Concise Scientific Narrative */}
          <p
            data-testid="tour-stop-narrative"
            className="text-[12px] @[640px]/obs:text-[13px] leading-[1.55] text-[#D6D3CB]"
          >
            {stop.narrative[lang]}
          </p>

          {/* HeroUI ProgressBar + Interactive Chapter Ticks + Keyboard Hint */}
          <div className="space-y-1.5 pt-1">
            <ProgressBar
              aria-label={tour.title[lang]}
              value={pct}
              minValue={0}
              maxValue={100}
              className="w-full"
            >
              <ProgressBar.Track className="h-[3px] rounded-[2px] bg-[#FFF8E7]/10 overflow-hidden">
                <ProgressBar.Fill
                  className="rounded-[2px]"
                  style={{
                    background:
                      'linear-gradient(90deg, #E10500 0%, #FA500F 45%, #FFAF00 80%, #FFD800 100%)',
                  }}
                />
              </ProgressBar.Track>
            </ProgressBar>
            <div className="flex items-center justify-between gap-3">
              <div
                className="grid gap-1 flex-1 min-w-0"
                style={{ gridTemplateColumns: `repeat(${Math.max(1, tour.stops.length)}, minmax(0, 1fr))` }}
              >
                {tour.stops.map((item, idx) => {
                  const active = idx === stopIndex;
                  const passed = idx < stopIndex;
                  return (
                    <Button
                      key={item.id}
                      size="sm"
                      fullWidth
                      variant="ghost"
                      aria-label={item.title[lang]}
                      onPress={() => onJumpToStop(idx)}
                      className={`w-full h-2 min-w-0 rounded-[2px] p-0 ${
                        active
                          ? 'bg-[#FA500F]'
                          : passed
                            ? 'bg-[#FFAF00]/60 hover:bg-[#FFAF00]'
                            : 'bg-[#FFF8E7]/12 hover:bg-[#FFF8E7]/25'
                      }`}
                    />
                  );
                })}
              </div>
              <span className="hidden @[600px]/obs:inline text-[10px] font-mono text-[#8F8D87] whitespace-nowrap">
                {copy.keysHint}
              </span>
            </div>
          </div>
        </Card.Content>
      </Card>
    </aside>
  );
}
