export {
  MilkyWayObservatoryPlugin,
  default,
} from './MilkyWayObservatoryPlugin';
export type {
  MilkyWayPluginHandle,
  MilkyWayPluginProps,
  PluginGraphicsPresetTier,
} from './types';

// Direct low-level canvas & UI exports for custom host layouts
export { default as UniverseCanvas } from './components/UniverseCanvas';
export type { UniverseCanvasProps } from './components/UniverseCanvas';
export { default as GraphicsSettingsModal } from './components/GraphicsSettingsModal';
export { default as ObservatoryBootOverlay } from './components/ObservatoryBootOverlay';
export type { ObservatoryBootOverlayProps } from './components/ObservatoryBootOverlay';
export { default as ObservatorySidebar } from './components/ObservatorySidebar';
export { default as MemoryDetailDrawer } from './components/MemoryDetailDrawer';
export { default as ScaleHudBar } from './components/ScaleHudBar';
export { default as TimeControlPanel } from './components/TimeControlPanel';

// Core astrophysical data, ephemeris, graphics presets & i18n utilities
export {
  GRAPHICS_PRESETS,
  detectClientHardwareProfile,
  scoreHardwareAndRecommend,
} from './lib/graphics-settings';
export type {
  GraphicsSettings,
  HardwareProfile,
  HardwareRecommendation,
  QualityTierId,
} from './lib/graphics-settings';
export { INITIAL_MEMORIES } from './lib/mock-memories';
export type { MemoryCategory, MemoryNode, ConstellationLink } from './lib/memory-types';
export type { LanguageCode } from './lib/i18n';
export type { ScalePresetId } from './lib/universe-i18n';
export type { SimulationScaleMode } from './lib/scientific-catalog';
export {
  MILKY_WAY_NASA_DATA,
  MILKY_WAY_SPIRAL_ARMS,
  generateNasaMilkyWayKpcStarfield,
} from './lib/milky-way';
export { computeSolarSystemEphemeris } from './lib/ephemeris';
export { EXTRAGALACTIC_CATALOG } from './lib/extragalactic-catalog';
export {
  MemoryClusterSimulation,
  SolarOrbitalWakeTracker,
  MEMORY_TRAIL_POINTS,
  SOLAR_TRAIL_POINTS,
} from './lib/memory-dynamics';
export type {
  CategoryClusterSummary,
  ClusterCohesionMetrics,
  MemoryDynamicNode,
  MemoryDynamicsStepOptions,
  SolarOrbitalWakeSpec,
} from './lib/memory-dynamics';
export {
  BOOT_COPY,
  BOOT_MILESTONES,
  BOOT_STAGE_ORDER,
  BOOT_STAGE_PROGRESS,
  advanceBootState,
  createInitialBootState,
  getBootCopy,
  getBootMilestoneStatus,
  isBootReady,
} from './lib/boot-sequence';
export type {
  BootCopyDictionary,
  BootMilestoneId,
  BootMilestoneStatus,
  BootStageId,
  BootState,
} from './lib/boot-sequence';
