import { strict as assert } from 'node:assert';
import test from 'node:test';
import {
  buildEmploymentAgencyIntermediaryCompanySummary,
  classifyEmploymentAgencyAssociation,
  classifyEmploymentAgencyBusinessItem,
  classifyEmploymentAgencyBusinessScope,
  classifyEmploymentAgencyEvaluationGrade,
  classifyEmploymentAgencyStaffSize,
  employmentAgencyLocationPrecision,
  filterEmploymentAgencyIntermediaryCompanies,
  parseEmploymentAgencyAddress,
  parseEmploymentAgencyPhone,
  parseNonNegativeIntegerCount,
  parseTaiwanUnifiedBusinessNumber,
} from './employmentAgencyIntermediaryCompanies';
import type { EmploymentAgencyIntermediaryCompanyRecord } from '../types';

const base: EmploymentAgencyIntermediaryCompanyRecord = {
  id: 'a',
  module: 'employment_agency_intermediary_companies',
  sourceSequenceNumber: 1,
  sourceSequenceNumberNormalized: '1',
  evaluationGradeRaw: 'A',
  evaluationGrade: 'A',
  evaluationGradeNormalized: 'a',
  evaluationGradeCategory: 'grade_a',
  institutionName: '東南亞人力資源管理顧問有限公司',
  institutionNameNormalized: '東南亞人力資源管理顧問有限公司',
  institutionAddress: '臺北市松山區南京東路５段６３號６樓',
  institutionAddressNormalized: '臺北市松山區南京東路５段６３號６樓',
  districtNameFromAddress: '松山區',
  isTaipeiDistrict: true,
  roadName: '南京東路５段',
  addressLooksLikeMultiFloorOrUnit: true,
  phone: '02-2760-0000',
  phoneNormalized: '02-2760-0000',
  hasPhone: true,
  fax: '02-2760-0001',
  faxNormalized: '02-2760-0001',
  hasFax: true,
  businessScopeRaw: '國內暨國外',
  businessScope: '國內暨國外',
  businessScopeNormalized: '國內暨國外',
  businessScopeCategory: 'domestic_and_foreign',
  intermediaryAssociationRaw: '臺北市就業服務商業同業公會',
  intermediaryAssociation: '臺北市就業服務商業同業公會',
  intermediaryAssociationNormalized: '臺北市就業服務商業同業公會',
  intermediaryAssociationCategory: 'taipei_employment_service_business_association',
  hasIntermediaryAssociation: true,
  responsiblePersonOrManagerName: '王小明',
  responsiblePersonOrManagerNameNormalized: '王小明',
  responsiblePersonOrManagerEnglishName: 'WANG',
  responsiblePersonOrManagerEnglishNameNormalized: 'wang',
  companyUnifiedBusinessNumber: '12345678',
  companyUnifiedBusinessNumberNormalized: '12345678',
  companyUnifiedBusinessNumberValidFormat: true,
  businessItemCode: 'I701011',
  businessItemCodeNormalized: 'I701011',
  businessItemCategory: 'employment_service',
  professionalStaffCount: 3,
  bilingualEmploymentPermitStaffCount: 1,
  employeeCount: 12,
  staffSizeCategory: 'small',
  hasBilingualEmploymentPermitStaff: true,
  professionalStaffShare: 0.25,
  bilingualEmploymentPermitStaffShare: 1 / 12,
  coordinateSource: 'none',
  geocodingStatus: 'not_geocoded_address_only',
  locationPrecision: 'district_address',
  googleMapsQuery: '臺北市松山區南京東路５段６３號６樓 東南亞人力資源管理顧問有限公司',
  source: '臺北市仲介公司資料',
  sourceAgency: '臺北市政府勞動局重建處',
};

test('classifies source categories without ranking agencies', () => {
  assert.equal(classifyEmploymentAgencyEvaluationGrade('績優免評'), 'excellent_exempt');
  assert.equal(classifyEmploymentAgencyEvaluationGrade('B'), 'grade_b');
  assert.equal(classifyEmploymentAgencyEvaluationGrade('尚無'), 'not_available');
  assert.equal(classifyEmploymentAgencyBusinessScope('國內暨國外'), 'domestic_and_foreign');
  assert.equal(classifyEmploymentAgencyBusinessScope('國外'), 'foreign_only');
  assert.equal(classifyEmploymentAgencyAssociation('未加入公會或不詳'), 'not_joined_or_unknown');
  assert.equal(classifyEmploymentAgencyBusinessItem('I701011'), 'employment_service');
  assert.equal(classifyEmploymentAgencyStaffSize(75), 'large');
});

test('parses address, contact and unified business number fields as text', () => {
  const address = parseEmploymentAgencyAddress('台北市大安區忠孝東路３段１３６號１０樓');
  assert.equal(address.districtNameFromAddress, '大安區');
  assert.equal(address.roadName, '忠孝東路３段');
  assert.equal(address.addressLooksLikeMultiFloorOrUnit, true);
  assert.equal(parseEmploymentAgencyPhone('(02) 2760-0000').phoneNormalized, '022760-0000');
  assert.equal(parseTaiwanUnifiedBusinessNumber('01234567').companyUnifiedBusinessNumberValidFormat, true);
  assert.equal(parseNonNegativeIntegerCount('17', '專業人員人數').value, 17);
  assert.equal(employmentAgencyLocationPrecision(address), 'district_address');
});

test('builds summaries and filters intermediary company records', () => {
  const records = [base, { ...base, id: 'b', sourceSequenceNumber: 2, sourceSequenceNumberNormalized: '2', evaluationGrade: '尚無', evaluationGradeCategory: 'not_available', institutionName: '乙公司', institutionNameNormalized: '乙公司', districtNameFromAddress: '中山區', intermediaryAssociation: undefined, intermediaryAssociationCategory: 'missing', hasIntermediaryAssociation: false, professionalStaffCount: 1, bilingualEmploymentPermitStaffCount: 0, employeeCount: 4, staffSizeCategory: 'micro', hasBilingualEmploymentPermitStaff: false }];
  const summary = buildEmploymentAgencyIntermediaryCompanySummary(records);
  assert.equal(summary.totalRecords, 2);
  assert.equal(summary.districtCount, 2);
  assert.equal(summary.totalEmployeeCount, 16);
  assert.equal(summary.byBusinessScope[0].businessScopeCategory, 'domestic_and_foreign');
  assert.equal(filterEmploymentAgencyIntermediaryCompanies(records, { search: '12345678', districtNameFromAddress: '', roadName: '', evaluationGrade: '', evaluationGradeCategory: '', businessScope: '', businessScopeCategory: '', intermediaryAssociation: '', intermediaryAssociationCategory: '', hasPhone: '', hasFax: '', hasIntermediaryAssociation: '', businessItemCode: '', companyUnifiedBusinessNumberValidFormat: '', staffSizeCategory: '', professionalStaffMin: '', professionalStaffMax: '', bilingualStaffMin: '', bilingualStaffMax: '', employeeMin: '', employeeMax: '', hasBilingualEmploymentPermitStaff: '', locationPrecision: '', geocodingStatus: '' }).length, 2);
  assert.equal(filterEmploymentAgencyIntermediaryCompanies(records, { search: '', districtNameFromAddress: '中山區', roadName: '', evaluationGrade: '', evaluationGradeCategory: '', businessScope: '', businessScopeCategory: '', intermediaryAssociation: '', intermediaryAssociationCategory: 'missing', hasPhone: '', hasFax: '', hasIntermediaryAssociation: 'no', businessItemCode: '', companyUnifiedBusinessNumberValidFormat: '', staffSizeCategory: 'micro', professionalStaffMin: '', professionalStaffMax: '', bilingualStaffMin: '', bilingualStaffMax: '', employeeMin: '', employeeMax: '5', hasBilingualEmploymentPermitStaff: 'no', locationPrecision: '', geocodingStatus: '' }).length, 1);
});
