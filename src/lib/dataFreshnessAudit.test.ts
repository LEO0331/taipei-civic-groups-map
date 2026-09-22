import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  buildFreshnessAudit,
  classifyAge,
  parseSourceTimestamp,
} from '../../scripts/buildDataFreshnessAudit';

test('classifies age bands as review triage rather than stale/current truth', () => {
  assert.equal(classifyAge(180), 'recent');
  assert.equal(classifyAge(181), 'review');
  assert.equal(classifyAge(365), 'review');
  assert.equal(classifyAge(366), 'priority_review');
});

test('treats Taipei portal timestamps without offsets as Asia/Taipei local time', () => {
  assert.equal(parseSourceTimestamp('2026-03-31 15:13:03').toISOString(), '2026-03-31T07:13:03.000Z');
  assert.equal(parseSourceTimestamp('2026-03-17').toISOString(), '2026-03-16T16:00:00.000Z');
});

test('builds a deterministic top-priority review queue ordered by age', () => {
  const audit = buildFreshnessAudit(
    [
      { id: 'recent', sourceUpdatedAt: '2026-09-03T17:56:42+08:00' },
      { id: 'review', sourceUpdatedAt: '2026-01-07T11:46:42+08:00' },
      { id: 'oldest', sourceUpdatedAt: '2024-07-05T17:21:17+08:00' },
      { id: 'older', sourceUpdatedAt: '2025-03-19T16:17:56+08:00' },
      { id: 'unknown' },
    ],
    5,
    '2026-09-22',
  );

  assert.deepEqual(audit.counts, { recent: 1, review: 1, priority_review: 2 });
  assert.equal(audit.datedDatasetCount, 4);
  assert.equal(audit.unknownDateDatasetCount, 1);
  assert.deepEqual(audit.topPriorityReview.map((entry) => entry.id), ['oldest', 'older']);
});

test('requires an explicit valid audit date', () => {
  assert.throws(() => buildFreshnessAudit([], 0, '2026/09/22'), /Expected --as-of/);
});


test('checked-in 2026-09-22 audit is reproducible from the trust manifest', async () => {
  const manifest = JSON.parse(await readFile('public/data/data-trust-manifest.json', 'utf8'));
  const checkedIn = JSON.parse(await readFile('public/data/data-freshness-audit.json', 'utf8'));
  assert.deepEqual(
    buildFreshnessAudit(manifest.entries, manifest.datasetDirectoryCount, '2026-09-22'),
    checkedIn,
  );
});
