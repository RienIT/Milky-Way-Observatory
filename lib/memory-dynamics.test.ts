import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_MEMORIES } from './mock-memories';
import { ALL_CATEGORIES, MemoryNode } from './memory-types';
import { computeSolarSystemEphemeris } from './ephemeris';
import {
  MEMORY_TRAIL_POINTS,
  MEMORY_TRAIL_SEGMENTS,
  MemoryClusterSimulation,
  packMemoryTrailsToLineSegments,
  SOLAR_TRAIL_POINTS,
  SolarOrbitalWakeTracker,
} from './memory-dynamics';

test('MemoryClusterSimulation initializes all 48 catalog memories with finite galactic coordinates and trail buffers', () => {
  const sim = new MemoryClusterSimulation(INITIAL_MEMORIES);
  assert.equal(sim.nodes.length, 48);

  const metrics = sim.computeClusterMetrics();
  assert.equal(metrics.clusters.length, ALL_CATEGORIES.length);

  for (const nd of sim.nodes) {
    assert.equal(nd.trailKpc.length, MEMORY_TRAIL_POINTS);
    for (const v of nd.posKpc) {
      assert.ok(Number.isFinite(v), `Non-finite position for ${nd.id}`);
    }
    for (const c of nd.colorRgb) {
      assert.ok(c >= 0 && c <= 1, `Color channel out of range for ${nd.id}`);
    }
  }
});

test('Gravitational clustering drifts same-category memory nodes into distinct, cohesive 3D star clusters without collapsing', () => {
  const sim = new MemoryClusterSimulation(INITIAL_MEMORIES);
  const initialMetrics = sim.computeClusterMetrics();

  // Run 120 simulation steps (~6 simulated seconds) with clustering enabled
  for (let i = 0; i < 120; i += 1) {
    sim.step({
      dtSec: 0.05,
      clusteringEnabled: true,
      orbitalSpeedScale: 1.0,
      recordTrail: true,
    });
  }

  const clusteredMetrics = sim.computeClusterMetrics();

  // Intra-category spread must strictly decrease as same-category nodes drift together
  assert.ok(
    clusteredMetrics.meanIntraCategoryDistKpc < initialMetrics.meanIntraCategoryDistKpc * 0.65,
    `Expected intra-category spread to shrink significantly: initial=${initialMetrics.meanIntraCategoryDistKpc.toFixed(2)} kpc, clustered=${clusteredMetrics.meanIntraCategoryDistKpc.toFixed(2)} kpc`
  );

  // Inter-to-intra cohesion ratio must rise sharply (> 3.5 = visually distinct star clusters)
  assert.ok(
    clusteredMetrics.cohesionRatio > initialMetrics.cohesionRatio * 1.8 &&
      clusteredMetrics.cohesionRatio > 3.5,
    `Expected high cluster cohesion ratio: initial=${initialMetrics.cohesionRatio.toFixed(2)}, clustered=${clusteredMetrics.cohesionRatio.toFixed(2)}`
  );

  // Verify short-range repulsion prevents overlapping collapse inside every cluster
  for (let i = 0; i < sim.nodes.length; i += 1) {
    for (let j = i + 1; j < sim.nodes.length; j += 1) {
      const a = sim.nodes[i];
      const b = sim.nodes[j];
      const d = Math.hypot(
        b.posKpc[0] - a.posKpc[0],
        b.posKpc[1] - a.posKpc[1],
        b.posKpc[2] - a.posKpc[2]
      );
      assert.ok(d > 0.08, `Nodes ${a.id} and ${b.id} collapsed too close (${d.toFixed(4)} kpc)`);
    }
  }
});

test('Disabling gravitational clustering smoothly relaxes nodes back toward their orbital paths with curved fading trails', () => {
  const sim = new MemoryClusterSimulation(INITIAL_MEMORIES);
  sim.prewarm(60, true, 0.05);
  const clusteredMetrics = sim.computeClusterMetrics();

  // Turn clustering OFF and step 120 frames
  for (let i = 0; i < 120; i += 1) {
    sim.step({
      dtSec: 0.05,
      clusteringEnabled: false,
      orbitalSpeedScale: 1.0,
      recordTrail: true,
    });
  }

  const relaxedMetrics = sim.computeClusterMetrics();
  assert.ok(
    relaxedMetrics.meanIntraCategoryDistKpc > clusteredMetrics.meanIntraCategoryDistKpc * 1.35,
    `Expected nodes to relax apart when clustering is OFF: clustered=${clusteredMetrics.meanIntraCategoryDistKpc.toFixed(2)}, relaxed=${relaxedMetrics.meanIntraCategoryDistKpc.toFixed(2)}`
  );

  // Verify every node has a non-degenerate, finite moving trajectory trail
  let movedTrails = 0;
  for (const nd of sim.nodes) {
    const tail = nd.trailKpc[0];
    const head = nd.trailKpc[nd.trailKpc.length - 1];
    const span = Math.hypot(head[0] - tail[0], head[1] - tail[1], head[2] - tail[2]);
    assert.ok(Number.isFinite(span), `Trail span NaN for ${nd.id}`);
    if (span > 0.05) movedTrails += 1;
  }
  assert.equal(movedTrails, sim.nodes.length, 'Every moving memory node should trace a visible trail');
});

test('packMemoryTrailsToLineSegments packs monotonic 0->1 fade progress and respects search filter dimming', () => {
  const sim = new MemoryClusterSimulation(INITIAL_MEMORIES.slice(0, 6));
  sim.prewarm(25, true, 0.05);

  const maxVerts = sim.nodes.length * MEMORY_TRAIL_SEGMENTS * 2;
  const posArr = new Float32Array(maxVerts * 3);
  const colArr = new Float32Array(maxVerts * 3);
  const progArr = new Float32Array(maxVerts);

  const matched = new Set([sim.nodes[0].id]);
  const vertCount = packMemoryTrailsToLineSegments(
    sim.nodes,
    posArr,
    colArr,
    progArr,
    matched,
    sim.nodes[0].id
  );

  assert.equal(vertCount, maxVerts);
  // First segment starts at 0.0 (tail), final segment of first node ends at 1.0 (head)
  assert.equal(progArr[0], 0);
  const firstNodeEndVert = MEMORY_TRAIL_SEGMENTS * 2 - 1;
  assert.ok(Math.abs(progArr[firstNodeEndVert] - 1.0) < 1e-6);

  // Selected matched node 0 should be brighter than dimmed unmatched node 1
  const lum0 = colArr[0] + colArr[1] + colArr[2];
  const node1Offset = MEMORY_TRAIL_SEGMENTS * 2 * 3;
  const lum1 = colArr[node1Offset] + colArr[node1Offset + 1] + colArr[node1Offset + 2];
  assert.ok(lum0 > lum1 * 2.0, `Expected matched/selected node trail (${lum0}) brighter than dimmed (${lum1})`);
});

test('syncMemories dynamically integrates custom AI-simulated worlds while preserving existing node trails', () => {
  const sim = new MemoryClusterSimulation(INITIAL_MEMORIES);
  sim.prewarm(20, true, 0.05);
  const rigelBefore = sim.getNodeById('star-rigel');
  assert.ok(rigelBefore);
  const rigelTrailHeadBefore = [...rigelBefore.trailKpc[rigelBefore.trailKpc.length - 1]];

  const customWorld: MemoryNode = {
    id: 'custom-nebula-world-99',
    title: 'Aetheris Prime — AI Simulated Ocean World',
    category: 'Hành tinh Đại dương & Sự sống',
    summary: ['Deep liquid ocean', 'Dense N2/O2 sky', 'Active plate tectonics'],
    tags: ['ocean', 'exoplanet', 'custom'],
    content: 'Custom user-created AI simulated world.',
    createdAt: '2026-11-21',
    orbitRadius: 42,
    orbitAngle: 1.1,
    orbitSpeed: 0.12,
    orbitTilt: 0.14,
    position: [0, 0, 0],
    starSize: 0.9,
  };

  sim.syncMemories([...INITIAL_MEMORIES, customWorld]);
  assert.equal(sim.nodes.length, 49);
  assert.ok(sim.getNodeById('custom-nebula-world-99'));

  const rigelAfter = sim.getNodeById('star-rigel');
  assert.deepEqual(
    rigelAfter?.trailKpc[rigelAfter.trailKpc.length - 1],
    rigelTrailHeadBefore
  );
});

test('SolarOrbitalWakeTracker samples real historical ephemeris wakes and advances cleanly over time', () => {
  const tracker = new SolarOrbitalWakeTracker();
  const t0 = Date.UTC(2026, 10, 21, 12, 0, 0);
  const snap0 = computeSolarSystemEphemeris(new Date(t0));
  const wakes0 = tracker.update(t0, snap0);

  assert.equal(wakes0.length, 11);
  const earthWake = wakes0.find((w) => w.id === 'earth');
  assert.ok(earthWake);
  assert.equal(earthWake.pointsM.length, SOLAR_TRAIL_POINTS);

  // Tail and head of Earth's 88-day orbital wake must be separated by millions of km (~1.3 AU chord!)
  const tail = earthWake.pointsM[0];
  const head = earthWake.pointsM[earthWake.pointsM.length - 1];
  const chordM = Math.hypot(head[0] - tail[0], head[1] - tail[1], head[2] - tail[2]);
  assert.ok(chordM > 1e11, `Expected Earth orbital wake > 1e11 m, got ${chordM}`);

  // Advance by 5 days and verify head tracks new live ephemeris position
  const t1 = t0 + 5 * 86400 * 1000;
  const snap1 = computeSolarSystemEphemeris(new Date(t1));
  const wakes1 = tracker.update(t1, snap1);
  const earthAfter = wakes1.find((w) => w.id === 'earth')!;
  const newHead = earthAfter.pointsM[earthAfter.pointsM.length - 1];
  assert.deepEqual(newHead, snap1.bodies.earth.helioPosM);
});
