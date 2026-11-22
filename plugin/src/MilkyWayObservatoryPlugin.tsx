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
  ChevronDown,
  CircleDot,
  Globe,
  LayoutGrid,
  Plus,
  Scaling,
  Search,
  SlidersHorizontal,
  Telescope,
} from 'lucide-react';
import AddMemoryModal from './components/AddMemoryModal';
import CommandPalette from './components/CommandPalette';
import ExoplanetCatalogView from './components/ExoplanetCatalogView';
import GraphicsSettingsModal from './components/GraphicsSettingsModal';
import MemoryDetailDrawer from './components/MemoryDetailDrawer';
import ObservatoryBootOverlay from './components/ObservatoryBootOverlay';
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
import { LanguageCode, SUPPORTED_LANGUAGES, UI_STRINGS } from './lib/i18n';
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
 * Framework-agnostic (works in Next.js App/Pages Router, Vite + React, Remix, CRA) with zero Next.js runtime imports.
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

  // SSR-safe client mount gate (avoids needing next/dynamic in non-Next hosts)
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
  const [langMenuOpen, setLangMenuOpen] = useState<boolean>(false);
  const [eclipseRequest, setEclipseRequest] = useState<{
    preset: SolarEclipsePreset;
    seq: number;
  } | null>(null);
  const [photonTrigger, setPhotonTrigger] = useState<number>(0);
  const [scalePresetRequest, setScalePresetRequest] = useState<{
    preset: ScalePresetId;
    seq: number;
  } | null>(null);

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
    [handleChangeGraphicsSettings, handleChangeLang, handleSelectNode]
  );

  const t = UI_STRINGS[lang];
  const hud = UNIVERSE_HUD_COPY[lang];
  const activeLangOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];
  const isTrue1To1 = scaleMode === 'true-1to1';

  return (
    <div
      data-testid="milky-way-observatory-plugin"
      className={`relative w-full h-full min-h-[480px] flex flex-col overflow-hidden bg-[#030406] text-[#ECEAE4] ${className}`.trim()}
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
                <ObservatoryBootOverlay stage="bundle" progress={12} lang={lang} />
              </div>
            )}

            {/* Floating Top-Left Precision Instrument Strip */}
            {showTopBar && (
              <header
                className={`absolute top-3 left-3 z-30 flex flex-wrap items-center gap-1.5 max-w-[calc(100%-380px)] transition-opacity duration-300 ${
                  cinemaMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              >
                <div className="rounded-[4px] bg-[#0a0c10]/95 border border-white/[0.09] p-1 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectNode(null);
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
                    onClick={() => setIsPaletteOpen(true)}
                    className="inline-flex items-center gap-2 px-2 py-1 rounded-[2px] text-[11px] text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.06] transition-colors whitespace-nowrap"
                  >
                    <Search className="w-3.5 h-3.5 text-[#E88B38] shrink-0" />
                    <span className="hidden md:inline max-w-[160px] truncate">
                      {hud.searchTrigger}
                    </span>
                    <kbd className="px-1 rounded-[2px] border border-white/[0.12] bg-white/[0.04] font-mono text-[9px] text-[#C8C6C0]">
                      /
                    </kbd>
                  </button>
                </div>

                <div className="rounded-[4px] bg-[#0a0c10]/95 border border-white/[0.09] p-1 flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => handleSelectNode('BLACK_HOLE_CORE')}
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
                    onClick={() => setActiveView('catalog')}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-[2px] text-[11px] font-medium text-[#C8C6C0] hover:text-[#ECEAE4] hover:bg-white/[0.06] transition-colors whitespace-nowrap"
                  >
                    <LayoutGrid className="w-3 h-3 shrink-0 text-[#8A8D96]" />
                    <span className="hidden lg:inline">{t.navCatalog}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-[2px] text-[11px] font-medium text-[#C8C6C0] hover:text-[#ECEAE4] hover:bg-white/[0.06] transition-colors whitespace-nowrap"
                  >
                    <Plus className="w-3 h-3 text-[#E88B38] shrink-0" />
                    <span className="hidden lg:inline">{hud.worldLabLabel}</span>
                  </button>

                  <span className="mx-0.5 h-3.5 w-px bg-white/[0.09]" aria-hidden="true" />

                  <button
                    type="button"
                    aria-pressed={isTrue1To1}
                    onClick={() =>
                      setScaleMode((prev) => (prev === 'atlas' ? 'true-1to1' : 'atlas'))
                    }
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
                    onClick={() => setIsGraphicsOpen(true)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-[2px] text-[10px] font-mono text-[#C8C6C0] hover:text-[#ECEAE4] hover:bg-white/[0.06] transition-colors whitespace-nowrap"
                  >
                    <SlidersHorizontal className="w-3 h-3 text-[#E88B38] shrink-0" />
                    <span>{graphicsSettings.resolutionScale}x</span>
                  </button>

                  <div className="relative">
                    <button
                      type="button"
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
      />

      <AddMemoryModal
        isOpen={isAddModalOpen}
        existingCount={memories.length}
        onClose={() => setIsAddModalOpen(false)}
        onAddMemory={handleAddMemory}
        lang={lang}
        summarizeApiUrl={summarizeApiUrl}
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
