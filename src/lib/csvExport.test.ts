import assert from 'node:assert/strict';
import { test } from 'node:test';
import { csvExportCell } from './csvExport';

test('exports formula-like cells as quoted text', () => {
  const values = [
    '=Provider',
    ' +Provider',
    '@Provider',
    '-2-3',
    '\t@Provider',
    '\u200b＝Provider',
    '＋Provider',
    '－Provider',
    '＠Provider',
    '\tProvider',
    '\rProvider',
    '\nProvider',
  ];
  for (const value of values) {
    assert.equal(csvExportCell(value), '"' + "'" + value + '"');
  }
});

test('preserves phone display, literal negative numbers, and CSV delimiters', () => {
  assert.equal(csvExportCell('+886 2 1234 5678'), '"\'+886 2 1234 5678"');
  assert.equal(csvExportCell('02-1234-5678'), '"02-1234-5678"');
  assert.equal(csvExportCell(-42.5), '"-42.5"');
  assert.equal(csvExportCell('-1.5e-4'), '"-1.5e-4"');
  assert.equal(csvExportCell(null), '""');
  assert.equal(csvExportCell('a,"b"\nc'), '"a,""b""\nc"');
});
