import assert from 'node:assert/strict';
import test from 'node:test';
import { SOLAR_ECLIPSE_PRESETS } from './astrophysics-science';
import {
  computeCircleObscuration,
  computeEclipseTelemetry,
  ECLIPSE_STUDIO_COPY,
  formatEclipseOffset,
  sampleEclipsePathBodyFixedDirs,
} from './eclipse-studio';
import { LanguageCode } from './i18n';

const VIETNAMESE_DIACRITICS =
  /[ăâđêôơưĂÂĐÊÔƠƯáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/;

test('SOLAR_ECLIPSE_PRESETS exposes 5 real total solar eclipses', () => {
  assert.equal(SOLAR_ECLIPSE_PRESETS.length, 5);
  for (const preset of SOLAR_ECLIPSE_PRESETS) {
    assert.ok(Number.isFinite(preset.dateMs));
    assert.ok(preset.durationSec >= 120);
  }
});

test('computeCircleObscuration reaches 0 outside contact and 1 inside totality', () => {
  assert.equal(computeCircleObscuration(2.2, 1.05), 0);
  assert.equal(computeCircleObscuration(0, 1.05), 1);
  assert.equal(computeCircleObscuration(0.03, 1.05), 1);
  const half = computeCircleObscuration(1.0, 1.0);
  assert.ok(half > 0.35 && half < 0.45, `Expected partial overlap ~0.39, got ${half}`);
});

test('computeEclipseTelemetry transitions smoothly through C1 -> C2 -> Totality -> C3 -> C4', () => {
  const luxor = SOLAR_ECLIPSE_PRESETS.find((p) => p.id === 'eclipse-2027')!;
  const maxState = computeEclipseTelemetry(luxor, 0);
  assert.equal(maxState.phase, 'totality');
  assert.equal(maxState.obscurationPct, 100);
  assert.ok(maxState.magnitude > 1.02);
  assert.ok(maxState.coronaIntensity > 0.85);
  assert.ok(maxState.skyLuminance < 0.05);

  // Diamond ring peaks right near C2 and C3
  const c2Ring = computeEclipseTelemetry(luxor, maxState.contacts.c2 - 6);
  assert.equal(c2Ring.phase, 'c2-diamond-ring');
  assert.ok(c2Ring.diamondRingIntensity > 0.8);
  assert.ok(c2Ring.bailysBeadsIntensity > 0.5);

  const c3Ring = computeEclipseTelemetry(luxor, maxState.contacts.c3 + 6);
  assert.equal(c3Ring.phase, 'c3-diamond-ring');
  assert.ok(c3Ring.diamondRingIntensity > 0.8);

  // Mid partial ingress
  const partial = computeEclipseTelemetry(luxor, -2200);
  assert.equal(partial.phase, 'c1-ingress');
  assert.ok(partial.obscurationPct > 25 && partial.obscurationPct < 80);

  // Outside C1 / C4
  const pre = computeEclipseTelemetry(luxor, -5200);
  assert.equal(pre.phase, 'pre');
  assert.equal(pre.obscurationPct, 0);

  const post = computeEclipseTelemetry(luxor, 5200);
  assert.equal(post.phase, 'post');
  assert.equal(post.obscurationPct, 0);
});

test('sampleEclipsePathBodyFixedDirs generates finite unit vectors on Earth for every eclipse preset', () => {
  for (const preset of SOLAR_ECLIPSE_PRESETS) {
    const pts = sampleEclipsePathBodyFixedDirs(preset, 32);
    assert.ok(pts.length >= 6, `Expected >= 6 path points for ${preset.id}, got ${pts.length}`);
    for (const [x, y, z] of pts) {
      const len = Math.hypot(x, y, z);
      assert.ok(Math.abs(len - 1.0) < 1e-4, `Expected unit vector, got len=${len}`);
    }
  }
});

test('formatEclipseOffset formats positive and negative timestamps clearly', () => {
  assert.equal(formatEclipseOffset(0), 'T+00:00');
  assert.equal(formatEclipseOffset(-125), 'T-02:05');
  assert.equal(formatEclipseOffset(3661), 'T+1:01:01');
});

test('ECLIPSE_STUDIO_COPY has complete 5-language coverage and zero Vietnamese leaks in non-vi locales', () => {
  const langs: LanguageCode[] = ['en', 'vi', 'ja', 'zh', 'ko'];
  for (const lang of langs) {
    const copy = ECLIPSE_STUDIO_COPY[lang];
    assert.ok(copy.studioTitle.length > 0);
    if (lang !== 'vi') {
      const serialized = JSON.stringify(copy);
      assert.ok(
        !VIETNAMESE_DIACRITICS.test(serialized),
        `Found Vietnamese leak in ECLIPSE_STUDIO_COPY.${lang}`
      );
    }
  }
});
