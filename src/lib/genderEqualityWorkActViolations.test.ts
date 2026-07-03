import assert from 'node:assert/strict';
import test from 'node:test';
import { buildGenderEqualityWorkActViolationSummary, classifyFineAmount, classifyGenderEqualityActNameVersion, classifyGenderEqualityWorkViolationContent, detectNoViolationPeriodRecord, filterGenderEqualityWorkActViolationRecords, parseFineAmount, parseTaipeiLaborPublicationDate, parseViolatedGenderEqualityWorkActArticle } from './genderEqualityWorkActViolations';
import type { GenderEqualityWorkActViolationRecord } from '../types';

test('parses gender equality work act dates, articles, fine amounts, and no-violation rows', () => {
  assert.deepEqual(parseTaipeiLaborPublicationDate('1150605'), { raw: '1150605', date: '2026-06-05', year: 2026, month: 6, yearMonth: '2026-06', warning: undefined });
  assert.equal(parseTaipeiLaborPublicationDate('115/03/30').date, '2026-03-30');
  assert.equal(parseTaipeiLaborPublicationDate('民國115年6月5日').date, '2026-06-05');
  assert.equal(classifyGenderEqualityActNameVersion('性別工作平等法第13條第2項'), 'act_of_gender_equality_in_employment_old_name');
  assert.equal(classifyGenderEqualityActNameVersion('性別平等工作法第13條第2項'), 'gender_equality_in_employment_act');
  assert.deepEqual(parseViolatedGenderEqualityWorkActArticle('性別平等工作法第13條第2項;性別平等工作法第36條').violatedArticleTokens, ['第13條第2項', '第36條']);
  assert.deepEqual(classifyGenderEqualityWorkViolationContent('雇主未盡工作場所性騷擾防治義務'), ['workplace_sexual_harassment_prevention']);
  assert.equal(classifyGenderEqualityWorkViolationContent('本期無違反性別平等工作法之事業單位')[0], 'no_violation_period');
  assert.deepEqual(parseFineAmount('300,000'), { fineAmountRaw: '300,000', fineAmount: 300000, fineAmountCategory: '300000_to_499999', hasFineAmount: true });
  assert.equal(classifyFineAmount(undefined, '無'), 'none_or_not_applicable');
  assert.equal(detectNoViolationPeriodRecord({ note: '本期無違反性別平等工作法之事業單位' }), true);
});

test('summarizes and filters gender equality work act publication records', () => {
  const records: GenderEqualityWorkActViolationRecord[] = [
    { id: 'a', module: 'gender_equality_work_act_violation_records', sourceSequenceNumber: 1, announcementDateRaw: '1150605', announcementDate: '2026-06-05', announcementYear: 2026, announcementMonth: 6, announcementYearMonth: '2026-06', penaltyDateRaw: '無', penaltyDocumentNumber: undefined, businessOrganizationOrNaturalPersonName: '本期無違規', violatedArticleTokens: [], actNameVersion: 'none', violationContentCategories: ['no_violation_period'], fineAmountCategory: 'none_or_not_applicable', hasFineAmount: false, note: '本期無違反性別平等工作法之事業單位', hasNote: true, isNoViolationPeriodRecord: true, source: 'x', sourceAgency: 'x', legalBasis: '性別平等工作法' },
    { id: 'b', module: 'gender_equality_work_act_violation_records', sourceSequenceNumber: 2, announcementDateRaw: '1150505', announcementDate: '2026-05-05', announcementYear: 2026, announcementMonth: 5, announcementYearMonth: '2026-05', penaltyDateRaw: '1150330', penaltyDate: '2026-03-30', penaltyYear: 2026, penaltyMonth: 3, penaltyYearMonth: '2026-03', daysBetweenPenaltyAndAnnouncement: 36, penaltyDocumentNumber: '北市勞就字第11461087681號', penaltyDocumentNumberNormalized: '北市勞就字第11461087681號', businessOrganizationOrNaturalPersonName: '某公司', businessOrganizationOrNaturalPersonNameNormalized: '某公司', representativeName: '王小明', representativeNameNormalized: '王小明', violatedGenderEqualityWorkActArticleRaw: '性別平等工作法第21條第1項', violatedGenderEqualityWorkActArticle: '性別平等工作法第21條第1項', violatedGenderEqualityWorkActArticleNormalized: '性別平等工作法第21條第1項', violatedArticleTokens: ['第21條第1項'], actNameVersion: 'gender_equality_in_employment_act', violationContent: '申請育嬰留職停薪遭拒', violationContentNormalized: '申請育嬰留職停薪遭拒', violationContentCategories: ['parental_leave_or_childcare_rights'], fineAmountRaw: '20000', fineAmount: 20000, fineAmountCategory: 'under_50000', hasFineAmount: true, hasNote: false, isNoViolationPeriodRecord: false, source: 'x', sourceAgency: 'x', legalBasis: '性別平等工作法' },
    { id: 'c', module: 'gender_equality_work_act_violation_records', sourceSequenceNumber: 3, announcementDateRaw: '1150505', announcementDate: '2026-05-05', announcementYear: 2026, announcementMonth: 5, announcementYearMonth: '2026-05', penaltyDateRaw: '1150325', penaltyDate: '2026-03-25', penaltyYear: 2026, penaltyMonth: 3, penaltyYearMonth: '2026-03', daysBetweenPenaltyAndAnnouncement: 41, penaltyDocumentNumber: '北市勞就字第11461156651號', penaltyDocumentNumberNormalized: '北市勞就字第11461156651號', businessOrganizationOrNaturalPersonName: '甲公司', businessOrganizationOrNaturalPersonNameNormalized: '甲公司', representativeName: '李小華', representativeNameNormalized: '李小華', violatedGenderEqualityWorkActArticleRaw: '性別平等工作法第13條第2項', violatedGenderEqualityWorkActArticle: '性別平等工作法第13條第2項', violatedGenderEqualityWorkActArticleNormalized: '性別平等工作法第13條第2項', violatedArticleTokens: ['第13條第2項'], actNameVersion: 'gender_equality_in_employment_act', violationContent: '雇主未盡工作場所性騷擾防治義務', violationContentNormalized: '雇主未盡工作場所性騷擾防治義務', violationContentCategories: ['workplace_sexual_harassment_prevention'], fineAmountRaw: '300000', fineAmount: 300000, fineAmountCategory: '300000_to_499999', hasFineAmount: true, hasNote: false, isNoViolationPeriodRecord: false, source: 'x', sourceAgency: 'x', legalBasis: '性別平等工作法' },
  ];
  const summary = buildGenderEqualityWorkActViolationSummary(records);
  assert.equal(summary.totalRecords, 3);
  assert.equal(summary.violationRecordCount, 2);
  assert.equal(summary.noViolationPeriodRecordCount, 1);
  assert.equal(summary.totalFineAmount, 320000);
  assert.equal(summary.byViolatedArticle[0].violatedArticle, '第13條第2項');
  assert.deepEqual(filterGenderEqualityWorkActViolationRecords(records, { search: '性騷擾', includeNoViolationPeriodRecords: 'yes', announcementYear: '', announcementYearMonth: '', announcementDateFrom: '', announcementDateTo: '', penaltyYear: '', penaltyYearMonth: '', penaltyDateFrom: '', penaltyDateTo: '', violatedArticle: '', actNameVersion: '', violationContentCategory: '', fineAmountCategory: '', fineAmountMin: '', fineAmountMax: '', hasFineAmount: '', hasNote: '', name: '', penaltyDocumentNumber: '' }).map((r) => r.id), ['c']);
  assert.equal(filterGenderEqualityWorkActViolationRecords(records, { search: '', includeNoViolationPeriodRecords: 'no', announcementYear: '', announcementYearMonth: '', announcementDateFrom: '', announcementDateTo: '', penaltyYear: '', penaltyYearMonth: '', penaltyDateFrom: '', penaltyDateTo: '', violatedArticle: '', actNameVersion: '', violationContentCategory: '', fineAmountCategory: '', fineAmountMin: '', fineAmountMax: '', hasFineAmount: '', hasNote: '', name: '', penaltyDocumentNumber: '' }).length, 2);
});
