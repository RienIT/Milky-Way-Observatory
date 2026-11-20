import test from 'node:test';
import assert from 'node:assert/strict';

import {
  AU_IN_METERS,
  KILOPARSEC_METERS,
  LIGHT_YEAR_METERS,
  MEGAPARSEC_METERS,
  PARSEC_METERS,
  SGR_A_SCHWARZSCHILD_RADIUS_M,
  SGR_A_SHADOW_RADIUS_M,
  SUN_GALACTOCENTRIC_DISTANCE_M,
  SUN_GALACTOCENTRIC_DISTANCE_PC,
} from './constants';
import {
  AnchorOriginsM,
  applyLogZoom,
  auToMeters,
  computeAdaptiveFlightSpeedMps,
  computeAnchoredCameraRelativeGpuPos,
  computeCameraRelativeGpuPos,
  computeLayerClipPlanes,
  computeRelativeMeters,
  computeScaleBar,
  computeScaleLayerWeights,
  formatDistanceAuto,
  interpolateLogDistance,
  kpcToMeters,
  lyToMeters,
  metersToAu,
  metersToKpc,
  metersToLy,
  metersToMpc,
  metersToPc,
  mpcToMeters,
  pcToMeters,
  UniversePosition,
} from './scale-engine';

test('Physical constants match IAU 2012/2015 and GRAVITY 2019/2022 within strict tolerances', () => {
  assert.equal(AU_IN_METERS, 149_597_870_700);
  // 1 parsec ≈ 3.261563777 light-years
  assert.ok(Math.abs(PARSEC_METERS / LIGHT_YEAR_METERS - 3.261563777) < 1e-6);
  // Sun-Sgr A* = 8178 pc (~8.178 kpc)
  assert.equal(SUN_GALACTOCENTRIC_DISTANCE_PC, 8178);
  assert.ok(Math.abs(metersToKpc(SUN_GALACTOCENTRIC_DISTANCE_M) - 8.178) < 1e-9);
  // Sgr A* Schwarzschild radius = 2 G M / c^2 for 4.297e6 M_sun ≈ 1.269e10 m (12.69 million km)
  assert.ok(
    SGR_A_SCHWARZSCHILD_RADIUS_M > 1.25e10 && SGR_A_SCHWARZSCHILD_RADIUS_M < 1.29e10,
    `Expected Sgr A* r_s ≈ 1.269e10 m, got ${SGR_A_SCHWARZSCHILD_RADIUS_M}`
  );
  // Shadow radius = sqrt(27)/2 * r_s ≈ 2.598 r_s
  assert.ok(
    Math.abs(SGR_A_SHADOW_RADIUS_M / SGR_A_SCHWARZSCHILD_RADIUS_M - Math.sqrt(27) / 2) < 1e-12
  );
});

test('Unit conversions round-trip accurately across m, AU, ly, pc, kpc, Mpc', () => {
  assert.ok(Math.abs(metersToAu(auToMeters(1.523679)) - 1.523679) < 1e-12);
  assert.ok(Math.abs(metersToLy(lyToMeters(4.2465)) - 4.2465) < 1e-12);
  assert.ok(Math.abs(metersToPc(pcToMeters(8178)) - 8178) < 1e-12);
  assert.ok(Math.abs(metersToKpc(kpcToMeters(15.5)) - 15.5) < 1e-12);
  assert.ok(Math.abs(metersToMpc(mpcToMeters(99.0)) - 99.0) < 1e-12);
});

test('Floating-origin subtraction preserves sub-meter precision at Earth surface while 8.178 kpc from Sgr A*', () => {
  const origins: AnchorOriginsM = {
    sunInGalacticM: [-SUN_GALACTOCENTRIC_DISTANCE_M, 20.8 * PARSEC_METERS, 0],
    earthInHelioM: [AU_IN_METERS, 0, 0],
  };

  // Camera 500 m above Earth's surface, object on Earth's surface
  const surfacePoint: UniversePosition = {
    anchor: 'earth',
    offsetM: [6_371_008.4, 0, 0],
  };
  const cameraPoint: UniversePosition = {
    anchor: 'earth',
    offsetM: [6_371_008.4 + 500.25, 0, 0],
  };

  const relM = computeRelativeMeters(surfacePoint, cameraPoint, origins);
  assert.ok(
    Math.abs(relM[0] - -500.25) < 1e-9,
    `Expected exact -500.25 m offset, got ${relM[0]}`
  );

  // Float32 GPU coordinates in planetary layer (1 unit = 1e6 m) stay finite and accurate
  const gpu = computeAnchoredCameraRelativeGpuPos(surfacePoint, cameraPoint, origins, 1e6);
  assert.ok(Math.abs(gpu[0] - -0.00050025) < 1e-7);
  assert.ok(Number.isFinite(gpu[0]) && Number.isFinite(gpu[1]) && Number.isFinite(gpu[2]));

  // Even for two raw float64 vectors near 1e15 m separated by 1,000 m, float64 subtraction preserves exact delta
  const largeA = [1e15 + 1000, -5e14, 2e14] as const;
  const largeB = [1e15, -5e14, 2e14] as const;
  const relGpu = computeCameraRelativeGpuPos(largeA, largeB, 1e3);
  assert.ok(Math.abs(relGpu[0] - 1.0) < 1e-5);
});

test('Scale layers crossfade smoothly from 500 m to 100 Mpc without dead zones or NaNs', () => {
  const testDistances = [
    500,                   // 500 m above Earth
    400_000,               // ISS orbit
    384_400_000,           // Moon
    AU_IN_METERS,          // 1 AU
    50 * AU_IN_METERS,     // Kuiper belt
    4.25 * LIGHT_YEAR_METERS, // Proxima Centauri
    500 * PARSEC_METERS,   // Orion Nebula
    8.178 * KILOPARSEC_METERS, // Milky Way
    0.778 * MEGAPARSEC_METERS, // M31 Andromeda
    99 * MEGAPARSEC_METERS,    // Coma Cluster
  ];

  for (const d of testDistances) {
    const w = computeScaleLayerWeights(d);
    const total = w.planetary + w.stellar + w.galactic + w.extragalactic;
    assert.ok(total > 0.5, `Expected active visible layers at ${d} m, sum was ${total}`);
    assert.ok(w.planetary >= 0 && w.planetary <= 1);
    assert.ok(w.stellar >= 0 && w.stellar <= 1);
    assert.ok(w.galactic >= 0 && w.galactic <= 1);
    assert.ok(w.extragalactic >= 0 && w.extragalactic <= 1);

    const clip = computeLayerClipPlanes(w.dominant, d);
    assert.ok(clip.near > 0 && clip.far > clip.near);
  }

  assert.equal(computeScaleLayerWeights(10_000).dominant, 'planetary');
  assert.equal(computeScaleLayerWeights(20 * LIGHT_YEAR_METERS).dominant, 'stellar');
  assert.equal(computeScaleLayerWeights(15 * KILOPARSEC_METERS).dominant, 'galactic');
  assert.equal(computeScaleLayerWeights(16.5 * MEGAPARSEC_METERS).dominant, 'extragalactic');
});

test('Logarithmic zoom, log fly-to, adaptive flight speed, and auto-unit scale bar behave monotonically', () => {
  const zoomedOut = applyLogZoom(1e7, 0.5, 500);
  const zoomedIn = applyLogZoom(1e7, -0.5, 500);
  assert.ok(zoomedOut > 1e7 && zoomedIn < 1e7);
  assert.ok(Math.abs(Math.log10(zoomedOut) - 7.5) < 1e-9);

  // Midpoint of log interpolation between 1e6 m and 1e20 m is 1e13 m
  const mid = interpolateLogDistance(1e6, 1e20, 0.5);
  assert.ok(Math.abs(Math.log10(mid) - 13.0) < 1e-9);

  // Adaptive WASD speed scales proportionally to distance
  const speedEarth = computeAdaptiveFlightSpeedMps(1e6, false);
  const speedGalaxy = computeAdaptiveFlightSpeedMps(1e20, false);
  assert.ok(speedGalaxy / speedEarth > 1e13);
  assert.ok(computeAdaptiveFlightSpeedMps(1e6, true) > speedEarth * 3);

  // Auto unit formatting
  assert.equal(formatDistanceAuto(450).unit, 'm');
  assert.equal(formatDistanceAuto(384_400_000).unit, 'km');
  assert.equal(formatDistanceAuto(5.2 * AU_IN_METERS).unit, 'AU');
  assert.equal(formatDistanceAuto(8.6 * LIGHT_YEAR_METERS).unit, 'ly');
  assert.equal(formatDistanceAuto(250 * PARSEC_METERS).unit, 'pc');
  assert.equal(formatDistanceAuto(8.178 * KILOPARSEC_METERS).unit, 'kpc');
  assert.equal(formatDistanceAuto(16.5 * MEGAPARSEC_METERS).unit, 'Mpc');

  // Dynamic scale bar
  const bar = computeScaleBar(5_000, 100); // ~500 km
  assert.equal(bar.unit, 'km');
  assert.ok(bar.widthPx >= 44 && bar.widthPx <= 180);
});
