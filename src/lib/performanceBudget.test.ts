import assert from 'node:assert/strict';
import test from 'node:test';
import {
  entryBudget,
  evaluateEntryBudget,
  findEntryAssetPath,
  formatKilobytes,
} from '../../scripts/checkPerformanceBudget';

test('finds the hashed Vite entry behind the configured base path', () => {
  const html = '<script type="module" crossorigin src="/taipei-civic-groups-map/assets/index-DwHf4rVw.js"></script>';
  assert.equal(findEntryAssetPath(html), 'assets/index-DwHf4rVw.js');
});

test('accepts the current production entry below the regression budget', () => {
  const violations = evaluateEntryBudget({
    assetPath: 'assets/index-current.js',
    rawBytes: 399_630,
    gzipBytes: 116_040,
  });
  assert.deepEqual(violations, []);
});

test('rejects a raw entry regression before Vite reaches its 500 kB advisory', () => {
  const violations = evaluateEntryBudget({
    assetPath: 'assets/index-regressed.js',
    rawBytes: entryBudget.rawBytes + 1,
    gzipBytes: 120_000,
  });
  assert.match(violations[0] ?? '', /raw entry size/);
});

test('rejects an excessive gzip entry even when raw size stays within budget', () => {
  const violations = evaluateEntryBudget({
    assetPath: 'assets/index-gzip-regressed.js',
    rawBytes: 420_000,
    gzipBytes: entryBudget.gzipBytes + 1,
  });
  assert.match(violations[0] ?? '', /gzip entry size/);
});

test('formats decimal kilobytes consistently with the Vite build report', () => {
  assert.equal(formatKilobytes(399_630), '399.63 kB');
});
