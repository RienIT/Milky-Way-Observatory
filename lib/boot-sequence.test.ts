import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceBootState,
  BOOT_COPY,
  BOOT_MILESTONES,
  BOOT_STAGE_ORDER,
  BOOT_STAGE_PROGRESS,
  createInitialBootState,
  getBootCopy,
  getBootMilestoneStatus,
  isBootReady,
} from './boot-sequence';
import { LanguageCode } from './i18n';

test('boot sequence advances monotonically from bundle to ready', () => {
  let state = createInitialBootState('bundle');
  assert.equal(state.stage, 'bundle');
  assert.equal(state.progress, BOOT_STAGE_PROGRESS.bundle);
  assert.equal(isBootReady(state), false);

  let prevProgress = state.progress;
  for (const stage of BOOT_STAGE_ORDER.slice(1)) {
    state = advanceBootState(state, stage);
    assert.equal(state.stage, stage);
    assert.ok(
      state.progress > prevProgress,
      `Expected progress to increase at stage ${stage}: ${state.progress} > ${prevProgress}`
    );
    prevProgress = state.progress;
  }

  assert.equal(state.progress, 100);
  assert.equal(isBootReady(state), true);
});

test('advanceBootState never regresses to an earlier stage', () => {
  const mid = createInitialBootState('ephemeris');
  const regressed = advanceBootState(mid, 'milky-way');
  assert.equal(regressed.stage, 'ephemeris');
  assert.equal(regressed.progress, mid.progress);

  const same = advanceBootState(mid, 'ephemeris');
  assert.equal(same.stage, 'ephemeris');
});

test('milestone statuses accurately reflect pending, active, and done stages', () => {
  assert.equal(getBootMilestoneStatus('bundle', 'webgl'), 'pending');
  assert.equal(getBootMilestoneStatus('webgl', 'webgl'), 'active');
  assert.equal(getBootMilestoneStatus('webgl', 'milky-way'), 'pending');
  assert.equal(getBootMilestoneStatus('milky-way', 'webgl'), 'done');
  assert.equal(getBootMilestoneStatus('milky-way', 'milky-way'), 'active');
  assert.equal(getBootMilestoneStatus('milky-way', 'ephemeris'), 'pending');
  assert.equal(getBootMilestoneStatus('ephemeris', 'milky-way'), 'done');
  assert.equal(getBootMilestoneStatus('ephemeris', 'ephemeris'), 'active');

  for (const m of BOOT_MILESTONES) {
    assert.equal(getBootMilestoneStatus('ready', m), 'done');
  }
});

test('all 5 supported languages provide complete non-empty boot copy', () => {
  const langs: LanguageCode[] = ['en', 'vi', 'ja', 'zh', 'ko'];
  for (const lang of langs) {
    const copy = getBootCopy(lang);
    assert.ok(copy.title.trim().length > 0, `Missing title for ${lang}`);
    assert.ok(copy.subtitle.trim().length > 0, `Missing subtitle for ${lang}`);
    assert.ok(copy.reassurance.trim().length > 0, `Missing reassurance for ${lang}`);
    for (const stage of BOOT_STAGE_ORDER) {
      assert.ok(
        copy.stages[stage]?.trim().length > 0,
        `Missing stage copy ${stage} for ${lang}`
      );
    }
    for (const milestone of BOOT_MILESTONES) {
      assert.ok(
        copy.milestones[milestone]?.trim().length > 0,
        `Missing milestone copy ${milestone} for ${lang}`
      );
    }
  }
  assert.equal(Object.keys(BOOT_COPY).length, 5);
});
