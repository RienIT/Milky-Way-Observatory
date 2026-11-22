import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampTourStopIndex,
  getGuidedTourById,
  getNextTourStopIndex,
  getPrevTourStopIndex,
  GUIDED_TOURS,
} from './guided-tours';
import {
  SOLAR_ECLIPSE_PRESETS,
  WAVELENGTH_BAND_ORDER,
} from './astrophysics-science';
import { INITIAL_MEMORIES } from './mock-memories';
import { SOLAR_SYSTEM_BODIES } from './constants';
import { computeSolarSystemEphemeris } from './ephemeris';
import { resolveUniverseTarget } from './universe-targets';

const SUPPORTED_LANGS = ['en', 'vi', 'ja', 'zh', 'ko'] as const;

test('all guided tours contain valid stops, 5-language copy, and valid catalog/eclipse/wavelength references', () => {
  assert.ok(GUIDED_TOURS.length >= 3, 'Expected at least 3 flagship scientific guided tours');

  const validTargetIds = new Set<string>([
    ...INITIAL_MEMORIES.map((m) => m.id),
    ...Object.keys(SOLAR_SYSTEM_BODIES),
    'BLACK_HOLE_CORE',
  ]);
  const ephemeris = computeSolarSystemEphemeris(new Date('2026-08-12T17:47:00Z'));
  const eclipseIds = new Set(SOLAR_ECLIPSE_PRESETS.map((e) => e.id));
  const validBands = new Set(WAVELENGTH_BAND_ORDER);

  for (const tour of GUIDED_TOURS) {
    assert.ok(tour.stops.length >= 4, `Tour ${tour.id} should have at least 4 stops`);
    assert.equal(getGuidedTourById(tour.id)?.id, tour.id);

    for (const lang of SUPPORTED_LANGS) {
      assert.ok(tour.title[lang].trim().length > 0, `Missing tour title for ${tour.id} (${lang})`);
      assert.ok(
        tour.subtitle[lang].trim().length > 0,
        `Missing tour subtitle for ${tour.id} (${lang})`
      );
    }

    for (const stop of tour.stops) {
      assert.ok(
        validBands.has(stop.wavelengthBand),
        `Invalid wavelength band ${stop.wavelengthBand} in stop ${stop.id}`
      );
      assert.ok(stop.durationSec >= 5 && stop.durationSec <= 30);
      assert.ok(
        Boolean(stop.targetId || stop.presetId || stop.eclipsePresetId),
        `Stop ${stop.id} must specify a targetId, presetId, or eclipsePresetId`
      );
      if (stop.targetId) {
        assert.ok(
          validTargetIds.has(stop.targetId),
          `Unknown catalog targetId ${stop.targetId} in stop ${stop.id}`
        );
        const resolved = resolveUniverseTarget(stop.targetId, ephemeris, INITIAL_MEMORIES, 'en');
        assert.ok(resolved && resolved.label.length > 0, `Failed to resolve ${stop.targetId}`);
        if (stop.targetId !== 'earth') {
          assert.notEqual(
            resolved.id,
            'earth',
            `Stop ${stop.id} targetId ${stop.targetId} unexpectedly fell back to Earth`
          );
        }
      }
      if (stop.eclipsePresetId) {
        assert.ok(
          eclipseIds.has(stop.eclipsePresetId),
          `Unknown eclipsePresetId ${stop.eclipsePresetId} in stop ${stop.id}`
        );
      }
      for (const lang of SUPPORTED_LANGS) {
        assert.ok(stop.title[lang].trim().length > 0, `Missing stop title ${stop.id} (${lang})`);
        assert.ok(
          stop.narrative[lang].trim().length > 20,
          `Missing stop narrative ${stop.id} (${lang})`
        );
      }
    }
  }
});

test('guided tour index stepping clamps safely and supports optional wrap-around', () => {
  const tour = getGuidedTourById('powers-of-ten');
  assert.ok(tour);
  const last = tour.stops.length - 1;

  assert.equal(clampTourStopIndex(tour, -5), 0);
  assert.equal(clampTourStopIndex(tour, 999), last);
  assert.equal(getNextTourStopIndex(tour, 0), 1);
  assert.equal(getNextTourStopIndex(tour, last, false), last);
  assert.equal(getNextTourStopIndex(tour, last, true), 0);
  assert.equal(getPrevTourStopIndex(tour, 0), 0);
  assert.equal(getPrevTourStopIndex(tour, 2), 1);
  assert.equal(getGuidedTourById('non-existent'), null);
});
