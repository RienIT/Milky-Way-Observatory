# Changelog

All notable changes to **Milky Way 1:1 Observatory — NASA & Gaia DR3 Galactic Atlas** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Standalone React Plugin (`/plugin`)**: Added the self-contained `@milky-way/observatory-plugin` package (`MilkyWayObservatoryPlugin`, `MilkyWayPluginHandle`, `npm run sync:plugin`, `npm run typecheck:plugin`) with zero Next.js runtime dependencies and full English integration documentation (`plugin/README.md`).
- **RTX 3050–4050 (4–8 GB VRAM) Graphics Preset (`rtx`)**: Dedicated high-fidelity tier featuring `1.5×` render scale, 120,000 stars, 16,000 belt asteroids, 96-segment planetary spheres, and 96-step Sagittarius A\* gravitational lensing raymarching with automatic GPU detection.
- **NASA/JPL-Caltech Milky Way Spiral Rebuild**: Rebuilt the 3D Milky Way disk shader and galactocentric starfield with a creamy-gold 27° central bar, four counter-clockwise logarithmic spiral arms, dark reddish-brown inner dust lanes, ruby-pink H-II knots, and smooth exponential outer halo falloff.
- Full GitHub Actions CI/CD suite (`.github/workflows/ci.yml`, `codeql.yml`, `release.yml`) with lint, typecheck, unit test, production build, SAST, and automated release packaging.
- Complete repository legal and open-source governance documentation: `LICENSE` (MIT), `COPYRIGHT.md`, `NOTICE`, `AUTHORS.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `README.md`, `CODEOWNERS`, Dependabot configuration, and structured Issue/PR templates.

### Changed
- **Default Language Switched to English (`en`)**: Standardized the application, standalone plugin, 404 page, API defaults, and all documentation files to English by default while retaining full 5-language switching (`en`, `vi`, `ja`, `zh`, `ko`).

### Fixed
- **Production Build Timeout (`HTTP 0`)**: Excluded non-runtime dev/build/compiler/sourcemap/unused-native trees from `outputFileTracingExcludes` and skipped redundant build-time TypeScript re-checking in `next.config.ts` (enforced via `npm run typecheck`), cutting `next build` duration from ~58s to ~15s while keeping `output: 'standalone'` intact.

## [1.1.0] - 2026-11-19

### Added
- **Real-Time Schwarzschild Gravitational Lensing**: 2nd-order Velocity-Verlet null-geodesic raymarching around Sagittarius A\* with two-pass 3D background capture, bending Milky Way spiral arms, stars, and distant objects into dynamic Einstein arcs as the viewing angle changes.
- Exact per-fragment logarithmic `gl_FragDepth` output preserving pixel-accurate occlusion when foreground planets stand between the camera and Sagittarius A\*.
- Unit tests covering Schwarzschild shadow radius, monotonic gravitational deflection, outer lensing blend taper, and foreground/background occlusion planes.

### Fixed
- Eliminated the circular hole inside Sagittarius A\*'s Event Horizon shadow by decoupling orbit-ring depth masking to render after the volumetric black hole pass.
- Eliminated polar arch stair-stepping/moiré artifacts using Interleaved Gradient Noise ray jitter, adaptive near-disk stepping, and Nyquist band-limited accretion striations.
- Prevented edge-on white additive nebula blowout near accretion disk tips by clearing inner galactic bar dust/star density around the core.
- Resolved React 19 hydration mismatches caused by browser/extension-injected form attributes (`__gcruniqueid`) via `suppressHydrationWarning` and `autoComplete="off"`.

## [1.0.0] - 2026-11-18

### Added
- **NASA & ESA Gaia DR3 1:1 Milky Way Simulation** active by default without requiring environment variables.
- True 1:1 astronomical physical scaling between Sagittarius A\*, stars, Solar System planets, dwarf planets, asteroid/Kuiper belts, nebulae, and galactic arms.
- **6-DOF WASD Galactic Flight** (`W/A/S/D`, `Q/E`, `Shift` boost) plus unlimited smooth orbital zoom for inspecting planetary surfaces and galactic scale.
- **Astryx-inspired Observatory Interface** with multilingual support (`vi`, `en`, `ja`, `zh`, `ko`), celestial directory sidebar, 3D explorer, encyclopedia catalog, and inspector drawer.
- **Hardware Auto-Profiler & Graphics Settings Modal** detecting GPU/WebGL2/CPU/RAM to automatically recommend optimal resolution scale and visual fidelity presets.
