'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AddMemoryModal from '@/components/AddMemoryModal';
import BlackHoleCanvas from '@/components/BlackHoleCanvas';
import ExoplanetCatalogView from '@/components/ExoplanetCatalogView';
import GraphicsSettingsModal from '@/components/GraphicsSettingsModal';
import MemoryDetailDrawer from '@/components/MemoryDetailDrawer';
import ObservatorySidebar from '@/components/ObservatorySidebar';
import TopSearchBar, { ActiveWebView } from '@/components/TopSearchBar';
import {
  detectClientHardwareProfile,
  GRAPHICS_PRESETS,
  GraphicsSettings,
  HardwareProfile,
  HardwareRecommendation,
  scoreHardwareAndRecommend,
} from '@/lib/graphics-settings';
import { LanguageCode } from '@/lib/i18n';
import {
  computeConstellationLinks,
  filterMemories,
} from '@/lib/memory-logic';
import { MemoryCategory, MemoryNode } from '@/lib/memory-types';
import { INITIAL_MEMORIES } from '@/lib/mock-memories';
import { SimulationScaleMode } from '@/lib/scientific-catalog';

const STORAGE_MEMORIES_KEY = 'milky-way-nodes-v4';
const STORAGE_LANG_KEY = 'milky-way-lang-v1';
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
  const [lang, setLang] = useState<LanguageCode>('vi');
  const [activeView, setActiveView] = useState<ActiveWebView>('explorer');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory | 'ALL'>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [orbitSpeedMultiplier, setOrbitSpeedMultiplier] = useState<number>(1);
  const [showOrbitRings, setShowOrbitRings] = useState<boolean>(true);
  const [showConstellations, setShowConstellations] = useState<boolean>(false);
  const [showMilkyWayDisk, setShowMilkyWayDisk] = useState<boolean>(true);
  const [scaleMode, setScaleMode] = useState<SimulationScaleMode>('true-1to1');
  const [cameraResetTrigger, setCameraResetTrigger] = useState<number>(0);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isGraphicsOpen, setIsGraphicsOpen] = useState<boolean>(false);
  const [hardwareProfile, setHardwareProfile] = useState<HardwareProfile>(DEFAULT_HARDWARE_PROFILE);
  const [recommendation, setRecommendation] = useState<HardwareRecommendation>(() =>
    scoreHardwareAndRecommend(DEFAULT_HARDWARE_PROFILE)
  );
  const [graphicsSettings, setGraphicsSettings] = useState<GraphicsSettings>(
    GRAPHICS_PRESETS.medium
  );

  // Hydrate persisted language, custom celestial objects, and auto-detected hardware recommendation
  useEffect(() => {
    let cancelled = false;
    const rafId = window.requestAnimationFrame(() => {
      if (cancelled) return;

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

  const handleRestoreDefaults = useCallback(() => {
    setMemories(INITIAL_MEMORIES);
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedId(null);
    setCameraResetTrigger((c) => c + 1);
    try {
      window.localStorage.removeItem(STORAGE_MEMORIES_KEY);
    } catch {
      // Ignore
    }
  }, []);

  const handleSelectTag = useCallback((tag: string) => {
    setSearchQuery(tag);
    setSelectedCategory('ALL');
    setSidebarOpen(true);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#090a0d] text-[#f3f4f6]">
      {/* Astryx Top Navigation Bar */}
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

      {/* Main Content Workspace */}
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
            setSelectedId(id);
          }}
          onOpenBlackHoleLab={() => {
            setActiveView('explorer');
            setSelectedId('BLACK_HOLE_CORE');
          }}
          onOpenSimulator={() => setIsAddModalOpen(true)}
          lang={lang}
        />
      ) : (
        <div className="relative flex-1 flex overflow-hidden">
          {/* Left Astryx Observatory Sidebar */}
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
            onSelectNode={(id) => setSelectedId(id)}
            onRestoreDefaults={handleRestoreDefaults}
            lang={lang}
          />

          {/* 3D NASA Milky Way & Sagittarius A* Interactive Viewport */}
          <main className="relative flex-1 h-full overflow-hidden">
            <BlackHoleCanvas
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
            />

            {/* Right Inspector Drawer for Selected Celestial Object or Sagittarius A* */}
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
            />
          </main>
        </div>
      )}

      {/* Add Celestial Body / Simulator Modal */}
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
