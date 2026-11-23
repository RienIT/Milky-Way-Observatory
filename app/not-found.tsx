'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Chip } from '@heroui/react';
import ObservatoryLogo from '@/components/ObservatoryLogo';
import SunsetStripeBand from '@/components/SunsetStripeBand';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="mistral-editorial-light min-h-screen w-screen bg-[#FFFFFF] text-[#111111] flex flex-col justify-between overflow-y-auto">
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <Card className="max-w-lg w-full rounded-[12px] bg-[#FFF8E7] border border-[#E9DFC6] shadow-[0_4px_12px_rgba(0,0,0,0.04)] p-0 overflow-hidden">
          <Card.Content className="p-8 sm:p-10 text-center flex flex-col items-center space-y-5">
            <ObservatoryLogo size={52} />

            <Chip
              size="sm"
              className="rounded-full bg-[#FEF0C7] border border-[#E9DFC6] px-3 py-1 font-mono text-[12px] font-semibold text-[#111111]"
            >
              404 · Sector Uncharted
            </Chip>

            <h1 className="font-display text-[40px] sm:text-[48px] font-normal leading-[1.1] tracking-[-0.02em] text-[#111111] text-balance">
              Coordinates beyond the charted disk.
            </h1>

            <p className="text-[16px] leading-[1.55] text-[#525252] max-w-md">
              The route you requested does not match an active catalog object or
              observatory sector.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="primary"
                onPress={() => router.push('/')}
                className="h-11 rounded-[8px] px-5 bg-[#FA500F] hover:bg-[#D93D04] text-white font-medium text-[14px]"
              >
                Return to Milky Way 3D
              </Button>
            </div>
          </Card.Content>
        </Card>
      </main>

      <div className="w-full shrink-0">
        <SunsetStripeBand variant="band" />
        <footer className="bg-[#FFF8E7] border-t border-[#E9DFC6] py-5 px-6 text-center text-[12px] font-medium text-[#737373]">
          Milky Way 1:1 Observatory · NASA JPL &amp; ESA Gaia DR3 Galactic Atlas
        </footer>
      </div>
    </div>
  );
}
