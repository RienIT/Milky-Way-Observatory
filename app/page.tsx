'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Camera,
  Check,
  ChevronDown,
  CircleDot,
  Compass,
  Globe,
  HelpCircle,
  LayoutGrid,
  Plus,
  Scaling,
  Search,
  Share2,
  SlidersHorizontal,
  Telescope,
} from 'lucide-react';
import AddMemoryModal from '@/components/AddMemoryModal';
import CommandPalette from '@/components/CommandPalette';
import ExoplanetCatalogView from '@/components/ExoplanetCatalogView';
import GraphicsSettingsModal from '@/components/GraphicsSettingsModal';
import GuidedTourBar from '@/components/GuidedTourBar';
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal';
import MemoryDetailDrawer from '@/components/MemoryDetailDrawer';
import ObservatoryBootOverlay from '@/components/ObservatoryBootOverlay';
import TopSearchBar, { ActiveWebView } from '@/components/TopSearchBar';
import {
  parseObservatoryHash,
  serializeObservatoryHash,
  SOLAR_ECLIPSE_PRESETS,
  SolarEclipsePreset,
  WavelengthBandId,
} from '@/lib/astrophysics-science';
import {
  getGuidedTourById,
  getNextTourStopIndex,
  getPrevTourStopIndex,
  GUIDED_TOURS,
  GuidedTourId,
  GuidedTourStop,
} from '@/lib/guided-tours';
import {
  detectClientHardwareProfile,
  GRAPHICS_PRESETS,
  GraphicsSettings,
  HardwareProfile,
  HardwareRecommendation,
  scoreHardwareAndRecommend,
} from '@/lib/graphics-settings';
import { LanguageCode, SUPPORTED_LANGUAGES, UI_STRINGS } from '@/lib/i18n';
import {
  computeConstellationLinks,
  filterMemories,
} from '@/lib/memory-logic';
import { MemoryCategory, MemoryNode } from '@/lib/memory-types';
import { INITIAL_MEMORIES } from '@/lib/mock-memories';
import { SimulationScaleMode } from '@/lib/scientific-catalog';
import { ScalePresetId, UNIVERSE_HUD_COPY } from '@/lib/universe-i18n';

const UniverseCanvas = dynamic(() => import('@/components/UniverseCanvas'), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-full bg-[#030406]">
      <ObservatoryBootOverlay stage="bundle" progress={12} lang="en" />
    </div>
  ),
});

const STORAGE_MEMORIES_KEY = 'milky-way-nodes-v4';
const STORAGE_LANG_KEY = 'milky-way-lang-v2';
const STORAGE_GFX_KEY = 'milky-way-gfx-v1';

const DEFAULT_HARDWARE_PROFILE: HardwareProfile = {
  gpuRenderer: 'WebGL2 Accelerator',
  gpuVendor: 'WebGL',
  isSoftwareGl: false,
  webgl2Supported: true,
  maxTextureSize: 8192,
  cpuCores: 8,
  deviceMemoryGb: 8,
  devicePixelRatio: 1,
  screenWidth: 1440,
  screenHeight: 900,
};

export default function MilkyWayObservatoryPage() {
  const [memories, setMemories] = useState<MemoryNode[]>(INITIAL_MEMORIES);
  const [lang, setLang] = useState<LanguageCode>('en');
  const [activeView, setActiveView] = useState<ActiveWebView>('explorer');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory | 'ALL'>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [orbitSpeedMultiplier, setOrbitSpeedMultiplier] = useState<number>(1);
  const [showOrbitRings, setShowOrbitRings] = useState<boolean>(true);
  const [showConstellations, setShowConstellations] = useState<boolean>(false);
  const [showMilkyWayDisk, setShowMilkyWayDisk] = useState<boolean>(true);
  const [scaleMode, setScaleMode] = useState<SimulationScaleMode>('true-1to1');
  const [cameraResetTrigger, setCameraResetTrigger] = useState<number>(0);

  // Phase 1 & 2 state: Command Palette, Multi-Wavelength, Cinema Mode, Deep-Linking
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [langMenuOpen, setLangMenuOpen] = useState<boolean>(false);
  const [wavelengthBand, setWavelengthBand] = useState<WavelengthBandId>('optical');
  const [cinemaMode, setCinemaMode] = useState<boolean>(false);
  const [initialSimDateMs, setInitialSimDateMs] = useState<number | undefined>(undefined);
  const [initialLogDistM, setInitialLogDistM] = useState<number | undefined>(undefined);
  const [eclipseRequest, setEclipseRequest] = useState<{
    preset: SolarEclipsePreset;
    seq: number;
  } | null>(null);
  const [photonTrigger, setPhotonTrigger] = useState<number>(0);
  const [scalePresetRequest, setScalePresetRequest] = useState<{
    preset: ScalePresetId;
    seq: number;
  } | null>(null);
  const hashHydratedRef = useRef(false);

  // Phase 3 state: Guided Expeditions, Share Deep-Link, Capture PNG, Shortcuts Reference
  const [activeTourId, setActiveTourId] = useState<GuidedTourId | null>(null);
  const [tourStopIndex, setTourStopIndex] = useState<number>(0);
  const [tourAutoPlay, setTourAutoPlay] = useState<boolean>(true);
  const [tourMenuOpen, setTourMenuOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const [isCapturingPng, setIsCapturingPng] = useState<boolean>(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isGraphicsOpen, setIsGraphicsOpen] = useState<boolean>(false);
  const [hardwareProfile, setHardwareProfile] = useState<HardwareProfile>(DEFAULT_HARDWARE_PROFILE);
  const [recommendation, setRecommendation] = useState<HardwareRecommendation>(() =>
    scoreHardwareAndRecommend(DEFAULT_HARDWARE_PROFILE)
  );
  const [graphicsSettings, setGraphicsSettings] = useState<GraphicsSettings>(
    GRAPHICS_PRESETS.medium
  );

  // Hydrate URL hash deep-link, persisted language, custom celestial objects, and auto-detected hardware recommendation
  useEffect(() => {
    let cancelled = false;
    const rafId = window.requestAnimationFrame(() => {
      if (cancelled) return;

      const parsedHash = parseObservatoryHash(window.location.hash);
      if (parsedHash.target) setSelectedId(parsedHash.target);
      if (parsedHash.band) setWavelengthBand(parsedHash.band);
      if (parsedHash.dateIso) {
        const parsedMs = Date.parse(parsedHash.dateIso);
        if (Number.isFinite(parsedMs)) setInitialSimDateMs(parsedMs);
      }
      if (parsedHash.logDist !== undefined) setInitialLogDistM(parsedHash.logDist);
      hashHydratedRef.current = true;

      try {
        const savedLang = window.localStorage.getItem(STORAGE_LANG_KEY) as LanguageCode | null;
        if (savedLang && ['vi', 'en', 'ja', 'zh', 'ko'].includes(savedLang)) {
          setLang(savedLang);
        }
      } catch {
        // Ignore storage access errors
      }

      try {
        const rawNodes = window.localStorage.getItem(STORAGE_MEMORIES_KEY);
        if (rawNodes) {
          const parsed = JSON.parse(rawNodes) as MemoryNode[];
          if (Array.isArray(parsed) && parsed.length >= INITIAL_MEMORIES.length) {
            setMemories(parsed);
          }
        }
      } catch {
        // Fallback cleanly to default NASA Milky Way catalog
      }

      const detected = detectClientHardwareProfile();
      const rec = scoreHardwareAndRecommend(detected);
      setHardwareProfile(detected);
      setRecommendation(rec);

      try {
        const rawGfx = window.localStorage.getItem(STORAGE_GFX_KEY);
        if (rawGfx) {
          const parsed = JSON.parse(rawGfx) as GraphicsSettings;
          if (parsed && typeof parsed.resolutionScale === 'number') {
            setGraphicsSettings(parsed);
            return;
          }
        }
      } catch {
        // Fallback to auto-recommended profile
      }
      setGraphicsSettings(rec.recommendedSettings);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  // Global Command Palette shortcuts: '/' or Cmd/Ctrl + K
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditing =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((v) => !v);
        return;
      }
      if (!isEditing && !e.metaKey && !e.ctrlKey && !e.altKey && e.key === '/') {
        e.preventDefault();
        setIsPaletteOpen(true);
        return;
      }
      if (!isEditing && !e.metaKey && !e.ctrlKey && !e.altKey && e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Sync target & spectral band to URL hash cleanly for shareable cosmic deep-links
  useEffect(() => {
    if (!hashHydratedRef.current) return;
    const nextHash = serializeObservatoryHash({
      target: selectedId ?? undefined,
      band: wavelengthBand !== 'optical' ? wavelengthBand : undefined,
    });
    try {
      const base = `${window.location.pathname}${window.location.search}`;
      window.history.replaceState(null, '', nextHash ? `${base}${nextHash}` : base);
    } catch {
      // Ignore history errors in sandboxed iframes
    }
  }, [selectedId, wavelengthBand]);

  const links = useMemo(() => computeConstellationLinks(memories), [memories]);

  const matchedIds = useMemo(
    () => filterMemories(memories, searchQuery, selectedCategory),
    [memories, searchQuery, selectedCategory]
  );

  const isFilterActive = searchQuery.trim().length > 0 || selectedCategory !== 'ALL';

  const selectedMemory = useMemo(() => {
    if (!selectedId || selectedId === 'BLACK_HOLE_CORE') return null;
    return memories.find((m) => m.id === selectedId) ?? null;
  }, [memories, selectedId]);

  const handleChangeLang = useCallback((next: LanguageCode) => {
    setLang(next);
    try {
      window.localStorage.setItem(STORAGE_LANG_KEY, next);
    } catch {
      // Ignore
    }
  }, []);

  const handleChangeGraphicsSettings = useCallback((next: GraphicsSettings) => {
    setGraphicsSettings(next);
    try {
      window.localStorage.setItem(STORAGE_GFX_KEY, JSON.stringify(next));
    } catch {
      // Ignore
    }
  }, []);

  const handleAddMemory = useCallback((node: MemoryNode) => {
    setMemories((prev) => {
      const next = [node, ...prev];
      try {
        window.localStorage.setItem(STORAGE_MEMORIES_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
    setActiveView('explorer');
    setSelectedId(node.id);
  }, []);

  const handleDeleteNode = useCallback((id: string) => {
    setMemories((prev) => {
      const next = prev.filter((m) => m.id !== id);
      try {
        window.localStorage.setItem(STORAGE_MEMORIES_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const handleSelectTag = useCallback((tag: string) => {
    setSearchQuery(tag);
    setSelectedCategory('ALL');
    setActiveView('catalog');
  }, []);

  const activeTour = useMemo(
    () => (activeTourId ? getGuidedTourById(activeTourId) : null),
    [activeTourId]
  );

  const applyTourStop = useCallback(
    (stop: GuidedTourStop, prevStop?: GuidedTourStop | null) => {
      setActiveView('explorer');
      setWavelengthBand(stop.wavelengthBand);
      if (stop.eclipsePresetId) {
        const preset =
          SOLAR_ECLIPSE_PRESETS.find((p) => p.id === stop.eclipsePresetId) ??
          SOLAR_ECLIPSE_PRESETS[0];
        setSelectedId(null);
        setEclipseRequest((prev) => ({ preset, seq: (prev?.seq ?? 0) + 1 }));
      } else if (stop.targetId) {
        if (stop.openInspector) {
          setSelectedId(stop.targetId);
        } else {
          setSelectedId(null);
          window.__OBSERVATORY_API__?.flyToTarget(stop.targetId);
        }
      } else if (stop.presetId) {
        setSelectedId(null);
        const samePresetAsPrev =
          prevStop &&
          !prevStop.eclipsePresetId &&
          !prevStop.targetId &&
          prevStop.presetId === stop.presetId;
        if (!samePresetAsPrev) {
          const preset = stop.presetId;
          setScalePresetRequest((prev) => ({ preset, seq: (prev?.seq ?? 0) + 1 }));
        }
      }

      if (stop.photonPulse) {
        setPhotonTrigger((n) => n + 1);
      } else {
        window.__OBSERVATORY_API__?.triggerPhotonPulse(false);
      }
    },
    []
  );

  const handleStartTour = useCallback(
    (tourId: GuidedTourId) => {
      const tour = getGuidedTourById(tourId);
      if (!tour || tour.stops.length === 0) return;
      setTourMenuOpen(false);
      setActiveTourId(tourId);
      setTourStopIndex(0);
      setTourAutoPlay(true);
      applyTourStop(tour.stops[0], null);
    },
    [applyTourStop]
  );

  const handleJumpTourStop = useCallback(
    (index: number) => {
      if (!activeTour) return;
      const safe = Math.max(0, Math.min(activeTour.stops.length - 1, index));
      const prevStop = activeTour.stops[tourStopIndex] ?? null;
      setTourStopIndex(safe);
      applyTourStop(activeTour.stops[safe], prevStop);
    },
    [activeTour, applyTourStop, tourStopIndex]
  );

  const handleCloseTour = useCallback(() => {
    setActiveTourId(null);
    setTourAutoPlay(false);
    window.__OBSERVATORY_API__?.triggerPhotonPulse(false);
  }, []);

  // Auto-advance guided tour stops smoothly when enabled
  useEffect(() => {
    if (!activeTour || !tourAutoPlay) return;
    const currentStop = activeTour.stops[tourStopIndex];
    if (!currentStop) return;
    const timer = window.setTimeout(() => {
      const nextIdx = getNextTourStopIndex(activeTour, tourStopIndex, false);
      if (nextIdx === tourStopIndex) {
        setTourAutoPlay(false);
        return;
      }
      setTourStopIndex(nextIdx);
      applyTourStop(activeTour.stops[nextIdx], currentStop);
    }, currentStop.durationSec * 1000);
    return () => window.clearTimeout(timer);
  }, [activeTour, applyTourStop, tourAutoPlay, tourStopIndex]);

  const handleShareView = useCallback(async () => {
    const live = window.__OBSERVATORY_API__?.getState();
    const fullHash = serializeObservatoryHash({
      target: selectedId ?? live?.targetId ?? undefined,
      band: wavelengthBand !== 'optical' ? wavelengthBand : undefined,
      dateIso: live?.simDateIso,
      logDist: live?.logDistM,
    });
    const base = `${window.location.origin}${window.location.pathname}${window.location.search}`;
    const shareUrl = fullHash ? `${base}${fullHash}` : base;
    try {
      window.history.replaceState(null, '', fullHash ? `${window.location.pathname}${window.location.search}${fullHash}` : `${window.location.pathname}${window.location.search}`);
    } catch {
      // Ignore sandboxed history errors
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch {
      // Clipboard may be restricted in sandboxed iframes; URL hash is still updated
    }
    setShareCopied(true);
    window.setTimeout(() => setShareCopied(false), 2200);
  }, [selectedId, wavelengthBand]);

  const handleCapturePng = useCallback(async () => {
    if (isCapturingPng) return;
    setIsCapturingPng(true);
    try {
      const dataUrl = await window.__OBSERVATORY_API__?.captureSnapshot();
      if (dataUrl) {
        const live = window.__OBSERVATORY_API__?.getState();
        const targetSlug = (selectedId || live?.targetId || 'milky-way')
          .toLowerCase()
          .replace(/[^a-z0-9_-]+/g, '-');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `milky-way-observatory-${targetSlug}-${wavelengthBand}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } finally {
      setIsCapturingPng(false);
    }
  }, [isCapturingPng, selectedId, wavelengthBand]);

  const t = UI_STRINGS[lang];
  const hud = UNIVERSE_HUD_COPY[lang];
  const activeLangOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];
  const isTrue1To1 = scaleMode === 'true-1to1';

  return (
    <div className="h-screen w-screen relative flex flex-col overflow-hidden bg-[#030406] text-[#ECEAE4]">
      {activeView === 'catalog' ? (
        <>
          <TopSearchBar
            activeView={activeView}
            isInspectingBlackHole={selectedId === 'BLACK_HOLE_CORE'}
            onSelectExplorer={() => {
              setActiveView('explorer');
              if (selectedId === 'BLACK_HOLE_CORE') {
                setSelectedId(null);
              }
            }}
            onSelectBlackHoleLab={() => {
              setActiveView('explorer');
              setSelectedId('BLACK_HOLE_CORE');
            }}
            onSelectCatalog={() => setActiveView('catalog')}
            onOpenSimulator={() => setIsAddModalOpen(true)}
            scaleMode={scaleMode}
            onToggleScaleMode={() =>
              setScaleMode((prev) => (prev === 'atlas' ? 'true-1to1' : 'atlas'))
            }
            resolutionScale={graphicsSettings.resolutionScale}
            onOpenGraphicsSettings={() => setIsGraphicsOpen(true)}
            lang={lang}
            onChangeLang={handleChangeLang}
          />
          <ExoplanetCatalogView
            memories={memories}
            matchedIds={matchedIds}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onInspectIn3D={(id) => {
              setActiveView('explorer');
              setSelectedId(id);
            }}
            onOpenBlackHoleLab={() => {
              setActiveView('explorer');
              setSelectedId('BLACK_HOLE_CORE');
            }}
            onOpenSimulator={() => setIsAddModalOpen(true)}
            lang={lang}
          />
        </>
      ) : (
        <main className="relative flex-1 w-full h-full overflow-hidden">
          {/* Full-Bleed 100vw x 100vh Continuous Multi-Scale 3D Viewport */}
          <UniverseCanvas
            memories={memories}
            links={links}
            matchedIds={matchedIds}
            isFilterActive={isFilterActive}
            selectedId={selectedId}
            onSelectNode={setSelectedId}
            orbitSpeedMultiplier={orbitSpeedMultiplier}
            onChangeOrbitSpeed={setOrbitSpeedMultiplier}
            showOrbitRings={showOrbitRings}
            onToggleOrbitRings={() => setShowOrbitRings((v) => !v)}
            showConstellations={showConstellations}
            onToggleConstellations={() => setShowConstellations((v) => !v)}
            showMilkyWayDisk={showMilkyWayDisk}
            onToggleMilkyWayDisk={() => setShowMilkyWayDisk((v) => !v)}
            scaleMode={scaleMode}
            graphicsSettings={graphicsSettings}
            cameraResetTrigger={cameraResetTrigger}
            onResetCamera={() => {
              setSelectedId(null);
              setCameraResetTrigger((c) => c + 1);
            }}
            lang={lang}
            wavelengthBand={wavelengthBand}
            onChangeWavelengthBand={setWavelengthBand}
            cinemaMode={cinemaMode}
            onToggleCinemaMode={() => setCinemaMode((v) => !v)}
            initialSimDateMs={initialSimDateMs}
            initialLogDistM={initialLogDistM}
            externalEclipseRequest={eclipseRequest}
            externalPhotonTrigger={photonTrigger}
            externalScalePresetRequest={scalePresetRequest}
          />

          {/* Floating Top-Left Precision Instrument Strip (Zero SaaS TopBar/Sidebar Clutter) */}
          <header
            data-testid="floating-instrument-strip"
            className={`absolute top-3 left-3 z-30 flex flex-wrap items-center gap-1.5 max-w-[calc(100vw-380px)] transition-opacity duration-300 ${
              cinemaMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            {/* Brand + Command Palette Search Trigger */}
            <div className="rounded-[4px] bg-[#0a0c10]/95 border border-white/[0.09] p-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedId(null);
                  setCameraResetTrigger((c) => c + 1);
                }}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[2px] text-[12px] font-semibold tracking-[-0.01em] text-[#ECEAE4] hover:bg-white/[0.06] transition-colors whitespace-nowrap"
              >
                <Telescope className="w-3.5 h-3.5 text-[#E88B38] shrink-0" />
                <span className="hidden sm:inline">{t.brandTitle}</span>
              </button>

              <span className="h-4 w-px bg-white/[0.09]" aria-hidden="true" />

              <button
                type="button"
                data-testid="open-command-palette-btn"
                onClick={() => setIsPaletteOpen(true)}
                className="inline-flex items-center gap-2 px-2 py-1 rounded-[2px] text-[11px] text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.06] transition-colors whitespace-nowrap"
              >
                <Search className="w-3.5 h-3.5 text-[#E88B38] shrink-0" />
                <span className="hidden md:inline max-w-[180px] truncate">
                  {hud.searchTrigger}
                </span>
                <kbd className="px-1 py-0.2 rounded-[2px] border border-white/[0.12] bg-white/[0.04] font-mono text-[9px] text-[#C8C6C0]">
                  /
                </kbd>
              </button>
            </div>

            {/* Compact Instrument Controls */}
            <div className="rounded-[4px] bg-[#0a0c10]/95 border border-white/[0.09] p-1 flex items-center gap-0.5">
              <button
                type="button"
                data-testid="inspect-blackhole-btn"
                onClick={() => setSelectedId('BLACK_HOLE_CORE')}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-[2px] text-[11px] font-medium transition-colors whitespace-nowrap ${
                  selectedId === 'BLACK_HOLE_CORE'
                    ? 'bg-[#E88B38] text-[#050608] font-semibold'
                    : 'text-[#C8C6C0] hover:text-[#ECEAE4] hover:bg-white/[0.06]'
                }`}
              >
                <CircleDot className="w-3 h-3 shrink-0" />
                <span>Sgr A*</span>
              </button>

              <button
                type="button"
                data-testid="nav-catalog-btn"
                onClick={() => setActiveView('catalog')}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-[2px] text-[11px] font-medium text-[#C8C6C0] hover:text-[#ECEAE4] hover:bg-white/[0.06] transition-colors whitespace-nowrap"
              >
                <LayoutGrid className="w-3 h-3 shrink-0 text-[#8A8D96]" />
                <span className="hidden lg:inline">{t.navCatalog}</span>
              </button>

              <button
                type="button"
                data-testid="nav-simulator-btn"
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-[2px] text-[11px] font-medium text-[#C8C6C0] hover:text-[#ECEAE4] hover:bg-white/[0.06] transition-colors whitespace-nowrap"
              >
                <Plus className="w-3 h-3 text-[#E88B38] shrink-0" />
                <span className="hidden xl:inline">{hud.worldLabLabel}</span>
              </button>

              {/* Guided Expeditions Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  data-testid="guided-tours-trigger"
                  aria-expanded={tourMenuOpen}
                  onClick={() => setTourMenuOpen((v) => !v)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-[2px] text-[11px] font-medium transition-colors whitespace-nowrap ${
                    activeTour || tourMenuOpen
                      ? 'bg-[#E88B38]/15 text-[#E88B38]'
                      : 'text-[#C8C6C0] hover:text-[#ECEAE4] hover:bg-white/[0.06]'
                  }`}
                >
                  <Compass className="w-3 h-3 shrink-0 text-[#E88B38]" />
                  <span>Tours</span>
                  <ChevronDown className="w-2.5 h-2.5 text-[#6B707B]" />
                </button>

                {tourMenuOpen && (
                  <div
                    data-testid="guided-tours-menu"
                    className="absolute left-0 top-full mt-1.5 w-80 rounded-[4px] bg-[#0a0c10] border border-white/[0.12] shadow-2xl divide-y divide-white/[0.06] z-50"
                  >
                    {GUIDED_TOURS.map((tour) => {
                      const isCurrent = activeTourId === tour.id;
                      return (
                        <button
                          key={tour.id}
                          type="button"
                          data-testid={`tour-option-${tour.id}`}
                          onClick={() => handleStartTour(tour.id)}
                          className={`w-full text-left px-3 py-2.5 transition-colors space-y-0.5 ${
                            isCurrent ? 'bg-[#E88B38]/12' : 'hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-[12px] font-medium ${
                                isCurrent ? 'text-[#E88B38]' : 'text-[#ECEAE4]'
                              }`}
                            >
                              {tour.title[lang]}
                            </span>
                            <span className="font-mono text-[9px] text-[#E88B38] shrink-0">
                              {tour.stops.length} stops
                            </span>
                          </div>
                          <p className="text-[11px] text-[#8A8D96] leading-snug">
                            {tour.subtitle[lang]}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <span className="mx-0.5 h-3.5 w-px bg-white/[0.09]" aria-hidden="true" />

              <button
                type="button"
                data-testid="scale-mode-toggle"
                aria-pressed={isTrue1To1}
                onClick={() =>
                  setScaleMode((prev) => (prev === 'atlas' ? 'true-1to1' : 'atlas'))
                }
                title={isTrue1To1 ? '1:1 True Scale' : 'Atlas Scale'}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-[2px] text-[10px] font-mono transition-colors whitespace-nowrap ${
                  isTrue1To1
                    ? 'text-[#E88B38] bg-[#E88B38]/12'
                    : 'text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.06]'
                }`}
              >
                <Scaling className="w-3 h-3 shrink-0" />
                <span>{isTrue1To1 ? '1:1' : 'ATLAS'}</span>
              </button>

              <button
                type="button"
                data-testid="open-graphics-settings-btn"
                onClick={() => setIsGraphicsOpen(true)}
                aria-label="Graphics settings"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-[2px] text-[10px] font-mono text-[#C8C6C0] hover:text-[#ECEAE4] hover:bg-white/[0.06] transition-colors whitespace-nowrap"
              >
                <SlidersHorizontal className="w-3 h-3 text-[#E88B38] shrink-0" />
                <span>{graphicsSettings.resolutionScale}x</span>
              </button>

              <button
                type="button"
                data-testid="share-view-btn"
                onClick={handleShareView}
                title="Copy shareable cosmic coordinate link"
                aria-label="Share current observatory view"
                className={`inline-flex items-center gap-1 px-1.5 py-1 rounded-[2px] text-[10px] font-mono transition-colors whitespace-nowrap ${
                  shareCopied
                    ? 'bg-[#E88B38]/18 text-[#E88B38]'
                    : 'text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.06]'
                }`}
              >
                {shareCopied ? (
                  <>
                    <Check className="w-3 h-3 shrink-0" />
                    <span>Copied</span>
                  </>
                ) : (
                  <Share2 className="w-3 h-3 shrink-0" />
                )}
              </button>

              <button
                type="button"
                data-testid="capture-png-btn"
                onClick={handleCapturePng}
                disabled={isCapturingPng}
                title="Save clean HUD-free WebGL2 PNG"
                aria-label="Capture clean PNG snapshot"
                className="inline-flex items-center justify-center p-1 rounded-[2px] text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.06] disabled:opacity-40 transition-colors"
              >
                <Camera className="w-3 h-3 shrink-0" />
              </button>

              <button
                type="button"
                data-testid="open-shortcuts-btn"
                onClick={() => setIsShortcutsOpen(true)}
                title="Keyboard shortcuts (?)"
                aria-label="Keyboard shortcuts"
                className="inline-flex items-center justify-center p-1 rounded-[2px] text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.06] transition-colors"
              >
                <HelpCircle className="w-3 h-3 shrink-0" />
              </button>

              {/* Compact 5-Language Switcher */}
              <div className="relative">
                <button
                  type="button"
                  data-testid="lang-dropdown-trigger"
                  onClick={() => setLangMenuOpen((v) => !v)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-[2px] text-[10px] font-mono text-[#C8C6C0] hover:text-[#ECEAE4] hover:bg-white/[0.06] transition-colors whitespace-nowrap"
                >
                  <Globe className="w-3 h-3 text-[#8A8D96]" />
                  <span>{activeLangOption.shortCode}</span>
                  <ChevronDown className="w-2.5 h-2.5 text-[#6B707B]" />
                </button>

                {langMenuOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-44 rounded-[4px] bg-[#0a0c10] border border-white/[0.12] shadow-2xl p-1 z-50">
                    {SUPPORTED_LANGUAGES.map((opt) => {
                      const active = opt.code === lang;
                      return (
                        <button
                          key={opt.code}
                          type="button"
                          data-testid={`lang-option-${opt.code}`}
                          onClick={() => {
                            handleChangeLang(opt.code);
                            setLangMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-[2px] text-xs font-medium flex items-center justify-between transition-colors ${
                            active
                              ? 'bg-[#E88B38]/15 text-[#E88B38]'
                              : 'text-[#C8C6C0] hover:bg-white/[0.06]'
                          }`}
                        >
                          <span>{opt.nativeLabel}</span>
                          <span className="font-mono text-[10px] text-[#6B707B]">
                            {opt.shortCode}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Interactive Guided Expedition Bar (Phase 3) */}
          {activeTour && (
            <GuidedTourBar
              tour={activeTour}
              stopIndex={tourStopIndex}
              isAutoPlaying={tourAutoPlay}
              lang={lang}
              hiddenInCinemaMode={cinemaMode}
              onPrev={() =>
                handleJumpTourStop(getPrevTourStopIndex(activeTour, tourStopIndex))
              }
              onNext={() =>
                handleJumpTourStop(getNextTourStopIndex(activeTour, tourStopIndex, false))
              }
              onJumpToStop={handleJumpTourStop}
              onToggleAutoPlay={() => setTourAutoPlay((v) => !v)}
              onClose={handleCloseTour}
            />
          )}

          {/* Floating Right Precision Inspector Drawer */}
          <MemoryDetailDrawer
            selectedId={selectedId}
            memory={selectedMemory}
            allMemories={memories}
            links={links}
            onClose={() => setSelectedId(null)}
            onSelectNode={(id) => setSelectedId(id)}
            onSelectTag={handleSelectTag}
            onDeleteNode={handleDeleteNode}
            lang={lang}
            hiddenInCinemaMode={cinemaMode}
          />
        </main>
      )}

      {/* Keyboard-Driven Command Palette (/, Cmd+K) */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        memories={memories}
        lang={lang}
        onSelectObject={(id) => {
          setActiveView('explorer');
          setSelectedId(id);
        }}
        onJumpToEclipse={(preset) => {
          setActiveView('explorer');
          setEclipseRequest((prev) => ({ preset, seq: (prev?.seq ?? 0) + 1 }));
        }}
        onSelectWavelength={(band) => {
          setActiveView('explorer');
          setWavelengthBand(band);
        }}
        onTriggerPhotonPulse={() => {
          setActiveView('explorer');
          setPhotonTrigger((n) => n + 1);
        }}
        onSelectScalePreset={(preset) => {
          setActiveView('explorer');
          setScalePresetRequest((prev) => ({ preset, seq: (prev?.seq ?? 0) + 1 }));
        }}
        onStartTour={handleStartTour}
      />

      {/* Keyboard Shortcuts Reference (?) */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        lang={lang}
      />

      {/* World Lab / Add Celestial Body Modal */}
      <AddMemoryModal
        isOpen={isAddModalOpen}
        existingCount={memories.length}
        onClose={() => setIsAddModalOpen(false)}
        onAddMemory={handleAddMemory}
        lang={lang}
      />

      {/* Hardware-Auto Graphics & Resolution Settings Modal */}
      <GraphicsSettingsModal
        isOpen={isGraphicsOpen}
        onClose={() => setIsGraphicsOpen(false)}
        settings={graphicsSettings}
        onChangeSettings={handleChangeGraphicsSettings}
        hardwareProfile={hardwareProfile}
        recommendation={recommendation}
        lang={lang}
      />
    </div>
  );
}
