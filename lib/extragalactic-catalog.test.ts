import test from 'node:test';
import assert from 'node:assert/strict';

import { KILOPARSEC_METERS, MEGAPARSEC_METERS } from './constants';
import {
  EXTRAGALACTIC_CATALOG,
  getExtragalacticPosThreeM,
  getExtragalacticRadiusM,
} from './extragalactic-catalog';
import { lengthVec3d } from './scale-engine';

test('Local Group & Galaxy Cluster distances match McConnachie (2012) and NED within tight tolerances', () => {
  const byId = new Map(EXTRAGALACTIC_CATALOG.map((e) => [e.id, e]));

  const lmc = byId.get('lmc');
  const m31 = byId.get('m31');
  const m33 = byId.get('m33');
  const virgo = byId.get('virgo-cluster');
  const coma = byId.get('coma-cluster');

  assert.ok(lmc && m31 && m33 && virgo && coma);

  // LMC ~50 kpc
  const lmcKpc = lengthVec3d(getExtragalacticPosThreeM(lmc)) / KILOPARSEC_METERS;
  assert.ok(lmcKpc > 44 && lmcKpc < 56, `Expected LMC ~50 kpc from GC, got ${lmcKpc}`);

  // M31 Andromeda ~778 kpc (0.778 Mpc)
  const m31Kpc = lengthVec3d(getExtragalacticPosThreeM(m31)) / KILOPARSEC_METERS;
  assert.ok(m31Kpc > 765 && m31Kpc < 795, `Expected M31 ~778 kpc, got ${m31Kpc}`);

  // Virgo Cluster ~16.5 Mpc
  const virgoMpc = lengthVec3d(getExtragalacticPosThreeM(virgo)) / MEGAPARSEC_METERS;
  assert.ok(Math.abs(virgoMpc - 16.5) < 0.1, `Expected Virgo ~16.5 Mpc, got ${virgoMpc}`);

  // Coma Cluster ~99 Mpc
  const comaMpc = lengthVec3d(getExtragalacticPosThreeM(coma)) / MEGAPARSEC_METERS;
  assert.ok(Math.abs(comaMpc - 99.0) < 0.2, `Expected Coma ~99 Mpc, got ${comaMpc}`);

  // Provenance integrity: positions are measured (false), procedural sprites are illustrative (true)
  for (const entry of EXTRAGALACTIC_CATALOG) {
    assert.equal(entry.positionIllustrative, false);
    assert.equal(entry.morphologyIllustrative, true);
    assert.ok(entry.source.length > 8);
    const pos = getExtragalacticPosThreeM(entry);
    assert.ok(pos.every((c) => Number.isFinite(c)));
    assert.ok(getExtragalacticRadiusM(entry) > 0);
  }
});
