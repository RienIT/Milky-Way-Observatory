# Changelog

All notable changes to **Milky Way 1:1 Observatory — NASA & Gaia DR3 Galactic Atlas** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Full GitHub Actions CI/CD suite (`.github/workflows/ci.yml`, `codeql.yml`, `release.yml`) with lint, typecheck, unit test, production build, SAST, and automated release packaging.
- Complete repository legal and open-source governance documentation: `LICENSE` (MIT), `COPYRIGHT.md`, `NOTICE`, `AUTHORS.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `README.md`, `CODEOWNERS`, Dependabot configuration, and structured Issue/PR templates.

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
