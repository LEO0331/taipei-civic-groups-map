import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildInfantCareCenterEvaluationSummary, filterInfantCareCenterEvaluationInstitutions,
  normalizeInfantCareEvaluationResult, parseEvaluationYearColumn, parseTaipeiDistrictCode, reconcileDistrict,
} from './infantCareCenterEvaluationResults';
import type { InfantCareCenterEvaluationInstitutionRecord, InfantCareCenterEvaluationYearRecord } from '../types';

test('normalizes infant care evaluation result values without dropping notes', () => {
  assert.deepEqual(normalizeInfantCareEvaluationResult('優'), { evaluationResultRaw: '優', evaluationResultNormalized: '優等', evaluationGrade: 'excellent', evaluationStatus: 'evaluated' });
  assert.deepEqual(normalizeInfantCareEvaluationResult('甲等'), { evaluationResultRaw: '甲等', evaluationResultNormalized: '甲等', evaluationGrade: 'a', evaluationStatus: 'evaluated' });
  assert.deepEqual(normalizeInfantCareEvaluationResult('丙(輔導通過)'), { evaluationResultRaw: '丙(輔導通過)', evaluationResultNormalized: '丙等', evaluationGrade: 'c', evaluationStatus: 'guidance_passed', evaluationNote: '丙(輔導通過)' });
  assert.deepEqual(normalizeInfantCareEvaluationResult('因績優排除項目降為乙等'), { evaluationResultRaw: '因績優排除項目降為乙等', evaluationResultNormalized: '乙等', evaluationGrade: 'b', evaluationStatus: 'special_note', evaluationNote: '因績優排除項目降為乙等' });
  assert.equal(normalizeInfantCareEvaluationResult('停業中').evaluationStatus, 'suspended');
});

test('parses evaluation year columns and district codes', () => {
  assert.deepEqual(parseEvaluationYearColumn('110年'), { rocYear: 110, year: 2021 });
  assert.deepEqual(parseTaipeiDistrictCode('63000050'), { districtCode: '63000050', districtFromCode: '中正區', warning: undefined });
  assert.deepEqual(reconcileDistrict({ district: '大安區', districtFromCode: '中正區' }), { district: '大安區', districtFromCode: '中正區', districtMismatch: true, warning: 'District mismatch: 大安區 / 中正區' });
});

const yearRecords: InfantCareCenterEvaluationYearRecord[] = [
  { id: 'a-2021', module: 'infant_care_center_evaluation_results', institutionName: '甲托嬰中心', institutionNameNormalized: '甲托嬰中心', district: '中正區', districtCode: '63000050', districtFromCode: '中正區', districtMismatch: false, evaluationRocYear: 110, evaluationYear: 2021, evaluationResultRaw: '優', evaluationResultNormalized: '優等', evaluationGrade: 'excellent', evaluationStatus: 'evaluated', isEvaluated: true, isExcellentOrEquivalent: true, isAOrEquivalent: false, isBOrEquivalent: false, isCOrEquivalent: false, isDOrEquivalent: false, isClosedOrSuspended: false, hasSpecialNote: false, sourceRecordHash: 'a', source: '臺北市托嬰中心評鑑結果', sourceAgency: '臺北市政府社會局' },
  { id: 'a-2022', module: 'infant_care_center_evaluation_results', institutionName: '甲托嬰中心', institutionNameNormalized: '甲托嬰中心', district: '中正區', districtCode: '63000050', districtFromCode: '中正區', districtMismatch: false, evaluationRocYear: 111, evaluationYear: 2022, evaluationGrade: 'not_evaluated', evaluationStatus: 'not_evaluated', isEvaluated: false, isExcellentOrEquivalent: false, isAOrEquivalent: false, isBOrEquivalent: false, isCOrEquivalent: false, isDOrEquivalent: false, isClosedOrSuspended: false, hasSpecialNote: false, sourceRecordHash: 'b', source: '臺北市托嬰中心評鑑結果', sourceAgency: '臺北市政府社會局' },
];
const institutions: InfantCareCenterEvaluationInstitutionRecord[] = [{
  id: 'a', module: 'infant_care_center_evaluation_results', institutionName: '甲托嬰中心', institutionNameNormalized: '甲托嬰中心',
  district: '中正區', districtCode: '63000050', districtFromCode: '中正區', districtMismatch: false,
  yearlyResults: {
    '2021': { rocYear: 110, year: 2021, evaluationResultRaw: '優', evaluationResultNormalized: '優等', evaluationGrade: 'excellent', evaluationStatus: 'evaluated', isEvaluated: true },
    '2022': { rocYear: 111, year: 2022, evaluationGrade: 'not_evaluated', evaluationStatus: 'not_evaluated', isEvaluated: false },
  }, latestEvaluationYear: 2021, latestEvaluationRocYear: 110,
  latestEvaluationResultRaw: '優', latestEvaluationGrade: 'excellent', latestEvaluationStatus: 'evaluated', evaluatedYearCount: 1, missingYearCount: 1, specialNoteCount: 0,
  sourceRecordHash: 'a', source: '臺北市托嬰中心評鑑結果', sourceAgency: '臺北市政府社會局',
}];

test('summarizes and filters infant care evaluation records', () => {
  const summary = buildInfantCareCenterEvaluationSummary(institutions, yearRecords);
  assert.equal(summary.totalInstitutions, 1);
  assert.equal(summary.totalInstitutionYearRecords, 2);
  assert.equal(summary.evaluatedRecordCount, 1);
  assert.equal(summary.latestEvaluationYear, 2022);
  assert.equal(filterInfantCareCenterEvaluationInstitutions(institutions, { search: '優', district: '', districtCode: '', evaluationYear: '', latestEvaluationGrade: 'excellent', latestEvaluationStatus: '', anyYearGrade: '', hasLatestResult: '', closedOrSuspended: '', specialNote: '' }).length, 1);
});
