import type React from 'react';
import type { WavelengthBandId } from './lib/astrophysics-science';
import type { GraphicsSettings, QualityTierId } from './lib/graphics-settings';
import type { GuidedTourId } from './lib/guided-tours';
import type { LanguageCode } from './lib/i18n';
import type { MemoryNode } from './lib/memory-types';
import type { SimulationScaleMode } from './lib/scientific-catalog';
import type { ScalePresetId } from './lib/universe-i18n';

export type PluginGraphicsPresetTier = Exclude<QualityTierId, 'custom'>;

export interface MilkyWayPluginProps {
  /** Optional className for the plugin root container (defaults to filling its parent 100% x 100%). */
  className?: string;
  /** Optional inline styles (e.g. `{ height: '720px' }` when embedding inside a page section). */
  style?: React.CSSProperties;
  /** Initial UI language (`'en' | 'vi' | 'ja' | 'zh' | 'ko'`). Defaults to `'en'`. */
  initialLanguage?: LanguageCode;
  /** Optional preset override (`'potato' | 'low' | 'medium' | 'high' | 'rtx' | 'ultra'`). When omitted, auto-detects client GPU. */
  initialGraphicsTier?: PluginGraphicsPresetTier;
  /** Optional initial celestial object ID to inspect (`'earth'`, `'saturn'`, `'BLACK_HOLE_CORE'`, etc.). */
  initialTarget?: string | null;
  /** Initial spectral observation band (`'optical' | 'infrared' | 'radio' | 'xray'`). Defaults to `'optical'`. */
  initialWavelengthBand?: WavelengthBandId;
  /** Initial simulation scale mode (`'true-1to1'` or `'atlas'`). Defaults to `'true-1to1'`. */
  initialScaleMode?: SimulationScaleMode;
  /** Initial sidebar state when `showSidebar` is enabled. Defaults to `false` (full-bleed observatory). */
  initialSidebarOpen?: boolean;
  /** Show or hide the floating instrument strip / top navigation. Defaults to `true`. */
  showTopBar?: boolean;
  /** Show or hide the optional left celestial catalog sidebar. Defaults to `false` (Command Palette `/` replaces permanent sidebar). */
  showSidebar?: boolean;
  /**
   * Public base path where `plugin/public/data` and `plugin/public/workers` are served by the host app.
   * Example: `"/observatory"` loads `/observatory/data/stars-manifest.json` and `/observatory/workers/star-tile-worker.js`.
   * Defaults to `""` (root `/data/...` and `/workers/...`).
   */
  assetBasePath?: string;
  /**
   * Optional endpoint URL for celestial body summarization (`POST` returning `{ title, category, summary, tags }`).
   * Set to `""` to always use the built-in offline astrophysicist generator with zero backend required.
   */
  summarizeApiUrl?: string;
  /** Persist user language, custom objects, and graphics tier in `localStorage`. Defaults to `true`. */
  persistState?: boolean;
  /** Prefix for `localStorage` keys to avoid collisions with host app storage. Defaults to `'mw-plugin'`. */
  storageKeyPrefix?: string;
  /** Optional custom initial catalog items appended or replacing default NASA/Gaia catalog. */
  initialObjects?: MemoryNode[];
  /** Fired whenever the user selects or clears a celestial object (or `'BLACK_HOLE_CORE'`). */
  onSelectObject?: (id: string | null, object: MemoryNode | null) => void;
  /** Fired when UI language changes. */
  onLanguageChange?: (lang: LanguageCode) => void;
  /** Fired when graphics settings or preset tier changes. */
  onGraphicsChange?: (settings: GraphicsSettings) => void;
  /** Fired once the WebGL2 engine finishes its staged startup and renders the first frame. */
  onReady?: () => void;
}

export interface MilkyWayPluginHandle {
  /** Smoothly fly camera in logarithmic space to any Solar System body, catalog node, or `'BLACK_HOLE_CORE'`. */
  flyToTarget: (targetId: string, distanceMeters?: number) => void;
  /** Jump to a named cosmic scale preset (`'earth' | 'solar-system' | 'nearby-stars' | 'milky-way' | 'sgr-a' | 'local-group'`). */
  flyToPreset: (preset: ScalePresetId) => void;
  /** Switch electromagnetic observation band (`'optical' | 'infrared' | 'radio' | 'xray'`). */
  setWavelengthBand: (band: WavelengthBandId) => void;
  /** Jump ephemeris clock and camera directly to a real Total Solar Eclipse (`'eclipse-2026'`, `'eclipse-2027'`, `'eclipse-2024'`). */
  jumpToEclipse: (presetId?: string) => void;
  /** Toggle or emit the Speed-of-Light Photon Pulse wavefront (`c = 299,792,458 m/s`). */
  triggerPhotonPulse: (active?: boolean) => void;
  /** Toggle distraction-free Cinema / Telescope Mode (`H`). */
  setCinemaMode: (enabled: boolean) => void;
  /** Launch an interactive scientific Guided Expedition (`'powers-of-ten' | 'multi-wavelength-galaxy' | 'gravity-and-shadows'`). */
  startTour: (tourId: GuidedTourId) => void;
  /** Exit the currently running Guided Expedition. */
  stopTour: () => void;
  /** Capture a clean HUD-free WebGL2 PNG data URL of the live canvas. */
  captureSnapshot: () => Promise<string | null>;
  /** Switch UI language programmatically. */
  setLanguage: (lang: LanguageCode) => void;
  /** Switch graphics preset programmatically (e.g. `'rtx'` for RTX 3050-4050 4-8GB VRAM). */
  setGraphicsTier: (tier: PluginGraphicsPresetTier) => void;
  /** Open the Graphics & Hardware Settings dialog. */
  openGraphicsSettings: () => void;
  /** Reset camera & clear active selection. */
  resetCamera: () => void;
}
