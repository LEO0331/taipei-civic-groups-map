import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildDataReleaseBaseline,
  collectAuthoritativeSourceTimestamps,
  compareDataRelease,
  countCsvDataRows,
  effectiveSourceTimestamp,
  type DatasetSourceState,
  type RawSourceFileSnapshot,
} from '../../scripts/buildDataChangeSummary';

const file = (
  datasetId: string,
  relativePath: string,
  sha256: string,
  bytes: number,
  rowCount: number | null,
): RawSourceFileSnapshot => ({
  datasetId,
  relativePath,
  sha256,
  bytes,
  format: relativePath.endsWith('.json') ? 'json' : 'csv',
  rowCount,
});

const dataset = (
  id: string,
  files: RawSourceFileSnapshot[],
  sourceTimestamps: string[] = [],
): DatasetSourceState => ({
  id,
  files,
  sourceTimestamps,
  effectiveSourceTimestamp: effectiveSourceTimestamp(sourceTimestamps),
});

test('counts logical CSV data rows without treating quoted newlines as extra records', () => {
  const csv = '\uFEFFname,note\r\nA,"line 1\r\nline 2"\r\nB,ok\r\n,,\r\n';
  assert.equal(countCsvDataRows(csv), 2);
});

test('extracts only explicit authoritative source timestamps and uses the oldest included resource timestamp', () => {
  const timestamps = collectAuthoritativeSourceTimestamps({
    downloadedAt: '2026-09-22T01:00:00Z',
    metadataUpdatedAt: '2026-09-21T01:00:00Z',
    sourceUpdatedAt: '2026-09-20T08:00:00+08:00',
    resources: [
      { sourceFileUpdatedAt: '2026-09-18T10:00:00+08:00' },
      { csvUpdateDate: '2026-09-19T10:00:00+08:00' },
    ],
  });

  assert.deepEqual(timestamps, [
    '2026-09-18T10:00:00+08:00',
    '2026-09-19T10:00:00+08:00',
    '2026-09-20T08:00:00+08:00',
  ]);
  assert.equal(effectiveSourceTimestamp(timestamps), '2026-09-18T10:00:00+08:00');
});

test('reports a content change with before/after hash, bytes, and source row counts', () => {
  const before = dataset('clinic', [
    file('clinic', 'clinic/source.csv', 'old-hash', 100, 10),
  ], ['2026-01-01T00:00:00Z']);
  const after = dataset('clinic', [
    file('clinic', 'clinic/source.csv', 'new-hash', 120, 12),
  ], ['2026-01-01T00:00:00Z']);

  const summary = compareDataRelease(
    buildDataReleaseBaseline([before], '2026-09-22T00:00:00Z'),
    [after],
    '2026-09-22T01:00:00Z',
  );

  assert.equal(summary.status, 'source_changes_detected');
  assert.equal(summary.contentChangedDatasetCount, 1);
  assert.equal(summary.changedFileCount, 1);
  assert.equal(summary.sourceRowCountBefore, 10);
  assert.equal(summary.sourceRowCountAfter, 12);
  assert.deepEqual(summary.changes[0]?.files[0], {
    path: 'clinic/source.csv',
    status: 'changed',
    sha256Before: 'old-hash',
    sha256After: 'new-hash',
    bytesBefore: 100,
    bytesAfter: 120,
    rowCountBefore: 10,
    rowCountAfter: 12,
  });
});

test('does not treat fetch-time metadata churn as a source timestamp change', () => {
  const source = dataset('stable', [
    file('stable', 'stable/source.csv', 'same', 50, 4),
  ]);

  const summary = compareDataRelease(
    buildDataReleaseBaseline([source], '2026-09-22T00:00:00Z'),
    [source],
  );

  assert.equal(summary.status, 'no_source_changes');
  assert.equal(summary.unchangedDatasetCount, 1);
  assert.deepEqual(summary.changes, []);
});

test('reports added and removed source files and a source timestamp change without blocking', () => {
  const before = dataset('rolling', [
    file('rolling', 'rolling/202608.csv', 'aug', 80, 8),
  ], ['2026-08-31T00:00:00Z']);
  const after = dataset('rolling', [
    file('rolling', 'rolling/202609.csv', 'sep', 90, 9),
  ], ['2026-09-21T00:00:00Z']);

  const summary = compareDataRelease(
    buildDataReleaseBaseline([before], '2026-09-22T00:00:00Z'),
    [after],
  );

  assert.equal(summary.changedDatasetCount, 1);
  assert.equal(summary.addedFileCount, 1);
  assert.equal(summary.removedFileCount, 1);
  assert.equal(summary.sourceTimestampChangedDatasetCount, 1);
  assert.equal(summary.changes[0]?.effectiveSourceTimestampBefore, '2026-08-31T00:00:00Z');
  assert.equal(summary.changes[0]?.effectiveSourceTimestampAfter, '2026-09-21T00:00:00Z');
});
