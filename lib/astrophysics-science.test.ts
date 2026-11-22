import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeLunarShadowOnEarth,
  computePhotonPulseRadiusM,
  computeStarHrPoint,
  formatLightTravelTime,
  getLatestPhotonMilestone,
  HR_BENCHMARK_STARS,
  kelvinToBlackbodyHex,
  parseObservatoryHash,
  parseSurfaceTemperatureK,
  sampleNormalizedPlanckCurve,
  serializeObservatoryHash,
  SOLAR_ECLIPSE_PRESETS,
  SPEED_OF_LIGHT_MPS,
  WAVELENGTH_BAND_ORDER,
  WAVELENGTH_BAND_SPECS,
  wienPeakWavelengthNm,
} from './astrophysics-science';
import { AU_IN_METERS } from './constants';
import { computeSolarSystemEphemeris } from './ephemeris';
import { LanguageCode } from './i18n';

test('4-band multi-wavelength dictionary covers all 5 languages completely', () => {
  const langs: LanguageCode[] = ['en', 'vi', 'ja', 'zh', 'ko'];
  assert.equal(WAVELENGTH_BAND_ORDER.length, 4);
  for (const band of WAVELENGTH_BAND_ORDER) {
    const spec = WAVELENGTH_BAND_SPECS[band];
    assert.ok(spec.wavelengthRange.length > 0);
    assert.ok(spec.observatoryRef.length > 0);
    for (const lang of langs) {
      assert.ok(spec.labels[lang].trim().length > 0);
      assert.ok(spec.shortLabels[lang].trim().length > 0);
      assert.ok(spec.descriptions[lang].trim().length > 0);
    }
  }
});

test('real ephemeris detects active lunar shadow on Earth during the 2026-08-12 and 2027-08-02 total solar eclipses', () => {
  for (const preset of SOLAR_ECLIPSE_PRESETS) {
    const ephem = computeSolarSystemEphemeris(new Date(preset.dateMs));
    const earth = ephem.bodies.earth.helioPosM;
    const moon = ephem.bodies.moon.helioPosM;
    const shadow = computeLunarShadowOnEarth(earth, moon, [0, 0, 0]);
    assert.equal(
      shadow.isActive,
      true,
      `Expected active solar eclipse shadow on ${preset.isoUtc}, got impact=${shadow.shadowAxisImpactEarthRadii.toFixed(2)} R_earth`
    );
    assert.ok(
      shadow.alignmentAngleDeg < 1.2,
      `Expected Sun-Moon alignment < 1.2 deg on ${preset.isoUtc}, got ${shadow.alignmentAngleDeg.toFixed(3)} deg`
    );
  }

  // Non-eclipse date (full moon 14 days later) must not report an eclipse
  const nonEclipseEphem = computeSolarSystemEphemeris(new Date('2026-08-26T12:00:00Z'));
  const nonShadow = computeLunarShadowOnEarth(
    nonEclipseEphem.bodies.earth.helioPosM,
    nonEclipseEphem.bodies.moon.helioPosM,
    [0, 0, 0]
  );
  assert.equal(nonShadow.isActive, false);
});

test('speed-of-light photon pulse reaches Earth (~1 AU) in ~499 seconds and formats milestones cleanly', () => {
  const rAtEarthTime = computePhotonPulseRadiusM(499.005);
  assert.ok(
    Math.abs(rAtEarthTime - AU_IN_METERS) / AU_IN_METERS < 0.002,
    `Expected c * 499s ~= 1 AU, got ${rAtEarthTime / AU_IN_METERS} AU`
  );
  assert.equal(computePhotonPulseRadiusM(1), SPEED_OF_LIGHT_MPS);
  assert.equal(formatLightTravelTime(500), '8m 20s');
  assert.equal(formatLightTravelTime(3660), '1h 01m');
  assert.equal(getLatestPhotonMilestone(1.05 * AU_IN_METERS)?.id, 'earth');
  assert.equal(getLatestPhotonMilestone(0.1 * AU_IN_METERS), null);
});

test('blackbody physics, Wien displacement law, and H-R diagram loci match astrophysics', () => {
  assert.equal(parseSurfaceTemperatureK('5,778 K'), 5778);
  assert.equal(parseSurfaceTemperatureK('12.100 K'), 12100);
  assert.equal(parseSurfaceTemperatureK('5.778 K (quang cầu)'), 5778);
  assert.equal(parseSurfaceTemperatureK('15 °C'), 288.15);
  assert.equal(parseSurfaceTemperatureK('-180 °C'), 93.15);

  // Sun peaks in green-visible ~501.5 nm
  const sunPeak = wienPeakWavelengthNm(5778);
  assert.ok(sunPeak > 495 && sunPeak < 508, `Sun Wien peak should be ~501.5 nm, got ${sunPeak}`);

  // Hot blue Rigel lies left & above cool red Betelgeuse on the H-R diagram
  const rigel = computeStarHrPoint('star-rigel', 'Rigel', 12100, 8600);
  const betelgeuse = computeStarHrPoint('star-betelgeuse', 'Betelgeuse', 3600, 83500);
  const sun = computeStarHrPoint('star-sun', 'Sun', 5778, 109.1);
  assert.ok(rigel.normX < sun.normX && sun.normX < betelgeuse.normX);
  assert.ok(rigel.normY < sun.normY && betelgeuse.normY < sun.normY);

  // Planck curve normalizes to 1.0 peak and blackbody hex is valid
  const curve = sampleNormalizedPlanckCurve(5778, [300, 500, 700, 1200, 2000]);
  assert.equal(Math.max(...curve), 1);
  assert.match(kelvinToBlackbodyHex(12100), /^#[0-9a-f]{6}$/);
  assert.ok(HR_BENCHMARK_STARS.length >= 10);
});

test('URL deep-link hash codec round-trips safely and rejects unsafe values', () => {
  const hash = serializeObservatoryHash({
    target: 'saturn',
    band: 'xray',
    dateIso: '2026-08-12T17:47:06Z',
    logDist: 10.45,
  });
  const parsed = parseObservatoryHash(hash);
  assert.equal(parsed.target, 'saturn');
  assert.equal(parsed.band, 'xray');
  assert.equal(parsed.dateIso, '2026-08-12T17:47:06Z');
  assert.equal(parsed.logDist, 10.45);

  const sanitized = parseObservatoryHash('#target=<script>&band=invalid&logd=999');
  assert.equal(sanitized.target, undefined);
  assert.equal(sanitized.band, undefined);
  assert.equal(sanitized.logDist, undefined);
});
