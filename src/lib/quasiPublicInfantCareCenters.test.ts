import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildQuasiPublicInfantCareCenterSummary, deriveCapacityMetrics, parseInfantCareCenterAddress,
  parseInfantCareCenterPhone, parseInfantCareEvaluationResult, parseIntegerValue,
} from './quasiPublicInfantCareCenters';
import type { QuasiPublicInfantCareCenter } from '../types';

test('parses infant care source fields', () => {
  assert.equal(parseIntegerValue(' 1,234 '), 1234);
  assert.equal(parseIntegerValue('--'), undefined);
  assert.deepEqual(deriveCapacityMetrics(20, 18), { apparentRemainingCapacity: 2, occupancyRatePercent: 90, capacityStatus: 'apparent_remaining_capacity', warning: undefined });
  assert.deepEqual(parseInfantCareEvaluationResult('111-甲'), { evaluationResultRaw: '111-甲', evaluationRocYear: 111, evaluationGregorianYear: 2022, evaluationGrade: 'grade_a', warning: undefined });
  assert.equal(parseInfantCareEvaluationResult('').evaluationGrade, 'missing');
  assert.equal(parseInfantCareCenterAddress('台北市中正區南昌路1段145號2樓', '中正區').roadName, '南昌路1段');
  assert.equal(parseInfantCareCenterAddress('臺北市內湖區民權東路6段1號', '內湖區').roadName, '民權東路6段');
  assert.equal(parseInfantCareCenterPhone('(02)23456789').phoneType, 'taipei_landline');
  assert.equal(parseInfantCareCenterPhone('02-2345-6789#9').phoneType, 'extension');
});

test('summarizes infant care capacity without treating missing as zero', () => {
  const base = {
    module: 'quasi_public_infant_care_centers' as const, centerName: '甲托嬰中心', centerOperationType: 'private_infant_care_center' as const,
    district: '中正區', address: '臺北市中正區A路1號', addressNormalized: '臺北市中正區A路1號', roadName: 'A路',
    phoneType: 'taipei_landline' as const, hasPhone: true, evaluationGrade: 'grade_a' as const, hasEvaluationResult: true,
    locationPrecision: 'district_centroid' as const, source: '臺北市準公共化托嬰中心', sourceAgency: '臺北市政府社會局',
  };
  const records: QuasiPublicInfantCareCenter[] = [
    { ...base, id: 'a', approvedCapacity: 20, actualEnrollment: 20, apparentRemainingCapacity: 0, occupancyRatePercent: 100, capacityStatus: 'apparent_full', evaluationResultRaw: '111-甲', evaluationRocYear: 111, evaluationGregorianYear: 2022 },
    { ...base, id: 'b', centerName: '乙托嬰中心', approvedCapacity: 10, actualEnrollment: 5, apparentRemainingCapacity: 5, occupancyRatePercent: 50, capacityStatus: 'apparent_remaining_capacity' },
  ];
  const summary = buildQuasiPublicInfantCareCenterSummary(records);
  assert.equal(summary.totalApprovedCapacity, 30);
  assert.equal(summary.totalActualEnrollment, 25);
  assert.equal(summary.totalApparentRemainingCapacity, 5);
  assert.equal(summary.medianOccupancyRatePercent, 75);
  assert.equal(summary.apparentFullRecordCount, 1);
});
