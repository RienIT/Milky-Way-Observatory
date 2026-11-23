'use client';

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
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
  ChevronDown,
  CircleDot,
  Compass,
  Globe,
  HelpCircle,
  LayoutGrid,
  Plus,
  Scaling,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import AddMemoryModal from './components/AddMemoryModal';
import CommandPalette from './components/CommandPalette';
import ExoplanetCatalogView from './components/ExoplanetCatalogView';
import GraphicsSettingsModal from './components/GraphicsSettingsModal';
import GuidedTourBar from './components/GuidedTourBar';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import MemoryDetailDrawer from './components/MemoryDetailDrawer';
import ObservatoryBootOverlay from './components/ObservatoryBootOverlay';
import ObservatoryLogo from './components/ObservatoryLogo';
import ObservatorySidebar from './components/ObservatorySidebar';
import TopSearchBar, { ActiveWebView } from './components/TopSearchBar';
import UniverseCanvas from './components/UniverseCanvas';
import {
  SOLAR_ECLIPSE_PRESETS,
  SolarEclipsePreset,
  WavelengthBandId,
} from './lib/astrophysics-science';
import {
  detectClientHardwareProfile,
  GRAPHICS_PRESETS,
  GraphicsSettings,
  HardwareProfile,
  HardwareRecommendation,
  scoreHardwareAndRecommend,
} from './lib/graphics-settings';
import {
  getGuidedTourById,
  getNextTourStopIndex,
  getPrevTourStopIndex,
  GUIDED_TOURS,
  GuidedTourId,
  GuidedTourStop,
} from './lib/guided-tours';
import { LanguageCode, SUPPORTED_LANGUAGES, UI_STRINGS } from './lib/i18n';
import { OBSERVATORY_EXTRA_COPY } from './lib/localized-telemetry';
import { computeConstellationLinks, filterMemories } from './lib/memory-logic';
import { MemoryCategory, MemoryNode } from './lib/memory-types';
import { INITIAL_MEMORIES } from './lib/mock-memories';
import { SimulationScaleMode } from './lib/scientific-catalog';
import { ScalePresetId, UNIVERSE_HUD_COPY } from './lib/universe-i18n';
import {
  MilkyWayPluginHandle,
  MilkyWayPluginProps,
  PluginGraphicsPresetTier,
} from './types';

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

/**
 * Drop-in React plugin wrapping the complete WebGL2 Multi-Scale Milky Way Observatory.
 * Built with HeroUI v3 + Tailwind CSS v4 and zero Next.js runtime imports.
 */
export const MilkyWayObservatoryPlugin = forwardRef<
  MilkyWayPluginHandle,
  MilkyWayPluginProps
>(function MilkyWayObservatoryPlugin(
  {
    className = '',
    style,
    initialLanguage = 'en',
    initialGraphicsTier,
    initialTarget = null,
    initialWavelengthBand = 'optical',
    initialScaleMode = 'true-1to1',
    initialSidebarOpen = false,
    showTopBar = true,
    showSidebar = false,
    assetBasePath = '',
    summarizeApiUrl = '',
    persistState = true,
    storageKeyPrefix = 'mw-plugin',
    initialObjects,
    onSelectObject,
    onLanguageChange,
    onGraphicsChange,
    onReady,
  },
  ref
) {
  const storageNodesKey = `${storageKeyPrefix}-nodes-v4`;
  const storageLangKey = `${storageKeyPrefix}-lang-v2`;
  const storageGfxKey = `${storageKeyPrefix}-gfx-v1`;

  const baseCatalog = useMemo(
    () => (initialObjects && initialObjects.length > 0 ? initialObjects : INITIAL_MEMORIES),
    [initialObjects]
  );

  // SSR-safe client mount gate
  const [isClientMounted, setIsClientMounted] = useState(false);

  const [memories, setMemories] = useState<MemoryNode[]>(baseCatalog);
  const [lang, setLang] = useState<LanguageCode>(initialLanguage);
  const [activeView, setActiveView] = useState<ActiveWebView>('explorer');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(initialSidebarOpen);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory | 'ALL'>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(initialTarget);

  const [orbitSpeedMultiplier, setOrbitSpeedMultiplier] = useState<number>(1);
  const [showOrbitRings, setShowOrbitRings] = useState<boolean>(true);
  const [showConstellations, setShowConstellations] = useState<boolean>(false);
  const [showMilkyWayDisk, setShowMilkyWayDisk] = useState<boolean>(true);
  const [scaleMode, setScaleMode] = useState<SimulationScaleMode>(initialScaleMode);
  const [cameraResetTrigger, setCameraResetTrigger] = useState<number>(0);

  const [wavelengthBand, setWavelengthBand] = useState<WavelengthBandId>(initialWavelengthBand);
  const [cinemaMode, setCinemaMode] = useState<boolean>(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [eclipseRequest, setEclipseRequest] = useState<{
    preset: SolarEclipsePreset;
    seq: number;
  } | null>(null);
  const [photonTrigger, setPhotonTrigger] = useState<number>(0);
  const [scalePresetRequest, setScalePresetRequest] = useState<{
    preset: ScalePresetId;
    seq: number;
  } | null>(null);
  const [activeTourId, setActiveTourId] = useState<GuidedTourId | null>(null);
  const [tourStopIndex, setTourStopIndex] = useState<number>(0);
  const [tourAutoPlay, setTourAutoPlay] = useState<boolean>(true);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isGraphicsOpen, setIsGraphicsOpen] = useState<boolean>(false);
  const [hardwareProfile, setHardwareProfile] = useState<HardwareProfile>(DEFAULT_HARDWARE_PROFILE);
  const [recommendation, setRecommendation] = useState<HardwareRecommendation>(() =>
    scoreHardwareAndRecommend(DEFAULT_HARDWARE_PROFILE)
  );
  const [graphicsSettings, setGraphicsSettings] = useState<GraphicsSettings>(() =>
    initialGraphicsTier ? { ...GRAPHICS_PRESETS[initialGraphicsTier] } : GRAPHICS_PRESETS.medium
  );

  // Hydrate browser-only state & hardware profile once mounted
  useEffect(() => {
    let cancelled = false;
    const rafId = window.requestAnimationFrame(() => {
      if (cancelled) return;
      setIsClientMounted(true);

      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }

      if (persistState) {
        try {
          const savedLang = window.localStorage.getItem(storageLangKey) as LanguageCode | null;
          if (savedLang && ['vi', 'en', 'ja', 'zh', 'ko'].includes(savedLang)) {
            setLang(savedLang);
          }
        } catch {
          // ignore storage errors
        }

        try {
          const rawNodes = window.localStorage.getItem(storageNodesKey);
          if (rawNodes) {
            const parsed = JSON.parse(rawNodes) as MemoryNode[];
            if (Array.isArray(parsed) && parsed.length >= baseCatalog.length) {
              setMemories(parsed);
            }
          }
        } catch {
          // fallback cleanly
        }
      }

      const detected = detectClientHardwareProfile();
      const rec = scoreHardwareAndRecommend(detected);
      setHardwareProfile(detected);
      setRecommendation(rec);

      if (initialGraphicsTier) {
        setGraphicsSettings({ ...GRAPHICS_PRESETS[initialGraphicsTier] });
        return;
      }

      if (persistState) {
        try {
          const rawGfx = window.localStorage.getItem(storageGfxKey);
          if (rawGfx) {
            const parsed = JSON.parse(rawGfx) as GraphicsSettings;
            if (parsed && typeof parsed.resolutionScale === 'number') {
              setGraphicsSettings(parsed);
              return;
            }
          }
        } catch {
          // fallback to auto-recommended profile
        }
      }
      setGraphicsSettings(rec.recommendedSettings);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
    };
  }, [
    baseCatalog.length,
    initialGraphicsTier,
    persistState,
    storageGfxKey,
    storageLangKey,
    storageNodesKey,
  ]);

  // Global Command Palette keyboard trigger ('/' or Cmd/Ctrl + K)
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

  const handleSelectNode = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      if (onSelectObject) {
        const obj =
          !id || id === 'BLACK_HOLE_CORE'
            ? null
            : (memories.find((m) => m.id === id) ?? null);
        onSelectObject(id, obj);
      }
    },
    [memories, onSelectObject]
  );

  const handleChangeLang = useCallback(
    (next: LanguageCode) => {
      setLang(next);
      onLanguageChange?.(next);
      if (persistState) {
        try {
          window.localStorage.setItem(storageLangKey, next);
        } catch {
          // ignore
        }
      }
    },
    [onLanguageChange, persistState, storageLangKey]
  );

  const handleChangeGraphicsSettings = useCallback(
    (next: GraphicsSettings) => {
      setGraphicsSettings(next);
      onGraphicsChange?.(next);
      if (persistState) {
        try {
          window.localStorage.setItem(storageGfxKey, JSON.stringify(next));
        } catch {
          // ignore
        }
      }
    },
    [onGraphicsChange, persistState, storageGfxKey]
  );

  const handleAddMemory = useCallback(
    (node: MemoryNode) => {
      setMemories((prev) => {
        const next = [node, ...prev];
        if (persistState) {
          try {
            window.localStorage.setItem(storageNodesKey, JSON.stringify(next));
          } catch {
            // ignore
          }
        }
        return next;
      });
      setActiveView('explorer');
      handleSelectNode(node.id);
    },
    [handleSelectNode, persistState, storageNodesKey]
  );

  const handleDeleteNode = useCallback(
    (id: string) => {
      setMemories((prev) => {
        const next = prev.filter((m) => m.id !== id);
        if (persistState) {
          try {
            window.localStorage.setItem(storageNodesKey, JSON.stringify(next));
          } catch {
            // ignore
          }
        }
        return next;
      });
      if (selectedId === id) {
        handleSelectNode(null);
      }
    },
    [handleSelectNode, persistState, selectedId, storageNodesKey]
  );

  const handleRestoreDefaults = useCallback(() => {
    setMemories(baseCatalog);
    setSearchQuery('');
    setSelectedCategory('ALL');
    handleSelectNode(null);
    setCameraResetTrigger((c) => c + 1);
    if (persistState) {
      try {
        window.localStorage.removeItem(storageNodesKey);
      } catch {
        // ignore
      }
    }
  }, [baseCatalog, handleSelectNode, persistState, storageNodesKey]);

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
        handleSelectNode(null);
        setEclipseRequest((prev) => ({ preset, seq: (prev?.seq ?? 0) + 1 }));
      } else if (stop.targetId) {
        if (stop.openInspector) {
          handleSelectNode(stop.targetId);
        } else {
          handleSelectNode(null);
          window.__OBSERVATORY_API__?.flyToTarget(stop.targetId);
        }
      } else if (stop.presetId) {
        handleSelectNode(null);
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
    [handleSelectNode]
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

  const handleCapturePng = useCallback(async () => {
    const dataUrl = await window.__OBSERVATORY_API__?.captureSnapshot();
    if (!dataUrl) return;
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
  }, [selectedId, wavelengthBand]);

  // Expose imperative plugin controller API to host applications via ref
  useImperativeHandle(
    ref,
    () => ({
      flyToTarget: (targetId: string, distanceMeters?: number) => {
        setActiveView('explorer');
        handleSelectNode(targetId);
        window.__OBSERVATORY_API__?.flyToTarget(targetId, distanceMeters);
      },
      flyToPreset: (preset: ScalePresetId) => {
        setActiveView('explorer');
        window.__OBSERVATORY_API__?.flyToPreset(preset);
      },
      setWavelengthBand: (band: WavelengthBandId) => {
        setWavelengthBand(band);
        window.__OBSERVATORY_API__?.setWavelengthBand(band);
      },
      jumpToEclipse: (presetId?: string) => {
        setActiveView('explorer');
        const preset =
          SOLAR_ECLIPSE_PRESETS.find((p) => p.id === presetId) ?? SOLAR_ECLIPSE_PRESETS[0];
        setEclipseRequest((prev) => ({ preset, seq: (prev?.seq ?? 0) + 1 }));
      },
      triggerPhotonPulse: (active = true) => {
        setActiveView('explorer');
        if (active) {
          setPhotonTrigger((n) => n + 1);
        } else {
          window.__OBSERVATORY_API__?.triggerPhotonPulse(false);
        }
      },
      setCinemaMode: (enabled: boolean) => {
        setCinemaMode(enabled);
      },
      startTour: (tourId: GuidedTourId) => {
        handleStartTour(tourId);
      },
      stopTour: () => {
        handleCloseTour();
      },
      captureSnapshot: async () => {
        return (await window.__OBSERVATORY_API__?.captureSnapshot()) ?? null;
      },
      setLanguage: (nextLang: LanguageCode) => {
        handleChangeLang(nextLang);
      },
      setGraphicsTier: (tier: PluginGraphicsPresetTier) => {
        handleChangeGraphicsSettings({ ...GRAPHICS_PRESETS[tier] });
      },
      openGraphicsSettings: () => {
        setIsGraphicsOpen(true);
      },
      resetCamera: () => {
        handleSelectNode(null);
        setCameraResetTrigger((c) => c + 1);
      },
    }),
    [
      handleChangeGraphicsSettings,
      handleChangeLang,
      handleCloseTour,
      handleSelectNode,
      handleStartTour,
    ]
  );

  const t = UI_STRINGS[lang];
  const hud = UNIVERSE_HUD_COPY[lang];
  const extra = OBSERVATORY_EXTRA_COPY[lang];
  const activeLangOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];
  const isTrue1To1 = scaleMode === 'true-1to1';

  return (
    <div
      data-theme="dark"
      data-testid="milky-way-observatory-plugin"
      className={`dark relative w-full h-full min-h-[480px] flex flex-col overflow-hidden bg-[#030406] text-[#ECEAE4] ${className}`.trim()}
      style={style}
    >
      {activeView === 'catalog' ? (
        <>
          {showTopBar && (
            <TopSearchBar
              activeView={activeView}
              isInspectingBlackHole={selectedId === 'BLACK_HOLE_CORE'}
              onSelectExplorer={() => {
                setActiveView('explorer');
                if (selectedId === 'BLACK_HOLE_CORE') {
                  handleSelectNode(null);
                }
              }}
              onSelectBlackHoleLab={() => {
                setActiveView('explorer');
                handleSelectNode('BLACK_HOLE_CORE');
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
              assetBasePath={assetBasePath}
            />
          )}
          <ExoplanetCatalogView
            memories={memories}
            matchedIds={matchedIds}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onInspectIn3D={(id) => {
              setActiveView('explorer');
              handleSelectNode(id);
            }}
            onOpenBlackHoleLab={() => {
              setActiveView('explorer');
              handleSelectNode('BLACK_HOLE_CORE');
            }}
            onOpenSimulator={() => setIsAddModalOpen(true)}
            lang={lang}
            assetBasePath={assetBasePath}
          />
        </>
      ) : (
        <div className="relative flex-1 flex overflow-hidden">
          {showSidebar && (
            <ObservatorySidebar
              isOpen={sidebarOpen}
              onToggleOpen={() => setSidebarOpen((o) => !o)}
              memories={memories}
              matchedIds={matchedIds}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedId={selectedId}
              onSelectNode={handleSelectNode}
              onRestoreDefaults={handleRestoreDefaults}
              lang={lang}
            />
          )}

          <main className="relative flex-1 h-full overflow-hidden">
            {isClientMounted ? (
              <UniverseCanvas
                memories={memories}
                links={links}
                matchedIds={matchedIds}
                isFilterActive={isFilterActive}
                selectedId={selectedId}
                onSelectNode={handleSelectNode}
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
                  handleSelectNode(null);
                  setCameraResetTrigger((c) => c + 1);
                }}
                lang={lang}
                assetBasePath={assetBasePath}
                onBootReady={onReady}
                wavelengthBand={wavelengthBand}
                onChangeWavelengthBand={setWavelengthBand}
                cinemaMode={cinemaMode}
                onToggleCinemaMode={() => setCinemaMode((v) => !v)}
                externalEclipseRequest={eclipseRequest}
                externalPhotonTrigger={photonTrigger}
                externalScalePresetRequest={scalePresetRequest}
              />
            ) : (
              <div className="relative w-full h-full bg-[#030406]">
                <ObservatoryBootOverlay
                  stage="bundle"
                  progress={12}
                  lang={lang}
                  assetBasePath={assetBasePath}
                />
              </div>
            )}

            {/* Floating Top-Left Precision Instrument Strip (Mistral Dark Studio + HeroUI v3) */}
            {showTopBar && (
              <header
                className={`absolute top-3 left-3 z-30 flex flex-wrap items-center gap-2 max-w-[calc(100%-380px)] transition-opacity duration-300 ${
                  cinemaMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              >
                <Card className="rounded-[12px] bg-[#141416]/95 border border-[#FFF8E7]/12 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.45)] p-0">
                  <Card.Content className="p-1.5 flex flex-row items-center gap-1.5 overflow-visible">
                    <Button
                      size="sm"
                      variant="ghost"
                      onPress={() => {
                        handleSelectNode(null);
                        setCameraResetTrigger((c) => c + 1);
                      }}
                      className="h-7 min-w-0 rounded-[8px] px-2 text-[13px] font-medium tracking-[-0.01em] text-[#FFF8E7] hover:bg-white/[0.06] whitespace-nowrap gap-2"
                    >
                      <ObservatoryLogo size={20} assetBasePath={assetBasePath} />
                      <span className="hidden sm:inline font-display text-[15px] font-normal tracking-[-0.01em]">
                        {t.brandTitle}
                      </span>
                    </Button>

                    <Separator orientation="vertical" className="h-4 bg-[#FFF8E7]/12" />

                    <Button
                      size="sm"
                      variant="ghost"
                      onPress={() => setIsPaletteOpen(true)}
                      className="h-7 min-w-0 rounded-[8px] px-2.5 text-[11px] text-[#B8B4AA] hover:text-[#FFF8E7] hover:bg-white/[0.06] whitespace-nowrap gap-2"
                    >
                      <Search className="w-3.5 h-3.5 text-[#FA500F] shrink-0" />
                      <span className="hidden md:inline max-w-[160px] truncate">
                        {hud.searchTrigger}
                      </span>
                      <Kbd className="px-1.5 py-0 rounded-[4px] border border-[#FFF8E7]/15 bg-white/[0.05] font-mono text-[9px] text-[#FFF8E7]/80 shadow-none">
                        <Kbd.Content>/</Kbd.Content>
                      </Kbd>
                    </Button>
                  </Card.Content>
                </Card>

                <Card className="rounded-[12px] bg-[#141416]/95 border border-[#FFF8E7]/12 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.45)] p-0">
                  <Card.Content className="p-1.5 flex flex-row items-center gap-1 overflow-visible">
                    <Button
                      size="sm"
                      variant={selectedId === 'BLACK_HOLE_CORE' ? 'primary' : 'ghost'}
                      onPress={() => handleSelectNode('BLACK_HOLE_CORE')}
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
                      onPress={() => setActiveView('catalog')}
                      className="h-7 min-w-0 rounded-[8px] px-2.5 text-[11px] font-medium text-[#D6D3CB] hover:text-[#FFF8E7] hover:bg-white/[0.06] whitespace-nowrap gap-1.5"
                    >
                      <LayoutGrid className="w-3 h-3 shrink-0 text-[#9A968C]" />
                      <span className="hidden lg:inline">{t.navCatalog}</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onPress={() => setIsAddModalOpen(true)}
                      className="h-7 min-w-0 rounded-[8px] px-2.5 text-[11px] font-medium text-[#D6D3CB] hover:text-[#FFF8E7] hover:bg-white/[0.06] whitespace-nowrap gap-1.5"
                    >
                      <Plus className="w-3 h-3 text-[#FA500F] shrink-0" />
                      <span className="hidden xl:inline">{hud.worldLabLabel}</span>
                    </Button>

                    <Dropdown>
                      <Button
                        size="sm"
                        variant="ghost"
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
                          onAction={(key) => handleStartTour(String(key) as GuidedTourId)}
                        >
                          {GUIDED_TOURS.map((tour) => (
                            <Dropdown.Item
                              key={tour.id}
                              id={tour.id}
                              textValue={tour.title[lang]}
                              className="rounded-[8px] px-2.5 py-2 data-[hovered=true]:bg-white/[0.06]"
                            >
                              <div className="space-y-0.5 w-full">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[12px] font-medium text-[#FFF8E7]">
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
                          ))}
                        </Dropdown.Menu>
                      </Dropdown.Popover>
                    </Dropdown>

                    <Separator orientation="vertical" className="mx-0.5 h-3.5 bg-[#FFF8E7]/12" />

                    <Tooltip delay={250}>
                      <Button
                        size="sm"
                        variant="ghost"
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
                      onPress={() => setIsGraphicsOpen(true)}
                      aria-label={extra.graphicsAria}
                      className="h-7 min-w-0 rounded-[8px] px-2 text-[10px] font-mono text-[#D6D3CB] hover:text-[#FFF8E7] hover:bg-white/[0.06] whitespace-nowrap gap-1"
                    >
                      <SlidersHorizontal className="w-3 h-3 text-[#FA500F] shrink-0" />
                      <span>{graphicsSettings.resolutionScale}x</span>
                    </Button>

                    <Tooltip delay={250}>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        onPress={handleCapturePng}
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

                    <Dropdown>
                      <Button
                        size="sm"
                        variant="ghost"
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
            )}

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

            <MemoryDetailDrawer
              selectedId={selectedId}
              memory={selectedMemory}
              allMemories={memories}
              links={links}
              onClose={() => handleSelectNode(null)}
              onSelectNode={handleSelectNode}
              onSelectTag={handleSelectTag}
              onDeleteNode={handleDeleteNode}
              lang={lang}
              hiddenInCinemaMode={cinemaMode}
            />
          </main>
        </div>
      )}

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        memories={memories}
        lang={lang}
        onSelectObject={(id) => {
          setActiveView('explorer');
          handleSelectNode(id);
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

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        lang={lang}
      />

      <AddMemoryModal
        isOpen={isAddModalOpen}
        existingCount={memories.length}
        onClose={() => setIsAddModalOpen(false)}
        onAddMemory={handleAddMemory}
        lang={lang}
        summarizeApiUrl={summarizeApiUrl}
        assetBasePath={assetBasePath}
      />

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
});

export default MilkyWayObservatoryPlugin;
