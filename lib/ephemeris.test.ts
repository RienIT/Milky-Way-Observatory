import test from 'node:test';
import assert from 'node:assert/strict';

import {
  AU_IN_METERS,
  EARTH_MEAN_RADIUS_M,
  EARTH_MOON_MEAN_DISTANCE_M,
  KILOPARSEC_METERS,
  MOON_MEAN_RADIUS_M,
  SOLAR_SYSTEM_BODIES,
} from './constants';
import {
  computeEclipticToGalacticTiltDeg,
  computeSolarSystemEphemeris,
  EQJ_TO_GALACTIC_MATRIX,
  sampleOrbitCurveHelioM,
  SUN_GALACTOCENTRIC_THREE_M,
} from './ephemeris';
import { lengthVec3d } from './scale-engine';

test('EQJ-to-Galactic matrix is strictly orthogonal (R^T R = I, det = +1) and gives ~60.19 deg ecliptic tilt', () => {
  const M = EQJ_TO_GALACTIC_MATRIX;
  for (let i = 0; i < 3; i += 1) {
    for (let j = 0; j < 3; j += 1) {
      const dot = M[i][0] * M[j][0] + M[i][1] * M[j][1] + M[i][2] * M[j][2];
      const expected = i === j ? 1 : 0;
      assert.ok(Math.abs(dot - expected) < 1e-12, `Row ${i}·Row ${j} = ${dot}`);
    }
  }
  const det =
    M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) -
    M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) +
    M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
  assert.ok(Math.abs(det - 1) < 1e-12, `Expected det = +1, got ${det}`);

  const tiltDeg = computeEclipticToGalacticTiltDeg();
  assert.ok(
    Math.abs(tiltDeg - 60.189) < 0.05,
    `Expected Ecliptic-to-Galactic tilt ~60.189 deg, got ${tiltDeg}`
  );
});

test('Sun-to-Sgr A* Galactocentric distance matches GRAVITY (2019) 8.178 kpc', () => {
  const distKpc = lengthVec3d(SUN_GALACTOCENTRIC_THREE_M) / KILOPARSEC_METERS;
  assert.ok(
    Math.abs(distKpc - 8.178) < 0.01,
    `Expected Sun-Sgr A* ~8.178 kpc, got ${distKpc}`
  );
});

test('Real Solar System ephemeris gives accurate planetary & lunar distances for J2000 and 2026 dates', () => {
  // 2026-01-03 (near Earth perihelion ~0.9833 AU) and 2026-07-06 (near Earth aphelion ~1.0167 AU)
  const periSnap = computeSolarSystemEphemeris(new Date('2026-01-03T12:00:00Z'));
  const aphSnap = computeSolarSystemEphemeris(new Date('2026-07-06T12:00:00Z'));

  const earthPeriAu = periSnap.bodies.earth.distanceFromParentM / AU_IN_METERS;
  const earthAphAu = aphSnap.bodies.earth.distanceFromParentM / AU_IN_METERS;

  assert.ok(
    earthPeriAu > 0.98 && earthPeriAu < 0.987,
    `Expected Earth perihelion ~0.983 AU, got ${earthPeriAu}`
  );
  assert.ok(
    earthAphAu > 1.013 && earthAphAu < 1.02,
    `Expected Earth aphelion ~1.017 AU, got ${earthAphAu}`
  );

  // Moon distance within real perigee–apogee envelope (356,400 – 406,700 km)
  const moonDistM = periSnap.bodies.moon.distanceFromParentM;
  assert.ok(
    moonDistM > 350_000_000 && moonDistM < 412_000_000,
    `Expected Moon distance near ${EARTH_MOON_MEAN_DISTANCE_M} m, got ${moonDistM}`
  );
  assert.ok(periSnap.moonPhaseFraction >= 0 && periSnap.moonPhaseFraction <= 1);
  assert.equal(periSnap.bodies.earth.radiusM, EARTH_MEAN_RADIUS_M);
  assert.equal(periSnap.bodies.moon.radiusM, MOON_MEAN_RADIUS_M);

  // All Solar System bodies finite and in physically valid ranges
  const expectedIds = [
    'sun',
    'mercury',
    'venus',
    'earth',
    'moon',
    'mars',
    'ceres',
    'jupiter',
    'io',
    'europa',
    'ganymede',
    'callisto',
    'saturn',
    'titan',
    'enceladus',
    'uranus',
    'neptune',
    'triton',
    'pluto',
  ];

  for (const id of expectedIds) {
    const b = periSnap.bodies[id];
    assert.ok(b, `Missing body ${id}`);
    assert.ok(
      b.helioPosM.every((c) => Number.isFinite(c)),
      `Non-finite coordinates on ${id}`
    );
    assert.equal(b.illustrative, false);
    if (id !== 'sun') {
      const expectedDist = SOLAR_SYSTEM_BODIES[id].semiMajorAxisM;
      const ratio = b.distanceFromParentM / expectedDist;
      assert.ok(
        ratio > 0.65 && ratio < 1.4,
        `Body ${id} distance ratio ${ratio} out of realistic orbital envelope`
      );
    }
  }

  // Orbit sampling produces finite closed curves
  const earthOrbit = sampleOrbitCurveHelioM('earth', new Date('2026-01-03T12:00:00Z'), 32);
  assert.equal(earthOrbit.length, 33);
  assert.ok(earthOrbit.every((p) => p.every((c) => Number.isFinite(c))));
});
