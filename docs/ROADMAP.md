# Milky Way Observatory — Multi-Scale Universe Viewer Roadmap & Audit

> Repository: `RienIT/Milky-Way-Observatory`  
> Stack: Next.js 15 App Router · React 19 · TypeScript 5 · Three.js WebGL2 · Tailwind CSS v4 · `astronomy-engine`

---

## 1. Phase 0 Repository Audit Findings

### Existing Architecture Inventory
- **Entry & Layout**: `app/layout.tsx`, `app/page.tsx`, `app/not-found.tsx`, `app/api/summarize/route.ts`
- **3D Engine**: `components/BlackHoleCanvas.tsx` (~2,477 lines monolithic WebGL component), `lib/cosmic-shaders.ts` (~1,297 lines GLSL shaders including Velocity-Verlet Schwarzschild black hole raymarching with two-pass background gravitational lensing)
- **Domain & Data**: `lib/milky-way.ts`, `lib/scientific-catalog.ts`, `lib/memory-logic.ts`, `lib/memory-types.ts`, `lib/mock-memories.ts`, `lib/graphics-settings.ts`
- **Localization**: `lib/i18n.ts`, `lib/milky-way-i18n.ts`, `lib/celestial-translations.ts`, `lib/extra-translations.ts` (5 languages: `en`, `vi`, `ja`, `zh`, `ko`)
- **UI Components**: `TopSearchBar.tsx`, `ObservatorySidebar.tsx`, `MemoryDetailDrawer.tsx`, `ExoplanetCatalogView.tsx`, `GraphicsSettingsModal.tsx`, `AddMemoryModal.tsx`

### Identified Technical Debt & Fixes
1. **Package Manager Split**: Repository contained `bun.lock` while README/CI used `npm`. Standardized on **npm** (`package-lock.json` + `"packageManager": "npm@10.9.8"`, removed `bun.lock`).
2. **Legacy ESLint Config**: Removed legacy `.eslintrc.json`; retained flat `eslint.config.mjs`.
3. **Unused Chat Media**: Removed unused screenshots in `public/assets/aistudio/`.
4. **Build Metadata**: Added `tsconfig.tsbuildinfo` and `.playwright-cli/` to `.gitignore`.
5. **Test Naming & Scripts**: Renamed `lib/memory-logic.test.ts` → `lib/observatory.test.ts`, added `"test"` and `"typecheck"` npm scripts, and updated `.github/workflows/ci.yml` and `.github/workflows/release.yml` to run them (preserving user-updated action versions `@v7`/`@v6`/`@v4`).
6. **Precision & Multi-Scale Limitations (addressed in Phases 1–3)**:
   - Previous coordinate system used compressed scene units (`1 unit ≈ 600 ly` galactocentric vs `0.145 unit/AU` heliocentric) in float32 world space with a single `near = 2e-6, far = 30000` frustum (`1.5e10` ratio).
   - Replaced with **float64 SI meters** on CPU (`lib/constants.ts`, `lib/scale-engine.ts`), **camera-relative floating origin** (`objAbs - camAbs` in float64 before GPU float32 cast), **logarithmic zoom** (`log10(distanceMeters)`), and **per-scale render layers** (`planetary`, `stellar`, `galactic`, `extragalactic`).
7. **Baseline Black Hole Preservation (Hard Rule #1)**:
   - Captured 3 fixed-pose Playwright screenshots (`oblique`, `edge-on`, `polar`) of Sagittarius A\* before modifying any shader or coordinate plumbing.

### Explicit Assumptions & Constraints
- **`metadata.json` retained**: Required by the hosted runtime environment for applet capabilities (`MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`); left intact rather than deleted.
- **No local `.git` history in sandbox**: This execution workspace does not contain a `.git` directory; phase completion is verified via full lint, typecheck, unit tests, and production build after every phase so commits can be created cleanly on push.
- **Zero external 404 texture dependencies**: High-detail Earth (day albedo with continents/bathymetry, city night lights, cloud cover, Rayleigh atmosphere) and planetary/galaxy assets are generated procedurally in-memory at 2K/4K/8K-capable resolution tiers (plus optional lazy texture loader hook with graceful procedural fallback) so the viewer works offline and never suffers broken CORS/network image requests.
- **Data Provenance**: All physical constants, orbital ephemerides, nearby stars, and Local Group / galaxy cluster catalogs carry explicit peer-reviewed citations in `lib/constants.ts`, `lib/ephemeris.ts`, `lib/star-catalog.ts`, and `lib/extragalactic-catalog.ts`. Parametric/model elements (Milky Way disk/arms beyond Gaia DR3 completeness, illustrative starfield fill, procedural galaxy sprite morphology) are explicitly flagged `illustrative: true` and badged in the UI.

---

## 2. Phased Implementation Plan & Status

- [x] **Phase 0 — Audit, Hygiene & Baseline Black Hole Capture**
  - [x] Full codebase audit & `docs/ROADMAP.md`
  - [x] Standardize on `npm` (remove `bun.lock`, add `packageManager`, `test`, `typecheck` scripts)
  - [x] Remove legacy `.eslintrc.json` and unused `public/assets/aistudio/` files
  - [x] Rename `lib/memory-logic.test.ts` → `lib/observatory.test.ts`
  - [x] Update CI/Release workflows to call `npm run typecheck` and `npm test`
  - [x] Capture 3 baseline Playwright screenshots of Sagittarius A\* before refactoring
- [x] **Phase 1 — Float64 Precision, Floating Origin & Scale-Hierarchy Engine**
  - [x] `lib/constants.ts`: SI physical & astronomical constants with peer-reviewed source citations
  - [x] `lib/scale-engine.ts`: unit conversions (`m`, `km`, `AU`, `ly`, `pc`, `kpc`, `Mpc`), float64 camera-relative positioning (`objAbs - camAbs`) with hierarchical precision anchors (`earth`, `heliocentric`, `galactic`), 4-tier scale-layer selector (`planetary`, `stellar`, `galactic`, `extragalactic`), logarithmic zoom & log-space fly-to interpolation, distance-adaptive WASD flight speed, dynamic `1/2/5×10^n` scale bar
  - [x] `lib/scale-engine.test.ts`: unit tests covering unit conversions, sub-millimeter float64 relative accuracy at `1e21 m`, scale-layer selection, crossfade weights & log-zoom
- [x] **Phase 2 — Real Solar System Ephemeris & Earth/Moon Fidelity**
  - [x] `lib/ephemeris.ts`: real `astronomy-engine` heliocentric/geocentric ephemerides for Sun, 8 planets, Moon, Pluto, plus NASA JPL Keplerian elements for Ceres & 7 major moons (Io, Europa, Ganymede, Callisto, Titan, Enceladus, Triton), controllable simulation Date/Time, play/pause/rate, reset-to-now
  - [x] Exact GRAVITY 2022 Sun–Sgr A\* placement (`8.178 kpc`) & IAU Hipparcos J2000 ecliptic-to-galactic transformation (`~60.19°` galactic plane tilt relative to ecliptic), verified by `lib/ephemeris.test.ts`
  - [x] `createEarthHighResMaterial()` & `createEarthCloudsMaterial()`: realistic continents/oceans, night city lights on the night hemisphere, dynamic animated cloud layer, Rayleigh atmospheric limb scattering, true solar-direction day/night terminator, and live Moon phase
- [x] **Phase 3 — Real Nearby Stars, Parametric Milky Way & Local Group / Clusters**
  - [x] `scripts/build-star-tiles.mjs` + `public/data/stars-tier0.bin` (219 measured Hipparcos/HYG/Gaia DR3 stars), `stars-tier1.bin` (8,000 Gaia-calibrated local neighborhood fill, `illustrative: true`), `stars-manifest.json`, `public/data/README.md` & `public/workers/star-tile-worker.js`
  - [x] `createMilkyWayParametricDiskMaterial()`: double-sided parametric Milky Way model beyond Gaia reach (Wegg+2015 27° bar, Reid+2019 4 logarithmic spiral arms + Orion Spur, bulge, dark dust lanes) explicitly marked `illustrative: true`
  - [x] Sgr A\* derived Schwarzschild radius $r_s = 2GM/c^2$ from `4.297e6 M_sun` (GRAVITY 2022), distance-threshold LOD crossfading from cheap `createSgrACoreGlowBillboardMaterial()` to the untouched full Schwarzschild volumetric lensing shader (`createVolumetricBlackHoleMaterial()`) on approach
  - [x] `lib/extragalactic-catalog.ts` + `lib/extragalactic-catalog.test.ts`: 25 real Local Group galaxies (McConnachie 2012) + nearby galaxies & Virgo/Fornax/Perseus/Coma clusters (NED/2MRS) with real distances, sky coordinates, orientations, and `morphologyIllustrative: true` flags
- [x] **Phase 4 — Multi-Scale HUD, Time Controls, Presets & 5-Language i18n**
  - [x] `components/ScaleHudBar.tsx`: Auto-unit Scale Bar (`m -> km -> AU -> ly -> pc -> kpc -> Mpc`), live distance/altitude readout, log-zoom slider, 6 scale presets (`Earth`, `Solar System`, `Nearby Stars`, `Milky Way`, `Sgr A*`, `Local Group`), layer toggles (`Orbits`, `Labels`, `Galactic Grid`, `Galaxies`, `Reduced Motion`), and Measured/Illustrative provenance badge
  - [x] `components/TimeControlPanel.tsx`: Live UTC date/time readout, play/pause, speed presets (`1x`, `1h/s`, `1d/s`, `1mo/s`, `1yr/s`), Reset to Now, and live lunar phase indicator
  - [x] `components/ObservatorySidebar.tsx`: Added Local Group & Galaxy Clusters quick-jump strip; full 5-language (`en`, `vi`, `ja`, `zh`, `ko`) localization in `lib/universe-i18n.ts`
- [x] **Phase 5 — Dynamic Client-Only Canvas, Disposal, Adaptive FPS, Smoke Tests & Docs**
  - [x] Client-only dynamic import (`next/dynamic(..., { ssr: false })`) for `UniverseCanvas` in `app/page.tsx` (legacy `BlackHoleCanvas.tsx` retired)
  - [x] Complete WebGL resource disposal + `webglcontextlost`/`webglcontextrestored` recovery + hidden-tab render pause (`visibilitychange`)
  - [x] Real FPS sliding-window adaptive quality governor + WebGL2 `fenceSync` software-GL pacing
  - [x] Off-main-thread Web Worker star tile streaming with progress banner & fallback
  - [x] Playwright multi-scale visual verification (`Earth`, `600 m` altitude, `Solar System`, `Nearby Stars`, `Milky Way`, `Sgr A*` 3-pose baseline parity, `Local Group`, mobile `390×844`) + updated `README.md`, `NOTICE`, and `docs/ROADMAP.md`
  - [x] Dedicated **RTX 3050–4050 (4–8 GB VRAM)** preset, NASA/JPL-Caltech R. Hurt Milky Way visual fidelity rebuild, standalone `/plugin/` (`@milky-way/observatory-plugin`) package, English default localization across app/docs, and optimized standalone Next.js build tracing
- [x] **Observatory Overhaul — Phase 1 (Precision Aerospace Instrument UI)**
  - [x] Full-bleed `100vw × 100vh` 3D viewport with compact floating top-left instrument strip (`#030406` vacuum black, `#0a0c10` matte surface, `#ECEAE4` ivory text, `#E88B38` optical amber accent, `IBM Plex Sans` + `IBM Plex Mono`)
  - [x] Keyboard-driven **Command Palette** (`/` or `⌘K` / `Ctrl+K`) searching all 48+ catalog objects, Local Group galaxies, Sgr A\*, eclipses, wavelengths, and guided tours
  - [x] **Cinema / Telescope Mode (`H`)**, live 3D-projected **Telescope Targeting Reticle**, URL hash deep-linking (`#target=...&band=...&date=...&logd=...`), and **AstrophysicsCharts** (SVG H-R Diagram, Planck Blackbody Spectrum, Interior Cross-Section)
- [x] **Observatory Overhaul — Phase 2 (Timeless Evergreen Astrophysics)**
  - [x] 4-band multi-wavelength Galactic observation switcher (`optical` | `infrared` | `radio` | `xray`) + 3D volumetric bipolar **Fermi Bubbles** (`±8.5 kpc`) above and below Sagittarius A\*
  - [x] Real analytical lunar umbra & penumbra shadow projection onto Earth's surface and clouds from live `astronomy-engine` geometry + Total Solar Eclipse quick-jump presets (`2026-08-12`, `2027-08-02`, `2024-04-08`)
  - [x] Expanding **Speed-of-Light Photon Pulse** ($c = 299{,}792{,}458\text{ m/s}$) spherical wavefront with live light-travel milestones
- [x] **Observatory Overhaul — Phase 3 (Guided Expeditions, Share/Snapshot & Flagship English Docs)**
  - [x] Three 5-language interactive scientific **Guided Expeditions** (*Powers of Ten*, *The Multi-Wavelength Milky Way*, *Gravity, Shadows & Event Horizons*) with automated camera/spectrum/epoch choreography and `GuidedTourBar` controls
  - [x] One-click **Share View** coordinate URL copy, HUD-free WebGL2 **PNG Snapshot** capture, and **Keyboard Shortcuts (`?`)** modal
  - [x] Full standalone `/plugin/` synchronization and standard-English flagship documentation (`README.md`, `plugin/README.md`, `CHANGELOG.md`, `docs/ROADMAP.md`)

---

## 3. Illustrative vs. Measured Data Registry

| Layer / Feature | Source | Status |
| :--- | :--- | :--- |
| Physical & IAU Constants | CODATA 2018 / IAU 2012 & 2015 | **Measured** (`illustrative: false`) |
| Solar System Positions, Moon Phase & Eclipses | `astronomy-engine` (VSOP87 / ELP2000) | **Measured** (`illustrative: false`) |
| Planetary Radii, Tilts, Rotation | NASA JPL Planetary Fact Sheets (2024) | **Measured** (`illustrative: false`) |
| Sun–Sgr A\* Distance & Mass | GRAVITY Collaboration (2019, 2022) | **Measured** (`illustrative: false`) |
| Nearby Bright & Gaia DR3 Stars | HYG v3.8 / ESA Gaia DR3 / Hipparcos | **Measured** (`illustrative: false`) |
| Stellar H-R Loci & Planck Spectra | Stefan–Boltzmann & Planck Laws | **Analytical Physics** (`illustrative: false`) |
| Local Group & Galaxy Clusters | McConnachie (2012) / NED / 2MRS | **Measured** positions & distances; procedural disc shapes (`illustrative: true`) |
| Milky Way Multi-Wavelength Disk & Fermi Bubbles | Reid et al. (2019) / Spitzer GLIMPSE / Fermi-LAT / eROSITA | **Parametric Model** (`illustrative: true`) |
| Deep Background Starfield Fill | Procedural deterministic PRNG | **Illustrative** (`illustrative: true`) |
