import * as THREE from 'three';

/**
 * Photorealistic NASA Planetary Surface Texture Manager.
 *
 * Loads high-resolution local equirectangular `.jpg` maps from
 * `${assetBasePath}/textures/planets/*.jpg` (zero external CDN requests,
 * 100% offline & bundled inside `/plugin/public/textures/planets/`).
 *
 * Configures WebGL seam-free spherical wrapping (`RepeatWrapping` on S,
 * `ClampToEdgeWrapping` on T, `generateMipmaps = false`, `NoColorSpace` for
 * direct sRGB handling inside custom `ShaderMaterial`) and supports live
 * `NearestFilter` <-> `LinearFilter` quality toggling when the user switches
 * between Potato and Low–Ultra graphics presets.
 */

export type TexturedSolarBodyId =
  | 'earth'
  | 'mars'
  | 'moon'
  | 'jupiter'
  | 'saturn'
  | 'venus'
  | 'mercury'
  | 'neptune'
  | 'uranus'
  | 'pluto';

export const SOLAR_PLANET_TEXTURE_FILES: Record<
  Exclude<TexturedSolarBodyId, 'earth'>,
  string
> = {
  mars: 'mars.jpg',
  moon: 'moon.jpg',
  jupiter: 'jupiter.jpg',
  saturn: 'saturn.jpg',
  venus: 'venus.jpg',
  mercury: 'mercury.jpg',
  neptune: 'neptune.jpg',
  uranus: 'uranus.jpg',
  pluto: 'pluto.jpg',
};

export interface EarthPhotoTextures {
  dayMap: THREE.Texture | null;
  cloudMap: THREE.Texture | null;
  nightMap: THREE.Texture | null;
}

export interface SolarPlanetTextureManager {
  loadEarthTextures: (callbacks: {
    onDayMap?: (tex: THREE.Texture) => void;
    onCloudMap?: (tex: THREE.Texture) => void;
    onNightMap?: (tex: THREE.Texture) => void;
  }) => void;
  loadPlanetSurface: (
    bodyId: Exclude<TexturedSolarBodyId, 'earth'>,
    onLoaded: (tex: THREE.Texture) => void
  ) => void;
  setQualityNearest: (nearest: boolean) => void;
  getLoadedCount: () => number;
  dispose: () => void;
}

function configureSphericalTexture(
  tex: THREE.Texture,
  nearest: boolean,
  maxAnisotropy: number
): THREE.Texture {
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.generateMipmaps = false;
  tex.minFilter = nearest ? THREE.NearestFilter : THREE.LinearFilter;
  tex.magFilter = nearest ? THREE.NearestFilter : THREE.LinearFilter;
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = nearest ? 1 : Math.min(8, Math.max(1, maxAnisotropy));
  tex.needsUpdate = true;
  return tex;
}

/**
 * Cleans up the MODIS equirectangular cloud image on load:
 *  - Converts RGB brightness into high-contrast cloud luminance with pure black ocean gaps
 *  - Softly attenuates any static Greenland ice-sheet patch near the upper-left polar zone
 *    so the drifting cloud deck reads 100% as floating meteorological clouds.
 */
function processEarthCloudImage(
  img: HTMLImageElement | ImageBitmap,
  nearest: boolean,
  maxAnisotropy: number
): THREE.Texture {
  const width = Math.min(1536, img.width || 1024);
  const height = Math.min(768, img.height || 512);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const raw = new THREE.Texture(img);
    return configureSphericalTexture(raw, nearest, maxAnisotropy);
  }

  ctx.drawImage(img, 0, 0, width, height);
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    for (let y = 0; y < height; y += 1) {
      const v = y / height; // 0 = North Pole, 1 = South Pole
      for (let x = 0; x < width; x += 1) {
        const u = x / width;
        const idx = (y * width + x) * 4;
        const r = data[idx] / 255;
        const g = data[idx + 1] / 255;
        const b = data[idx + 2] / 255;
        let lum = 0.299 * r + 0.587 * g + 0.114 * b;

        // Clean black floor so clear oceans stay crystal-clear
        lum = Math.max(0, (lum - 0.08) / 0.92);

        // Softly feather any static solid polar landmass glow over Greenland (top-left Arctic)
        // u in [0.27, 0.44], v in [0.03, 0.21]
        if (v < 0.23 && u > 0.25 && u < 0.46) {
          const du = (u - 0.355) / 0.095;
          const dv = (v - 0.11) / 0.095;
          const dist2 = du * du + dv * dv;
          if (dist2 < 1.35) {
            const falloff = Math.max(0, 1 - dist2 / 1.35);
            const wisp =
              0.5 +
              0.5 * Math.sin(u * 62.0 + v * 38.0) * Math.cos(u * 29.0 - v * 51.0);
            // Break up solid >0.72 Greenland ice polygon into wispy Arctic cloud streaks
            if (lum > 0.55) {
              lum = lum * (1 - falloff * 0.72) + lum * wisp * falloff * 0.42;
            }
          }
        }

        const out = Math.max(0, Math.min(255, Math.round(lum * 255)));
        data[idx] = out;
        data[idx + 1] = out;
        data[idx + 2] = out;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  } catch {
    // Keep drawn canvas if getImageData fails in restricted context
  }

  const tex = new THREE.CanvasTexture(canvas);
  return configureSphericalTexture(tex, nearest, maxAnisotropy);
}

export function createSolarPlanetTextureManager(
  assetBasePath: string,
  maxAnisotropy = 4,
  onAnyLoaded?: () => void
): SolarPlanetTextureManager {
  const base = assetBasePath.replace(/\/+$/, '');
  const textureRoot = `${base}/textures/planets`;
  const loader = new THREE.TextureLoader();
  const ownedTextures = new Set<THREE.Texture>();
  let disposed = false;
  let currentNearest = false;
  let loadedCount = 0;

  const registerTexture = (tex: THREE.Texture) => {
    ownedTextures.add(tex);
    loadedCount += 1;
    onAnyLoaded?.();
  };

  const loadStandardMap = (
    filename: string,
    onLoaded: (tex: THREE.Texture) => void
  ) => {
    if (disposed) return;
    loader.load(
      `${textureRoot}/${filename}`,
      (tex) => {
        if (disposed) {
          tex.dispose();
          return;
        }
        configureSphericalTexture(tex, currentNearest, maxAnisotropy);
        registerTexture(tex);
        onLoaded(tex);
      },
      undefined,
      () => {
        // Keep seamless procedural fallback if asset fails to load
      }
    );
  };

  return {
    loadEarthTextures(callbacks) {
      if (callbacks.onDayMap) {
        loadStandardMap('earth_day.jpg', callbacks.onDayMap);
      }
      if (callbacks.onNightMap) {
        loadStandardMap('earth_night.jpg', callbacks.onNightMap);
      }
      if (callbacks.onCloudMap && typeof document !== 'undefined') {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (disposed) return;
          const processed = processEarthCloudImage(
            img,
            currentNearest,
            maxAnisotropy
          );
          registerTexture(processed);
          callbacks.onCloudMap?.(processed);
        };
        img.src = `${textureRoot}/earth_clouds.jpg`;
      }
    },

    loadPlanetSurface(bodyId, onLoaded) {
      const file = SOLAR_PLANET_TEXTURE_FILES[bodyId];
      if (!file) return;
      loadStandardMap(file, onLoaded);
    },

    setQualityNearest(nearest: boolean) {
      if (currentNearest === nearest) return;
      currentNearest = nearest;
      for (const tex of ownedTextures) {
        tex.minFilter = nearest ? THREE.NearestFilter : THREE.LinearFilter;
        tex.magFilter = nearest ? THREE.NearestFilter : THREE.LinearFilter;
        tex.anisotropy = nearest ? 1 : Math.min(8, Math.max(1, maxAnisotropy));
        tex.needsUpdate = true;
      }
    },

    getLoadedCount() {
      return loadedCount;
    },

    dispose() {
      disposed = true;
      for (const tex of ownedTextures) {
        try {
          tex.dispose();
        } catch {
          // ignore
        }
      }
      ownedTextures.clear();
    },
  };
}
