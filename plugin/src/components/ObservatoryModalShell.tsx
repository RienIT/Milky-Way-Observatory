'use client';

import React, { useEffect } from 'react';
import { Button } from '@heroui/react';
import { X } from 'lucide-react';
import SunsetStripeBand from './SunsetStripeBand';

export interface ObservatoryModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  ariaLabel: string;
  testId?: string;
  placement?: 'center' | 'top';
  theme?: 'dark' | 'light';
  maxWidthClass?: string;
  showCloseButton?: boolean;
  closeButtonAriaLabel?: string;
  children: React.ReactNode;
}

/**
 * Container-scoped dialog shell that renders inside `.mw-observatory-root`
 * (`position: absolute; inset: 0; z-index: 80`) instead of portaling to `document.body`.
 *
 * This guarantees sub-windows (Graphics Settings, Command Palette, World Lab, Shortcuts)
 * ALWAYS appear inside and above any host OS window manager (regardless of host `z-index`,
 * CSS `transform`, or `overflow: hidden`), adapt via `@container/modal`, and scroll safely
 * inside short embedded windows.
 */
export default function ObservatoryModalShell({
  isOpen,
  onClose,
  ariaLabel,
  testId,
  placement = 'center',
  theme = 'dark',
  maxWidthClass = 'max-w-[780px]',
  showCloseButton = true,
  closeButtonAriaLabel = 'Close',
  children,
}: ObservatoryModalShellProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  return (
    <div
      data-mw-observatory="true"
      data-theme={theme}
      data-testid={testId ? `${testId}-backdrop` : undefined}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      className={`absolute inset-0 z-[80] flex justify-center p-2.5 sm:p-4 overflow-hidden bg-black/72 backdrop-blur-[2px] ${
        placement === 'top' ? 'items-start pt-[min(7vh,44px)]' : 'items-center'
      }`}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        data-testid={testId}
        data-theme={theme}
        data-mw-observatory="true"
        onClick={(e) => e.stopPropagation()}
        className={`@container/modal relative flex flex-col w-full ${maxWidthClass} max-h-full rounded-[12px] overflow-hidden ${
          isLight
            ? 'mistral-editorial-light bg-[#FFF8E7] border border-[#E9DFC6] text-[#111111] shadow-[0_16px_48px_-8px_rgba(0,0,0,0.28)]'
            : 'dark bg-[#141416] border border-[#FFF8E7]/16 text-[#F5F2EB] shadow-[0_16px_48px_-8px_rgba(0,0,0,0.65)]'
        }`}
      >
        <SunsetStripeBand variant="hairline" />
        {showCloseButton && (
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            onPress={onClose}
            aria-label={closeButtonAriaLabel}
            className={`absolute top-3 right-3 z-20 w-7 h-7 min-w-7 rounded-[8px] p-0 inline-flex items-center justify-center leading-none ${
              isLight
                ? 'text-[#525252] hover:text-[#111111] hover:bg-[#FEF0C7]'
                : 'text-[#A19F99] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.10]'
            }`}
          >
            <X className="w-4 h-4 shrink-0 block" />
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}
