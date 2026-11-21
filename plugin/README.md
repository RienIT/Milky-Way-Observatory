# @milky-way/observatory-plugin

A self-contained React + Three.js WebGL2 plugin package for **Milky Way Observatory** — a continuous multi-scale 3D universe viewer spanning **Earth -> Solar System -> Nearby Gaia DR3 Stars -> NASA/JPL-Caltech Milky Way -> Sagittarius A\* -> Local Group & Galaxy Clusters**.

The `plugin/` directory is **fully self-contained**: it has zero Next.js runtime dependencies and zero `@/` path aliases, so it can be embedded directly into any **Next.js**, **Vite + React**, **Remix**, or **Webpack** application.

---

## Directory Structure

```text
plugin/
├── package.json                      # Package metadata (@milky-way/observatory-plugin)
├── tsconfig.json                     # Standalone TypeScript configuration
├── README.md                         # Integration documentation
├── public/                           # Static star catalog tiles & Web Worker
│   ├── data/
│   │   ├── stars-manifest.json
│   │   ├── stars-tier0.bin
│   │   └── stars-tier1.bin
│   └── workers/
│       └── star-tile-worker.js
└── src/
    ├── index.ts                      # Primary barrel exports
    ├── types.ts                      # MilkyWayPluginProps & MilkyWayPluginHandle
    ├── MilkyWayObservatoryPlugin.tsx # Drop-in React component
    ├── components/                   # Complete UI & WebGL2 engine (relative imports only)
    └── lib/                          # Orbital physics, GLSL cosmic shaders, NASA model, i18n
```

---

## Integration Guide (3 Steps)

### Step 1: Copy `plugin/` & Install Dependencies

Copy the entire `plugin/` directory into your host project (for example `./plugins/milky-way-observatory`), then add the package and peer/runtime dependencies to your host `package.json`:

```json
{
  "dependencies": {
    "@milky-way/observatory-plugin": "file:./plugins/milky-way-observatory",
    "three": "^0.187.0",
    "astronomy-engine": "^2.1.19",
    "lucide-react": "^0.553.0",
    "motion": "^12.23.24",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.1"
  }
}
```

> **Tailwind CSS v4 Note:** The plugin UI uses Tailwind CSS utility classes. If your host project uses Tailwind v4, include `@source "../plugins/milky-way-observatory/src";` in your global stylesheet (`globals.css` or `index.css`) so utility classes inside the plugin are scanned.

### Step 2: Copy Star Catalog Tiles & Web Worker into Host `public/`

Copy `plugin/public/data` and `plugin/public/workers` into your host application's `public/` directory:

- **Placed at the root of `public/`** (`public/data/...`, `public/workers/...`) -> leave `assetBasePath` empty (default `""`).
- **Placed in a subdirectory** (e.g. `public/observatory/data/...`, `public/observatory/workers/...`) -> pass `assetBasePath="/observatory"`.

### Step 3: Mount the Component

#### A. Next.js (App Router)

Add `transpilePackages: ['@milky-way/observatory-plugin', 'motion']` to `next.config.ts`, then render inside a Client Component:

```tsx
'use client';

import { useRef } from 'react';
import {
  MilkyWayObservatoryPlugin,
  type MilkyWayPluginHandle,
} from '@milky-way/observatory-plugin';

export default function ObservatoryPage() {
  const obsRef = useRef<MilkyWayPluginHandle>(null);

  return (
    <div className="w-screen h-screen">
      <MilkyWayObservatoryPlugin
        ref={obsRef}
        initialLanguage="en"
        initialGraphicsTier="rtx"
        assetBasePath=""
        onSelectObject={(id, obj) => {
          console.log('Selected celestial body:', id, obj?.title);
        }}
      />
    </div>
  );
}
```

#### B. Vite + React

```tsx
import { MilkyWayObservatoryPlugin } from './plugins/milky-way-observatory/src';

export function App() {
  return (
    <section style={{ width: '100%', height: '800px' }}>
      <MilkyWayObservatoryPlugin
        initialLanguage="en"
        showTopBar={false}
        showSidebar={false}
        assetBasePath="/observatory"
      />
    </section>
  );
}
```

---

## Props & Imperative `ref` API

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` / `style` | `string` / `CSSProperties` | `""` | Container sizing & styling (defaults to filling its parent `100% × 100%`) |
| `initialLanguage` | `'en' \| 'vi' \| 'ja' \| 'zh' \| 'ko'` | `'en'` | Initial UI language (defaults to English) |
| `initialGraphicsTier` | `'potato' \| 'low' \| 'medium' \| 'high' \| 'rtx' \| 'ultra'` | Auto-detect | Optional graphics tier override (`'rtx'` targets RTX 3050–4050 4–8 GB VRAM) |
| `initialTarget` | `string \| null` | `null` | Initial celestial body to inspect (`'earth'`, `'saturn'`, `'BLACK_HOLE_CORE'`, etc.) |
| `initialScaleMode` | `'true-1to1' \| 'atlas'` | `'true-1to1'` | Initial astronomical scale mode |
| `initialSidebarOpen` | `boolean` | `true` | Initial expanded state of the celestial catalog sidebar on desktop |
| `showTopBar` | `boolean` | `true` | Show or hide the top navigation bar |
| `showSidebar` | `boolean` | `true` | Show or hide the left celestial directory sidebar |
| `assetBasePath` | `string` | `""` | Public URL prefix for `data/` and `workers/` assets |
| `summarizeApiUrl` | `string` | `""` | Optional AI summary API endpoint (when empty, uses the built-in offline generator with zero backend required) |
| `persistState` | `boolean` | `true` | Persist language, custom objects, and graphics settings in `localStorage` |
| `storageKeyPrefix` | `string` | `'mw-plugin'` | Prefix for `localStorage` keys to prevent collisions with host app storage |
| `initialObjects` | `MemoryNode[]` | Built-in catalog | Optional custom initial catalog replacing the default 48 NASA/Gaia objects |
| `onSelectObject` | `(id, obj) => void` | — | Fired when the user selects or clears a celestial object |
| `onLanguageChange` | `(lang) => void` | — | Fired when UI language changes |
| `onGraphicsChange` | `(settings) => void` | — | Fired when graphics settings or preset tier changes |

### Imperative Controller Methods (`MilkyWayPluginHandle`)

```ts
obsRef.current?.flyToPreset('milky-way');        // Fly to the NASA Milky Way overview
obsRef.current?.flyToTarget('BLACK_HOLE_CORE');  // Fly directly to Sagittarius A*
obsRef.current?.flyToTarget('saturn');           // Fly to Saturn
obsRef.current?.setGraphicsTier('rtx');          // Enable RTX 3050-4050 preset (1.5x SSAA, 120k stars)
obsRef.current?.setLanguage('en');               // Switch UI language programmatically
obsRef.current?.openGraphicsSettings();          // Open the Graphics & Hardware Settings modal
obsRef.current?.resetCamera();                   // Reset camera view and clear selection
```

---

## Synchronizing the Plugin from the Root Project

Whenever source files in the root application (`components/`, `lib/`, `public/`) are updated, synchronize and verify the standalone plugin package from the repository root:

```bash
npm run sync:plugin
npm run typecheck:plugin
```
