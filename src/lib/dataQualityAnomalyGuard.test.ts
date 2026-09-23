import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assessDataQuality,
  type DataQualityIssueKind,
} from '../../scripts/dataQualityAnomalyGuard';
import {
  buildDataReleaseBaseline,
  type DatasetSourceState,
  type RawSourceFileSnapshot,
} from '../../scripts/buildDataChangeSummary';

const file = (
  datasetId: string,
  relativePath: string,
  rowCount: number | null,
): RawSourceFileSnapshot => ({
  datasetId,
  relativePath,
  sha256: `${relativePath}-${rowCount}`,
  bytes: 100,
  format: relativePath.endsWith('.json') ? 'json' : 'csv',
  rowCount,
});

const dataset = (
  id: string,
  rowCount: number | null,
  path = `${id}/source.csv`,
): DatasetSourceState => ({
  id,
  sourceTimestamps: [],
  files: [file(id, path, rowCount)],
});

const kinds = (report: ReturnType<typeof assessDataQuality>) =>
  report.issues.map((issue) => issue.kind as DataQualityIssueKind);

test('passes stable row counts without manufacturing anomalies', () => {
  const baseline = buildDataReleaseBaseline([dataset('stable', 100)], '2026-09-23T00:00:00Z');
  const report = assessDataQuality(baseline, [dataset('stable', 90)], '2026-09-23T01:00:00Z');

  assert.equal(report.status, 'passed');
  assert.equal(report.blockerCount, 0);
  assert.equal(report.warningCount, 0);
  assert.deepEqual(report.issues, []);
});

test('blocks a previously populated dataset that becomes empty', () => {
  const baseline = buildDataReleaseBaseline([dataset('clinic', 120)], '2026-09-23T00:00:00Z');
  const report = assessDataQuality(baseline, [dataset('clinic', 0)]);

  assert.equal(report.status, 'blocked');
  assert.equal(report.blockerCount, 1);
  assert.deepEqual(kinds(report), ['unexpected_empty_dataset']);
});

test('blocks a stable source file whose row count becomes unreadable', () => {
  const baseline = buildDataReleaseBaseline([dataset('clinic', 120)], '2026-09-23T00:00:00Z');
  const report = assessDataQuality(baseline, [dataset('clinic', null)]);

  assert.equal(report.status, 'blocked');
  assert.equal(report.blockerCount, 1);
  assert.deepEqual(kinds(report), ['source_file_row_count_unreadable']);
  assert.equal(report.issues[0]?.sourcePath, 'clinic/source.csv');
});

test('blocks disappearance of a previously countable dataset directory', () => {
  const baseline = buildDataReleaseBaseline([dataset('clinic', 120)], '2026-09-23T00:00:00Z');
  const report = assessDataQuality(baseline, []);

  assert.equal(report.status, 'blocked');
  assert.deepEqual(kinds(report), ['missing_dataset']);
});

test('reports severe row-count collapse as a warning rather than a release blocker', () => {
  const baseline = buildDataReleaseBaseline([dataset('registry', 100)], '2026-09-23T00:00:00Z');
  const report = assessDataQuality(baseline, [dataset('registry', 40)]);

  assert.equal(report.status, 'passed');
  assert.equal(report.blockerCount, 0);
  assert.equal(report.warningCount, 1);
  assert.deepEqual(kinds(report), ['severe_row_count_collapse']);
  assert.equal(report.issues[0]?.ratio, 0.4);
});

test('reports severe row-count spike as a warning rather than a release blocker', () => {
  const baseline = buildDataReleaseBaseline([dataset('registry', 100)], '2026-09-23T00:00:00Z');
  const report = assessDataQuality(baseline, [dataset('registry', 250)]);

  assert.equal(report.status, 'passed');
  assert.equal(report.warningCount, 1);
  assert.deepEqual(kinds(report), ['severe_row_count_spike']);
  assert.equal(report.issues[0]?.ratio, 2.5);
});

test('does not apply proportional warnings to small datasets', () => {
  const baseline = buildDataReleaseBaseline([dataset('small', 10)], '2026-09-23T00:00:00Z');
  const report = assessDataQuality(baseline, [dataset('small', 3)]);

  assert.equal(report.status, 'passed');
  assert.equal(report.warningCount, 0);
  assert.deepEqual(report.issues, []);
});

test('allows rolling filenames when the dataset remains countable', () => {
  const baseline = buildDataReleaseBaseline(
    [dataset('rolling', 100, 'rolling/202608.csv')],
    '2026-09-23T00:00:00Z',
  );
  const report = assessDataQuality(baseline, [dataset('rolling', 105, 'rolling/202609.csv')]);

  assert.equal(report.status, 'passed');
  assert.deepEqual(report.issues, []);
});
