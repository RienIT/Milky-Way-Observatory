import type React from 'react';
import type { GraphicsSettings, QualityTierId } from './lib/graphics-settings';
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
  /** Initial simulation scale mode (`'true-1to1'` or `'atlas'`). Defaults to `'true-1to1'`. */
  initialScaleMode?: SimulationScaleMode;
  /** Initial sidebar state on desktop. Defaults to `true`. */
  initialSidebarOpen?: boolean;
  /** Show or hide the top navigation bar. Set `false` when embedding inside a host app header. Defaults to `true`. */
  showTopBar?: boolean;
  /** Show or hide the left celestial catalog sidebar. Set `false` for a minimal 3D canvas widget. Defaults to `true`. */
  showSidebar?: boolean;
  /**
   * Public base path where `plugin/public/data` and `plugin/public/workers` are served by the host app.
   * Example: `"/observatory"` loads `/observatory/data/stars-manifest.json` and `/observatory/workers/star-tile-worker.js`.
   * Defaults to `""` (root `/data/...` and `/workers/...`).
   */
  assetBasePath?: string;
  /**
   * Optional endpoint URL for AI celestial body summarization (`POST` returning `{ title, category, summary, tags }`).
   * Set to `""` to always use the built-in offline astrophysicist generator with zero backend required.
   * Defaults to `""` inside the standalone plugin so host projects work immediately with no backend setup.
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
}

export interface MilkyWayPluginHandle {
  /** Smoothly fly camera in logarithmic space to any Solar System body, catalog node, or `'BLACK_HOLE_CORE'`. */
  flyToTarget: (targetId: string, distanceMeters?: number) => void;
  /** Jump to a named cosmic scale preset (`'earth' | 'solar-system' | 'nearby-stars' | 'milky-way' | 'sgr-a' | 'local-group'`). */
  flyToPreset: (preset: ScalePresetId) => void;
  /** Switch UI language programmatically. */
  setLanguage: (lang: LanguageCode) => void;
  /** Switch graphics preset programmatically (e.g. `'rtx'` for RTX 3050-4050 4-8GB VRAM). */
  setGraphicsTier: (tier: PluginGraphicsPresetTier) => void;
  /** Open the Graphics & Hardware Settings dialog. */
  openGraphicsSettings: () => void;
  /** Reset camera & clear active selection. */
  resetCamera: () => void;
}
