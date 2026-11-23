'use client';

import React from 'react';

export interface SunsetStripeBandProps {
  variant?: 'band' | 'hairline' | 'stepped';
  className?: string;
}

/**
 * Signature Mistral-inspired horizontal sunset stripe band:
 * deep vermilion (#E10500) -> brand orange (#FA500F) -> sunshine orange (#FF8205)
 * -> sunshine amber (#FFAF00) -> saturated yellow (#FFD800) -> warm cream (#FFF8E7).
 */
export default function SunsetStripeBand({
  variant = 'band',
  className = '',
}: SunsetStripeBandProps) {
  if (variant === 'hairline') {
    return (
      <div
        aria-hidden="true"
        data-testid="sunset-stripe-hairline"
        className={`w-full h-[3px] shrink-0 ${className}`}
        style={{
          background:
            'linear-gradient(90deg, #E10500 0%, #FA500F 24%, #FF8205 48%, #FFAF00 72%, #FFD800 88%, #FFF8E7 100%)',
        }}
      />
    );
  }

  if (variant === 'stepped') {
    return (
      <div
        aria-hidden="true"
        data-testid="sunset-stripe-band"
        className={`w-full flex flex-col shrink-0 ${className}`}
      >
        <div className="w-full h-2.5 bg-[#E10500]" />
        <div className="w-full h-2.5 bg-[#FA500F]" />
        <div className="w-full h-2.5 bg-[#FF8205]" />
        <div className="w-full h-2.5 bg-[#FFAF00]" />
        <div className="w-full h-2.5 bg-[#FFD800]" />
        <div className="w-full h-2.5 bg-[#FFF8E7]" />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      data-testid="sunset-stripe-band"
      className={`w-full h-14 sm:h-16 shrink-0 ${className}`}
      style={{
        background:
          'linear-gradient(180deg, #E10500 0%, #FA500F 22%, #FF8205 44%, #FFAF00 66%, #FFD800 84%, #FFF8E7 100%)',
      }}
    />
  );
}
