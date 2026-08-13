import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyApprovedProject, parseApprovedSubsidy, parseSubsidyYear, parseTaipeiDistrict } from './privateCulturalHeritageSubsidies';

test('parses unambiguous ROC and Gregorian subsidy years without adding dates', () => {
  assert.deepEqual(parseSubsidyYear('96'), { rocYear: 96, gregorianYear: 2007 });
  assert.deepEqual(parseSubsidyYear('2026'), { rocYear: null, gregorianYear: 2026 });
  assert.deepEqual(parseSubsidyYear('96年度'), { rocYear: null, gregorianYear: null });
});

test('preserves missing and ranged approved subsidies as missing', () => {
  assert.equal(parseApprovedSubsidy('NT$ 3,600,000'), 3600000);
  assert.equal(parseApprovedSubsidy('1,200.5'), 1200.5);
  assert.equal(parseApprovedSubsidy('100,000～200,000'), null);
  assert.equal(parseApprovedSubsidy('--'), null);
});

test('classifies project text transparently and parses only explicit Taipei districts', () => {
  assert.deepEqual(classifyApprovedProject('公館廳三進緊急搶修工程'), ['emergency_repair']);
  assert.deepEqual(classifyApprovedProject('修復工程（第2期）'), ['restoration']);
  assert.equal(parseTaipeiDistrict('大同區'), '大同區');
  assert.equal(parseTaipeiDistrict('大稻埕'), null);
});
