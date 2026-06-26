import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildLaborStandardActViolationSummary, classifyLaborPenaltyAmountBucket, classifyLaborViolationTopicTags,
  filterLaborStandardActViolationRecords, parsePenaltyAmount, parseRocDate, parseViolatedProvisions,
} from './laborStandardActViolations';
import type { LaborStandardActViolationRecord } from '../types';

test('parses ROC dates, penalties, provisions, and topic tags', () => {
  assert.equal(parseRocDate('1150515').isoDate, '2026-05-15');
  assert.equal(parseRocDate('1001115').isoDate, '2011-11-15');
  assert.equal(parseRocDate('10409298').warning, 'Invalid ROC date format');
  assert.equal(parsePenaltyAmount('40,000').amountNtd, 40000);
  assert.equal(parsePenaltyAmount('-').amountNtd, undefined);
  assert.deepEqual(parseViolatedProvisions('勞動基準法第24條第1項；勞動基準法第32條第2項'), ['勞動基準法第24條第1項', '勞動基準法第32條第2項']);
  assert.deepEqual(classifyLaborViolationTopicTags(['勞動基準法第24條第1項'], ['延長工作時間未依規定加給工資']), ['overtime_pay']);
  assert.equal(classifyLaborPenaltyAmountBucket(1000001), '1000001_plus');
});

test('summarizes and filters labor publication records without treating missing penalties as zero', () => {
  const records: LaborStandardActViolationRecord[] = [
    {
      id: 'a', module: 'labor_standard_act_violation_records', announcementDate: '2026-05-15', announcementYear: 2026, announcementMonth: '2026-05',
      dispositionDate: '2026-04-30', dispositionYear: 2026, dispositionMonth: '2026-04', dispositionNumber: 'A1',
      businessOrEmployerName: '甲公司', violatedProvisions: ['勞動基準法第24條第1項'], provisionCount: 1,
      violationContents: ['延長工作時間未依規定加給工資'], violationContentCount: 1, violationTopicTags: ['overtime_pay'],
      penaltyAmountNtd: 40000, penaltyAmountBucket: '20001_to_50000', hasPenaltyAmount: true,
      hasResponsiblePersonName: false, hasNote: false, hasSourceExtraNote: false,
      source: '臺北市政府勞動局違反勞動基準法事業單位及事業主公布總表', sourceAgency: '臺北市政府勞動局',
    },
    {
      id: 'b', module: 'labor_standard_act_violation_records', announcementDate: '2026-05-15', announcementYear: 2026, announcementMonth: '2026-05',
      businessOrEmployerName: '乙公司', violatedProvisions: [], provisionCount: 0, violationContents: [], violationContentCount: 0,
      violationTopicTags: ['unknown'], penaltyAmountBucket: 'none_or_missing', hasPenaltyAmount: false,
      hasResponsiblePersonName: true, hasNote: true, hasSourceExtraNote: true,
      source: '臺北市政府勞動局違反勞動基準法事業單位及事業主公布總表', sourceAgency: '臺北市政府勞動局',
    },
  ];
  const summary = buildLaborStandardActViolationSummary(records);
  assert.equal(summary.totalPenaltyAmountNtd, 40000);
  assert.equal(summary.recordsMissingPenaltyAmount, 1);
  assert.equal(summary.medianPenaltyAmountNtd, 40000);
  assert.deepEqual(filterLaborStandardActViolationRecords(records, {
    search: '甲', announcementYear: '', announcementMonth: '', dispositionYear: '', dispositionMonth: '', violatedProvision: '',
    violationTopicTag: '', penaltyAmountBucket: '', hasPenaltyAmount: '', hasResponsiblePersonName: '', hasNote: '',
  }).map((record) => record.id), ['a']);
});
