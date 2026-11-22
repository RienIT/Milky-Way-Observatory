'use client';

import React, { useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Pause,
  Play,
  X,
} from 'lucide-react';
import { GuidedTourDefinition } from '@/lib/guided-tours';
import { LanguageCode } from '@/lib/i18n';

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

  // Keyboard navigation while a guided tour is active: Left/Right arrows & Escape
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

  return (
    <aside
      aria-label={tour.title[lang]}
      data-testid="guided-tour-bar"
      className="pointer-events-auto absolute left-1/2 -translate-x-1/2 bottom-[106px] z-30 w-[calc(100%-24px)] max-w-[580px] rounded-[4px] bg-[#0a0c10]/95 border border-white/[0.12] shadow-2xl px-4 py-3 flex flex-col gap-2"
    >
      {/* Top Header Row: Tour Name + Chapter Counter + Controls */}
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Compass className="w-3.5 h-3.5 text-[#E88B38] shrink-0" />
          <span className="text-[10px] font-mono uppercase tracking-[0.08em] text-[#E88B38] shrink-0">
            {copy.expeditionLabel}
          </span>
          <span className="text-white/20 text-xs">/</span>
          <span className="text-[11px] font-medium text-[#C8C6C0] truncate">
            {tour.title[lang]}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span
            data-testid="tour-step-counter"
            className="font-mono text-[10px] tabular-nums text-[#8A8D96] mr-1"
          >
            {String(stopIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <button
            type="button"
            data-testid="tour-prev-btn"
            onClick={onPrev}
            disabled={stopIndex === 0}
            aria-label={copy.prevAria}
            className="p-1 rounded-[2px] text-[#C8C6C0] hover:text-[#ECEAE4] hover:bg-white/[0.07] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            data-testid="tour-autoplay-btn"
            aria-pressed={isAutoPlaying}
            onClick={onToggleAutoPlay}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-mono transition-colors ${
              isAutoPlaying
                ? 'bg-[#E88B38] text-[#050608] font-semibold'
                : 'bg-white/[0.06] text-[#C8C6C0] hover:text-[#ECEAE4] hover:bg-white/[0.10]'
            }`}
          >
            {isAutoPlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
            <span>{isAutoPlaying ? copy.pauseAuto : copy.playAuto}</span>
          </button>
          <button
            type="button"
            data-testid="tour-next-btn"
            onClick={onNext}
            aria-label={copy.nextAria}
            className="p-1 rounded-[2px] text-[#C8C6C0] hover:text-[#ECEAE4] hover:bg-white/[0.07] transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            data-testid="tour-close-btn"
            onClick={onClose}
            aria-label={copy.exitTour}
            className="p-1 ml-0.5 rounded-[2px] text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.07] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chapter Title + Physical Telemetry Metric */}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3
          data-testid="tour-stop-title"
          className="text-[13px] font-semibold text-[#ECEAE4] tracking-[-0.01em]"
        >
          {stop.title[lang]}
        </h3>
        <span className="text-[10px] font-mono tabular-nums text-[#E88B38]">
          {stop.metricLabel}
        </span>
      </div>

      {/* Concise Scientific Narrative */}
      <p
        data-testid="tour-stop-narrative"
        className="text-[12px] leading-relaxed text-[#C8C6C0]"
      >
        {stop.narrative[lang]}
      </p>

      {/* Segmented Chapter Ticks + Keyboard Hint */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1 flex-1">
          {tour.stops.map((item, idx) => {
            const active = idx === stopIndex;
            const passed = idx < stopIndex;
            return (
              <button
                key={item.id}
                type="button"
                aria-label={item.title[lang]}
                onClick={() => onJumpToStop(idx)}
                className="flex-1 py-1 group focus:outline-none"
              >
                <div
                  className={`h-[3px] rounded-[1px] transition-colors ${
                    active
                      ? 'bg-[#E88B38]'
                      : passed
                        ? 'bg-[#E88B38]/45 group-hover:bg-[#E88B38]/75'
                        : 'bg-white/[0.12] group-hover:bg-white/[0.28]'
                  }`}
                />
              </button>
            );
          })}
        </div>
        <span className="hidden sm:inline text-[10px] font-mono text-[#6B707B] whitespace-nowrap">
          {copy.keysHint}
        </span>
      </div>
    </aside>
  );
}
