import assert from 'node:assert/strict';
import test from 'node:test';
import { buildOccupationalSafetyHealthViolationSummary, classifyOccupationalSafetyHealthViolationContent, filterOccupationalSafetyHealthViolationRecords, parseTaipeiViolationDate, parseViolatedOshActArticle } from './occupationalSafetyHealthViolations';
import type { OccupationalSafetyHealthViolationRecord } from '../types';

test('parses OSH violation dates, articles, and categories', () => {
  assert.deepEqual(parseTaipeiViolationDate('1150605'), { raw: '1150605', date: '2026-06-05', year: 2026, month: 6, yearMonth: '2026-06', warning: undefined });
  assert.deepEqual(parseTaipeiViolationDate('115/4/30').date, '2026-04-30');
  assert.deepEqual(parseTaipeiViolationDate('2026-05-14').date, '2026-05-14');
  assert.deepEqual(parseViolatedOshActArticle('職業安全衛生法第6條第1項第13款').violatedArticleTokens, ['第6條']);
  assert.ok(classifyOccupationalSafetyHealthViolationContent('有墜落危險之處所未設防護設備。').includes('fall_prevention'));
});

test('summarizes and filters OSH violation records', () => {
  const records: OccupationalSafetyHealthViolationRecord[] = [
    { id: '1', module: 'occupational_safety_health_violation_records', announcementDateRaw: '1150605', announcementDate: '2026-06-05', announcementYear: 2026, announcementMonth: 6, announcementYearMonth: '2026-06', penaltyDateRaw: '1150430', penaltyDate: '2026-04-30', penaltyYear: 2026, penaltyMonth: 4, penaltyYearMonth: '2026-04', daysBetweenPenaltyAndAnnouncement: 36, penaltyDocumentNumber: '北市勞職字第1號', penaltyDocumentNumberNormalized: '北市勞職字第1號', businessOrOrganizationName: '辰豐營造股份有限公司', businessOrOrganizationNameNormalized: '辰豐營造股份有限公司', responsiblePersonName: '吳詠棠', responsiblePersonNameNormalized: '吳詠棠', violatedOshActArticleRaw: '職業安全衛生法第6條第1項第13款', violatedOshActArticle: '職業安全衛生法第6條第1項第13款', violatedOshActArticleNormalized: '職業安全衛生法第6條第1項第13款', violatedArticleTokens: ['第6條'], violationContent: '有墜落危險之處所未設防護設備。', violationContentNormalized: '有墜落危險之處所未設防護設備。', violationContentCategories: ['fall_prevention'], hasNote: false, source: '臺北市政府勞動局違反職業安全衛生法事業單位及事業主公布總表', sourceAgency: '臺北市政府勞動局', legalBasis: '職業安全衛生法' },
    { id: '2', module: 'occupational_safety_health_violation_records', announcementDateRaw: '1150605', announcementDate: '2026-06-05', announcementYear: 2026, announcementMonth: 6, announcementYearMonth: '2026-06', penaltyDateRaw: '1150429', penaltyDate: '2026-04-29', penaltyYear: 2026, penaltyMonth: 4, penaltyYearMonth: '2026-04', daysBetweenPenaltyAndAnnouncement: 37, penaltyDocumentNumber: '北市勞職字第2號', penaltyDocumentNumberNormalized: '北市勞職字第2號', businessOrOrganizationName: '原廣工程有限公司', businessOrOrganizationNameNormalized: '原廣工程有限公司', violatedOshActArticleRaw: '職業安全衛生法第6條第1項第13款', violatedOshActArticle: '職業安全衛生法第6條第1項第13款', violatedOshActArticleNormalized: '職業安全衛生法第6條第1項第13款', violatedArticleTokens: ['第6條'], violationContent: '通道等未保持安全狀態或防跌等預防措施。', violationContentNormalized: '通道等未保持安全狀態或防跌等預防措施。', violationContentCategories: ['fall_prevention'], hasNote: true, note: '訴願中', source: '臺北市政府勞動局違反職業安全衛生法事業單位及事業主公布總表', sourceAgency: '臺北市政府勞動局', legalBasis: '職業安全衛生法' },
  ];
  const summary = buildOccupationalSafetyHealthViolationSummary(records);
  assert.equal(summary.totalRecords, 2);
  assert.equal(summary.uniqueBusinessOrOrganizationNameCount, 2);
  assert.equal(summary.recordsWithNote, 1);
  assert.equal(summary.byViolationContentCategory[0].category, 'fall_prevention');
  assert.equal(filterOccupationalSafetyHealthViolationRecords(records, { search: '原廣', announcementYear: '', announcementYearMonth: '', announcementDateFrom: '', announcementDateTo: '', penaltyYear: '', penaltyYearMonth: '', penaltyDateFrom: '', penaltyDateTo: '', violatedArticle: '', violationContentCategory: '', hasNote: '', businessOrOrganizationName: '', penaltyDocumentNumber: '' }).length, 1);
});
