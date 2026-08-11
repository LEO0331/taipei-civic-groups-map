import assert from 'node:assert/strict';
import test from 'node:test';
import { freshnessStatus, safeSmallCount } from './dataTrust';

const now = new Date('2026-08-11T00:00:00.000Z');

test('classifies source dates without treating an unknown date as current', () => {
  assert.equal(freshnessStatus('2026-07-13', now), 'current');
  assert.equal(freshnessStatus('2026-03-17', now), 'aging');
  assert.equal(freshnessStatus('2025-06-06', now), 'stale');
  assert.equal(freshnessStatus(undefined, now), 'unknown');
});

test('suppresses positive small counts but preserves zero', () => {
  assert.equal(safeSmallCount(0), '0');
  assert.equal(safeSmallCount(1), '<5');
  assert.equal(safeSmallCount(4), '<5');
  assert.equal(safeSmallCount(5), '5');
});
