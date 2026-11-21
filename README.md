# Milky Way Observatory — Multi-Scale Universe Viewer

[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](./.github/workflows/ci.yml)
[![CodeQL](https://img.shields.io/badge/Security-CodeQL-2ea44f?logo=github&logoColor=white)](./.github/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![Three.js WebGL2](https://img.shields.io/badge/Three.js-WebGL2%20GLSL-049EF4?logo=threedotjs)](https://threejs.org)

An interactive, continuous **multi-scale universe viewer** modeled after **NASA / JPL**, **ESA Gaia DR3**, **GRAVITY Collaboration**, and **McConnachie / NED** astronomical datasets. Smoothly zoom continuously across **23+ orders of magnitude** — from **< 1 km above Earth's surface** → **Moon** → **Solar System** → **Nearby Stars** → **Milky Way** → **Sagittarius A\*** → **Local Group** → **Virgo & Coma Galaxy Clusters** — with float64 camera-relative precision, real ephemerides, and transparent data provenance.

---

## Key Features

- **Continuous Multi-Scale Precision Architecture (`1 m` to `10^26 m`)**:
  - **Float64 SI Meters & Hierarchical Floating Origin**: All celestial positions are computed in IEEE-754 float64 meters relative to dynamic precision anchors (`earth`, `heliocentric`, `galactic`), subtracting camera position on CPU (`objAbs - camAbs`) before casting to GPU float32 — eliminating vertex jitter even at 600 m altitude above Earth while 8.178 kpc from Sagittarius A\*.
  - **4-Pass Depth-Cleared Scale Hierarchy**: Independent scale layers (`planetary`, `stellar`, `galactic`, `extragalactic`) with dynamic per-layer near/far clip planes, logarithmic depth buffer, and smooth crossfades.
  - **Logarithmic Zoom & Log-Space Fly-To**: Mouse wheel, pinch gestures, zoom slider, and 6 scale presets traverse decades smoothly.
- **Real-Time Solar System Ephemerides & Earth Fidelity**:
  - Live heliocentric/geocentric coordinates for the **Sun**, **8 planets**, **Moon** (with real illumination phase), and **Pluto** via `astronomy-engine` (VSOP87 / ELP2000), plus NASA JPL Keplerian elements for **Ceres** and 7 major moons (Io, Europa, Ganymede, Callisto, Titan, Enceladus, Triton).
  - Exact IAU Hipparcos J2000 Equatorial → Galactic transformation (`~60.19°` ecliptic–galactic tilt) placing the Solar System at **8.178 kpc** from Sagittarius A\* (GRAVITY 2019/2022).
  - High-detail Earth with continents, bathymetry, solar specular glint, twilight terminator, night-side city lights, animated cloud layer, and Rayleigh atmospheric scattering.
  - Full simulation time controls: play/pause, speed presets (`1x`, `1h/s`, `1d/s`, `1mo/s`, `1yr/s`), and **Reset to Now**.
- **Measured Nearby Stars, Parametric Milky Way & Local Group / Clusters**:
  - Compact binary star tiles (`public/data/stars-tier0.bin` & `stars-tier1.bin`) decoded off-main-thread in a Web Worker (`public/workers/star-tile-worker.js`) combining measured Hipparcos/HYG/Gaia DR3 stars (`illustrative: false`) with Gaia-calibrated local neighborhood fill (`illustrative: true`).
  - Double-sided parametric Milky Way barred spiral disk modeled after the **NASA/JPL-Caltech (R. Hurt)** galactic visualization (Wegg et al. 2015 27° creamy-gold central bar, Reid et al. 2019 4 counter-clockwise spiral arms + Orion Spur, dark reddish-brown inner dust lanes, ruby-pink H-II star-forming knots, and smooth exponential outer halo fade, flagged `illustrative: true`).
  - Real Local Group galaxies (**M31 Andromeda**, **M33**, **LMC**, **SMC**, **M32**, **M110**, **NGC 6822**, **IC 1613**, **Leo I**, **Fornax**, **Sculptor**, **Draco**) and nearby galaxies & clusters (**M81**, **Centaurus A**, **Virgo / M87**, **Fornax**, **Perseus**, **Coma**).
- **Preserved Sagittarius A\* Relativistic Gravitational Lensing**:
  - Identical 2nd-order **Velocity-Verlet** Schwarzschild null-geodesic raymarching shader (`r_s = 2GM/c^2` derived from `4.297e6 M_sun`, GRAVITY 2022) with two-pass live 3D background lensing capture and distance-based core-glow LOD.
- **Hardware Auto-Profiler & RTX 3050–4050 High-Fidelity Tier**:
  - Six graphics presets (`Potato`, `Low`, `Medium`, `High`, **`RTX 3050–4050 (4–8 GB VRAM)`** with `1.5×` supersampling, 120,000 stars, 16,000 belt asteroids, 96-segment planetary spheres, and 96-step black hole raymarching, and `Ultra 4K`) with automatic GPU/CPU/RAM hardware detection.
- **Data Provenance Transparency, 6-DOF Flight, English Default & 5 Languages**:
  - Live HUD badge clearly distinguishing **Measured Catalog / Ephemeris**, **Parametric / Illustrative**, and **Measured Positions + Procedural Shapes**.
  - Distance-proportional `W / A / S / D / Q / E / Shift` flight controls, right-click drag panning, auto-unit scale bar (`m → km → AU → ly → pc → kpc → Mpc`), decluttered 3D labels, reduced-motion toggle, adaptive FPS quality governor, and full localization defaulting to **English (`en`)** with support for `vi`, `ja`, `zh`, and `ko`.
- **Drop-In Standalone React Plugin (`/plugin`)**:
  - Self-contained `@milky-way/observatory-plugin` package with zero Next.js runtime dependencies and an imperative `ref` controller API (`flyToTarget`, `flyToPreset`, `setGraphicsTier`, `setLanguage`) ready to embed in any Next.js, Vite, or React project. See [`plugin/README.md`](./plugin/README.md).

---

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript 5
- **3D & Shaders**: Three.js (WebGL2, custom GLSL volumetric Schwarzschild lensing & planetary/galactic shaders, logarithmic depth buffer)
- **Astronomy & Ephemeris**: `astronomy-engine` (VSOP87 / ELP2000), Web Worker binary star tile loader
- **Styling & Motion**: Tailwind CSS v4, Lucide React, Motion
- **Testing & CI/CD**: Node built-in `node:test` (`tsx`), ESLint 9 (flat config), GitHub Actions CI/CD, CodeQL, Dependabot

---

## Quick Start

```bash
# 1. Install dependencies (standardized on npm)
npm install

# 2. (Optional) Regenerate binary star catalog tiles from source catalog builder
node scripts/build-star-tiles.mjs

# 3. Start local development server at http://localhost:3000
npm run dev
```

### Verification Scripts

```bash
npm run lint              # ESLint 9 flat config validation
npm run typecheck         # Next.js route typegen + TypeScript strict check (tsc --noEmit)
npm run typecheck:plugin  # Standalone TypeScript check for /plugin
npm run sync:plugin       # Synchronize root source & assets into /plugin
npm test                  # Run all astrophysics, scale-engine, ephemeris & catalog unit tests
npm run build             # Build production bundle
```

---

## Architecture & Data Provenance

All physical constants live in [`lib/constants.ts`](./lib/constants.ts) with peer-reviewed citations (CODATA 2018, IAU 2012/2015, GRAVITY 2019/2022, EHT 2022, Reid et al. 2019, Wegg et al. 2015, NASA JPL 2024). Procedural or parametric layers are explicitly flagged `illustrative: true` and surfaced in the HUD. See [`docs/ROADMAP.md`](./docs/ROADMAP.md) and [`public/data/README.md`](./public/data/README.md) for the complete dataset registry and multi-scale design notes.

---

## CI/CD & Repository Governance

| File / Workflow | Description |
| :--- | :--- |
| [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) | Automated governance check, ESLint, TypeScript (`npm run typecheck`), unit tests (`npm test`) & production build |
| [`.github/workflows/codeql.yml`](./.github/workflows/codeql.yml) | Scheduled & PR-triggered CodeQL Static Application Security Testing (SAST) |
| [`.github/workflows/release.yml`](./.github/workflows/release.yml) | Automated quality gate, production build packaging, SHA-256 checksums & GitHub Release publishing on `v*.*.*` tags |
| [`.github/dependabot.yml`](./.github/dependabot.yml) | Automated weekly security & dependency update PRs for `npm` and GitHub Actions |
| [`.github/CODEOWNERS`](./.github/CODEOWNERS) | Enforces repository code ownership review by `@DanGuangLT` and `@LienThuan04` |
| [`LICENSE`](./LICENSE) | Open-source **MIT License** |
| [`COPYRIGHT.md`](./COPYRIGHT.md) | **Digital Copyright & Intellectual Property Notice** |
| [`NOTICE`](./NOTICE) | Third-party open-source software & astronomical dataset attributions |
| [`AUTHORS.md`](./AUTHORS.md) | Project authors, core maintainers & collaborative development credits |
| [`SECURITY.md`](./SECURITY.md) | Security policy & coordinated vulnerability disclosure instructions |
| [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) | Community Code of Conduct (Contributor Covenant v2.1) |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Contribution guidelines, branching workflow & commit conventions |
| [`CHANGELOG.md`](./CHANGELOG.md) | Structured release history following Keep a Changelog |

---

## Authors & Digital Copyright

Copyright © 2026 **DanGuangLT** (`phatmcpack@gmail.com`) & **LienThuan04** (`lienthuan2004@gmail.com`).

Co-created and owned by **DanGuangLT** and **LienThuan04**, built with AI-assisted software engineering tools, and released under the [MIT License](./LICENSE).
