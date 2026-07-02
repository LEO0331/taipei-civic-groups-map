import assert from 'node:assert/strict';
import test from 'node:test';
import { buildVeterinarianProfessionalRegistrySummary, createAnimalHospitalMatchKey, filterVeterinarianProfessionalRegistry, parseVeterinarianCityCode, parseVeterinarianCityCounty, parseVeterinarianPracticeLicenseNumber } from './veterinarianProfessionalRegistry';
import type { VeterinarianProfessionalRegistryRecord } from '../types';

test('parses veterinarian registry source fields', () => {
  assert.deepEqual(parseVeterinarianCityCode('63000'), { cityCode: '63000', cityCodeNormalized: '63000', warning: undefined });
  assert.deepEqual(parseVeterinarianCityCounty('台北市'), { cityCounty: '台北市', cityCountyNormalized: '臺北市', cityCountyIsTaipei: true, warning: undefined });
  assert.equal(parseVeterinarianPracticeLicenseNumber('北市獸師執字第97773號').practiceLicenseNumberFormat, 'taipei_veterinarian_practice_license');
  assert.equal(parseVeterinarianPracticeLicenseNumber('12345').practiceLicenseNumberFormat, 'numeric_only');
  assert.equal(createAnimalHospitalMatchKey('  台 大 動物醫院 '), '臺大動物醫院');
});

test('summarizes and filters veterinarian registry records', () => {
  const records: VeterinarianProfessionalRegistryRecord[] = [
    { id: '1', module: 'veterinarian_professional_registry', cityCode: '63000', cityCodeNormalized: '63000', cityCounty: '臺北市', cityCountyNormalized: '臺北市', cityCountyIsTaipei: true, veterinarianName: '王小明', veterinarianNameNormalized: '王小明', practiceLicenseNumber: '北市獸師執字第1號', practiceLicenseNumberNormalized: '北市獸師執字第1號', practiceLicenseNumberFormat: 'taipei_veterinarian_practice_license', practiceLicenseIssuedCityCodeCandidate: '北市', serviceVeterinaryInstitutionName: '國立臺灣大學生物資源暨農學院附設動物醫院', serviceVeterinaryInstitutionNameNormalized: '國立臺灣大學生物資源暨農學院附設動物醫院', possibleAnimalHospitalMatchKey: '國立臺灣大學生物資源暨農學院附設動物醫院', source: '臺北市獸醫師資訊', sourceAgency: '臺北市政府產業發展局動物保護處' },
    { id: '2', module: 'veterinarian_professional_registry', cityCode: '63000', cityCodeNormalized: '63000', cityCounty: '臺北市', cityCountyNormalized: '臺北市', cityCountyIsTaipei: true, veterinarianName: '林小華', veterinarianNameNormalized: '林小華', practiceLicenseNumber: '北市獸師執字第2號', practiceLicenseNumberNormalized: '北市獸師執字第2號', practiceLicenseNumberFormat: 'taipei_veterinarian_practice_license', practiceLicenseIssuedCityCodeCandidate: '北市', serviceVeterinaryInstitutionName: '長青動物醫院', serviceVeterinaryInstitutionNameNormalized: '長青動物醫院', possibleAnimalHospitalMatchKey: '長青動物醫院', source: '臺北市獸醫師資訊', sourceAgency: '臺北市政府產業發展局動物保護處' },
  ];
  const summary = buildVeterinarianProfessionalRegistrySummary(records);
  assert.equal(summary.totalRecords, 2);
  assert.equal(summary.uniquePracticeLicenseNumberCount, 2);
  assert.equal(summary.recordsWithTaipeiCityCounty, 2);
  assert.equal(summary.topServiceVeterinaryInstitutions[0].veterinarianCount, 1);
  assert.equal(filterVeterinarianProfessionalRegistry(records, { search: '長青', cityCode: '', cityCounty: '', licenseNumberFormat: '', serviceVeterinaryInstitutionName: '', cityCountyIsTaipei: '' }).length, 1);
});
