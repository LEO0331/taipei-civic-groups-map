import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  buildProvenanceReviewQueue,
  REVIEW_RECHECK_DAYS,
} from '../../scripts/buildProvenanceReviewQueue';
import type { ProvenanceReviewRegistry } from '../../scripts/provenanceReviewRegistry';
import type { LocalProvenance } from '../../scripts/upstreamResourceMonitor';

function registry(entries: ProvenanceReviewRegistry['entries']): ProvenanceReviewRegistry {
  return { schemaVersion: 1, policy: { note: 'test' }, entries };
}

test('monthly queue prioritizes exact resources, then source-page matching, then source classification', () => {
  const queue = buildProvenanceReviewQueue(
    registry([
      { datasetId: 'unsupported', status: 'not_reviewed', lastReviewedAt: null },
      { datasetId: 'page-only', status: 'not_reviewed', lastReviewedAt: null },
      { datasetId: 'exact', status: 'not_reviewed', lastReviewedAt: null },
    ]),
    [
      { id: 'exact', sourcePage: 'https://data.taipei/dataset/detail?id=a', resourceId: '11111111-1111-1111-1111-111111111111' },
      { id: 'page-only', sourcePage: 'https://data.taipei/dataset/detail?id=b' },
      { id: 'unsupported' },
    ],
    '2026-10-01',
    10,
  );

  assert.deepEqual(queue.entries.map((entry) => entry.datasetId), ['exact', 'page-only', 'unsupported']);
  assert.deepEqual(queue.entries.map((entry) => entry.priority), [
    'exact_source_and_resource',
    'source_page_needs_resource_match',
    'source_needs_classification',
  ]);
});

test('routine queue excludes resolved outcomes and respects the reviewed-state recheck interval', () => {
  const queue = buildProvenanceReviewQueue(
    registry([
      { datasetId: 'verified', status: 'verified', lastReviewedAt: '2026-01-01', sourceFileUpdatedAt: '2026-01-01T00:00:00+08:00' },
      { datasetId: 'no-date', status: 'no_authoritative_timestamp', lastReviewedAt: '2026-01-01' },
      { datasetId: 'recent-api', status: 'api_source', lastReviewedAt: '2026-09-01' },
      { datasetId: 'old-api', status: 'api_source', lastReviewedAt: '2026-01-01' },
      { datasetId: 'manual', status: 'needs_manual_review', lastReviewedAt: '2026-09-30' },
    ]),
    [],
    '2026-10-01',
    10,
  );

  assert.equal(REVIEW_RECHECK_DAYS, 180);
  assert.deepEqual(queue.entries.map((entry) => entry.datasetId), ['old-api', 'manual']);
});

test('queue limit is hard-capped at ten candidates', () => {
  const entries = Array.from({ length: 12 }, (_, index) => ({
    datasetId: `dataset-${String(index).padStart(2, '0')}`,
    status: 'not_reviewed' as const,
    lastReviewedAt: null,
  }));
  const provenance: LocalProvenance[] = entries.map((entry) => ({ id: entry.datasetId }));
  const queue = buildProvenanceReviewQueue(registry(entries), provenance, '2026-10-01', 10);
  assert.equal(queue.eligibleCount, 12);
  assert.equal(queue.selectedCount, 10);
  assert.equal(queue.entries.length, 10);
  assert.throws(() => buildProvenanceReviewQueue(registry(entries), provenance, '2026-10-01', 11));
});

test('provenance review schedule stays monthly, read-only, and non-mutating', async () => {
  const workflow = await readFile('.github/workflows/provenance-review.yml', 'utf8');

  assert.match(workflow, /cron:\s*['"]15 1 1 \* \*['"]/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /permissions:\s*\n\s*contents:\s*read/);
  assert.match(workflow, /node-version:\s*22/);
  assert.match(workflow, /npm run data:provenance:review/);
  assert.match(workflow, /npm run data:provenance:queue/);
  assert.match(workflow, /--limit=10/);
  assert.match(workflow, /actions\/upload-artifact@v7\.0\.1/);
  assert.match(workflow, /retention-days:\s*30/);

  assert.doesNotMatch(workflow, /npm run data:fetch(?:\s|$)/);
  assert.doesNotMatch(workflow, /git\s+(?:commit|push)/);
  assert.doesNotMatch(workflow, /contents:\s*write/);
  assert.doesNotMatch(workflow, /pages:\s*write/);
});
