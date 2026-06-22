import assert from 'node:assert/strict';
import test from 'node:test';
import { buildIndustryGrantSummary, filterIndustryGrants, normalizeGrantDistrict, parseNtdAmount, parseRocDate } from './industryGrants';
import type { IndustryGrantRecipient } from '../types';

test('parses grant source values', () => {
  assert.deepEqual(parseRocDate('1000613'), { date: '2011-06-13', year: 2011, month: 6, day: 13 });
  assert.deepEqual(parseRocDate('114/12/31'), { date: '2025-12-31', year: 2025, month: 12, day: 31 });
  assert.deepEqual(parseRocDate('991201'), { date: '2010-12-01', year: 2010, month: 12, day: 1 });
  assert.equal(parseNtdAmount('1,200,000'), 1200000);
  assert.equal(parseNtdAmount('0'), 0);
  assert.equal(normalizeGrantDistrict(' 松山區 '), '松山區');
  assert.equal(normalizeGrantDistrict('中正'), '中正區');
});

test('builds grant summary', () => {
  const records: IndustryGrantRecipient[] = [
    { id: '1', module: 'industry_grant_recipients', companyName: '甲', subsidyYear: 2024, registeredDistrict: '大安區', approvedSubsidyNtd: 100, selfFundedAmountNtd: 300, totalProjectBudgetNtd: 400, grantField: '研發', industryCategory: '資訊', source: 'test' },
    { id: '2', module: 'industry_grant_recipients', companyName: '甲', subsidyYear: 2025, registeredDistrict: '大安區', approvedSubsidyNtd: 300, selfFundedAmountNtd: 300, totalProjectBudgetNtd: 600, grantField: '研發', industryCategory: '資訊', source: 'test' },
  ];
  const summary = buildIndustryGrantSummary(records);
  assert.equal(summary.uniqueCompanyCount, 1);
  assert.equal(summary.medianApprovedSubsidyNtd, 200);
  assert.equal(summary.byDistrict[0].approvedSubsidyNtd, 400);
  assert.equal(filterIndustryGrants([{ ...records[0], projectStartDate: '2024-01-01', projectEndDate: '2024-12-31' }], {
    search: '', subsidyYear: '', grantField: '', district: '', industryCategory: '', subsidyMin: '', subsidyMax: '',
    budgetMin: '', budgetMax: '', shareMin: '', shareMax: '', projectFrom: '2024-06-01', projectTo: '2024-06-30',
  }).length, 1);
});
