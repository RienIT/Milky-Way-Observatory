# Milky Way 1:1 Observatory — NASA & Gaia DR3 Galactic Atlas

[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](./.github/workflows/ci.yml)
[![CodeQL](https://img.shields.io/badge/Security-CodeQL-2ea44f?logo=github&logoColor=white)](./.github/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![Three.js WebGL2](https://img.shields.io/badge/Three.js-WebGL2%20GLSL-049EF4?logo=threedotjs)](https://threejs.org)

An interactive 3D simulation of the **Milky Way Galaxy** modeled after published **NASA / JPL** and **ESA Gaia DR3** datasets at true **1:1 physical proportions**, featuring the supermassive black hole **Sagittarius A\*** with real-time general-relativistic **gravitational lensing**, 6-DOF **WASD** galactic flight controls, an **Astryx**-inspired observatory interface, and automatic hardware detection with recommended graphics presets.

---

## Key Features

- **Zero-Config Default NASA Milky Way Simulation**: Runs completely out of the box with no environment variables required.
- **Real-Time Schwarzschild Gravitational Lensing**:
  - 2nd-order **Velocity-Verlet** null-geodesic raymarching around **Sagittarius A\***'s event horizon ($r_s$), photon sphere, and Einstein ring.
  - Two-pass live 3D background capture dynamically bends Milky Way spiral arms, stars, nebulae, and distant celestial bodies around the accretion disk as the camera viewing angle changes.
  - Exact per-fragment logarithmic depth (`gl_FragDepth`) preserves pixel-accurate occlusion so foreground planets standing between the observer and Sagittarius A\* cleanly occlude both the black hole and its lensing halo.
- **True 1:1 Physical Scaling & Unlimited Zoom**:
  - Authentic physical size hierarchy across Sagittarius A\*, stars, Solar System planets on the Orion Spur, dwarf planets, asteroid belts, Kuiper Belt, nebulae, and galactic spiral arms.
  - Smooth unlimited zoom from the 100,000-light-year galactic overview down to close-up planetary surfaces.
- **6-DOF WASD Galactic Navigation**:
  - `W / A / S / D`: Fly forward, backward, and strafe laterally relative to camera orientation.
  - `Q / E`: Ascend and descend vertically.
  - `Shift`: 3.2x boost thrusters for rapid interstellar traversal.
  - Left-drag to orbit, right-drag to pan, scroll wheel to zoom.
- **Auto Hardware Profiler & Custom Graphics Settings**:
  - Automatically inspects WebGL2 GPU renderer capabilities, CPU core count, device memory, and pixel ratio to recommend optimal settings for low-end to high-end machines, while exposing manual resolution scaling (`0.5x – 2.0x`), star density, and shader quality controls.
- **Multilingual Observatory Interface**: Full support for English (`en`), Vietnamese (`vi`), Japanese (`ja`), Chinese (`zh`), and Korean (`ko`).

---

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript 5
- **3D & Shaders**: Three.js (WebGL2, custom GLSL volumetric raymarching & lensing shaders, logarithmic depth buffer)
- **Styling & Motion**: Tailwind CSS v4, Lucide React, Motion
- **Testing & CI/CD**: Node built-in `node:test` (`tsx`), ESLint 9, GitHub Actions CI/CD, CodeQL, Dependabot

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Copy environment template if enabling server-side AI summarization
cp .env.example .env.local

# 3. Start local development server at http://localhost:3000
npm run dev
```

### Scripts & Verification

```bash
npm run lint                                    # Run ESLint
npx next typegen && npx tsc --noEmit            # Generate Next.js route types & typecheck
npx --yes tsx --test lib/memory-logic.test.ts   # Run 11 astrophysics & physics unit tests
npm run build                                   # Build production bundle
```

---

## CI/CD & Repository Governance

| File / Workflow | Description |
| :--- | :--- |
| [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) | Automated governance check, ESLint, TypeScript, unit tests & production build on every Push / PR |
| [`.github/workflows/codeql.yml`](./.github/workflows/codeql.yml) | Scheduled & PR-triggered CodeQL Static Application Security Testing (SAST) |
| [`.github/workflows/release.yml`](./.github/workflows/release.yml) | Automated quality gate, production build packaging, SHA-256 checksums & GitHub Release publishing on `v*.*.*` tags |
| [`.github/dependabot.yml`](./.github/dependabot.yml) | Automated weekly security & dependency update PRs for `npm` and GitHub Actions |
| [`.github/CODEOWNERS`](./.github/CODEOWNERS) | Enforces repository code ownership review by `@DanGuangLT` and `@LienThuan04` |
| [`LICENSE`](./LICENSE) | Open-source **MIT License** |
| [`COPYRIGHT.md`](./COPYRIGHT.md) | **Digital Copyright & Intellectual Property Notice** |
| [`NOTICE`](./NOTICE) | Third-party open-source software & NASA / ESA Gaia DR3 scientific data attributions |
| [`AUTHORS.md`](./AUTHORS.md) | Project authors, core maintainers & collaborative development credits |
| [`SECURITY.md`](./SECURITY.md) | Security policy & coordinated vulnerability disclosure instructions |
| [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) | Community Code of Conduct (Contributor Covenant v2.1) |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Contribution guidelines, branching workflow & commit conventions |
| [`CHANGELOG.md`](./CHANGELOG.md) | Structured release history following Keep a Changelog |

---

## Authors & Digital Copyright

Copyright © 2026 **DanGuangLT** (`phatmcpack@gmail.com`) & **LienThuan04** (`lienthuan2004@gmail.com`).

Co-created and owned by **DanGuangLT** and **LienThuan04**, built with AI-assisted software engineering tools, and released under the [MIT License](./LICENSE).
