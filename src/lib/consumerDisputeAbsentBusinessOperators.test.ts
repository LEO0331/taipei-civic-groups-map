import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildConsumerDisputeAbsentBusinessOperatorSummary, classifyConsumerDisputeKeywords,
  filterConsumerDisputeAbsentBusinessOperators, parseRocYear, parseTaiwanDate,
} from './consumerDisputeAbsentBusinessOperators';
import type { ConsumerDisputeAbsentBusinessOperatorRecord } from '../types';

const records: ConsumerDisputeAbsentBusinessOperatorRecord[] = [
  {
    id: 'a', module: 'consumer_dispute_absent_business_operators', resourceName: '109年度無故不到場協商之被申訴企業經營者列表',
    yearRaw: '109', rocYear: 109, year: 2020, respondentName: '依芙有限公司', respondentNameNormalized: '依芙有限公司',
    complainantName: '蔡○○', complainantNameNormalized: '蔡○○', hasComplainantName: true,
    negotiationDateRaw: '1091231', negotiationDate: '2020-12-31', negotiationYear: 2020, negotiationMonth: 12, negotiationMonthKey: '2020-12', negotiationQuarter: '2020-Q4',
    yearFromSource: 2020, yearFromNegotiationDate: 2020, yearMismatch: false,
    disputeContent: '購買美容商品消費爭議', disputeContentNormalized: '購買美容商品消費爭議', hasDisputeContent: true,
    disputeKeywordCategories: ['fitness_or_beauty', 'retail_goods'], disputeKeywordTags: ['購買美容商品消費爭議'],
    possibleBusinessRegistrationHint: '依芙有限公司', sourceRecordHash: 'a', source: '臺北市消費爭議無故不到場協商之被申訴企業經營者列表', sourceAgency: '臺北市政府法務局',
  },
  {
    id: 'b', module: 'consumer_dispute_absent_business_operators', resourceName: '無故不到場協商之被申訴企業經營者列表',
    yearRaw: '113', rocYear: 113, year: 2024, respondentName: '沐橙國際有限公司', respondentNameNormalized: '沐橙國際有限公司',
    hasComplainantName: false, negotiationDateRaw: '1131231', negotiationDate: '2024-12-31', negotiationYear: 2024, negotiationMonth: 12, negotiationMonthKey: '2024-12', negotiationQuarter: '2024-Q4',
    yearFromSource: 2024, yearFromNegotiationDate: 2024, yearMismatch: false,
    disputeContent: '網路購物', disputeContentNormalized: '網路購物', hasDisputeContent: true,
    disputeKeywordCategories: ['online_shopping'], disputeKeywordTags: ['網路購物'],
    possibleBusinessRegistrationHint: '沐橙國際有限公司', sourceRecordHash: 'b', source: '臺北市消費爭議無故不到場協商之被申訴企業經營者列表', sourceAgency: '臺北市政府法務局',
  },
];

test('parses ROC years and Taiwan dates for consumer dispute notices', () => {
  assert.deepEqual(parseRocYear('民國109年'), { yearRaw: '民國109年', rocYear: 109, year: 2020 });
  assert.deepEqual(parseTaiwanDate('1091231'), { raw: '1091231', date: '2020-12-31', year: 2020, month: 12, monthKey: '2020-12', quarter: '2020-Q4' });
  assert.equal(parseTaiwanDate('109/02/31').warning, 'Invalid date value');
});

test('classifies consumer dispute keyword categories without legal conclusions', () => {
  assert.deepEqual(classifyConsumerDisputeKeywords('網路購物退款爭議'), ['online_shopping', 'contract_or_refund']);
  assert.deepEqual(classifyConsumerDisputeKeywords(undefined), ['unknown']);
});

test('summarizes and filters consumer dispute absence notices', () => {
  const summary = buildConsumerDisputeAbsentBusinessOperatorSummary(records);
  assert.equal(summary.totalRecords, 2);
  assert.equal(summary.uniqueRespondentNameCount, 2);
  assert.equal(summary.recordsWithNegotiationDate, 2);
  assert.deepEqual(summary.byYear.map((item) => [item.year, item.recordCount]), [[2020, 1], [2024, 1]]);
  assert.equal(filterConsumerDisputeAbsentBusinessOperators(records, { search: '網路', year: '', yearFrom: '', yearTo: '', negotiationDateFrom: '', negotiationDateTo: '', respondentName: '', disputeKeywordCategory: '', hasNegotiationDate: '', hasDisputeContent: '', yearMismatch: '', resourceName: '' }).length, 1);
  assert.equal(filterConsumerDisputeAbsentBusinessOperators(records, { search: '', year: '', yearFrom: '', yearTo: '', negotiationDateFrom: '', negotiationDateTo: '', respondentName: '', disputeKeywordCategory: 'online_shopping', hasNegotiationDate: '', hasDisputeContent: '', yearMismatch: '', resourceName: '' }).length, 1);
});
