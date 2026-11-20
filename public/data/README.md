# Pre-Baked Astronomical Data Tiles

This directory contains compact, deterministic binary star tiles and their manifest used by the multi-scale WebGL2 observatory engine.

## Files

| File | Records | Provenance | Description |
| :--- | :---: | :--- | :--- |
| `stars-tier0.bin` | 219 | **Measured** (`illustrative: false`) | Real nearby & bright Hipparcos / HYG v3.8 / ESA Gaia DR3 stars with J2000 RA, Dec, parallax distance (pc), apparent visual magnitude (`V`), and Johnson `B-V` color index. |
| `stars-tier1.bin` | 8,000 | **Illustrative** (`illustrative: true`) | Deterministic Gaia DR3-calibrated statistical solar-neighborhood stellar fill (6–1,600 pc) concentrated along the Galactic thin disk. |
| `stars-manifest.json` | — | Metadata | Tile URLs, byte lengths, field layouts, source citations, and named star index for 3D labels. |

## Binary Record Layout

Every `.bin` tile is little-endian `Float32Array` packed with a stride of **6 floats (24 bytes)** per star:

1. `raDeg` — J2000 Equatorial Right Ascension (degrees)
2. `decDeg` — J2000 Equatorial Declination (degrees)
3. `distPc` — Heliocentric distance (parsecs)
4. `vMag` — Apparent visual magnitude `V`
5. `bvColor` — Johnson `B-V` color index (converted to blackbody RGB in `public/workers/star-tile-worker.js`)
6. `illustrative` — `0.0` for measured catalog stars, `1.0` for statistical illustrative fill

## Regeneration

Run from the repository root:

```bash
node scripts/build-star-tiles.mjs
```

## Sources & Attributions

- **ESA Hipparcos & Tycho Catalogues** (Perryman et al. 1997; van Leeuwen 2007)
- **HYG Database v3.8** (David Nash / AstroNexus, CC BY-SA 4.0)
- **ESA Gaia Data Release 3 (DR3)** (Gaia Collaboration 2022, CC BY-SA 3.0 IGO)
