'use client';

import React, { useState } from 'react';
import { Orbit } from 'lucide-react';

export interface ObservatoryLogoProps {
  size?: number;
  className?: string;
  assetBasePath?: string;
}

/**
 * Brand logo mark for Milky Way Observatory — renders the bespoke stepped
 * sunset-stripe spiral galaxy emblem with resilient Lucide fallback.
 */
export default function ObservatoryLogo({
  size = 24,
  className = '',
  assetBasePath = '',
}: ObservatoryLogoProps) {
  const [failed, setFailed] = useState(false);
  const normalizedBase = assetBasePath ? assetBasePath.replace(/\/$/, '') : '';
  const src = `${normalizedBase}/logo.jpg`;

  if (failed) {
    return (
      <span
        aria-hidden="true"
        style={{ width: size, height: size }}
        className={`inline-flex items-center justify-center rounded-[6px] bg-[#111111] border border-[#FA500F]/40 text-[#FA500F] shrink-0 ${className}`}
      >
        <Orbit style={{ width: Math.round(size * 0.58), height: Math.round(size * 0.58) }} />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Milky Way Observatory logo"
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      style={{ width: size, height: size }}
      className={`rounded-[6px] object-cover shrink-0 border border-black/15 ${className}`}
    />
  );
}
