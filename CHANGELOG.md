# Changelog

All notable changes to **Milky Way Observatory** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Phase 3 — Interactive Guided Expeditions, Shareable Coordinates & PNG Capture**:
  - Added three timeless multi-chapter scientific guided tours (*Powers of Ten — Earth to Local Group*, *The Multi-Wavelength Milky Way*, and *Gravity, Shadows & Event Horizons*) in `lib/guided-tours.ts` with 5-language narration, automated camera/wavelength/eclipse/photon choreography, segmented chapter controls (`GuidedTourBar`), keyboard `←/→` stepping, and Command Palette integration.
  - Added one-click **Share View** deep-link serialization (`#target=...&band=...&date=...&logd=...`) and zero-overhead HUD-free WebGL2 **PNG Snapshot** export (`captureSnapshot()`).
  - Added a precision **Keyboard Shortcuts (`?`)** reference modal (`KeyboardShortcutsModal`).
- **Phase 2 — Timeless Multi-Wavelength Astrophysics, Real Solar Eclipses & Speed-of-Light Pulse**:
  - Added real-time 4-band electromagnetic observation switching (`OPT` | `IR` | `HI` | `X/γ`) across the Milky Way disk and starfield shaders, plus 3D volumetric bipolar **Fermi Bubbles** (`±8.5 kpc`) above and below Sagittarius A\*.
  - Added analytical 3D lunar umbra and penumbra shadow projection onto Earth's surface and cloud layers driven by live `astronomy-engine` Sun–Moon–Earth geometry, with quick-jump presets for major Total Solar Eclipses (`2026-08-12`, `2027-08-02`, `2024-04-08`).
  - Added the expanding **Speed-of-Light Photon Pulse** ($c = 299{,}792{,}458\text{ m/s}$) spherical wavefront with live light-travel milestones.
- **Phase 1 — Precision Aerospace Observatory Interface**:
  - Replaced permanent top bar and sidebar chrome with a full-bleed `100vw × 100vh` 3D viewport, compact floating top-left instrument strip, and precision matte `#0a0c10` / `#ECEAE4` / optical amber `#E88B38` palette using `IBM Plex Sans` + `IBM Plex Mono` (`tabular-nums`).
  - Added the keyboard-driven **Command Palette** (`/` or `⌘K` / `Ctrl+K`), **Cinema / Telescope Mode (`H`)**, live 3D-projected **Telescope Targeting Reticle**, URL hash deep-linking, and scientific SVG **Hertzsprung–Russell (H-R) Diagram**, **Planck Blackbody Spectrum**, and **Interior Cross-Section** charts in the Inspector drawer.
- **Orbital Wakes, Gravitational Star Clustering & Staged Boot Screen**:
  - Added fading orbital trajectory trails, toggleable category-based gravitational clustering (`lib/memory-dynamics.ts`), and a non-blocking staged WebGL2 initialization overlay (`ObservatoryBootOverlay`).
- **Standalone React Plugin (`/plugin`)**:
  - Synchronized `@milky-way/observatory-plugin` with full Phase 1–3 parity (`setWavelengthBand`, `jumpToEclipse`, `triggerPhotonPulse`, `setCinemaMode`, `startTour`, `stopTour`, `captureSnapshot`).
- **RTX 3050–4050 (4–8 GB VRAM) Graphics Preset (`rtx`)** and **NASA/JPL-Caltech Milky Way Spiral Rebuild**.
- Full GitHub Actions CI/CD suite (`.github/workflows/ci.yml`, `codeql.yml`, `release.yml`) and complete open-source governance documentation (`LICENSE`, `COPYRIGHT.md`, `NOTICE`, `AUTHORS.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`).

### Changed
- **Default Language Standardized to English (`en`)**: Standardized the application, standalone plugin, 404 page, API defaults, and all Markdown documentation to standard English while retaining full 5-language switching (`en`, `vi`, `ja`, `zh`, `ko`).

### Fixed
- **European/Dot Thousands Temperature Parsing**: Normalized dot-separated Kelvin strings (e.g., `12.100 K`, `5.778 K`) in `parseSurfaceTemperatureK` so every catalog star plots accurately on the H-R Diagram and Planck curve.
- **Catalog 3D Inspection & Close-Up Framing**: Resolved 3D inspection routing for all 48+ stars, planets, dwarf planets, and exoplanets (including Rigel and supergiant stars) so every object renders with calibrated close-up framing.
- **Production Build Timeout (`HTTP 0`)**: Excluded non-runtime dev/build/compiler/sourcemap trees in `next.config.ts` while keeping `output: 'standalone'` intact.

## [1.1.0] - 2026-11-19

### Added
- **Real-Time Schwarzschild Gravitational Lensing**: 2nd-order Velocity-Verlet null-geodesic raymarching around Sagittarius A\* with two-pass 3D background capture, bending Milky Way spiral arms, stars, and distant objects into dynamic Einstein arcs as the viewing angle changes.
- Exact per-fragment logarithmic `gl_FragDepth` output preserving pixel-accurate occlusion when foreground planets stand between the camera and Sagittarius A\*.
- Unit tests covering Schwarzschild shadow radius, monotonic gravitational deflection, outer lensing blend taper, and foreground/background occlusion planes.

### Fixed
- Eliminated the circular hole inside Sagittarius A\*'s Event Horizon shadow by decoupling orbit-ring depth masking to render after the volumetric black hole pass.
- Eliminated polar arch stair-stepping and moire artifacts using Interleaved Gradient Noise ray jitter, adaptive near-disk stepping, and Nyquist band-limited accretion striations.
- Prevented edge-on white additive nebula blowout near accretion disk tips by clearing inner galactic bar dust/star density around the core.
- Resolved React 19 hydration mismatches caused by browser-injected form attributes via `suppressHydrationWarning` and `autoComplete="off"`.

## [1.0.0] - 2026-11-18

### Added
- **NASA & ESA Gaia DR3 1:1 Milky Way Simulation** active by default without requiring environment variables.
- True 1:1 astronomical physical scaling between Sagittarius A\*, stars, Solar System planets, dwarf planets, asteroid/Kuiper belts, nebulae, and galactic arms.
- **6-DOF WASD Galactic Flight** (`W/A/S/D`, `Q/E`, `Shift` boost) plus unlimited smooth orbital zoom for inspecting planetary surfaces and galactic scale.
- **Hardware Auto-Profiler & Graphics Settings Modal** detecting GPU/WebGL2/CPU/RAM to automatically recommend optimal resolution scale and visual fidelity presets.
