import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_MEMORIES } from './mock-memories';
import {
  computeConstellationLinks,
  computeOrbitalWorldPosition,
  computeOrbitRingPoints,
  filterMemories,
  generateOrbitalParameters,
  getSafeOrbitRadius,
  localFallbackSummarize,
  MIN_SAFE_ORBIT_RADIUS,
} from './memory-logic';
import { ALL_CATEGORIES, getPlanetSpecForNode } from './memory-types';

test('INITIAL_MEMORIES contains exactly 48 real NASA/Gaia Milky Way objects across all 7 categories with safe clearance outside black hole', () => {
  assert.equal(INITIAL_MEMORIES.length, 48);
  assert.equal(ALL_CATEGORIES.length, 7);

  for (const category of ALL_CATEGORIES) {
    const count = INITIAL_MEMORIES.filter(
      (m) => m.category === category
    ).length;
    assert.ok(
      count >= 5,
      `Expected at least 5 items in ${category}, got ${count}`
    );
  }

  for (const node of INITIAL_MEMORIES) {
    assert.equal(node.summary.length, 3);
    assert.ok(node.tags.length >= 3);
    assert.ok(
      node.orbitRadius >= MIN_SAFE_ORBIT_RADIUS,
      `Expected ${node.id} orbitRadius (${node.orbitRadius}) >= ${MIN_SAFE_ORBIT_RADIUS}`
    );
    // Verify position at any angle stays strictly outside the black hole accretion disk
    for (let step = 0; step < 8; step++) {
      const [x, y, z] = computeOrbitalWorldPosition(node, step * 5, 1);
      const dist = Math.hypot(x, y, z);
      assert.ok(
        dist >= MIN_SAFE_ORBIT_RADIUS - 0.01,
        `Planet ${node.id} got too close to black hole: ${dist}`
      );
    }
  }
});

test('filterMemories filters accurately by keyword and category (including Vietnamese diacritics)', () => {
  const allMatch = filterMemories(INITIAL_MEMORIES, '', 'ALL');
  assert.equal(allMatch.size, 48);

  const blackHoleCategoryOnly = filterMemories(
    INITIAL_MEMORIES,
    '',
    'Hố đen & Hiện tượng Thiên hà'
  );
  assert.equal(blackHoleCategoryOnly.size, 6);

  // Search for 'kepler' tag
  const keplerMatches = filterMemories(INITIAL_MEMORIES, 'kepler', 'ALL');
  assert.ok(keplerMatches.size >= 3);
  assert.ok(keplerMatches.has('astro-ocean-02'));

  // Search without diacritics ("chan troi su kien" matches "Chân Trời Sự Kiện")
  const horizonMatches = filterMemories(
    INITIAL_MEMORIES,
    'chan troi su kien',
    'ALL'
  );
  assert.ok(horizonMatches.has('astro-bh-01'));
});

test('computeConstellationLinks connects nodes sharing tags and ensures every node is linked', () => {
  const links = computeConstellationLinks(INITIAL_MEMORIES);
  assert.ok(links.length >= 30, 'Should generate rich constellation network');

  const connectedNodeIds = new Set<string>();
  for (const link of links) {
    connectedNodeIds.add(link.sourceId);
    connectedNodeIds.add(link.targetId);
    assert.notEqual(link.sourceId, link.targetId);
  }

  // Every single astronomical node should participate in the constellation network
  assert.equal(connectedNodeIds.size, INITIAL_MEMORIES.length);
});

test('generateOrbitalParameters, computeOrbitalWorldPosition, and computeOrbitRingPoints stay safe and aligned', () => {
  const orbital = generateOrbitalParameters(30);
  assert.ok(orbital.orbitRadius >= MIN_SAFE_ORBIT_RADIUS && orbital.orbitRadius <= 64);
  assert.equal(orbital.position.length, 3);

  // Legacy small radius gets remapped cleanly outside black hole
  assert.ok(getSafeOrbitRadius(14.5) >= MIN_SAFE_ORBIT_RADIUS);

  const posT0 = computeOrbitalWorldPosition(orbital, 0, 1);
  const posT10 = computeOrbitalWorldPosition(orbital, 10, 1);
  assert.notDeepEqual(posT0, posT10);
  assert.ok(Number.isFinite(posT10[0]));
  assert.ok(Number.isFinite(posT10[1]));
  assert.ok(Number.isFinite(posT10[2]));

  // Verify circular ring track points match orbital distance and segment count
  const ringPts = computeOrbitRingPoints(orbital, 64);
  assert.equal(ringPts.length, 64 * 3);
  for (let i = 0; i < 64; i++) {
    const r = Math.hypot(ringPts[i * 3], ringPts[i * 3 + 1], ringPts[i * 3 + 2]);
    assert.ok(r >= MIN_SAFE_ORBIT_RADIUS - 0.01);
  }
});

test('localFallbackSummarize extracts 3 bullet points and 3 astronomical tags from description', () => {
  const rawInput =
    'Khám phá ngoại hành tinh đại dương Kepler-22b nằm trong vùng sống được (habitable zone). ' +
    'Bề mặt hành tinh được bao phủ bởi đại dương nước lỏng sâu hàng trăm kilomet. ' +
    'Quan sát quang phổ từ kính viễn vọng JWST giúp xác định thành phần khí quyển.';
  const result = localFallbackSummarize(rawInput);

  assert.equal(result.summary.length, 3);
  assert.equal(result.tags.length, 3);
  assert.equal(result.category, 'Hành tinh Đại dương & Sự sống');
  assert.ok(result.tags.includes('exoplanet'));
});

test('getPlanetSpecForNode assigns valid real NASA Milky Way archetypes with authentic physical size hierarchy', () => {
  let ringedCount = 0;
  const archetypesSeen = new Set<number>();
  let minScale = Infinity;
  let maxScale = -Infinity;

  for (const node of INITIAL_MEMORIES) {
    const spec = getPlanetSpecForNode(node);
    assert.ok(spec.designation.length > 0);
    assert.ok(spec.diameterKm.length > 0);
    assert.ok(spec.earthRadiusRatio > 0);
    assert.ok(spec.planetTypeVi.length > 0);
    assert.ok(spec.realInspiration.length > 0);
    assert.ok(
      spec.radiusScale >= 0.12 && spec.radiusScale <= 1.75,
      `Unexpected scale ${spec.radiusScale} for ${node.id}`
    );
    minScale = Math.min(minScale, spec.radiusScale);
    maxScale = Math.max(maxScale, spec.radiusScale);
    if (spec.hasRings) {
      assert.ok(spec.ringOuterRadius > spec.ringInnerRadius);
      ringedCount++;
    }
    archetypesSeen.add(spec.archetypeId);

    // Ensure no fictional Interstellar movie worlds remain in the default NASA Milky Way dataset
    assert.ok(!/Miller|Mann|Edmunds/i.test(node.title), `Unexpected fictional world: ${node.title}`);
  }

  assert.ok(ringedCount >= 7, 'Expected multiple ringed planets');
  assert.ok(archetypesSeen.size >= 10, 'Expected 10+ distinct NASA/Gaia archetypes including stars, asteroids, and comets');
  assert.ok(maxScale / minScale >= 8.0, `Expected wide visual size hierarchy (>= 8x), got ${(maxScale / minScale).toFixed(2)}x`);

  // Verify authentic Solar System relative size hierarchy (all 8 planets + Europa)
  const byId = new Map(INITIAL_MEMORIES.map((m) => [m.id, getPlanetSpecForNode(m)]));
  const jupiter = byId.get('astro-gas-03')!;
  const saturn = byId.get('astro-gas-02')!;
  const uranus = byId.get('astro-ice-03')!;
  const neptune = byId.get('astro-ice-02')!;
  const earth = byId.get('astro-ocean-01')!;
  const venus = byId.get('astro-lava-06')!;
  const mars = byId.get('astro-ice-01')!;
  const mercury = byId.get('astro-bh-06')!;
  const europa = byId.get('astro-ice-04')!;

  assert.ok(jupiter.radiusScale > saturn.radiusScale, 'Jupiter must be larger than Saturn');
  assert.ok(saturn.radiusScale > uranus.radiusScale, 'Saturn must be larger than Uranus');
  assert.ok(uranus.radiusScale >= neptune.radiusScale, 'Uranus must be >= Neptune');
  assert.ok(neptune.radiusScale > earth.radiusScale, 'Neptune must be larger than Earth');
  assert.ok(earth.radiusScale > venus.radiusScale, 'Earth must be slightly larger than Venus');
  assert.ok(venus.radiusScale > mars.radiusScale, 'Venus must be larger than Mars');
  assert.ok(mars.radiusScale > mercury.radiusScale, 'Mars must be larger than Mercury');
  assert.ok(mercury.radiusScale > europa.radiusScale, 'Mercury must be larger than Europa');
});

test('computeWasdFlightDelta produces distance-scaled 6-DOF galactic movement and 3.2x boost', async () => {
  const { computeWasdFlightDelta } = await import('./memory-logic');

  const idle = computeWasdFlightDelta(
    { forward: false, backward: false, left: false, right: false, up: false, down: false, boost: false },
    [0, 0, -1],
    [1, 0, 0],
    40,
    0.016
  );
  assert.deepEqual(idle, [0, 0, 0]);

  const fwd = computeWasdFlightDelta(
    { forward: true, backward: false, left: false, right: false, up: false, down: false, boost: false },
    [0, 0, -1],
    [1, 0, 0],
    40,
    0.1
  );
  assert.ok(fwd[2] < -1.5, `Expected strong forward movement along -Z, got ${fwd[2]}`);

  const boosted = computeWasdFlightDelta(
    { forward: true, backward: false, left: false, right: false, up: false, down: false, boost: true },
    [0, 0, -1],
    [1, 0, 0],
    40,
    0.1
  );
  assert.ok(Math.abs(boosted[2] / fwd[2] - 3.2) < 0.01, 'Shift boost should be 3.2x');

  // Close-up planetary inspection should automatically slow down for fine surface control
  const closeUp = computeWasdFlightDelta(
    { forward: true, backward: false, left: false, right: false, up: false, down: false, boost: false },
    [0, 0, -1],
    [1, 0, 0],
    0.5,
    0.1
  );
  assert.ok(Math.abs(closeUp[2]) < Math.abs(fwd[2]) * 0.25, 'Close-up speed must scale down smoothly');
});

test('all 5 languages (vi, en, ja, zh, ko) cover UI strings, orbitRings, black hole physics, and all 30 celestial worlds', async () => {
  const { SUPPORTED_LANGUAGES, UI_STRINGS } = await import('./i18n');
  const { getLocalizedNode } = await import('./celestial-translations');

  assert.equal(SUPPORTED_LANGUAGES.length, 5);

  for (const langOpt of SUPPORTED_LANGUAGES) {
    const dict = UI_STRINGS[langOpt.code];
    assert.ok(dict, `Missing UI_STRINGS for ${langOpt.code}`);
    assert.ok(dict.orbitRings.length > 0, `Missing orbitRings in ${langOpt.code}`);
    assert.equal(dict.blackHoleAnatomy.length, 4);
    assert.equal(dict.famousBlackHoles.length, 4);
    assert.equal(dict.modalPresets.length, 3);

    for (const cat of ALL_CATEGORIES) {
      assert.ok(
        dict.categories[cat]?.shortLabel.length > 0,
        `Missing category translation for ${cat} in ${langOpt.code}`
      );
    }

    for (const node of INITIAL_MEMORIES) {
      const loc = getLocalizedNode(node, langOpt.code);
      assert.ok(loc.title.length > 0);
      assert.equal(loc.summary.length, 3);
      assert.ok(loc.content.length > 20);
      if (langOpt.code !== 'vi') {
        assert.notEqual(
          loc.title,
          node.title,
          `Expected localized title for ${node.id} in ${langOpt.code}`
        );
      }
    }
  }
});

test('NASA Milky Way model generates deterministic barred spiral arms, Solar System Orion Spur position, and 5-language data', async () => {
  const {
    MILKY_WAY_NASA_DATA,
    MILKY_WAY_SPIRAL_ARMS,
    computeSolarSystemWorldPosition,
    generateMilkyWayNebulae,
    generateMilkyWayStarfield,
  } = await import('./milky-way');
  const { MILKY_WAY_I18N } = await import('./milky-way-i18n');
  const { SUPPORTED_LANGUAGES } = await import('./i18n');

  assert.equal(MILKY_WAY_NASA_DATA.diameterLightYears, 105700);
  assert.equal(MILKY_WAY_NASA_DATA.sunDistanceLightYears, 26670);
  assert.equal(MILKY_WAY_SPIRAL_ARMS.length, 5);

  const [sx, sy, sz] = computeSolarSystemWorldPosition(0, 1);
  const sunR = Math.hypot(sx, sy, sz);
  assert.ok(sunR >= 44 && sunR <= 45.5, `Expected Sun radius ~44.5 units (26,700 ly), got ${sunR}`);

  const stars = generateMilkyWayStarfield(1200);
  assert.equal(stars.count, 1200);
  assert.equal(stars.positions.length, 1200 * 3);
  assert.ok(Number.isFinite(stars.positions[0]) && Number.isFinite(stars.positions[3599]));

  const nebulae = generateMilkyWayNebulae(120);
  assert.equal(nebulae.count, 120);
  assert.equal(nebulae.colors.length, 120 * 3);

  for (const langOpt of SUPPORTED_LANGUAGES) {
    const mw = MILKY_WAY_I18N[langOpt.code];
    assert.ok(mw.diskToggleLabel.length > 0);
    assert.equal(mw.arms.length, 5);
    assert.ok(mw.solarBeaconTitle.length > 0);
  }
});

test('ESA Gaia DR3 galactocentric transform, True 1:1 scaling, rocky belts & hardware recommender work accurately', async () => {
  const {
    computeGalactocentricPosition,
    computeHeliocentricOrbitRadiusUnits,
    computeTrue1To1RadiusScale,
    generateRockyBeltParticles,
    getScientificAstrometry,
    PLANET_BASE_SPHERE_RADIUS,
    SGRA_EVENT_HORIZON_RADIUS_UNITS,
    SOLAR_SYSTEM_KUIPER_BELT_AU,
    SOLAR_SYSTEM_MAIN_BELT_AU,
  } = await import('./scientific-catalog');
  const { scoreHardwareAndRecommend } = await import('./graphics-settings');

  // 1. Sun at (l=0, b=0, d=0) sits at R0 = 26,670 ly from Sgr A*
  const solPos = computeGalactocentricPosition(0, 0, 0);
  assert.equal(solPos.galactocentricLy[0], 26670);
  assert.equal(solPos.galactocentricLy[1], 55);

  // Sgr A* at (l=0, b=0, d=26670) sits at x=0 (Galactic Center)
  const sgrAPos = computeGalactocentricPosition(0, 0, 26670);
  assert.ok(Math.abs(sgrAPos.galactocentricLy[0]) < 1e-6);
  assert.ok(Math.abs(sgrAPos.galactocentricLy[2]) < 1e-6);

  // 2. Strict True 1:1 linear diameter hierarchy anchored to Sagittarius A*'s 4.52-unit event horizon (25.4M km)
  const sgrAScale = computeTrue1To1RadiusScale(25400000, 'black-hole');
  const sunScale = computeTrue1To1RadiusScale(1392700, 'star');
  const siriusScale = computeTrue1To1RadiusScale(2380000, 'star');
  const betelgeuseScale = computeTrue1To1RadiusScale(1064000000, 'star');
  const uyScutiScale = computeTrue1To1RadiusScale(1260000000, 'star');

  const jupiterScale = computeTrue1To1RadiusScale(139820, 'planet');
  const saturnScale = computeTrue1To1RadiusScale(116460, 'planet');
  const earthScale = computeTrue1To1RadiusScale(12742, 'planet');
  const marsScale = computeTrue1To1RadiusScale(6779, 'planet');
  const plutoScale = computeTrue1To1RadiusScale(2376.6, 'dwarf-planet');
  const ceresScale = computeTrue1To1RadiusScale(939.4, 'dwarf-planet');
  const vestaScale = computeTrue1To1RadiusScale(525.4, 'asteroid');
  const halleyScale = computeTrue1To1RadiusScale(11.0, 'comet');
  const bennuScale = computeTrue1To1RadiusScale(0.49, 'asteroid');

  // Sagittarius A* shadow dwarfs every star and planet in galactic overview
  const sgrARadius = sgrAScale * PLANET_BASE_SPHERE_RADIUS;
  const sunRadius = sunScale * PLANET_BASE_SPHERE_RADIUS;
  const jupiterRadius = jupiterScale * PLANET_BASE_SPHERE_RADIUS;
  const earthRadius = earthScale * PLANET_BASE_SPHERE_RADIUS;
  const uyScutiRadius = uyScutiScale * PLANET_BASE_SPHERE_RADIUS;

  assert.ok(Math.abs(sgrARadius - SGRA_EVENT_HORIZON_RADIUS_UNITS) < 1e-4);
  assert.ok(sgrARadius > uyScutiRadius, 'Sagittarius A* horizon must tower over even hypergiant stars');
  assert.ok(sgrARadius > sunRadius * 18.0 && sgrARadius < sunRadius * 18.5, 'Sgr A* shadow must be ~18.24x Sun');
  assert.ok(Math.abs(sunRadius / earthRadius - 109.3) < 0.2, 'Sun must be 109.3x Earth in True 1:1 mode');
  assert.ok(Math.abs(jupiterRadius / earthRadius - 10.973) < 0.05, 'Jupiter must be 10.97x Earth in True 1:1 mode');
  assert.ok(jupiterRadius < sgrARadius * 0.01, 'Jupiter must be < 1% of Sagittarius A* event horizon');

  assert.ok(uyScutiScale > betelgeuseScale && betelgeuseScale > siriusScale && siriusScale > sunScale);
  assert.ok(sunScale > jupiterScale && jupiterScale > saturnScale && saturnScale > earthScale && earthScale > marsScale);
  assert.ok(marsScale > plutoScale && plutoScale > ceresScale && ceresScale > vestaScale && vestaScale > halleyScale && halleyScale > bennuScale);
  assert.ok(bennuScale >= 0.000048, 'Bennu stays safely above logarithmic depth buffer floor');

  // 2B. Heliocentric orbital hierarchy around the Sun: Sun < Mercury < Mars < Main Asteroid Belt < Jupiter < Neptune <= Kuiper Belt < Eris
  const rMercury = computeHeliocentricOrbitRadiusUnits(0.39);
  const rEarth = computeHeliocentricOrbitRadiusUnits(1.0);
  const rMars = computeHeliocentricOrbitRadiusUnits(1.52);
  const rMainInner = computeHeliocentricOrbitRadiusUnits(SOLAR_SYSTEM_MAIN_BELT_AU.inner);
  const rMainOuter = computeHeliocentricOrbitRadiusUnits(SOLAR_SYSTEM_MAIN_BELT_AU.outer);
  const rJupiter = computeHeliocentricOrbitRadiusUnits(5.2);
  const rNeptune = computeHeliocentricOrbitRadiusUnits(30.06);
  const rKuiperInner = computeHeliocentricOrbitRadiusUnits(SOLAR_SYSTEM_KUIPER_BELT_AU.inner);
  const rKuiperOuter = computeHeliocentricOrbitRadiusUnits(SOLAR_SYSTEM_KUIPER_BELT_AU.outer);
  const rPluto = computeHeliocentricOrbitRadiusUnits(39.48);

  assert.ok(rMercury > sunRadius * 1.4, 'Mercury must orbit cleanly outside the Sun photosphere');
  assert.ok(rMercury < rEarth && rEarth < rMars && rMars < rMainInner);
  assert.ok(rMainOuter < rJupiter && rJupiter < rNeptune);
  assert.ok(rPluto > rKuiperInner && rPluto < rKuiperOuter, 'Pluto must sit inside the Kuiper Belt');

  // Every object in INITIAL_MEMORIES returns valid scientific astrometry
  for (const node of INITIAL_MEMORIES) {
    const astro = getScientificAstrometry(node.id);
    assert.ok(astro.diameterKmNumeric > 0);
    assert.ok(astro.sourceCitation.length > 5);
  }

  // 3. Rocky belt generator stays strictly within heliocentric Main Asteroid Belt inner..outer radii
  const belt = generateRockyBeltParticles(600, rMainInner, rMainOuter, 0.04, 123, false);
  assert.equal(belt.count, 600);
  assert.equal(belt.positions.length, 1800);
  for (let i = 0; i < 600; i++) {
    const r = Math.hypot(belt.positions[i * 3], belt.positions[i * 3 + 2]);
    assert.ok(r >= rMainInner - 0.001 && r <= rMainOuter + 0.001, `Belt particle out of range: ${r}`);
  }

  // 4. Hardware profiler recommends potato on 2-core SwiftShader, low/medium on Intel UHD, and ultra on RTX 4080
  const swRec = scoreHardwareAndRecommend({
    gpuRenderer: 'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device))',
    gpuVendor: 'Google Inc.',
    isSoftwareGl: true,
    webgl2Supported: true,
    maxTextureSize: 8192,
    cpuCores: 2,
    deviceMemoryGb: 2,
    devicePixelRatio: 1,
    screenWidth: 1440,
    screenHeight: 900,
  });
  assert.equal(swRec.recommendedTier, 'potato');
  assert.ok(swRec.score < 40);

  const weakLaptopRec = scoreHardwareAndRecommend({
    gpuRenderer: 'ANGLE (Intel, Intel(R) UHD Graphics 620)',
    gpuVendor: 'Intel',
    isSoftwareGl: false,
    webgl2Supported: true,
    maxTextureSize: 8192,
    cpuCores: 4,
    deviceMemoryGb: 8,
    devicePixelRatio: 1,
    screenWidth: 1366,
    screenHeight: 768,
  });
  assert.ok(
    weakLaptopRec.recommendedTier === 'low' || weakLaptopRec.recommendedTier === 'medium'
  );

  const workstationRec = scoreHardwareAndRecommend({
    gpuRenderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4080 Direct3D11)',
    gpuVendor: 'NVIDIA',
    isSoftwareGl: false,
    webgl2Supported: true,
    maxTextureSize: 16384,
    cpuCores: 16,
    deviceMemoryGb: 16,
    devicePixelRatio: 2,
    screenWidth: 3840,
    screenHeight: 2160,
  });
  assert.equal(workstationRec.recommendedTier, 'ultra');
  assert.ok(workstationRec.score >= 90);
});

test('Schwarzschild gravitational lensing physics & black-hole plane occlusion stay physically exact', async () => {
  const {
    SGRA_SCHWARZSCHILD_RS,
    computeGravitationalDeflectionRad,
    computeLensingBlendFactor,
    computeSchwarzschildShadowRadius,
    isPointBehindBlackHolePlane,
  } = await import('./memory-logic');

  const bCrit = computeSchwarzschildShadowRadius(SGRA_SCHWARZSCHILD_RS);
  assert.ok(bCrit > 4.5 && bCrit < 4.65, `Expected b_crit ≈ 4.57, got ${bCrit}`);

  // Rays inside b_crit are captured by the event horizon; outside b_crit deflection decreases monotonically with impact parameter
  assert.equal(computeGravitationalDeflectionRad(bCrit * 0.9), Infinity);
  const dNear = computeGravitationalDeflectionRad(5.2);
  const dMid = computeGravitationalDeflectionRad(10.0);
  const dFar = computeGravitationalDeflectionRad(22.0);
  assert.ok(Number.isFinite(dNear) && dNear > dMid && dMid > dFar && dFar > 0.1);

  // Outer lensing blend tapers smoothly from 1.0 (inner zone) to 0.0 (boundary) for zero seam
  assert.equal(computeLensingBlendFactor(12.0), 1);
  assert.ok(computeLensingBlendFactor(28.0) > 0.1 && computeLensingBlendFactor(28.0) < 0.9);
  assert.equal(computeLensingBlendFactor(34.0), 0);

  // Foreground planet standing between camera (0, 0, 50) and Sgr A* (0, 0, 0) must NOT be behind black hole
  assert.equal(isPointBehindBlackHolePlane([0, 0, 50], [0, 0, 20]), false);
  // Planet behind Sgr A* (0, 0, -25) MUST be classified behind black hole (occluded & lensed)
  assert.equal(isPointBehindBlackHolePlane([0, 0, 50], [0, 0, -25]), true);
  // Oblique foreground planet closer to camera than projected BH ray distance stays in foreground
  assert.equal(isPointBehindBlackHolePlane([0, 0, 50], [10, 2, 18]), false);
});
