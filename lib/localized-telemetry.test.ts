import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SOLAR_ECLIPSE_PRESETS } from './astrophysics-science';
import { getBootCopy } from './boot-sequence';
import { getLocalizedNode } from './celestial-translations';
import { GUIDED_TOURS } from './guided-tours';
import { LanguageCode, UI_STRINGS } from './i18n';
import {
  getLocalizedOrbitalPeriod,
  getLocalizedPlanetSpec,
  OBSERVATORY_EXTRA_COPY,
} from './localized-telemetry';
import { MemoryNode } from './memory-types';
import { MILKY_WAY_I18N } from './milky-way-i18n';
import { INITIAL_MEMORIES } from './mock-memories';
import { getScientificAstrometry } from './scientific-catalog';
import { UNIVERSE_HUD_COPY } from './universe-i18n';

// Matches any Vietnamese-specific accented character or đ/Đ
const VIETNAMESE_DIACRITIC_RE =
  /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/;

// Common unaccented or signature Vietnamese words that must never appear in non-VI telemetry
const VIETNAMESE_WORD_RE =
  /\b(hành tinh|ngôi sao|thiên hà|vệ tinh|hố đen|chòm sao|quỹ đạo|hệ mặt trời|chu kỳ|khí quyển|đường kính|nhiệt độ|trái đất|sao mộc|sao thổ|sao hỏa|sao kim|sao thủy|quang cầu|triệu km|tỷ km|cận nhật|tự quay)\b/i;

const NON_VI_LANGS: readonly Exclude<LanguageCode, 'vi'>[] = [
  'en',
  'ja',
  'zh',
  'ko',
];

function assertNoVietnamese(text: string, context: string) {
  assert.equal(
    VIETNAMESE_DIACRITIC_RE.test(text),
    false,
    `Vietnamese diacritic leaked in ${context}: "${text}"`
  );
  assert.equal(
    VIETNAMESE_WORD_RE.test(text),
    false,
    `Vietnamese phrase leaked in ${context}: "${text}"`
  );
}

describe('5-Language Localization Purity (Zero Vietnamese Leaks)', () => {
  it('translates all 48 catalog objects planet specs & orbital periods cleanly in en, ja, zh, ko', () => {
    assert.equal(INITIAL_MEMORIES.length, 48);

    for (const lang of NON_VI_LANGS) {
      for (const node of INITIAL_MEMORIES) {
        const loc = getLocalizedNode(node, lang);
        assertNoVietnamese(loc.title, `${lang}:${node.id}.title`);
        assertNoVietnamese(loc.createdAt, `${lang}:${node.id}.createdAt`);
        assertNoVietnamese(loc.content, `${lang}:${node.id}.content`);
        loc.summary.forEach((s, idx) =>
          assertNoVietnamese(s, `${lang}:${node.id}.summary[${idx}]`)
        );

        const spec = getLocalizedPlanetSpec(node, lang);
        assertNoVietnamese(spec.designation, `${lang}:${node.id}.spec.designation`);
        assertNoVietnamese(spec.planetType, `${lang}:${node.id}.spec.planetType`);
        assertNoVietnamese(spec.diameterKm, `${lang}:${node.id}.spec.diameterKm`);
        assertNoVietnamese(spec.surfaceTemp, `${lang}:${node.id}.spec.surfaceTemp`);
        assertNoVietnamese(spec.surfaceGravity, `${lang}:${node.id}.spec.surfaceGravity`);
        assertNoVietnamese(
          spec.atmosphereComposition,
          `${lang}:${node.id}.spec.atmosphereComposition`
        );
        assertNoVietnamese(spec.realInspiration, `${lang}:${node.id}.spec.realInspiration`);

        const astro = getScientificAstrometry(node.id, spec.earthRadiusRatio);
        const period = getLocalizedOrbitalPeriod(
          node.id,
          astro.orbitalPeriodLabel,
          lang
        );
        assertNoVietnamese(period, `${lang}:${node.id}.astrometry.orbitalPeriod`);
        assertNoVietnamese(astro.massLabel, `${lang}:${node.id}.astrometry.mass`);
        assertNoVietnamese(astro.spectralOrType, `${lang}:${node.id}.astrometry.spectral`);
        assertNoVietnamese(astro.sourceCitation, `${lang}:${node.id}.astrometry.source`);
      }
    }
  });

  it('translates custom user-created worlds with zero Vietnamese fallback leaks', () => {
    const customNode: MemoryNode = {
      id: 'astro-custom-999999',
      title: 'Aurelia Prime',
      category: 'Hành tinh Đại dương & Sự sống',
      summary: ['Deep liquid ocean', 'Dense nitrogen sky', 'Warm temperate equator'],
      tags: ['Ocean', 'Custom'],
      content: 'Synthesized pelagic exoplanet orbiting a K-dwarf host.',
      createdAt: '2026-11-22',
      orbitRadius: 14,
      orbitSpeed: 0.12,
      orbitAngle: 1.2,
      orbitTilt: 0.08,
      position: [10, 0.2, 10],
      starSize: 1.1,
    };

    for (const lang of NON_VI_LANGS) {
      const spec = getLocalizedPlanetSpec(customNode, lang);
      assertNoVietnamese(spec.designation, `${lang}:custom.designation`);
      assertNoVietnamese(spec.planetType, `${lang}:custom.planetType`);
      assertNoVietnamese(spec.diameterKm, `${lang}:custom.diameterKm`);
      assertNoVietnamese(spec.surfaceTemp, `${lang}:custom.surfaceTemp`);
      assertNoVietnamese(spec.surfaceGravity, `${lang}:custom.surfaceGravity`);
      assertNoVietnamese(spec.atmosphereComposition, `${lang}:custom.atmosphere`);
      assertNoVietnamese(spec.realInspiration, `${lang}:custom.inspiration`);

      const astro = getScientificAstrometry(customNode.id, spec.earthRadiusRatio);
      const period = getLocalizedOrbitalPeriod(
        customNode.id,
        astro.orbitalPeriodLabel,
        lang
      );
      assertNoVietnamese(period, `${lang}:custom.period`);
    }
  });

  it('keeps all HUD, UI_STRINGS, MILKY_WAY_I18N, boot, tours, eclipses, and extra labels leak-free', () => {
    const walk = (prefix: string, value: unknown) => {
      if (typeof value === 'string') {
        assertNoVietnamese(value, prefix);
      } else if (Array.isArray(value)) {
        value.forEach((v, i) => walk(`${prefix}[${i}]`, v));
      } else if (value && typeof value === 'object') {
        for (const [k, v] of Object.entries(value)) {
          // Skip internal MemoryCategory enum reference keys in modalPresets
          if (k === 'category') continue;
          walk(`${prefix}.${k}`, v);
        }
      }
    };

    for (const lang of NON_VI_LANGS) {
      walk(`UI_STRINGS.${lang}`, UI_STRINGS[lang]);
      walk(`MILKY_WAY_I18N.${lang}`, MILKY_WAY_I18N[lang]);
      walk(`UNIVERSE_HUD_COPY.${lang}`, UNIVERSE_HUD_COPY[lang]);
      walk(`OBSERVATORY_EXTRA_COPY.${lang}`, OBSERVATORY_EXTRA_COPY[lang]);
      walk(`BOOT.${lang}`, getBootCopy(lang));
      for (const tour of GUIDED_TOURS) {
        assertNoVietnamese(tour.title[lang], `tour.${lang}.${tour.id}.title`);
        assertNoVietnamese(tour.subtitle[lang], `tour.${lang}.${tour.id}.subtitle`);
        for (const stop of tour.stops) {
          assertNoVietnamese(stop.title[lang], `tour.${lang}.${stop.id}.title`);
          assertNoVietnamese(stop.narrative[lang], `tour.${lang}.${stop.id}.narrative`);
        }
      }
      for (const eclipse of SOLAR_ECLIPSE_PRESETS) {
        assertNoVietnamese(eclipse.region[lang], `eclipse.${lang}.${eclipse.id}`);
      }
    }
  });

  it('preserves authentic Vietnamese telemetry when lang === "vi"', () => {
    const sun = INITIAL_MEMORIES.find((m) => m.id === 'star-sol')!;
    const specVi = getLocalizedPlanetSpec(sun, 'vi');
    assert.ok(specVi.planetType.includes('Hệ Mặt Trời'));
    assert.ok(specVi.surfaceTemp.includes('quang cầu'));
  });
});
