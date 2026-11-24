import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computePlanetQualityProfile,
  GRAPHICS_PRESETS,
  scoreHardwareAndRecommend,
} from './graphics-settings';

test('computePlanetQualityProfile scales monotonically from potato to ultra', () => {
  const order = ['potato', 'low', 'medium', 'high', 'rtx', 'ultra'] as const;
  const profiles = order.map((tier) =>
    computePlanetQualityProfile(GRAPHICS_PRESETS[tier])
  );

  for (let i = 1; i < profiles.length; i += 1) {
    assert.ok(
      profiles[i].qualityLevel > profiles[i - 1].qualityLevel,
      `qualityLevel should strictly increase from ${order[i - 1]} to ${order[i]}`
    );
    assert.ok(
      profiles[i].sphereSegments > profiles[i - 1].sphereSegments,
      `sphereSegments should strictly increase from ${order[i - 1]} to ${order[i]}`
    );
    assert.ok(
      profiles[i].reliefStrength > profiles[i - 1].reliefStrength,
      `reliefStrength should strictly increase from ${order[i - 1]} to ${order[i]}`
    );
    assert.ok(
      profiles[i].nightLightsStrength > profiles[i - 1].nightLightsStrength,
      `nightLightsStrength should strictly increase from ${order[i - 1]} to ${order[i]}`
    );
    assert.ok(
      profiles[i].specularStrength > profiles[i - 1].specularStrength,
      `specularStrength should strictly increase from ${order[i - 1]} to ${order[i]}`
    );
    assert.ok(
      profiles[i].atmosphereStrength > profiles[i - 1].atmosphereStrength,
      `atmosphereStrength should strictly increase from ${order[i - 1]} to ${order[i]}`
    );
  }
});

test('potato preset disables clouds, atmosphere, relief, night lights, and uses nearest filtering', () => {
  const potato = computePlanetQualityProfile(GRAPHICS_PRESETS.potato);
  assert.equal(potato.qualityLevel, 0);
  assert.equal(potato.reliefStrength, 0);
  assert.equal(potato.cloudShadowStrength, 0);
  assert.equal(potato.nightLightsStrength, 0);
  assert.equal(potato.atmosphereStrength, 0);
  assert.equal(potato.auroraStrength, 0);
  assert.equal(potato.showClouds, false);
  assert.equal(potato.textureFilterNearest, true);
});

test('ultra preset enables peak relief, clouds, cloud shadows, aurora, and linear filtering', () => {
  const ultra = computePlanetQualityProfile(GRAPHICS_PRESETS.ultra);
  assert.equal(ultra.qualityLevel, 1);
  assert.equal(ultra.sphereSegments, 112);
  assert.ok(ultra.reliefStrength >= 1.5);
  assert.ok(ultra.cloudShadowStrength >= 0.55);
  assert.ok(ultra.nightLightsStrength >= 1.6);
  assert.ok(ultra.atmosphereStrength >= 1.3);
  assert.ok(ultra.auroraStrength >= 1.1);
  assert.equal(ultra.showClouds, true);
  assert.equal(ultra.textureFilterNearest, false);
});

test('disabling showAtmosphereAndNebulae turns off atmosphere, clouds, cloud shadows, and aurora even on ultra', () => {
  const customNoAtmo = computePlanetQualityProfile({
    ...GRAPHICS_PRESETS.ultra,
    tier: 'custom',
    showAtmosphereAndNebulae: false,
  });
  assert.equal(customNoAtmo.atmosphereStrength, 0);
  assert.equal(customNoAtmo.cloudShadowStrength, 0);
  assert.equal(customNoAtmo.auroraStrength, 0);
  assert.equal(customNoAtmo.showClouds, false);
  assert.ok(customNoAtmo.reliefStrength > 1.2);
});

test('scoreHardwareAndRecommend detects software WebGL and high-end GPUs accurately', () => {
  const swRec = scoreHardwareAndRecommend({
    gpuRenderer: 'Google SwiftShader',
    gpuVendor: 'Google',
    isSoftwareGl: true,
    webgl2Supported: true,
    maxTextureSize: 8192,
    cpuCores: 8,
    deviceMemoryGb: 8,
    devicePixelRatio: 1,
    screenWidth: 1440,
    screenHeight: 900,
  });
  assert.equal(swRec.gpuClass, 'software');
  assert.equal(swRec.recommendedTier, 'low');

  const highRec = scoreHardwareAndRecommend({
    gpuRenderer: 'NVIDIA GeForce RTX 4080',
    gpuVendor: 'NVIDIA',
    isSoftwareGl: false,
    webgl2Supported: true,
    maxTextureSize: 16384,
    cpuCores: 16,
    deviceMemoryGb: 32,
    devicePixelRatio: 2,
    screenWidth: 3840,
    screenHeight: 2160,
  });
  assert.equal(highRec.gpuClass, 'discrete-high');
  assert.equal(highRec.recommendedTier, 'ultra');
});
