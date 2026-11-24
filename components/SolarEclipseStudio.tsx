'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Chip, Switch } from '@heroui/react';
import {
  ChevronDown,
  ChevronUp,
  Eclipse,
  Eye,
  Globe,
  Orbit,
  Pause,
  Play,
  Sparkles,
  X,
} from 'lucide-react';
import { SOLAR_ECLIPSE_PRESETS, SolarEclipsePreset } from '@/lib/astrophysics-science';
import {
  computeEclipseTelemetry,
  ECLIPSE_STUDIO_COPY,
  ECLIPSE_WINDOW_HALF_SEC,
  EclipseCameraMode,
  EclipseContactId,
  EclipseTelemetry,
  formatEclipseOffset,
} from '@/lib/eclipse-studio';
import { LanguageCode } from '@/lib/i18n';

export interface SolarEclipseStudioProps {
  isOpen: boolean;
  lang: LanguageCode;
  preset: SolarEclipsePreset;
  simDateMs: number;
  cameraMode: EclipseCameraMode;
  isPlaying: boolean;
  speedSecondsPerSec: number;
  showTotalityPath: boolean;
  showShadowCone: boolean;
  showEarthClouds: boolean;
  onSelectPreset: (preset: SolarEclipsePreset) => void;
  onChangeCameraMode: (mode: EclipseCameraMode) => void;
  onScrubOffsetSec: (offsetSec: number) => void;
  onTogglePlay: () => void;
  onChangeSpeed: (secondsPerSec: number) => void;
  onToggleTotalityPath: () => void;
  onToggleShadowCone: () => void;
  onToggleEarthClouds: () => void;
  onClose: () => void;
}

const ECLIPSE_SPEED_OPTIONS = [
  { label: '1×', value: 1 },
  { label: '15×', value: 15 },
  { label: '60×', value: 60 },
  { label: '300×', value: 300 },
] as const;

interface BackgroundStar {
  nx: number;
  ny: number;
  size: number;
  brightness: number;
  hue: string;
}

function createStarField(count: number): BackgroundStar[] {
  let seed = 420812;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const hues = ['#FFF8E7', '#CFE4FF', '#FFE2B8', '#FFFFFF', '#D7E9FF'];
  const stars: BackgroundStar[] = [];
  for (let i = 0; i < count; i += 1) {
    stars.push({
      nx: rnd(),
      ny: rnd() * 0.88,
      size: 0.6 + Math.pow(rnd(), 2.4) * 1.9,
      brightness: 0.25 + rnd() * 0.75,
      hue: hues[i % hues.length],
    });
  }
  return stars;
}

/**
 * Full-viewport real-time optical telescope simulation for Ground Totality mode:
 * renders Eddington limb-darkened photosphere, cratered lunar silhouette with
 * faint earthshine, multi-layer animated solar corona streamers, crimson
 * chromosphere & prominence arches, Baily's Beads, and Diamond Ring flares.
 */
function TotalityTelescopeCanvas({
  telemetry,
  lang,
}: {
  telemetry: EclipseTelemetry;
  lang: LanguageCode;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const telemetryRef = useRef(telemetry);
  useEffect(() => {
    telemetryRef.current = telemetry;
  }, [telemetry]);

  const stars = useMemo(() => createStarField(210), []);
  const copy = ECLIPSE_STUDIO_COPY[lang];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let width = 1;
    let height = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = (nowMs: number) => {
      const tSec = nowMs * 0.001;
      const tel = telemetryRef.current;

      // 1. Dynamic sky dome transitioning smoothly from crisp daylight blue -> deep totality twilight
      const lum = tel.skyLuminance;
      const zenithR = Math.round(4 + lum * 16);
      const zenithG = Math.round(7 + lum * 56);
      const zenithB = Math.round(18 + lum * 138);
      const midR = Math.round(10 + lum * 42);
      const midG = Math.round(15 + lum * 102);
      const midB = Math.round(34 + lum * 168);
      const horR = Math.round(52 * (1 - lum * 0.55) + lum * 125);
      const horG = Math.round(24 * (1 - lum * 0.4) + lum * 168);
      const horB = Math.round(28 * (1 - lum * 0.5) + lum * 212);

      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, `rgb(${zenithR},${zenithG},${zenithB})`);
      skyGrad.addColorStop(0.58, `rgb(${midR},${midG},${midB})`);
      skyGrad.addColorStop(1, `rgb(${horR},${horG},${horB})`);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Warm 360-degree sunset horizon glow during deep totality
      if (lum < 0.35) {
        const horizonStrength = (0.35 - lum) / 0.35;
        const sunsetGrad = ctx.createLinearGradient(0, height * 0.72, 0, height);
        sunsetGrad.addColorStop(0, 'rgba(250, 80, 15, 0)');
        sunsetGrad.addColorStop(0.65, `rgba(217, 61, 4, ${(0.22 * horizonStrength).toFixed(3)})`);
        sunsetGrad.addColorStop(1, `rgba(255, 175, 0, ${(0.34 * horizonStrength).toFixed(3)})`);
        ctx.fillStyle = sunsetGrad;
        ctx.fillRect(0, height * 0.72, width, height * 0.28);
      }

      // Center optical target slightly right of center on wide screens so the left Studio dock never covers the Sun
      const cx = width >= 920 ? width * 0.56 : width * 0.5;
      const cy = height * 0.47;
      const rSun = Math.max(44, Math.min(width, height) * 0.145);
      const rMoon = rSun * tel.moonToSunRadiusRatio;

      // 2. Background stars + bright planets (Venus & Jupiter) emerging during totality
      const starVis = Math.max(0, Math.min(1, (0.42 - lum) / 0.38));
      if (starVis > 0.01) {
        for (let i = 0; i < stars.length; i += 1) {
          const st = stars[i];
          const sx = st.nx * width;
          const sy = st.ny * height;
          const dx = sx - cx;
          const dy = sy - cy;
          if (dx * dx + dy * dy < rSun * rSun * 2.2) continue;
          const twinkle = 0.76 + 0.24 * Math.sin(tSec * 1.9 + i * 2.13);
          ctx.globalAlpha = starVis * st.brightness * twinkle * 0.9;
          ctx.fillStyle = st.hue;
          ctx.beginPath();
          ctx.arc(sx, sy, st.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Bright planets flanking the eclipsed Sun (Venus to lower-right, Jupiter to upper-left)
        const drawPlanetSpark = (px: number, py: number, color: string, radius: number) => {
          const g = ctx.createRadialGradient(px, py, 0, px, py, radius * 5.2);
          g.addColorStop(0, color);
          g.addColorStop(0.35, 'rgba(255,248,231,0.55)');
          g.addColorStop(1, 'rgba(255,248,231,0)');
          ctx.globalAlpha = starVis * 0.95;
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(px, py, radius * 5.2, 0, Math.PI * 2);
          ctx.fill();
        };
        drawPlanetSpark(cx + rSun * 3.15, cy + rSun * 0.72, '#FFF8E7', 2.4);
        drawPlanetSpark(cx - rSun * 2.85, cy - rSun * 1.05, '#FFD9A8', 1.8);
        ctx.globalAlpha = 1;
      }

      // 3. Multi-layer Animated Solar Corona (K-Corona + Equatorial Helmet Streamers + Polar Plumes)
      const coronaVis = tel.coronaIntensity;
      if (coronaVis > 0.015) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.globalCompositeOperation = 'lighter';

        // Broad atmospheric scattering halo around eclipsed Sun
        const outerHalo = ctx.createRadialGradient(0, 0, rSun * 0.92, 0, 0, rSun * 4.9);
        outerHalo.addColorStop(0, `rgba(255, 250, 240, ${(0.52 * coronaVis).toFixed(3)})`);
        outerHalo.addColorStop(0.18, `rgba(220, 236, 255, ${(0.28 * coronaVis).toFixed(3)})`);
        outerHalo.addColorStop(0.45, `rgba(148, 186, 236, ${(0.11 * coronaVis).toFixed(3)})`);
        outerHalo.addColorStop(1, 'rgba(80, 120, 195, 0)');
        ctx.fillStyle = outerHalo;
        ctx.beginPath();
        ctx.arc(0, 0, rSun * 4.9, 0, Math.PI * 2);
        ctx.fill();

        // Soft silky equatorial helmet streamers (layered feathered ellipses + fine filament strokes, no hard polygons)
        const streamerCount = 24;
        for (let i = 0; i < streamerCount; i += 1) {
          const baseAng = (i / streamerCount) * Math.PI * 2 + 0.14;
          // Authentic dipolar NASA totality shape: long equatorial wings, finer polar brushes
          const eqWeight = 0.25 + 0.75 * Math.pow(Math.abs(Math.cos(baseAng - 0.16)), 1.9);
          const wave = Math.sin(tSec * 0.38 + i * 1.43) * 0.045;
          const length = rSun * (1.75 + eqWeight * 2.85 + wave * 1.2);
          const halfWidth = rSun * (0.24 + eqWeight * 0.36);

          ctx.save();
          ctx.rotate(baseAng + wave * 0.22);
          const sGrad = ctx.createRadialGradient(
            rSun * 0.78,
            0,
            rSun * 0.08,
            rSun * 0.78,
            0,
            length
          );
          sGrad.addColorStop(0, `rgba(255, 253, 248, ${(0.17 * coronaVis * eqWeight).toFixed(3)})`);
          sGrad.addColorStop(0.28, `rgba(224, 240, 255, ${(0.095 * coronaVis * eqWeight).toFixed(3)})`);
          sGrad.addColorStop(0.62, `rgba(165, 202, 248, ${(0.036 * coronaVis * eqWeight).toFixed(3)})`);
          sGrad.addColorStop(1, 'rgba(110, 158, 230, 0)');
          ctx.fillStyle = sGrad;
          ctx.beginPath();
          ctx.ellipse(rSun * 0.95 + length * 0.28, 0, length * 0.62, halfWidth, 0, 0, Math.PI * 2);
          ctx.fill();

          // Delicate hair-thin magnetic plasma filament inside each streamer
          const fGrad = ctx.createLinearGradient(rSun * 0.95, 0, length * 0.95, 0);
          fGrad.addColorStop(0, `rgba(255, 255, 255, ${(0.24 * coronaVis * eqWeight).toFixed(3)})`);
          fGrad.addColorStop(0.45, `rgba(215, 236, 255, ${(0.09 * coronaVis * eqWeight).toFixed(3)})`);
          fGrad.addColorStop(1, 'rgba(160, 200, 255, 0)');
          ctx.strokeStyle = fGrad;
          ctx.lineWidth = 1.2 + eqWeight * 1.1;
          ctx.beginPath();
          ctx.moveTo(rSun * 0.96, 0);
          ctx.quadraticCurveTo(length * 0.45, halfWidth * 0.18 * (i % 2 === 0 ? 1 : -1), length * 0.95, 0);
          ctx.stroke();
          ctx.restore();
        }

        // Delicate magnetic polar brush plumes near North & South solar poles
        for (let pole = -1; pole <= 1; pole += 2) {
          for (let j = -6; j <= 6; j += 1) {
            const ang = pole * (Math.PI / 2) + j * 0.085 + Math.sin(tSec * 0.35 + j) * 0.012;
            const plumeLen = rSun * (1.72 + (1 - Math.abs(j) / 7) * 0.68);
            const pGrad = ctx.createLinearGradient(
              Math.cos(ang) * rSun * 0.98,
              Math.sin(ang) * rSun * 0.98,
              Math.cos(ang) * plumeLen,
              Math.sin(ang) * plumeLen
            );
            pGrad.addColorStop(0, `rgba(240, 248, 255, ${(0.25 * coronaVis).toFixed(3)})`);
            pGrad.addColorStop(0.55, `rgba(195, 224, 255, ${(0.08 * coronaVis).toFixed(3)})`);
            pGrad.addColorStop(1, 'rgba(160, 205, 255, 0)');
            ctx.strokeStyle = pGrad;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(Math.cos(ang) * rSun * 0.98, Math.sin(ang) * rSun * 0.98);
            ctx.quadraticCurveTo(
              Math.cos(ang + j * 0.025) * plumeLen * 0.6,
              Math.sin(ang + j * 0.025) * plumeLen * 0.6,
              Math.cos(ang + j * 0.05) * plumeLen,
              Math.sin(ang + j * 0.05) * plumeLen
            );
            ctx.stroke();
          }
        }

        // Crisp pearly inner K-corona ring hugging the limb
        const innerRing = ctx.createRadialGradient(0, 0, rSun * 0.96, 0, 0, rSun * 1.56);
        innerRing.addColorStop(0, `rgba(255, 254, 248, ${(0.95 * coronaVis).toFixed(3)})`);
        innerRing.addColorStop(0.24, `rgba(242, 248, 255, ${(0.48 * coronaVis).toFixed(3)})`);
        innerRing.addColorStop(0.6, `rgba(198, 224, 255, ${(0.14 * coronaVis).toFixed(3)})`);
        innerRing.addColorStop(1, 'rgba(180, 212, 255, 0)');
        ctx.fillStyle = innerRing;
        ctx.beginPath();
        ctx.arc(0, 0, rSun * 1.56, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 4. Solar Photosphere (Eddington limb darkening + glare halo outside totality)
      const sunVisibility = Math.max(0, 1 - tel.totalityFactor);
      if (sunVisibility > 0.005) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const glareR = rSun * (2.6 + sunVisibility * 1.4);
        const glare = ctx.createRadialGradient(cx, cy, rSun * 0.5, cx, cy, glareR);
        glare.addColorStop(0, `rgba(255, 244, 210, ${(0.45 * sunVisibility).toFixed(3)})`);
        glare.addColorStop(0.35, `rgba(255, 195, 105, ${(0.18 * sunVisibility).toFixed(3)})`);
        glare.addColorStop(1, 'rgba(255, 140, 40, 0)');
        ctx.fillStyle = glare;
        ctx.beginPath();
        ctx.arc(cx, cy, glareR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        const photoGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rSun);
        photoGrad.addColorStop(0, '#FFFFFF');
        photoGrad.addColorStop(0.68, '#FFF4D2');
        photoGrad.addColorStop(0.88, '#FFD27A');
        photoGrad.addColorStop(1, '#F58A1F');
        ctx.fillStyle = photoGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, rSun, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Pink-Crimson Chromosphere Rim & Erupting Solar Prominence Loops (visible peeking beyond rMoon!)
      if (tel.chromosphereIntensity > 0.04) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.globalCompositeOperation = 'lighter';
        const ci = tel.chromosphereIntensity;

        // Glowing rose-magenta chromosphere arc extending cleanly right past the lunar silhouette
        ctx.strokeStyle = `rgba(255, 58, 126, ${(0.75 * ci).toFixed(3)})`;
        ctx.lineWidth = Math.max(2.6, rSun * 0.036);
        ctx.shadowColor = 'rgba(255, 42, 118, 0.9)';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, rMoon * 1.006, 0, Math.PI * 2);
        ctx.stroke();

        // 4 iconic ruby-magenta magnetic prominence arches erupting past the lunar limb
        const proms = [
          { ang: -0.58, span: 0.14, h: 0.14 },
          { ang: 1.94, span: 0.18, h: 0.18 },
          { ang: 3.48, span: 0.13, h: 0.13 },
          { ang: 5.12, span: 0.11, h: 0.11 },
        ];
        for (const pr of proms) {
          const pulse = 1 + 0.06 * Math.sin(tSec * 1.4 + pr.ang * 3);
          const a0 = pr.ang - pr.span * 0.5;
          const a1 = pr.ang + pr.span * 0.5;
          const rBase = rMoon * 0.99;
          const rPeak = rMoon * (1.0 + pr.h * pulse);
          ctx.strokeStyle = `rgba(255, 92, 148, ${(0.92 * ci).toFixed(3)})`;
          ctx.lineWidth = Math.max(2.4, rSun * 0.032);
          ctx.beginPath();
          ctx.moveTo(Math.cos(a0) * rBase, Math.sin(a0) * rBase);
          ctx.quadraticCurveTo(
            Math.cos(pr.ang) * rPeak,
            Math.sin(pr.ang) * rPeak,
            Math.cos(a1) * rBase,
            Math.sin(a1) * rBase
          );
          ctx.stroke();
        }
        ctx.restore();
      }

      // 6. Cratered Moon Silhouette traversing the solar disk along tilted ecliptic path
      const pathTiltRad = -0.24; // ~14 deg realistic sky inclination
      const mx = cx + Math.cos(pathTiltRad) * tel.moonOffsetSolarRadii * rSun;
      const my = cy + Math.sin(pathTiltRad) * tel.moonOffsetSolarRadii * rSun;

      ctx.save();
      ctx.beginPath();
      // Subtle lunar limb crater profile (0.4% jagged mountain/valley height variation)
      const limbSteps = 120;
      for (let i = 0; i <= limbSteps; i += 1) {
        const a = (i / limbSteps) * Math.PI * 2;
        const limbBump =
          Math.sin(a * 19.0 + 0.7) * 0.0022 +
          Math.cos(a * 37.0 - 1.2) * 0.0014 +
          Math.sin(a * 61.0 + 2.3) * 0.0008;
        const rr = rMoon * (1 + limbBump);
        const px = mx + Math.cos(a) * rr;
        const py = my + Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      // Deep lunar shadow disk with subtle blue-slate earthshine visible during totality
      const es = tel.totalityFactor * 0.9;
      const moonGrad = ctx.createRadialGradient(
        mx - rMoon * 0.22,
        my - rMoon * 0.18,
        rMoon * 0.05,
        mx,
        my,
        rMoon
      );
      moonGrad.addColorStop(
        0,
        `rgb(${Math.round(6 + es * 14)}, ${Math.round(8 + es * 18)}, ${Math.round(14 + es * 26)})`
      );
      moonGrad.addColorStop(
        0.78,
        `rgb(${Math.round(4 + es * 9)}, ${Math.round(6 + es * 11)}, ${Math.round(10 + es * 16)})`
      );
      moonGrad.addColorStop(1, '#020306');
      ctx.fillStyle = moonGrad;
      ctx.fill();

      // Subtle earthshine lunar maria patches inside totality
      if (es > 0.18) {
        ctx.clip();
        ctx.fillStyle = `rgba(3, 5, 10, ${(0.32 * es).toFixed(3)})`;
        const maria = [
          [-0.24, -0.18, 0.28, 0.22],
          [0.18, -0.22, 0.24, 0.18],
          [0.22, 0.12, 0.22, 0.16],
          [-0.12, 0.22, 0.2, 0.14],
        ];
        for (const [ox, oy, rx, ry] of maria) {
          ctx.beginPath();
          ctx.ellipse(mx + ox * rMoon, my + oy * rMoon, rx * rMoon, ry * rMoon, 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // 7. Baily's Beads (shimmering sunlight beads piercing lunar valleys right at C2 / C3)
      if (tel.bailysBeadsIntensity > 0.05) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const baseContactAngle =
          tel.diamondRingSide > 0 ? pathTiltRad : pathTiltRad + Math.PI;
        const beadAngles = [-0.26, -0.15, -0.06, 0.02, 0.11, 0.21];
        for (let i = 0; i < beadAngles.length; i += 1) {
          const ang = baseContactAngle + beadAngles[i];
          const bx = cx + Math.cos(ang) * rSun * 1.005;
          const by = cy + Math.sin(ang) * rSun * 1.005;
          const shimmer = 0.65 + 0.35 * Math.sin(tSec * 7.5 + i * 2.4);
          const bRad = rSun * (0.04 + (i % 3) * 0.018) * tel.bailysBeadsIntensity * shimmer;
          const bGrad = ctx.createRadialGradient(bx, by, 0, bx, by, bRad * 2.6);
          bGrad.addColorStop(0, `rgba(255, 255, 255, ${(0.98 * tel.bailysBeadsIntensity).toFixed(3)})`);
          bGrad.addColorStop(0.35, `rgba(255, 224, 150, ${(0.72 * tel.bailysBeadsIntensity).toFixed(3)})`);
          bGrad.addColorStop(1, 'rgba(250, 80, 15, 0)');
          ctx.fillStyle = bGrad;
          ctx.beginPath();
          ctx.arc(bx, by, bRad * 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 8. Diamond Ring Optical Burst (blazing star-burst + 6-point diffraction spikes at C2 & C3)
      if (tel.diamondRingIntensity > 0.04) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const dr = tel.diamondRingIntensity;
        const contactAngle =
          tel.diamondRingSide > 0 ? pathTiltRad : pathTiltRad + Math.PI;
        const dx = cx + Math.cos(contactAngle) * rSun * 1.005;
        const dy = cy + Math.sin(contactAngle) * rSun * 1.005;

        // Radiant diamond core bloom
        const flareR = rSun * (0.65 + dr * 1.15);
        const fGrad = ctx.createRadialGradient(dx, dy, 0, dx, dy, flareR);
        fGrad.addColorStop(0, `rgba(255, 255, 255, ${(1.0 * dr).toFixed(3)})`);
        fGrad.addColorStop(0.14, `rgba(255, 246, 205, ${(0.88 * dr).toFixed(3)})`);
        fGrad.addColorStop(0.38, `rgba(255, 175, 72, ${(0.34 * dr).toFixed(3)})`);
        fGrad.addColorStop(1, 'rgba(250, 80, 15, 0)');
        ctx.fillStyle = fGrad;
        ctx.beginPath();
        ctx.arc(dx, dy, flareR, 0, Math.PI * 2);
        ctx.fill();

        // 6-point optical telescope aperture diffraction spikes
        ctx.translate(dx, dy);
        for (let k = 0; k < 3; k += 1) {
          const spikeAng = (k * Math.PI) / 3 + 0.25;
          const spikeLen = rSun * (1.2 + dr * 1.85);
          ctx.save();
          ctx.rotate(spikeAng);
          const sGrad = ctx.createLinearGradient(-spikeLen, 0, spikeLen, 0);
          sGrad.addColorStop(0, 'rgba(255,248,231,0)');
          sGrad.addColorStop(0.45, `rgba(255,248,231,${(0.48 * dr).toFixed(3)})`);
          sGrad.addColorStop(0.5, `rgba(255,255,255,${(0.95 * dr).toFixed(3)})`);
          sGrad.addColorStop(0.55, `rgba(255,248,231,${(0.48 * dr).toFixed(3)})`);
          sGrad.addColorStop(1, 'rgba(255,248,231,0)');
          ctx.fillStyle = sGrad;
          ctx.fillRect(-spikeLen, -1.6, spikeLen * 2, 3.2);
          ctx.restore();
        }
        ctx.restore();
      }

      rafId = window.requestAnimationFrame(draw);
    };

    rafId = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [stars]);

  const activePhenomena: string[] = [];
  if (telemetry.coronaIntensity > 0.28) activePhenomena.push(copy.telescopeBadges.corona);
  if (telemetry.chromosphereIntensity > 0.28) activePhenomena.push(copy.telescopeBadges.chromosphere);
  if (telemetry.diamondRingIntensity > 0.22) activePhenomena.push(copy.telescopeBadges.diamondRing);
  if (telemetry.bailysBeadsIntensity > 0.22) activePhenomena.push(copy.telescopeBadges.bailysBeads);

  return (
    <div
      data-testid="eclipse-totality-canvas-layer"
      className="pointer-events-none absolute inset-0 z-[15] overflow-hidden"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Clean Optical Phenomenon Indicator Strip (positioned below TopBar so zero overlap!) */}
      <div className="hidden @[840px]/obs:flex absolute top-[66px] left-1/2 -translate-x-1/2 flex-col items-center gap-1.5">
        <span className="rounded-[8px] bg-[#141416]/88 border border-[#FFF8E7]/14 px-3 py-1 text-[10px] font-mono text-[#FFF8E7]/90 whitespace-nowrap">
          {copy.telescopeNote}
        </span>
        {activePhenomena.length > 0 && (
          <div className="flex items-center gap-1.5">
            {activePhenomena.map((badge) => (
              <span
                key={badge}
                className="rounded-[6px] bg-[#FA500F]/22 border border-[#FA500F]/55 px-2 py-0.5 text-[10px] font-mono font-semibold text-[#FFD800]"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SolarEclipseStudio({
  isOpen,
  lang,
  preset,
  simDateMs,
  cameraMode,
  isPlaying,
  speedSecondsPerSec,
  showTotalityPath,
  showShadowCone,
  showEarthClouds,
  onSelectPreset,
  onChangeCameraMode,
  onScrubOffsetSec,
  onTogglePlay,
  onChangeSpeed,
  onToggleTotalityPath,
  onToggleShadowCone,
  onToggleEarthClouds,
  onClose,
}: SolarEclipseStudioProps) {
  const [collapsed, setCollapsed] = useState(false);

  const offsetSec = useMemo(
    () => (simDateMs - preset.dateMs) / 1000,
    [simDateMs, preset.dateMs]
  );

  const telemetry = useMemo(
    () => computeEclipseTelemetry(preset, offsetSec),
    [preset, offsetSec]
  );

  if (!isOpen) return null;

  const copy = ECLIPSE_STUDIO_COPY[lang];
  const contactIds: EclipseContactId[] = ['c1', 'c2', 'max', 'c3', 'c4'];
  const cameraModes: { id: EclipseCameraMode; icon: React.ReactNode }[] = [
    { id: 'orbital', icon: <Globe className="w-3 h-3 shrink-0" /> },
    { id: 'totality', icon: <Sparkles className="w-3 h-3 shrink-0" /> },
    { id: 'syzygy', icon: <Orbit className="w-3 h-3 shrink-0" /> },
  ];

  const handleJumpContact = (cid: EclipseContactId) => {
    const targetSec =
      cid === 'c2'
        ? telemetry.contacts.c2 - 6
        : cid === 'c3'
          ? telemetry.contacts.c3 + 6
          : telemetry.contacts[cid];
    onScrubOffsetSec(targetSec);
  };

  return (
    <>
      {/* Full-Viewport Optical Telescope / Totality Simulation Layer */}
      {cameraMode === 'totality' && (
        <TotalityTelescopeCanvas telemetry={telemetry} lang={lang} />
      )}

      {/* Mistral Editorial Floating Eclipse Studio Control Dock */}
      <Card
        data-testid="solar-eclipse-studio"
        className="pointer-events-auto absolute left-3 top-[142px] @[780px]/obs:top-[60px] @[1220px]/obs:top-[64px] z-20 w-[min(324px,calc(100%-24px))] max-h-[calc(100%-290px)] @[680px]/obs:max-h-[calc(100%-248px)] @[780px]/obs:max-h-[calc(100%-156px)] rounded-[12px] bg-[#141416]/95 border border-[#FFF8E7]/14 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.55)] p-0 overflow-hidden flex flex-col"
      >
        {/* Top Sunset Accent Hairline */}
        <div
          aria-hidden="true"
          className="h-[2px] w-full shrink-0"
          style={{
            backgroundImage:
              'linear-gradient(90deg, #E10500 0%, #FA500F 42%, #FFAF00 76%, #FFD800 100%)',
          }}
        />

        {/* Dock Header */}
        <div className="px-3 py-2.5 flex items-center justify-between gap-2 border-b border-[#FFF8E7]/10 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-[8px] bg-[#FA500F]/18 border border-[#FA500F]/45 flex items-center justify-center shrink-0">
              <Eclipse className="w-3.5 h-3.5 text-[#FFAF00]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[12px] font-semibold text-[#FFF8E7] leading-tight truncate">
                {copy.studioTitle}
              </h2>
              <p className="text-[10px] text-[#A19F99] truncate">{copy.studioSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              data-testid="eclipse-studio-collapse-btn"
              onPress={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? 'Expand' : 'Collapse'}
              className="w-6 h-6 min-w-6 rounded-[6px] text-[#A19F99] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.08] p-0 inline-flex items-center justify-center"
            >
              {collapsed ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              data-testid="eclipse-studio-close-btn"
              onPress={onClose}
              aria-label={copy.closeStudioAria}
              className="w-6 h-6 min-w-6 rounded-[6px] text-[#A19F99] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.08] p-0 inline-flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Collapsible Studio Controls Body */}
        {!collapsed && (
          <Card.Content className="px-3 py-2.5 flex flex-col gap-2.5 overflow-y-auto min-h-0">
            {/* 1. Event Selector (5 Real Total Solar Eclipses) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#A19F99]">
                  {copy.eventLabel}
                </span>
                <span className="text-[10px] font-mono text-[#FFAF00] tabular-nums">
                  {Math.floor(preset.durationSec / 60)}m{' '}
                  {String(preset.durationSec % 60).padStart(2, '0')}s
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {SOLAR_ECLIPSE_PRESETS.map((item) => {
                  const active = item.id === preset.id;
                  const year = item.shortLabel.slice(0, 4);
                  return (
                    <Button
                      key={item.id}
                      size="sm"
                      fullWidth
                      variant={active ? 'primary' : 'outline'}
                      data-testid={`eclipse-studio-event-${item.id}`}
                      onPress={() => onSelectPreset(item)}
                      className={`w-full h-7 min-w-0 max-w-full overflow-hidden rounded-[8px] px-1 text-[10px] font-mono ${
                        active
                          ? 'bg-[#FA500F] text-white font-semibold border-[#FA500F]'
                          : 'bg-[#FFF8E7]/[0.04] text-[#D7D4CC] hover:bg-[#FFF8E7]/[0.1] border-[#FFF8E7]/12'
                      }`}
                    >
                      <span className="truncate">{year}</span>
                    </Button>
                  );
                })}
              </div>
              <p className="text-[11px] text-[#E6E2D8] leading-snug truncate" title={preset.region[lang]}>
                {preset.region[lang]}
              </p>
            </div>

            {/* 2. 3-Angle Camera Switcher (Orbital / Totality Telescope / Syzygy) */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A19F99] flex items-center gap-1">
                <Eye className="w-3 h-3 text-[#FA500F]" />
                {copy.viewLabel}
              </span>
              <div className="grid grid-cols-3 gap-1">
                {cameraModes.map(({ id, icon }) => {
                  const active = cameraMode === id;
                  return (
                    <Button
                      key={id}
                      size="sm"
                      fullWidth
                      variant={active ? 'primary' : 'outline'}
                      data-testid={`eclipse-view-${id}`}
                      onPress={() => onChangeCameraMode(id)}
                      className={`w-full h-7 min-w-0 max-w-full overflow-hidden rounded-[8px] px-1.5 text-[10px] font-medium gap-1 ${
                        active
                          ? 'bg-[#FA500F] text-white font-semibold border-[#FA500F]'
                          : 'bg-[#FFF8E7]/[0.04] text-[#D7D4CC] hover:bg-[#FFF8E7]/[0.1] border-[#FFF8E7]/12'
                      }`}
                    >
                      {icon}
                      <span className="truncate">{copy.views[id]}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* 3. Live Phase Status + Contact Timeline Scrubber (C1 -> C2 -> MAX -> C3 -> C4) */}
            <div className="rounded-[10px] bg-[#FFF8E7]/[0.04] border border-[#FFF8E7]/10 p-2.5 space-y-2">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <Chip
                  size="sm"
                  variant="soft"
                  color="accent"
                  data-testid="eclipse-phase-badge"
                  className="h-5 rounded-[6px] bg-[#FA500F]/22 border border-[#FA500F]/45 px-2 text-[10px] font-mono font-semibold text-[#FFD800] max-w-[70%] truncate"
                >
                  {copy.phases[telemetry.phase]}
                </Chip>
                <span
                  data-testid="eclipse-offset-readout"
                  className="text-[11px] font-mono font-semibold text-[#FFF8E7] tabular-nums shrink-0"
                >
                  {formatEclipseOffset(telemetry.offsetSec)}
                </span>
              </div>

              {/* Scrubber Track */}
              <div className="space-y-1">
                <input
                  type="range"
                  aria-label={copy.timelineLabel}
                  data-testid="eclipse-timeline-slider"
                  min={-ECLIPSE_WINDOW_HALF_SEC}
                  max={ECLIPSE_WINDOW_HALF_SEC}
                  step={1}
                  value={Math.round(telemetry.offsetSec)}
                  onChange={(e) => onScrubOffsetSec(Number(e.target.value))}
                  className="w-full h-1.5 accent-[#FA500F] cursor-pointer rounded-full bg-[#FFF8E7]/15"
                />
              </div>

              {/* Contact Quick-Jump Buttons */}
              <div className="grid grid-cols-5 gap-1">
                {contactIds.map((cid) => {
                  const isMax = cid === 'max';
                  const active =
                    (cid === 'max' && telemetry.phase === 'totality') ||
                    (cid === 'c2' && telemetry.phase === 'c2-diamond-ring') ||
                    (cid === 'c3' && telemetry.phase === 'c3-diamond-ring');
                  return (
                    <Button
                      key={cid}
                      size="sm"
                      fullWidth
                      variant={active ? 'primary' : 'outline'}
                      data-testid={`eclipse-contact-${cid}`}
                      onPress={() => handleJumpContact(cid)}
                      className={`w-full h-6 min-w-0 max-w-full overflow-hidden rounded-[6px] px-0.5 text-[10px] font-mono ${
                        active
                          ? 'bg-[#FA500F] text-white font-semibold border-[#FA500F]'
                          : isMax
                            ? 'bg-[#FA500F]/14 text-[#FFD800] hover:bg-[#FA500F]/25 border-[#FA500F]/35'
                            : 'bg-[#FFF8E7]/[0.05] text-[#D7D4CC] hover:bg-[#FFF8E7]/[0.12] border-[#FFF8E7]/12'
                      }`}
                    >
                      <span className="truncate">{copy.contacts[cid]}</span>
                    </Button>
                  );
                })}
              </div>

              {/* Playback + Eclipse Speed Row */}
              <div className="flex items-center gap-1 pt-0.5">
                <Button
                  isIconOnly
                  size="sm"
                  variant="primary"
                  data-testid="eclipse-play-toggle"
                  onPress={onTogglePlay}
                  aria-label={isPlaying ? copy.pauseLabel : copy.playLabel}
                  className="w-7 h-7 min-w-7 rounded-[8px] bg-[#FA500F] hover:bg-[#D93D04] text-white p-0 inline-flex items-center justify-center shrink-0"
                >
                  {isPlaying ? (
                    <Pause className="w-3 h-3 shrink-0" />
                  ) : (
                    <Play className="w-3 h-3 shrink-0" />
                  )}
                </Button>
                <div className="grid grid-cols-4 gap-1 flex-1 min-w-0">
                  {ECLIPSE_SPEED_OPTIONS.map((sp) => {
                    const active = Math.abs(speedSecondsPerSec - sp.value) < 0.5;
                    return (
                      <Button
                        key={sp.value}
                        size="sm"
                        fullWidth
                        variant={active ? 'outline' : 'ghost'}
                        data-testid={`eclipse-speed-${sp.value}`}
                        onPress={() => onChangeSpeed(sp.value)}
                        className={`w-full h-7 min-w-0 max-w-full overflow-hidden rounded-[8px] px-1 text-[10px] font-mono ${
                          active
                            ? 'bg-[#FA500F]/18 text-[#FFD800] font-semibold border-[#FA500F]/60'
                            : 'text-[#A19F99] hover:text-[#FFF8E7] hover:bg-[#FFF8E7]/[0.07] border-transparent'
                        }`}
                      >
                        <span className="truncate">{sp.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. Live Eclipse Telemetry Metrics (2x2 Grid) */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className="rounded-[8px] bg-[#FFF8E7]/[0.04] border border-[#FFF8E7]/10 px-2.5 py-1.5 min-w-0">
                <div className="text-[9px] font-mono uppercase tracking-wider text-[#A19F99] truncate">
                  {copy.metrics.obscuration}
                </div>
                <div
                  data-testid="eclipse-obscuration-value"
                  className="text-[13px] font-mono font-semibold text-[#FFF8E7] tabular-nums"
                >
                  {telemetry.obscurationPct.toFixed(1)}%
                </div>
              </div>
              <div className="rounded-[8px] bg-[#FFF8E7]/[0.04] border border-[#FFF8E7]/10 px-2.5 py-1.5 min-w-0">
                <div className="text-[9px] font-mono uppercase tracking-wider text-[#A19F99] truncate">
                  {copy.metrics.magnitude}
                </div>
                <div className="text-[13px] font-mono font-semibold text-[#FFD800] tabular-nums">
                  {telemetry.magnitude.toFixed(3)}
                </div>
              </div>
              <div className="rounded-[8px] bg-[#FFF8E7]/[0.04] border border-[#FFF8E7]/10 px-2.5 py-1.5 min-w-0">
                <div className="text-[9px] font-mono uppercase tracking-wider text-[#A19F99] truncate">
                  {copy.metrics.umbraWidth}
                </div>
                <div className="text-[12px] font-mono font-semibold text-[#FFF8E7] tabular-nums">
                  {telemetry.umbraWidthKm} km
                </div>
              </div>
              <div className="rounded-[8px] bg-[#FFF8E7]/[0.04] border border-[#FFF8E7]/10 px-2.5 py-1.5 min-w-0">
                <div className="text-[9px] font-mono uppercase tracking-wider text-[#A19F99] truncate">
                  {copy.metrics.shadowSpeed}
                </div>
                <div className="text-[12px] font-mono font-semibold text-[#FFF8E7] tabular-nums">
                  {telemetry.shadowSpeedKmh.toLocaleString()} km/h
                </div>
              </div>
            </div>

            {/* 5. 3D Visual Layer Toggles (Orbital / Syzygy Views) */}
            {cameraMode !== 'totality' && (
              <div className="rounded-[10px] bg-[#FFF8E7]/[0.04] border border-[#FFF8E7]/10 px-2.5 py-2 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#E6E2D8] truncate">
                    {copy.layers.totalityPath}
                  </span>
                  <Switch
                    size="sm"
                    isSelected={showTotalityPath}
                    onChange={onToggleTotalityPath}
                    data-testid="eclipse-toggle-path"
                    aria-label={copy.layers.totalityPath}
                  >
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#E6E2D8] truncate">
                    {copy.layers.shadowCone}
                  </span>
                  <Switch
                    size="sm"
                    isSelected={showShadowCone}
                    onChange={onToggleShadowCone}
                    data-testid="eclipse-toggle-cone"
                    aria-label={copy.layers.shadowCone}
                  >
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#E6E2D8] truncate">
                    {copy.layers.earthClouds}
                  </span>
                  <Switch
                    size="sm"
                    isSelected={showEarthClouds}
                    onChange={onToggleEarthClouds}
                    data-testid="eclipse-toggle-clouds"
                    aria-label={copy.layers.earthClouds}
                  >
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch>
                </div>
              </div>
            )}
          </Card.Content>
        )}
      </Card>
    </>
  );
}
