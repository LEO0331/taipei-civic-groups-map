import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildSourceSchemaBaseline,
  compareSourceSchemas,
  decodeCsvHeader,
  parseFirstCsvRecord,
  type CsvSchemaSnapshot,
} from '../../scripts/sourceSchemaGuard';

const snapshot = (
  datasetId: string,
  relativePath: string,
  headers: string[],
): CsvSchemaSnapshot => ({ datasetId, relativePath, headers, encoding: 'UTF-8' });

test('parses a quoted CSV header and removes BOM/outer whitespace', () => {
  const bytes = new TextEncoder().encode('\uFEFF名稱,"地址,完整", 電話 \r\n值1,值2,值3\r\n');
  assert.deepEqual(decodeCsvHeader(bytes).headers, ['名稱', '地址,完整', '電話']);
  assert.deepEqual(parseFirstCsvRecord('\r\nA,B,C\n1,2,3\n'), ['A', 'B', 'C']);
});

test('baseline keeps exact file contracts and unique per-dataset header sets', () => {
  const baseline = buildSourceSchemaBaseline([
    snapshot('rolling', 'rolling/202601.csv', ['名稱', '地址']),
    snapshot('rolling', 'rolling/202602.csv', ['名稱', '地址']),
    snapshot('multi', 'multi/resource-1.csv', ['名稱', '電話']),
    snapshot('multi', 'multi/resource-2.csv', ['名稱', '地址']),
  ], '2026-09-22T00:00:00.000Z');

  assert.equal(baseline.csvFileCount, 4);
  assert.equal(baseline.datasetDirectoryCount, 2);
  assert.equal(baseline.datasets.find((dataset) => dataset.id === 'rolling')?.headerSets.length, 1);
  assert.equal(baseline.datasets.find((dataset) => dataset.id === 'multi')?.headerSets.length, 2);
});

test('accepts a rolling filename when its header matches a reviewed dataset signature', () => {
  const baseline = buildSourceSchemaBaseline([
    snapshot('rolling', 'rolling/202601.csv', ['名稱', '地址']),
  ], '2026-09-22T00:00:00.000Z');

  const report = compareSourceSchemas(baseline, [
    snapshot('rolling', 'rolling/202609.csv', ['名稱', '地址']),
  ], '2026-09-22T01:00:00.000Z');

  assert.equal(report.status, 'passed');
  assert.equal(report.matchedCsvFileCount, 1);
  assert.deepEqual(report.issues, []);
});

test('rejects renamed or reordered headers for a stable source file', () => {
  const baseline = buildSourceSchemaBaseline([
    snapshot('clinic', 'clinic/source.csv', ['機構名稱', '地址', '電話']),
  ], '2026-09-22T00:00:00.000Z');

  const renamed = compareSourceSchemas(baseline, [
    snapshot('clinic', 'clinic/source.csv', ['名稱', '地址', '電話']),
  ]);
  const reordered = compareSourceSchemas(baseline, [
    snapshot('clinic', 'clinic/source.csv', ['機構名稱', '電話', '地址']),
  ]);

  assert.equal(renamed.status, 'failed');
  assert.equal(renamed.issues[0]?.kind, 'unexpected_headers');
  assert.equal(reordered.status, 'failed');
  assert.equal(reordered.issues[0]?.kind, 'unexpected_headers');
});

test('rejects a newly fetched CSV dataset with no reviewed raw baseline', () => {
  const baseline = buildSourceSchemaBaseline([
    snapshot('known', 'known/source.csv', ['名稱']),
  ], '2026-09-22T00:00:00.000Z');

  const report = compareSourceSchemas(baseline, [
    snapshot('known', 'known/source.csv', ['名稱']),
    snapshot('new-source', 'new-source/source.csv', ['名稱']),
  ]);

  assert.equal(report.status, 'failed');
  assert.equal(report.issues.some((issue) => issue.kind === 'new_dataset'), true);
});
