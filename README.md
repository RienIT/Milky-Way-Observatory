# Milky Way Observatory

**A real-time, continuous multi-scale WebGL2 universe observatory spanning 23+ orders of magnitude — from 600 m above Earth's surface to the Coma Galaxy Cluster — built on peer-reviewed NASA/JPL, ESA Gaia DR3, GRAVITY Collaboration, and McConnachie/NED datasets.**

[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](./.github/workflows/ci.yml)
[![CodeQL](https://img.shields.io/badge/Security-CodeQL-2ea44f?logo=github&logoColor=white)](./.github/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![Three.js WebGL2](https://img.shields.io/badge/Three.js-WebGL2%20GLSL-049EF4?logo=threedotjs)](https://threejs.org)

---

## Preview

<!-- Drop your recorded demo video, GIF, or screenshots here -->
<!-- Example: ![Milky Way Observatory Demo](./docs/media/demo.gif) -->

> *Interactive full-bleed WebGL2 observatory viewport featuring precision aerospace telemetry, multi-wavelength Galactic imaging, real-time lunar eclipse umbra projection, Schwarzschild black-hole lensing, and interactive scientific guided expeditions.*

---

## Key Capabilities

### 1. Continuous Float64 Multi-Scale Architecture (`1 m` → `10²⁶ m`)
- **Float64 SI Meters & Floating Origin**: Every celestial position is computed in IEEE-754 float64 meters relative to hierarchical precision anchors (`earth`, `heliocentric`, `galactic`), subtracting camera coordinates on CPU (`objAbs - camAbs`) before casting to GPU float32 — eliminating vertex jitter even at 600 m altitude above Earth while 8.178 kpc from Sagittarius A\*.
- **4-Pass Depth-Cleared Scale Hierarchy**: Independent scale layers (`planetary`, `stellar`, `galactic`, `extragalactic`) with dynamic per-layer frustums, logarithmic depth buffer, and smooth decade crossfades.
- **Logarithmic Zoom & 6-DOF Flight**: Seamless wheel/pinch/slider logarithmic zoom, log-space camera fly-to, and distance-proportional `W / A / S / D / Q / E / Shift` galactic flight.

### 2. Timeless Evergreen Astrophysics (Zero External Live-Feed Decay)
- **4-Band Multi-Wavelength Galactic Observation (`OPT` | `IR` | `HI` | `X/γ`)**: Real-time shader blending across Optical (Gaia DR3 · `380–750 nm`), Infrared (2MASS/Spitzer · `1.2–24 µm`), Neutral Hydrogen 21 cm Radio (HI4PI · `1.42 GHz`), and X-Ray / Gamma-Ray (Fermi-LAT / eROSITA · `0.5–100 GeV`).
- **3D Volumetric Fermi Bubbles**: Bipolar `±8.5 kpc` gamma-ray / X-ray plasma lobes emerging above and below Sagittarius A\* in high-energy observation mode.
- **Real Total Solar Eclipse Lunar Umbra & Penumbra**: Live `astronomy-engine` Sun–Moon–Earth geometry casting analytical umbral darkening and warm bronze penumbral twilight onto both Earth's surface and cloud layers, with one-click jumps to major eclipses (`2026-08-12`, `2027-08-02`, `2024-04-08`).
- **Speed-of-Light Photon Pulse ($c = 299{,}792{,}458\text{ m/s}$)**: Expanding translucent spherical wavefront and ecliptic reference ring leaving the Sun with real-time light-travel milestones (`Mercury 3.2m`, `Earth 8m 20s`, `Jupiter 43m`, `Saturn 1h 19m`).
- **Real-Time Schwarzschild Gravitational Lensing (Sagittarius A\*)**: 2nd-order Velocity-Verlet null-geodesic raymarching shader ($r_s = 2GM/c^2$ derived from $4.297 \times 10^6 M_\odot$, GRAVITY 2022) with two-pass 3D background lensing capture and exact per-fragment logarithmic `gl_FragDepth`.
- **Orbital Wakes & Gravitational Star Clustering**: Fading historical orbital trails and toggleable category-based gravitational clustering dynamics across the 48+ catalog objects.

### 3. Precision Observatory Instrument Interface
- **Full-Bleed Viewport & Minimal Floating HUD**: Unobstructed `100vw × 100vh` 3D viewport framed by a compact top-left instrument strip, top-right ephemeris clock, and bottom telemetry dock using `IBM Plex Sans` + `IBM Plex Mono` (`tabular-nums`).
- **Keyboard-Driven Command Palette (`/` or `⌘K` / `Ctrl+K`)**: Instant fuzzy jump across all 48+ stars/planets/exoplanets, Local Group galaxies, Sagittarius A\*, Total Solar Eclipses, spectral bands, photon pulse, and Guided Expeditions.
- **Scientific Astrophysics Charts**: Built-in SVG **Hertzsprung–Russell (H-R) Diagram** (Stefan–Boltzmann locus + 10 benchmark stars), **Planck Blackbody Radiation Spectrum** (visible `380–750 nm` band + Wien $\lambda_{\max}$), and **Interior Cross-Section & Logarithmic Radius Comparator**.
- **Interactive Guided Expeditions (`Tours`)**: Three choreographed multi-chapter scientific tours (*Powers of Ten*, *The Multi-Wavelength Milky Way*, and *Gravity, Shadows & Event Horizons*) with automated camera/spectrum/epoch transitions and chapter narration in 5 languages.
- **Telescope Reticle, Cinema Mode (`H`), Deep-Linking & Clean PNG Capture**: Live 3D-projected optical corner-bracket reticle, single-key HUD hide (`H`), shareable `#target=...&band=...&date=...&logd=...` URL coordinates, and one-click HUD-free WebGL2 PNG export.
- **Hardware Auto-Profiler & 5-Language Localization**: Six graphics presets (`Potato`, `Low`, `Medium`, `High`, `RTX 3050–4050`, `Ultra 4K`) with automatic GPU/CPU/RAM detection; defaults to **English (`en`)** with instant switching to `vi`, `ja`, `zh`, and `ko`.

### 4. Drop-In Standalone React Plugin (`/plugin`)
- Self-contained `@milky-way/observatory-plugin` package with zero Next.js runtime dependencies and an imperative `ref` controller (`flyToTarget`, `flyToPreset`, `setWavelengthBand`, `jumpToEclipse`, `triggerPhotonPulse`, `setCinemaMode`, `startTour`, `stopTour`, `captureSnapshot`, `setGraphicsTier`, `setLanguage`). See [`plugin/README.md`](./plugin/README.md).

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `/` or `⌘K` / `Ctrl+K` | Open Command Palette (objects, galaxies, eclipses, spectra, tours) |
| `H` | Toggle Cinema / Telescope Mode (hide/restore all HUD elements) |
| `W` `A` `S` `D` | 6-DOF free-flight horizontal movement |
| `Q` / `E` + `Shift` | Ascend / Descend vertically (`Shift` for `3.2×` boost) |
| `Scroll` / `Drag` | Continuous logarithmic zoom (`1 m → 100 Mpc`) / Orbit & right-drag pan |
| `←` / `→` | Previous / Next chapter during an active Guided Expedition |
| `?` | Open Keyboard Shortcuts reference |

---

## Tech Stack

- **Framework**: Next.js 15 (App Router) · React 19 · TypeScript 5
- **3D & Shaders**: Three.js WebGL2 · Custom GLSL shaders (Schwarzschild geodesic lensing, 4-band multi-wavelength disk, Fermi Bubbles, Earth eclipse umbra/penumbra, photon wavefront) · Logarithmic depth buffer
- **Ephemeris & Catalogs**: `astronomy-engine` (VSOP87 / ELP2000) · Off-main-thread Web Worker binary star tiles (`Float32Array`)
- **Styling & Icons**: Tailwind CSS v4 · `IBM Plex Sans` / `IBM Plex Mono` · Lucide React · Motion
- **Testing & CI/CD**: Node built-in `node:test` (`tsx`) · ESLint 9 · GitHub Actions CI · CodeQL · Dependabot

---

## Quick Start

```bash
# 1. Install dependencies (standardized on npm)
npm install

# 2. (Optional) Regenerate binary star catalog tiles
node scripts/build-star-tiles.mjs

# 3. Start local development server at http://localhost:3000
npm run dev
```

### Verification Scripts

```bash
npm run lint              # ESLint 9 flat-config validation
npm run typecheck         # Next.js route typegen + strict TypeScript check
npm run typecheck:plugin  # Standalone TypeScript check for /plugin
npm run sync:plugin       # Synchronize root source & assets into /plugin
npm test                  # Run all astrophysics, scale, ephemeris, dynamics & tour tests
npm run build             # Build standalone production bundle
```

---

## Scientific Data Provenance

All physical constants are defined in [`lib/constants.ts`](./lib/constants.ts) with peer-reviewed citations, and every procedural or parametric layer is explicitly tagged `illustrative: true` and surfaced in the HUD:

| Layer / Dataset | Source Citation | Provenance |
| :--- | :--- | :--- |
| Physical & IAU Constants | CODATA 2018 · IAU 2012 / 2015 | Measured |
| Solar System Ephemeris & Eclipses | `astronomy-engine` (VSOP87 / ELP2000) | Measured |
| Planetary Radii, Axial Tilts & Moons | NASA JPL Planetary Fact Sheets (2024) | Measured |
| Sun–Sgr A\* Distance (`8.178 kpc`) & Mass (`4.297×10⁶ M☉`) | GRAVITY Collaboration (2019, 2022) · EHT (2022) | Measured |
| Nearby Bright & Gaia Stars (`stars-tier0.bin`) | ESA Hipparcos · HYG v3.8 · ESA Gaia DR3 | Measured |
| Local Group & Galaxy Clusters | McConnachie (2012) · NED · 2MRS | Measured positions; procedural morphology |
| Milky Way Disk, Multi-Wavelength & Fermi Bubbles | Reid et al. (2019) · Wegg et al. (2015) · Fermi-LAT / eROSITA | Parametric / Illustrative |

See [`docs/ROADMAP.md`](./docs/ROADMAP.md) and [`public/data/README.md`](./public/data/README.md) for the complete dataset layout and architectural notes.

---

## Repository Governance

| File / Workflow | Description |
| :--- | :--- |
| [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) | Automated lint, typecheck, unit tests, and production build validation |
| [`.github/workflows/codeql.yml`](./.github/workflows/codeql.yml) | Scheduled and PR-triggered CodeQL static security analysis (SAST) |
| [`.github/workflows/release.yml`](./.github/workflows/release.yml) | Quality gate, standalone build packaging, SHA-256 checksums, and GitHub Release publishing |
| [`.github/dependabot.yml`](./.github/dependabot.yml) | Weekly automated security and dependency update PRs |
| [`LICENSE`](./LICENSE) | Open-source **MIT License** |
| [`COPYRIGHT.md`](./COPYRIGHT.md) | Digital Copyright & Intellectual Property Notice |
| [`NOTICE`](./NOTICE) | Third-party open-source software & astronomical dataset attributions |
| [`AUTHORS.md`](./AUTHORS.md) | Project authors & core maintainers |
| [`SECURITY.md`](./SECURITY.md) | Coordinated vulnerability disclosure policy |
| [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) | Contributor Covenant v2.1 |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Contribution guidelines, branching workflow & commit conventions |
| [`CHANGELOG.md`](./CHANGELOG.md) | Keep a Changelog structured release history |

---

## Authors & License

Copyright © 2026 **DanGuangLT** (`phatmcpack@gmail.com`) & **LienThuan04** (`lienthuan2004@gmail.com`).

Co-created and maintained by **DanGuangLT** and **LienThuan04**, released under the [MIT License](./LICENSE).
