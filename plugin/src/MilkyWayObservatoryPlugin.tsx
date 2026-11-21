'use client';

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import AddMemoryModal from './components/AddMemoryModal';
import ExoplanetCatalogView from './components/ExoplanetCatalogView';
import GraphicsSettingsModal from './components/GraphicsSettingsModal';
import MemoryDetailDrawer from './components/MemoryDetailDrawer';
import ObservatorySidebar from './components/ObservatorySidebar';
import TopSearchBar, { ActiveWebView } from './components/TopSearchBar';
import UniverseCanvas from './components/UniverseCanvas';
import {
  detectClientHardwareProfile,
  GRAPHICS_PRESETS,
  GraphicsSettings,
  HardwareProfile,
  HardwareRecommendation,
  scoreHardwareAndRecommend,
} from './lib/graphics-settings';
import { LanguageCode } from './lib/i18n';
import { computeConstellationLinks, filterMemories } from './lib/memory-logic';
import { MemoryCategory, MemoryNode } from './lib/memory-types';
import { INITIAL_MEMORIES } from './lib/mock-memories';
import { SimulationScaleMode } from './lib/scientific-catalog';
import { ScalePresetId } from './lib/universe-i18n';
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
    initialScaleMode = 'true-1to1',
    initialSidebarOpen = true,
    showTopBar = true,
    showSidebar = true,
    assetBasePath = '',
    summarizeApiUrl = '',
    persistState = true,
    storageKeyPrefix = 'mw-plugin',
    initialObjects,
    onSelectObject,
    onLanguageChange,
    onGraphicsChange,
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
    setSidebarOpen(true);
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

  return (
    <div
      data-testid="milky-way-observatory-plugin"
      className={`relative w-full h-full min-h-[480px] flex flex-col overflow-hidden bg-[#090a0d] text-[#f3f4f6] ${className}`.trim()}
      style={style}
    >
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

      {activeView === 'catalog' ? (
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
              />
            ) : (
              <div className="w-full h-full bg-[#05060a] flex items-center justify-center">
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-[10px] bg-[#111318] border border-white/[0.08] text-xs font-mono text-[#9ca3af]">
                  <span className="w-2 h-2 rounded-full bg-[#0082fb] animate-pulse" />
                  <span>WebGL2 Multi-Scale Observatory</span>
                </div>
              </div>
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
            />
          </main>
        </div>
      )}

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
