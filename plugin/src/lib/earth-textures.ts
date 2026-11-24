import * as THREE from 'three';

/**
 * Photorealistic NASA Blue Marble Earth Procedural Texture Suite.
 *
 * 100% self-contained (zero external image/CDN 404s, works offline and inside the
 * standalone zero-config `/plugin` package). Generates four aligned equirectangular
 * textures for Three.js `SphereGeometry`:
 *  1. `dayMap`   (sRGB)   — Real geographic continents, biomes, bathymetry & alpine snow
 *  2. `dataMap`  (Linear) — R: height/relief, G: land mask (0=water,1=land), B: ice mask
 *  3. `nightMap` (sRGB)   — Authentic global metropolitan city-light corridors
 *  4. `cloudMap` (Linear) — Swirling baroclinic cyclones, ITCZ bands & cirrus wisps
 */

export interface EarthTextureBundle {
  dayMap: THREE.CanvasTexture;
  dataMap: THREE.CanvasTexture;
  nightMap: THREE.CanvasTexture;
  cloudMap: THREE.CanvasTexture;
}

// ============================================================================
// Deterministic Seamless 2D Tileable Noise (Wraps cleanly across ±180° lon)
// ============================================================================

function hash2(ix: number, iy: number, periodX: number): number {
  const wx = ((ix % periodX) + periodX) % periodX;
  let n = (wx * 374761393 + iy * 668265263) | 0;
  n = (n ^ (n >>> 13)) * 1274126177;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

function tileableValueNoise(x: number, y: number, periodX: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  const a = hash2(ix, iy, periodX);
  const b = hash2(ix + 1, iy, periodX);
  const c = hash2(ix, iy + 1, periodX);
  const d = hash2(ix + 1, iy + 1, periodX);

  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function tileableFbm(
  u: number,
  v: number,
  basePeriodX: number,
  octaves = 4
): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let o = 0; o < octaves; o += 1) {
    const px = Math.max(2, Math.round(basePeriodX * freq));
    sum += amp * tileableValueNoise(u * px, v * (px * 0.5), px);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}

// ============================================================================
// High-Accuracy Simplified World Continent Polygons ([lonDeg, latDeg])
// ============================================================================

const CONTINENT_POLYGONS: readonly (readonly [number, number][])[] = [
  // North America + Central America
  [
    [-168, 66], [-162, 70], [-141, 70], [-126, 70], [-110, 68], [-94, 68],
    [-82, 63], [-86, 56], [-78, 53], [-76, 61], [-65, 60], [-56, 52],
    [-60, 46], [-66, 44], [-71, 41], [-75, 36], [-81, 31], [-80, 25],
    [-82, 26], [-84, 30], [-90, 29], [-97, 26], [-96, 19], [-90, 21],
    [-87, 21], [-88, 16], [-83, 15], [-83, 10], [-78, 8], [-80, 7],
    [-85, 10], [-92, 14], [-104, 19], [-109, 25], [-113, 31], [-110, 23],
    [-115, 29], [-118, 34], [-124, 41], [-124, 49], [-131, 54], [-139, 59],
    [-151, 60], [-161, 56], [-166, 60], [-165, 64],
  ],
  // Greenland
  [
    [-52, 60], [-42, 60], [-36, 65], [-21, 70], [-18, 76], [-24, 81],
    [-40, 83], [-58, 81], [-70, 77], [-56, 73], [-52, 66],
  ],
  // Baffin & Canadian Arctic Islands
  [
    [-82, 72], [-70, 72], [-63, 66], [-72, 63], [-78, 66], [-84, 70],
  ],
  [
    [-118, 74], [-103, 74], [-100, 69], [-114, 69],
  ],
  // Cuba & Hispaniola
  [[-85, 22], [-80, 23], [-74, 20], [-77, 19], [-83, 21]],
  [[-74, 19], [-68, 18.5], [-69, 18], [-74, 18]],
  // Iceland
  [[-24, 65.5], [-14, 66], [-14, 63.8], [-23, 63.8]],
  // South America
  [
    [-78, 9], [-72, 12], [-62, 10], [-52, 5], [-49, 0], [-41, -3],
    [-35, -6], [-38, -14], [-41, -22], [-48, -26], [-53, -34], [-58, -38],
    [-65, -42], [-68, -50], [-66, -54], [-71, -55], [-75, -48], [-73, -38],
    [-71, -28], [-70, -18], [-77, -12], [-81, -5], [-79, 2],
  ],
  // Eurasia (Europe + Arabia + Asia + SE Asia)
  [
    [-9, 37], [-9, 43], [-2, 43], [-5, 48], [2, 51], [8, 54], [10, 57],
    [14, 54], [21, 55], [24, 60], [20, 60], [18, 64], [11, 59], [5, 60],
    [12, 66], [20, 70], [31, 70], [42, 67], [58, 69], [72, 73], [88, 74],
    [104, 77], [124, 73], [142, 72], [164, 70], [178, 66], [168, 61],
    [162, 57], [157, 51], [156, 56], [143, 59], [137, 54], [141, 51],
    [135, 44], [129, 40], [129, 35], [126, 35], [125, 39], [121, 40],
    [118, 38], [122, 37], [120, 34], [122, 30], [119, 25], [114, 22],
    [108, 21.5], [106, 20.5], [109, 14], [109, 11], [105, 8.6], [103, 10.5],
    [100, 13.5], [100, 8], [104, 1.3], [101, 2.5], [98, 9], [97, 16],
    [94, 16], [92, 22], [88, 22], [84, 18], [80, 13], [77.5, 8], [74, 15],
    [72.5, 21], [68, 23], [61, 25], [56, 27], [50, 29.5], [51, 25],
    [59, 22], [53, 16], [44, 12.6], [42, 16], [38, 22], [35, 29.5],
    [32.5, 31], [35.5, 34], [36, 36.8], [27, 36.8], [26, 40.5], [24, 38],
    [20, 39], [18, 42], [14, 45.5], [12.5, 44], [16, 41], [18, 40],
    [15.5, 38], [12, 42], [8, 44], [3, 43], [0, 39], [-5.5, 36],
  ],
  // Great Britain & Ireland
  [[-5.5, 50], [1.5, 51.3], [1.6, 52.8], [-1.5, 55.5], [-3, 58.5], [-5.5, 58], [-5, 54], [-4.5, 51.5]],
  [[-10, 51.8], [-6, 52.2], [-6, 55.2], [-9.5, 54.8]],
  // Sri Lanka
  [[79.8, 9.6], [81.8, 7.6], [80.7, 6.0], [79.8, 7.2]],
  // Africa
  [
    [-6, 35.8], [3, 36.8], [11, 37], [11, 33], [19, 32], [25, 31.5],
    [32.5, 31.2], [35, 25], [38, 19], [43.3, 12.2], [51, 11.8], [48, 5],
    [41, -2], [39.5, -10], [40.5, -15], [35, -20], [33, -26], [28, -33],
    [20, -34.8], [18, -33], [14.5, -22], [12, -16], [13, -8], [9, -2],
    [9.5, 4], [4, 5], [-4, 5], [-9, 4.5], [-13, 8], [-17.4, 14.7],
    [-16, 21], [-13, 27.5], [-9.5, 31],
  ],
  // Madagascar
  [[49.2, -12], [50.4, -15.5], [47, -25], [44, -25], [44, -20], [46.5, -15.5]],
  // Japan (Honshu + Hokkaido + Kyushu)
  [[130.5, 31.2], [132, 33], [136, 34.5], [140.5, 35.5], [142, 40], [140, 41.2], [138.5, 37.5], [135, 35.6], [131, 34]],
  [[140.5, 42], [145.5, 43.3], [144, 44.5], [141.5, 45.4], [140, 43]],
  // Taiwan & Philippines
  [[120.2, 22], [121.9, 25.1], [121.5, 22.8]],
  [[120, 18.4], [122.4, 18], [124, 13], [126.2, 7.2], [123, 6.5], [121, 13.5]],
  // Indonesia: Sumatra, Java, Borneo, Sulawesi, New Guinea
  [[95.3, 5.5], [99, 3], [105.6, -5.8], [103.5, -5.2], [97, 1.5]],
  [[105.5, -6.2], [114.4, -7.8], [114, -8.7], [106, -7.2]],
  [[109, 1.5], [117, 6.8], [118.8, 1.2], [116.5, -3.5], [111, -3.2]],
  [[119, 1], [125, 1.5], [122.5, -4.5], [119.5, -5.3]],
  [[131, -1.5], [141, -2.5], [150.5, -10.2], [146, -9], [138, -8], [133, -4]],
  // Australia & Tasmania
  [
    [114, -22], [122, -18], [129, -14.5], [136, -12], [137, -15.5],
    [141, -16], [142.5, -10.8], [146, -18], [153.5, -26], [153, -31],
    [150, -37.5], [144, -38.5], [137, -35.5], [131, -31.5], [123, -34],
    [115, -34.2], [114, -27],
  ],
  [[144.8, -40.8], [148.3, -41.2], [147, -43.5], [145.3, -42.5]],
  // New Zealand
  [[173, -34.6], [178.5, -37.7], [175.3, -41.5], [173.8, -39]],
  [[173, -41.2], [171, -44.5], [167, -46.5], [166.6, -45], [171.2, -41.5]],
  // Antarctica
  [
    [-180, -72], [-150, -76], [-125, -73], [-95, -73], [-70, -72],
    [-60, -64], [-56, -65], [-61, -74], [-40, -78], [-15, -72],
    [10, -70], [45, -67], [75, -69], [110, -66.5], [145, -67],
    [170, -71], [165, -78], [180, -78], [180, -90], [-180, -90],
  ],
];

// Real-world major metropolitan hubs ([lon, lat, radiusDeg, intensity])
const CITY_HUBS: readonly [number, number, number, number][] = [
  // North America
  [-74.0, 40.7, 5.2, 1.0],   // NYC / Boston / DC corridor
  [-87.6, 41.9, 4.8, 0.85],  // Chicago / Great Lakes
  [-96.8, 32.8, 4.2, 0.72],  // Texas triangle
  [-81.5, 28.0, 3.2, 0.78],  // Florida
  [-118.2, 34.0, 4.0, 0.92], // Southern California
  [-122.3, 37.8, 3.2, 0.80], // Bay Area
  [-122.3, 47.6, 2.5, 0.62], // Seattle / Vancouver
  [-99.1, 19.4, 3.8, 0.82],  // Mexico City
  // South America
  [-46.6, -23.5, 4.2, 0.88], // Sao Paulo / Rio
  [-58.4, -34.6, 3.4, 0.78], // Buenos Aires
  [-70.6, -33.4, 2.4, 0.60], // Santiago
  [-74.1, 4.6, 2.8, 0.58],   // Bogota / Caracas
  [-77.0, -12.0, 2.2, 0.52], // Lima
  // Europe
  [-0.1, 51.5, 4.0, 0.95],   // London / UK
  [4.5, 50.8, 4.8, 1.0],     // Benelux / Paris / Ruhr
  [10.5, 45.2, 4.5, 0.92],   // Northern Italy / Alps
  [-3.7, 40.4, 4.0, 0.80],   // Spain / Portugal
  [15.0, 51.5, 4.8, 0.82],   // Central Europe / Poland
  [29.0, 41.0, 3.8, 0.78],   // Istanbul / Greece
  [37.6, 55.8, 4.5, 0.85],   // Moscow
  [18.1, 59.3, 3.0, 0.65],   // Scandinavia
  // Africa & Middle East
  [31.2, 30.0, 3.2, 0.95],   // Cairo & Nile Delta
  [31.5, 26.5, 2.0, 0.65],   // Nile Valley
  [3.4, 6.5, 3.2, 0.62],     // Lagos / Gulf of Guinea
  [28.0, -26.2, 3.0, 0.72],  // Johannesburg
  [-6.8, 33.8, 3.2, 0.65],   // Morocco / Algiers
  [46.7, 24.7, 3.8, 0.75],   // Riyadh / Gulf
  [55.3, 25.2, 3.0, 0.85],   // Dubai / Persian Gulf
  [51.4, 35.7, 3.5, 0.70],   // Tehran
  // South & East Asia
  [77.2, 28.6, 5.8, 0.96],   // Northern India / Ganges Plain
  [72.8, 19.1, 4.5, 0.86],   // Mumbai / West India
  [78.5, 13.0, 4.2, 0.78],   // South India
  [88.4, 22.6, 4.0, 0.82],   // Kolkata / Dhaka
  [116.4, 39.9, 5.5, 0.96],  // Beijing / Tianjin
  [121.5, 31.2, 5.5, 1.0],   // Shanghai / Yangtze Delta
  [113.3, 23.1, 4.6, 0.95],  // Pearl River Delta / Hong Kong
  [127.0, 37.5, 3.4, 0.94],  // Seoul / Korea
  [139.7, 35.7, 4.0, 1.0],   // Tokyo / Osaka corridor
  [121.5, 24.5, 2.2, 0.82],  // Taiwan
  // Southeast Asia & Oceania
  [105.8, 21.0, 2.8, 0.78],  // Hanoi / Red River Delta
  [106.7, 10.8, 2.8, 0.80],  // Ho Chi Minh City / Mekong
  [100.5, 13.8, 3.0, 0.78],  // Bangkok
  [103.8, 1.3, 2.6, 0.82],   // Singapore / Kuala Lumpur
  [107.6, -6.9, 3.6, 0.80],  // Java / Jakarta
  [121.0, 14.6, 2.5, 0.74],  // Manila
  [151.2, -33.9, 2.8, 0.76], // Sydney / Melbourne
];

// Desert & Mountain geographic centers ([lon, lat, radiusLon, radiusLat, strength])
const DESERT_ZONES: readonly [number, number, number, number, number][] = [
  [14, 23, 30, 11, 1.0],    // Sahara
  [45, 24, 15, 10, 0.95],   // Arabian Desert
  [60, 38, 16, 8, 0.72],    // Central Asia / Karakum
  [98, 41, 18, 7, 0.82],    // Gobi & Taklamakan
  [132, -24, 19, 10, 0.92], // Australian Outback
  [-111, 33, 11, 9, 0.78],  // Sonoran / Mojave / Great Basin
  [-70, -23, 4.5, 12, 0.78],// Atacama
  [18, -24, 8, 8, 0.74],    // Kalahari / Namib
];

const MOUNTAIN_RANGES: readonly [number, number, number, number, number][] = [
  [86, 31, 16, 7, 1.0],     // Himalayas & Tibetan Plateau
  [-70, -22, 4.5, 26, 0.92],// Andes
  [-112, 44, 9, 16, 0.84],  // Rocky Mountains
  [10, 46.5, 7, 3.5, 0.72], // European Alps
  [39, 9, 6, 8, 0.65],      // Ethiopian Highlands
  [44, 41, 8, 4, 0.66],     // Caucasus & Iranian Plateau
];

function gaussianZone(
  lon: number,
  lat: number,
  zones: readonly [number, number, number, number, number][]
): number {
  let maxVal = 0;
  for (let i = 0; i < zones.length; i += 1) {
    const [cx, cy, rx, ry, str] = zones[i];
    let dx = lon - cx;
    if (dx > 180) dx -= 360;
    if (dx < -180) dx += 360;
    const dy = lat - cy;
    const d2 = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
    if (d2 < 4.5) {
      const v = Math.exp(-d2 * 1.15) * str;
      if (v > maxVal) maxVal = v;
    }
  }
  return maxVal;
}

function drawPolygonCanvas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  poly: readonly [number, number][]
) {
  if (poly.length < 3) return;
  ctx.beginPath();
  for (let i = 0; i < poly.length; i += 1) {
    const [lon, lat] = poly[i];
    const x = ((lon + 180) / 360) * w;
    const y = ((90 - lat) / 180) * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

let cachedBundle: EarthTextureBundle | null = null;

/**
 * Generate (or return cached) 1024x512 or 2048x1024 photorealistic NASA Blue Marble
 * Earth textures. Uses 1024x512 on software WebGL for snappy startup and 2048x1024
 * on hardware GPUs for razor-sharp close-up inspection.
 */
export function getEarthTextureBundle(highRes = true): EarthTextureBundle {
  if (cachedBundle) return cachedBundle;

  const w = highRes ? 1536 : 1024;
  const h = w / 2;

  // 1. Rasterize clean continent mask & soft coastal bathymetry shelf via Canvas 2D
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = w;
  maskCanvas.height = h;
  const maskCtx = maskCanvas.getContext('2d')!;
  maskCtx.fillStyle = '#000000';
  maskCtx.fillRect(0, 0, w, h);
  maskCtx.fillStyle = '#ffffff';
  for (const poly of CONTINENT_POLYGONS) {
    drawPolygonCanvas(maskCtx, w, h, poly);
  }
  const crispMask = maskCtx.getImageData(0, 0, w, h).data;

  // Blurred shelf canvas for shallow coastal bathymetry & soft coastline blending
  const shelfCanvas = document.createElement('canvas');
  shelfCanvas.width = w;
  shelfCanvas.height = h;
  const shelfCtx = shelfCanvas.getContext('2d')!;
  shelfCtx.fillStyle = '#000000';
  shelfCtx.fillRect(0, 0, w, h);
  shelfCtx.filter = `blur(${Math.max(4, Math.round(w * 0.0085))}px)`;
  shelfCtx.drawImage(maskCanvas, 0, 0);
  shelfCtx.filter = 'none';
  const shelfData = shelfCtx.getImageData(0, 0, w, h).data;

  // Tightly blurred coast edge so fractal perturbation sculpts organic bays & peninsulas
  const coastCanvas = document.createElement('canvas');
  coastCanvas.width = w;
  coastCanvas.height = h;
  const coastCtx = coastCanvas.getContext('2d')!;
  coastCtx.fillStyle = '#000000';
  coastCtx.fillRect(0, 0, w, h);
  coastCtx.filter = `blur(${Math.max(2, Math.round(w * 0.0032))}px)`;
  coastCtx.drawImage(maskCanvas, 0, 0);
  coastCtx.filter = 'none';
  const coastData = coastCtx.getImageData(0, 0, w, h).data;

  // Output canvases
  const dayCanvas = document.createElement('canvas');
  dayCanvas.width = w;
  dayCanvas.height = h;
  const dayCtx = dayCanvas.getContext('2d')!;
  const dayImg = dayCtx.createImageData(w, h);
  const dayOut = dayImg.data;

  const dataCanvas = document.createElement('canvas');
  dataCanvas.width = w;
  dataCanvas.height = h;
  const dataCtx = dataCanvas.getContext('2d')!;
  const dataImg = dataCtx.createImageData(w, h);
  const dataOut = dataImg.data;

  const nightCanvas = document.createElement('canvas');
  nightCanvas.width = w;
  nightCanvas.height = h;
  const nightCtx = nightCanvas.getContext('2d')!;
  const nightImg = nightCtx.createImageData(w, h);
  const nightOut = nightImg.data;

  const cloudCanvas = document.createElement('canvas');
  cloudCanvas.width = w;
  cloudCanvas.height = h;
  const cloudCtx = cloudCanvas.getContext('2d')!;
  const cloudImg = cloudCtx.createImageData(w, h);
  const cloudOut = cloudImg.data;

  // Synthesize pixel-by-pixel with geographic accuracy + multi-octave micro-detail
  for (let y = 0; y < h; y += 1) {
    const v = y / (h - 1);
    const lat = 90 - v * 180; // +90 north -> -90 south
    const absLat = Math.abs(lat);
    const polarCapNoiseBias = smoothstep(66, 82, absLat);

    for (let x = 0; x < w; x += 1) {
      const u = x / w;
      const lon = u * 360 - 180; // -180 -> +180
      const idx = (y * w + x) * 4;

      const rawMask = crispMask[idx] / 255;
      const coastBlur = coastData[idx] / 255;
      const shelfBlur = shelfData[idx] / 255;

      // Multi-octave organic coastal & topographic detail
      const nMacro = tileableFbm(u, v, 10, 3);
      const nDetail = tileableFbm(u + 0.17, v + 0.31, 28, 3);
      const nFine = tileableValueNoise(u * 96, v * 48, 96);

      // Organic fractured coastline (preserves real continent silhouettes cleanly)
      const landSignal = coastBlur * 0.72 + rawMask * 0.28 + (nDetail - 0.5) * 0.24 + (nFine - 0.5) * 0.08;
      const landMask = smoothstep(0.45, 0.54, landSignal);

      // Shallow shelf water (turquoise reefs & coastal seas)
      const shallowWater = clamp01(shelfBlur * 1.45 - landMask * 1.3) * (1 - landMask);
      const deepAbyssNoise = (nMacro - 0.5) * 0.25 + (nDetail - 0.5) * 0.14;

      // Authentic NASA Blue Marble ocean palette (vibrant cobalt -> deep sapphire -> turquoise reefs)
      const latOceanWarmth = 1 - smoothstep(10, 62, absLat);
      let oR = 14 + latOceanWarmth * 12 + deepAbyssNoise * 9;
      let oG = 52 + latOceanWarmth * 30 + deepAbyssNoise * 16;
      let oB = 114 + latOceanWarmth * 42 + deepAbyssNoise * 22;

      // Add luminous turquoise continental shelves (Caribbean, Red Sea, Coral Sea, SE Asia)
      oR += shallowWater * (28 + latOceanWarmth * 18);
      oG += shallowWater * (96 + latOceanWarmth * 36);
      oB += shallowWater * (92 + latOceanWarmth * 26);

      // Land biomes & relief
      const desertFactor = clamp01(
        gaussianZone(lon, lat, DESERT_ZONES) +
          smoothstep(16, 28, absLat) * (1 - smoothstep(32, 45, absLat)) * (nMacro - 0.44) * 0.55
      );
      const mountainBase = gaussianZone(lon, lat, MOUNTAIN_RANGES);
      const ridgeNoise = 1 - Math.abs(nDetail * 2 - 1);
      const elevation = clamp01(
        landMask * (0.14 + nMacro * 0.28 + mountainBase * (0.45 + ridgeNoise * 0.42) + nFine * 0.08)
      );

      // Polar ice & alpine snow
      const isAntarctica = lat < -63;
      const isGreenland = lon > -72 && lon < -14 && lat > 60 && lat < 84;
      const snowLine =
        isAntarctica
          ? 0.96
          : isGreenland
            ? smoothstep(61, 69, lat + (nDetail - 0.5) * 6) * 0.92
            : clamp01(
                polarCapNoiseBias * (0.7 + nDetail * 0.3) +
                  smoothstep(0.64, 0.84, elevation) * 0.88
              );

      // Lush tropical rainforest -> temperate forest -> savanna -> desert -> alpine rock
      const tropicality = 1 - smoothstep(8, 28, absLat);
      const boreal = smoothstep(46, 66, absLat);

      let lR = 30 + (1 - tropicality) * 18 + boreal * 14 + (nMacro - 0.5) * 18;
      let lG = 68 + tropicality * 12 - boreal * 12 + (nDetail - 0.5) * 20;
      let lB = 34 + boreal * 10 + (nMacro - 0.5) * 10;

      // Golden Sahara / Arabia / Outback desert tint
      const dBlend = smoothstep(0.18, 0.72, desertFactor);
      const dR = 196 + (nDetail - 0.5) * 26;
      const dG = 162 + (nDetail - 0.5) * 22;
      const dB = 112 + (nDetail - 0.5) * 18;
      lR = lR + (dR - lR) * dBlend;
      lG = lG + (dG - lG) * dBlend;
      lB = lB + (dB - lB) * dBlend;

      // Alpine rocky umber/slate ridges
      const rockBlend = smoothstep(0.45, 0.72, elevation) * (1 - snowLine * 0.6);
      const rR = 104 + (nFine - 0.5) * 24;
      const rG = 94 + (nFine - 0.5) * 20;
      const rB = 84 + (nFine - 0.5) * 18;
      lR = lR + (rR - lR) * rockBlend;
      lG = lG + (rG - lG) * rockBlend;
      lB = lB + (rB - lB) * rockBlend;

      // Snow & ice sheets (Antarctica, Greenland, Himalayas, Andes)
      const iceBlend = clamp01(snowLine);
      lR = lR + (236 - lR) * iceBlend;
      lG = lG + (243 - lG) * iceBlend;
      lB = lB + (250 - lB) * iceBlend;

      // Subtle polar sea-ice fringe around Arctic / Antarctic (damped near ±90° to avoid spherical pole spokes)
      const poleDamp = 1 - smoothstep(75, 86, absLat);
      const seaIce =
        (1 - landMask) *
        smoothstep(77.5, 84.5, absLat + (nMacro - 0.5) * 4.5 * poleDamp) *
        0.84;

      let fR = oR + (lR - oR) * landMask;
      let fG = oG + (lG - oG) * landMask;
      let fB = oB + (lB - oB) * landMask;
      if (seaIce > 0.01) {
        fR = fR + (226 - fR) * seaIce;
        fG = fG + (236 - fG) * seaIce;
        fB = fB + (246 - fB) * seaIce;
      }

      dayOut[idx] = Math.max(0, Math.min(255, Math.round(fR)));
      dayOut[idx + 1] = Math.max(0, Math.min(255, Math.round(fG)));
      dayOut[idx + 2] = Math.max(0, Math.min(255, Math.round(fB)));
      dayOut[idx + 3] = 255;

      // Data map: R = height, G = land mask, B = ice mask
      dataOut[idx] = Math.max(0, Math.min(255, Math.round(elevation * 255)));
      dataOut[idx + 1] = Math.max(0, Math.min(255, Math.round(landMask * 255)));
      dataOut[idx + 2] = Math.max(
        0,
        Math.min(255, Math.round(clamp01(Math.max(iceBlend * landMask, seaIce)) * 255))
      );
      dataOut[idx + 3] = 255;

      // Night-side city lights (real metropolitan corridors masked strictly to land!)
      let cityStrength = 0;
      if (landMask > 0.35 && absLat < 66 && !isAntarctica) {
        for (let c = 0; c < CITY_HUBS.length; c += 1) {
          const [cx, cy, rad, weight] = CITY_HUBS[c];
          let dx = lon - cx;
          if (dx > 180) dx -= 360;
          if (dx < -180) dx += 360;
          const dy = lat - cy;
          const d2 = (dx * dx + dy * dy) / (rad * rad);
          if (d2 < 3.6) {
            cityStrength += Math.exp(-d2 * 1.45) * weight;
          }
        }
        if (cityStrength > 0.02) {
          const sparkle = tileableValueNoise(u * 240, v * 120, 240);
          const network = tileableValueNoise(u * 120 + 0.3, v * 60 + 0.7, 120);
          const urbanWeb = smoothstep(0.28, 0.85, sparkle * 0.65 + network * 0.35);
          cityStrength = clamp01(cityStrength * (0.28 + urbanWeb * 1.15)) * landMask;
        }
      }
      nightOut[idx] = Math.round(cityStrength * 255);
      nightOut[idx + 1] = Math.round(cityStrength * 198);
      nightOut[idx + 2] = Math.round(cityStrength * 108);
      nightOut[idx + 3] = 255;

      // Photorealistic Crisp NASA Satellite Cloud Deck (feathery trade-wind streaks + subtle cyclones)
      const warpX = (tileableFbm(u + 0.21, v + 0.13, 10, 3) - 0.5) * 0.09;
      const warpY = (tileableFbm(u + 0.67, v + 0.42, 10, 3) - 0.5) * 0.055;
      const cu = (u + warpX + 1) % 1;
      const cv = clamp01(v + warpY);
      // Higher-frequency stretched zonal trade-wind wisps so continents remain crisp and unobstructed
      const cloudStrata = tileableFbm(cu, cv, 16, 4);
      const cloudFilaments = tileableFbm((cu + 0.37) % 1, clamp01(cv * 1.15), 36, 3);
      const cloudCirrus = tileableValueNoise(cu * 96, cv * 64, 96);

      // Latitude meteorology: thin ITCZ band near equator + mid-lat storm tracks (42°-62°), clear subtropics
      const itcz = Math.exp(-Math.pow((lat - 4) / 6.5, 2)) * 0.13;
      const stormTrack =
        Math.exp(-Math.pow((absLat - 52) / 11, 2)) * 0.16 -
        Math.exp(-Math.pow((absLat - 23) / 11, 2)) * 0.15;
      const rawCloud =
        cloudStrata * 0.46 + cloudFilaments * 0.36 + cloudCirrus * 0.18 + itcz + stormTrack;
      // Sparse, delicate NASA Blue Marble cloud coverage (~22-28%) with smooth polar fade
      const cloudDensity =
        smoothstep(0.575, 0.81, rawCloud) * (0.58 + cloudFilaments * 0.42) * (0.18 + 0.82 * poleDamp);
      const cByte = Math.max(0, Math.min(255, Math.round(clamp01(cloudDensity) * 255)));
      cloudOut[idx] = cByte;
      cloudOut[idx + 1] = cByte;
      cloudOut[idx + 2] = cByte;
      cloudOut[idx + 3] = cByte;
    }
  }

  dayCtx.putImageData(dayImg, 0, 0);
  dataCtx.putImageData(dataImg, 0, 0);
  nightCtx.putImageData(nightImg, 0, 0);
  cloudCtx.putImageData(cloudImg, 0, 0);

  const configureTex = (canvas: HTMLCanvasElement): THREE.CanvasTexture => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    // Disable mipmaps on equirectangular sphere textures to prevent UV-wrap derivative seam lines at ±180°
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.NoColorSpace;
    tex.needsUpdate = true;
    return tex;
  };

  cachedBundle = {
    dayMap: configureTex(dayCanvas),
    dataMap: configureTex(dataCanvas),
    nightMap: configureTex(nightCanvas),
    cloudMap: configureTex(cloudCanvas),
  };

  return cachedBundle;
}
