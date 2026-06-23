import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildMetroProcurementSummary, classifyProcurementCaseKeywords, classifyProcurementSubjectCategory, classifyTenderMethod,
  parseBudgetOrTenderMethod, parseRocYearMonth,
} from './metroProcurement';

test('parses metro procurement source values', () => {
  assert.deepEqual(parseRocYearMonth('11506'), { periodRocYearMonth: '11506', periodRocYear: 115, periodYear: 2026, periodMonth: 6, periodKey: '2026-06' });
  assert.equal(parseRocYearMonth('2026-06').periodKey, '2026-06');
  assert.equal(classifyProcurementSubjectCategory('財物類'), 'goods');
  assert.equal(classifyTenderMethod('公開取得報價單或企劃書'), 'public_quotation_or_proposal');
  assert.deepEqual(parseBudgetOrTenderMethod('1,200,000'), { budgetAmountRaw: '1,200,000', budgetAmountNtd: 1200000, tenderMethod: 'unknown' });
  assert.equal(parseBudgetOrTenderMethod('公開招標').tenderMethod, 'open_tender');
  assert.deepEqual(classifyProcurementCaseKeywords('車站電梯系統維護'), ['station_facility', 'elevator_escalator', 'it_system', 'maintenance']);
});

test('counts all textual budget-column values without treating them as numeric budgets', () => {
  const summary = buildMetroProcurementSummary([
    { id: '1', module: 'metro_procurement_schedule', caseName: 'A', budgetAmountRaw: '公開招標', tenderMethodRaw: '公開招標', tenderMethod: 'open_tender', subjectCategory: 'goods', periodRocYearMonth: '11506', periodKey: '2026-06', derivedKeywordGroups: ['other'], source: 'source', sourceAgency: 'agency' },
    { id: '2', module: 'metro_procurement_schedule', caseName: 'B', budgetAmountRaw: '預算金額不公開', tenderMethod: 'other', subjectCategory: 'services', periodRocYearMonth: '11506', periodKey: '2026-06', derivedKeywordGroups: ['other'], source: 'source', sourceAgency: 'agency' },
    { id: '3', module: 'metro_procurement_schedule', caseName: 'C', budgetAmountRaw: '1,000', budgetAmountNtd: 1000, tenderMethod: 'unknown', subjectCategory: 'works', periodRocYearMonth: '11506', periodKey: '2026-06', derivedKeywordGroups: ['other'], source: 'source', sourceAgency: 'agency' },
  ]);
  assert.equal(summary.recordsWithNumericBudgetAmount, 1);
  assert.equal(summary.recordsWithTextualBudgetColumn, 2);
});
