import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildProvenanceReviewReport,
  type ProvenanceReviewRegistry,
  type ReleaseSummary,
  type TrustManifest,
} from '../../scripts/provenanceReviewRegistry';

const releaseSummary: ReleaseSummary = {
  schemaVersion: 1,
  datasetDirectoryCount: 3,
  datedDatasetCount: 1,
  unknownDateDatasetCount: 2,
  datasetsWithSourceDates: ['dated'],
  datasetsWithoutSourceDates: ['unknown-a', 'unknown-b'],
};

const trustManifest: TrustManifest = {
  schemaVersion: 1,
  entries: [
    { id: 'dated', sourceUpdatedAt: '2026-01-02T03:04:05+08:00' },
    { id: 'unknown-a' },
    { id: 'unknown-b' },
  ],
};

function registry(entries: ProvenanceReviewRegistry['entries']): ProvenanceReviewRegistry {
  return {
    schemaVersion: 1,
    policy: { note: 'test' },
    entries,
  };
}

test('passes when every unknown-date dataset is explicitly tracked as not reviewed', () => {
  const report = buildProvenanceReviewReport(releaseSummary, trustManifest, registry([
    { datasetId: 'unknown-a', status: 'not_reviewed', lastReviewedAt: null },
    { datasetId: 'unknown-b', status: 'not_reviewed', lastReviewedAt: null },
  ]));

  assert.equal(report.status, 'passed');
  assert.equal(report.trackedUnknownDatasetCount, 2);
  assert.equal(report.notReviewedUnknownDatasetCount, 2);
  assert.equal(report.reviewedUnknownDatasetCount, 0);
  assert.deepEqual(report.issues, []);
});

test('blocks when a current unknown-date dataset is missing from the registry', () => {
  const report = buildProvenanceReviewReport(releaseSummary, trustManifest, registry([
    { datasetId: 'unknown-a', status: 'not_reviewed', lastReviewedAt: null },
  ]));

  assert.equal(report.status, 'blocked');
  assert.equal(report.untrackedUnknownDatasetCount, 1);
  assert.equal(report.issues.some((issue) => issue.kind === 'untracked_unknown_dataset'), true);
});

test('blocks duplicate registry entries', () => {
  const report = buildProvenanceReviewReport(releaseSummary, trustManifest, registry([
    { datasetId: 'unknown-a', status: 'not_reviewed', lastReviewedAt: null },
    { datasetId: 'unknown-a', status: 'needs_manual_review', lastReviewedAt: '2026-09-23' },
    { datasetId: 'unknown-b', status: 'not_reviewed', lastReviewedAt: null },
  ]));

  assert.equal(report.status, 'blocked');
  assert.equal(report.issues.some((issue) => issue.kind === 'duplicate_registry_entry'), true);
});

test('requires a review date once an unknown dataset has been reviewed', () => {
  const report = buildProvenanceReviewReport(releaseSummary, trustManifest, registry([
    { datasetId: 'unknown-a', status: 'no_authoritative_timestamp', lastReviewedAt: null },
    { datasetId: 'unknown-b', status: 'not_reviewed', lastReviewedAt: null },
  ]));

  assert.equal(report.status, 'blocked');
  assert.equal(report.issues.some((issue) => issue.kind === 'invalid_review_date'), true);
});

test('blocks verified status while Data Trust still considers the dataset unknown-date', () => {
  const report = buildProvenanceReviewReport(releaseSummary, trustManifest, registry([
    {
      datasetId: 'unknown-a',
      status: 'verified',
      lastReviewedAt: '2026-09-23',
      sourceFileUpdatedAt: '2026-01-02T03:04:05+08:00',
    },
    { datasetId: 'unknown-b', status: 'not_reviewed', lastReviewedAt: null },
  ]));

  assert.equal(report.status, 'blocked');
  assert.equal(report.issues.some((issue) => issue.kind === 'verified_but_still_unknown'), true);
});

test('accepts retained verified history when its source date matches Data Trust', () => {
  const report = buildProvenanceReviewReport(releaseSummary, trustManifest, registry([
    {
      datasetId: 'dated',
      status: 'verified',
      lastReviewedAt: '2026-09-23',
      sourceFileUpdatedAt: '2026-01-02T03:04:05+08:00',
    },
    { datasetId: 'unknown-a', status: 'not_reviewed', lastReviewedAt: null },
    { datasetId: 'unknown-b', status: 'not_reviewed', lastReviewedAt: null },
  ]));

  assert.equal(report.status, 'passed');
  assert.deepEqual(report.verifiedDatedDatasetIds, ['dated']);
});

test('blocks stale non-verified registry state after a dataset gains a source date', () => {
  const report = buildProvenanceReviewReport(releaseSummary, trustManifest, registry([
    { datasetId: 'dated', status: 'needs_manual_review', lastReviewedAt: '2026-09-23' },
    { datasetId: 'unknown-a', status: 'not_reviewed', lastReviewedAt: null },
    { datasetId: 'unknown-b', status: 'not_reviewed', lastReviewedAt: null },
  ]));

  assert.equal(report.status, 'blocked');
  assert.equal(report.issues.some((issue) => issue.kind === 'dated_dataset_not_verified'), true);
});
