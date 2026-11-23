'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Card,
  Dropdown,
  Kbd,
  Separator,
  Tooltip,
} from '@heroui/react';
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
} from 'lucide-react';
import AddMemoryModal from '@/components/AddMemoryModal';
import CommandPalette from '@/components/CommandPalette';
import ExoplanetCatalogView from '@/components/ExoplanetCatalogView';
import GraphicsSettingsModal from '@/components/GraphicsSettingsModal';
import GuidedTourBar from '@/components/GuidedTourBar';
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal';
import MemoryDetailDrawer from '@/components/MemoryDetailDrawer';
import ObservatoryBootOverlay from '@/components/ObservatoryBootOverlay';
import ObservatoryLogo from '@/components/ObservatoryLogo';
import TopSearchBar, { ActiveWebView } from '@/components/TopSearchBar';
import UniverseCanvas from '@/components/UniverseCanvas';
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
import { OBSERVATORY_EXTRA_COPY } from '@/lib/localized-telemetry';
import {
  computeConstellationLinks,
  filterMemories,
} from '@/lib/memory-logic';
import { MemoryCategory, MemoryNode } from '@/lib/memory-types';
import { INITIAL_MEMORIES } from '@/lib/mock-memories';
import { SimulationScaleMode } from '@/lib/scientific-catalog';
import { ScalePresetId, UNIVERSE_HUD_COPY } from '@/lib/universe-i18n';

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
  const [isClientMounted, setIsClientMounted] = useState(false);
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

  // Hydrate client mount gate, URL hash deep-link, persisted language, custom celestial objects, and hardware recommendation
  useEffect(() => {
    let cancelled = false;
    const timerId = window.setTimeout(() => {
      if (cancelled) return;
      setIsClientMounted(true);

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
      window.clearTimeout(timerId);
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
      window.history.replaceState(
        null,
        '',
        fullHash
          ? `${window.location.pathname}${window.location.search}${fullHash}`
          : `${window.location.pathname}${window.location.search}`
      );
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
  const extra = OBSERVATORY_EXTRA_COPY[lang];
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
          {isClientMounted ? (
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
          ) : (
            <div className="relative w-full h-full bg-[#030406]">
              <ObservatoryBootOverlay stage="bundle" progress={12} lang={lang} />
            </div>
          )}

          {/* Floating Top-Left Precision Instrument Strip (Mistral Dark Studio + HeroUI v3) */}
          <header
            data-testid="floating-instrument-strip"
            className={`absolute top-3 left-3 z-30 flex flex-wrap items-center gap-2 max-w-[calc(100vw-380px)] transition-opacity duration-300 ${
              cinemaMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            {/* Brand Logo + Command Palette Search Trigger */}
            <Card className="rounded-[12px] bg-[#141416]/95 border border-[#FFF8E7]/12 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.45)] p-0">
              <Card.Content className="p-1.5 flex flex-row items-center gap-1.5 overflow-visible">
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => {
                    setSelectedId(null);
                    setCameraResetTrigger((c) => c + 1);
                  }}
                  className="h-7 min-w-0 rounded-[8px] px-2 text-[13px] font-medium tracking-[-0.01em] text-[#FFF8E7] hover:bg-white/[0.06] whitespace-nowrap gap-2"
                >
                  <ObservatoryLogo size={20} />
                  <span className="hidden sm:inline font-display text-[15px] font-normal tracking-[-0.01em]">
                    {t.brandTitle}
                  </span>
                </Button>

                <Separator orientation="vertical" className="h-4 bg-[#FFF8E7]/12" />

                <Button
                  size="sm"
                  variant="ghost"
                  data-testid="open-command-palette-btn"
                  onPress={() => setIsPaletteOpen(true)}
                  className="h-7 min-w-0 rounded-[8px] px-2.5 text-[11px] text-[#B8B4AA] hover:text-[#FFF8E7] hover:bg-white/[0.06] whitespace-nowrap gap-2"
                >
                  <Search className="w-3.5 h-3.5 text-[#FA500F] shrink-0" />
                  <span className="hidden md:inline max-w-[180px] truncate">
                    {hud.searchTrigger}
                  </span>
                  <Kbd className="px-1.5 py-0 rounded-[4px] border border-[#FFF8E7]/15 bg-white/[0.05] font-mono text-[9px] text-[#FFF8E7]/80 shadow-none">
                    <Kbd.Content>/</Kbd.Content>
                  </Kbd>
                </Button>
              </Card.Content>
            </Card>

            {/* Compact Instrument Controls */}
            <Card className="rounded-[12px] bg-[#141416]/95 border border-[#FFF8E7]/12 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.45)] p-0">
              <Card.Content className="p-1.5 flex flex-row items-center gap-1 overflow-visible">
                <Button
                  size="sm"
                  variant={selectedId === 'BLACK_HOLE_CORE' ? 'primary' : 'ghost'}
                  data-testid="inspect-blackhole-btn"
                  onPress={() => setSelectedId('BLACK_HOLE_CORE')}
                  className={`h-7 min-w-0 rounded-[8px] px-2.5 text-[11px] font-medium whitespace-nowrap gap-1.5 ${
                    selectedId === 'BLACK_HOLE_CORE'
                      ? 'bg-[#FA500F] hover:bg-[#D93D04] text-[#FFFFFF] font-semibold'
                      : 'text-[#D6D3CB] hover:text-[#FFF8E7] hover:bg-white/[0.06]'
                  }`}
                >
                  <CircleDot className="w-3 h-3 shrink-0" />
                  <span>Sgr A*</span>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  data-testid="nav-catalog-btn"
                  onPress={() => setActiveView('catalog')}
                  className="h-7 min-w-0 rounded-[8px] px-2.5 text-[11px] font-medium text-[#D6D3CB] hover:text-[#FFF8E7] hover:bg-white/[0.06] whitespace-nowrap gap-1.5"
                >
                  <LayoutGrid className="w-3 h-3 shrink-0 text-[#9A968C]" />
                  <span className="hidden lg:inline">{t.navCatalog}</span>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  data-testid="nav-simulator-btn"
                  onPress={() => setIsAddModalOpen(true)}
                  className="h-7 min-w-0 rounded-[8px] px-2.5 text-[11px] font-medium text-[#D6D3CB] hover:text-[#FFF8E7] hover:bg-white/[0.06] whitespace-nowrap gap-1.5"
                >
                  <Plus className="w-3 h-3 text-[#FA500F] shrink-0" />
                  <span className="hidden xl:inline">{hud.worldLabLabel}</span>
                </Button>

                {/* Guided Expeditions HeroUI v3 Dropdown */}
                <Dropdown>
                  <Button
                    size="sm"
                    variant="ghost"
                    data-testid="guided-tours-trigger"
                    className={`h-7 min-w-0 rounded-[8px] px-2.5 text-[11px] font-medium whitespace-nowrap gap-1 ${
                      activeTour
                        ? 'bg-[#FA500F]/18 text-[#FFAF00]'
                        : 'text-[#D6D3CB] hover:text-[#FFF8E7] hover:bg-white/[0.06]'
                    }`}
                  >
                    <Compass className="w-3 h-3 shrink-0 text-[#FA500F]" />
                    <span>{extra.toursBtn}</span>
                    <ChevronDown className="w-2.5 h-2.5 text-[#8A867C] shrink-0" />
                  </Button>
                  <Dropdown.Popover
                    placement="bottom start"
                    className="bg-[#141416] border border-[#FFF8E7]/14 rounded-[12px] p-1.5 shadow-2xl w-80"
                  >
                    <Dropdown.Menu
                      aria-label={extra.toursBtn}
                      data-testid="guided-tours-menu"
                      onAction={(key) => handleStartTour(String(key) as GuidedTourId)}
                    >
                      {GUIDED_TOURS.map((tour) => {
                        const isCurrent = activeTourId === tour.id;
                        return (
                          <Dropdown.Item
                            key={tour.id}
                            id={tour.id}
                            data-testid={`tour-option-${tour.id}`}
                            textValue={tour.title[lang]}
                            className={`rounded-[8px] px-2.5 py-2 data-[hovered=true]:bg-white/[0.06] ${
                              isCurrent ? 'bg-[#FA500F]/15' : ''
                            }`}
                          >
                            <div className="space-y-0.5 w-full">
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={`text-[12px] font-medium ${
                                    isCurrent ? 'text-[#FFAF00]' : 'text-[#FFF8E7]'
                                  }`}
                                >
                                  {tour.title[lang]}
                                </span>
                                <span className="font-mono text-[9px] text-[#FA500F] shrink-0">
                                  {tour.stops.length} {extra.stopsUnit}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#9A968C] leading-snug whitespace-normal">
                                {tour.subtitle[lang]}
                              </p>
                            </div>
                          </Dropdown.Item>
                        );
                      })}
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown>

                <Separator orientation="vertical" className="mx-0.5 h-3.5 bg-[#FFF8E7]/12" />

                <Tooltip delay={250}>
                  <Button
                    size="sm"
                    variant="ghost"
                    data-testid="scale-mode-toggle"
                    aria-pressed={isTrue1To1}
                    onPress={() =>
                      setScaleMode((prev) => (prev === 'atlas' ? 'true-1to1' : 'atlas'))
                    }
                    className={`h-7 min-w-0 rounded-[8px] px-2 text-[10px] font-mono whitespace-nowrap gap-1 ${
                      isTrue1To1
                        ? 'text-[#FFAF00] bg-[#FA500F]/16'
                        : 'text-[#9A968C] hover:text-[#FFF8E7] hover:bg-white/[0.06]'
                    }`}
                  >
                    <Scaling className="w-3 h-3 shrink-0" />
                    <span>{isTrue1To1 ? '1:1' : 'ATLAS'}</span>
                  </Button>
                  <Tooltip.Content
                    placement="bottom"
                    className="bg-[#141416] border border-[#FFF8E7]/14 text-[#FFF8E7] text-[11px] rounded-[8px] px-2.5 py-1"
                  >
                    {isTrue1To1 ? extra.scaleTrue1to1 : extra.scaleAtlas}
                  </Tooltip.Content>
                </Tooltip>

                <Button
                  size="sm"
                  variant="ghost"
                  data-testid="open-graphics-settings-btn"
                  onPress={() => setIsGraphicsOpen(true)}
                  aria-label={extra.graphicsAria}
                  className="h-7 min-w-0 rounded-[8px] px-2 text-[10px] font-mono text-[#D6D3CB] hover:text-[#FFF8E7] hover:bg-white/[0.06] whitespace-nowrap gap-1"
                >
                  <SlidersHorizontal className="w-3 h-3 text-[#FA500F] shrink-0" />
                  <span>{graphicsSettings.resolutionScale}x</span>
                </Button>

                <Tooltip delay={250}>
                  <Button
                    size="sm"
                    variant="ghost"
                    isIconOnly={!shareCopied}
                    data-testid="share-view-btn"
                    onPress={handleShareView}
                    aria-label={extra.shareAria}
                    className={`h-7 min-w-7 rounded-[8px] px-1.5 text-[10px] font-mono whitespace-nowrap gap-1 ${
                      shareCopied
                        ? 'bg-[#FA500F] text-[#FFFFFF]'
                        : 'text-[#9A968C] hover:text-[#FFF8E7] hover:bg-white/[0.06]'
                    }`}
                  >
                    {shareCopied ? (
                      <>
                        <Check className="w-3 h-3 shrink-0" />
                        <span>{extra.copiedLabel}</span>
                      </>
                    ) : (
                      <Share2 className="w-3 h-3 shrink-0" />
                    )}
                  </Button>
                  <Tooltip.Content
                    placement="bottom"
                    className="bg-[#141416] border border-[#FFF8E7]/14 text-[#FFF8E7] text-[11px] rounded-[8px] px-2.5 py-1"
                  >
                    {extra.shareTooltip}
                  </Tooltip.Content>
                </Tooltip>

                <Tooltip delay={250}>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    data-testid="capture-png-btn"
                    onPress={handleCapturePng}
                    isDisabled={isCapturingPng}
                    aria-label={extra.captureAria}
                    className="w-7 h-7 min-w-7 rounded-[8px] p-0 text-[#9A968C] hover:text-[#FFF8E7] hover:bg-white/[0.06]"
                  >
                    <Camera className="w-3 h-3 shrink-0" />
                  </Button>
                  <Tooltip.Content
                    placement="bottom"
                    className="bg-[#141416] border border-[#FFF8E7]/14 text-[#FFF8E7] text-[11px] rounded-[8px] px-2.5 py-1"
                  >
                    {extra.captureTooltip}
                  </Tooltip.Content>
                </Tooltip>

                <Tooltip delay={250}>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    data-testid="open-shortcuts-btn"
                    onPress={() => setIsShortcutsOpen(true)}
                    aria-label={extra.shortcutsAria}
                    className="w-7 h-7 min-w-7 rounded-[8px] p-0 text-[#9A968C] hover:text-[#FFF8E7] hover:bg-white/[0.06]"
                  >
                    <HelpCircle className="w-3 h-3 shrink-0" />
                  </Button>
                  <Tooltip.Content
                    placement="bottom"
                    className="bg-[#141416] border border-[#FFF8E7]/14 text-[#FFF8E7] text-[11px] rounded-[8px] px-2.5 py-1"
                  >
                    {extra.shortcutsTooltip}
                  </Tooltip.Content>
                </Tooltip>

                {/* Compact 5-Language Switcher (HeroUI v3 Dropdown) */}
                <Dropdown>
                  <Button
                    size="sm"
                    variant="ghost"
                    data-testid="lang-dropdown-trigger"
                    className="h-7 min-w-0 rounded-[8px] px-2 text-[10px] font-mono text-[#D6D3CB] hover:text-[#FFF8E7] hover:bg-white/[0.06] whitespace-nowrap gap-1"
                  >
                    <Globe className="w-3 h-3 text-[#9A968C] shrink-0" />
                    <span>{activeLangOption.shortCode}</span>
                    <ChevronDown className="w-2.5 h-2.5 text-[#8A867C] shrink-0" />
                  </Button>
                  <Dropdown.Popover
                    placement="bottom start"
                    className="bg-[#141416] border border-[#FFF8E7]/14 rounded-[12px] p-1.5 shadow-2xl min-w-[176px]"
                  >
                    <Dropdown.Menu
                      aria-label="Language"
                      selectionMode="single"
                      selectedKeys={new Set([lang])}
                      onAction={(key) => handleChangeLang(String(key) as LanguageCode)}
                    >
                      {SUPPORTED_LANGUAGES.map((opt) => (
                        <Dropdown.Item
                          key={opt.code}
                          id={opt.code}
                          data-testid={`lang-option-${opt.code}`}
                          textValue={opt.nativeLabel}
                          className={`rounded-[8px] px-2.5 py-1.5 data-[hovered=true]:bg-white/[0.06] ${
                            opt.code === lang
                              ? 'bg-[#FA500F]/18 text-[#FFAF00] font-medium'
                              : 'text-[#D6D3CB]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 w-full">
                            <span className="text-xs">{opt.nativeLabel}</span>
                            <span className="font-mono text-[10px] text-[#8A867C]">
                              {opt.shortCode}
                            </span>
                          </div>
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown>
              </Card.Content>
            </Card>
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
