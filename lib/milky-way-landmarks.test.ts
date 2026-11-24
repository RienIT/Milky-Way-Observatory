import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_MILKY_WAY_LANDMARKS,
  getMilkyWayLandmarkById,
  helioGalacticToGalactocentricKpc,
  MILKY_WAY_SPIRAL_ARM_LANDMARKS,
  MILKY_WAY_STAR_CLUSTERS,
} from './milky-way-landmarks';
import { computeSolarSystemEphemeris } from './ephemeris';
import { INITIAL_MEMORIES } from './mock-memories';
import { resolveUniverseTarget } from './universe-targets';
import { KILOPARSEC_METERS } from './constants';
import { LanguageCode } from './i18n';

const LANGS: LanguageCode[] = ['en', 'vi', 'ja', 'zh', 'ko'];

test('helioGalacticToGalactocentricKpc maps l=0 b=0 d=8.178 kpc directly to Sagittarius A* origin', () => {
  const sgrA = helioGalacticToGalactocentricKpc(0, 0, 8.178);
  assert.ok(Math.abs(sgrA[0]) < 0.01, `Expected x ~ 0, got ${sgrA[0]}`);
  assert.ok(Math.abs(sgrA[2]) < 0.01, `Expected z ~ 0, got ${sgrA[2]}`);
  assert.ok(Math.abs(sgrA[1] - 0.02) < 0.02, `Expected y ~ 0.02 kpc, got ${sgrA[1]}`);
});

test('All real Milky Way star clusters and spiral arm landmarks have finite positions inside Milky Way bounds', () => {
  assert.ok(MILKY_WAY_STAR_CLUSTERS.length >= 8);
  assert.equal(MILKY_WAY_SPIRAL_ARM_LANDMARKS.length, 4);

  const ids = new Set<string>();
  for (const lm of ALL_MILKY_WAY_LANDMARKS) {
    assert.ok(!ids.has(lm.id), `Duplicate landmark id: ${lm.id}`);
    ids.add(lm.id);

    const rGalKpc = Math.hypot(lm.posKpc[0], lm.posKpc[1], lm.posKpc[2]);
    assert.ok(Number.isFinite(rGalKpc) && rGalKpc > 1.0 && rGalKpc < 22.0, `${lm.id} out of Milky Way bounds: ${rGalKpc} kpc`);
    assert.ok(lm.distanceFromSunKpc > 0 && lm.distanceFromSunKpc < 25, `${lm.id} invalid heliocentric dist`);

    for (const lang of LANGS) {
      assert.ok(lm.name[lang].trim().length > 0, `Missing name.${lang} for ${lm.id}`);
      assert.ok(lm.shortName[lang].trim().length > 0, `Missing shortName.${lang} for ${lm.id}`);
      assert.ok(lm.classLabel[lang].trim().length > 0, `Missing classLabel.${lang} for ${lm.id}`);
      assert.ok(lm.description[lang].trim().length > 10, `Missing description.${lang} for ${lm.id}`);
    }
  }
});

test('Clicking any Milky Way landmark resolves directly to its exact galactic position and never falls back to Earth', () => {
  const ephem = computeSolarSystemEphemeris(new Date('2026-11-24T00:00:00Z'));

  for (const lm of ALL_MILKY_WAY_LANDMARKS) {
    assert.equal(getMilkyWayLandmarkById(lm.id)?.id, lm.id);
    const resolved = resolveUniverseTarget(lm.id, ephem, INITIAL_MEMORIES, 'vi');
    assert.equal(resolved.id, lm.id, `Expected target id ${lm.id}, got ${resolved.id}`);
    assert.equal(resolved.position.anchor, 'galactic');
    assert.ok(
      Math.abs(resolved.position.offsetM[0] / KILOPARSEC_METERS - lm.posKpc[0]) < 1e-6,
      `X mismatch for ${lm.id}`
    );
    assert.ok(
      Math.abs(resolved.position.offsetM[1] / KILOPARSEC_METERS - lm.posKpc[1]) < 1e-6,
      `Y mismatch for ${lm.id}`
    );
    assert.ok(
      Math.abs(resolved.position.offsetM[2] / KILOPARSEC_METERS - lm.posKpc[2]) < 1e-6,
      `Z mismatch for ${lm.id}`
    );
    assert.equal(resolved.showSurfaceAltitude, false);
  }
});
