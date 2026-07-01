import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildChildMedicalSubsidyContractedProviderSummary, filterChildMedicalSubsidyContractedProviders,
  parseAdministrativeArea, parseIntegerText, parseMedicalProviderAddress, parseMedicalProviderPhone,
  parseProviderCode, reconcileProviderArea,
} from './childMedicalSubsidyContractedProviders';
import type { ChildMedicalSubsidyContractedProviderRecord } from '../types';

test('parses child medical subsidy provider source fields conservatively', () => {
  assert.equal(parseIntegerText('001'), 1);
  assert.equal(parseProviderCode('001234'), '001234');
  assert.deepEqual(parseAdministrativeArea('新北市'), {
    administrativeAreaRaw: '新北市',
    administrativeArea: '新北市',
    administrativeAreaNormalized: '新北市',
    isTaipeiDistrict: false,
    taipeiDistrict: undefined,
    outsideTaipeiArea: '新北市',
    areaDisplayName: '新北市',
    warning: undefined,
  });
  assert.deepEqual(parseAdministrativeArea('士林區').isTaipeiDistrict, true);
  assert.equal(parseMedicalProviderAddress('台北市士林區士東路12號之1號').addressNormalized, '臺北市士林區士東路12號之1號');
  assert.equal(parseMedicalProviderAddress('臺北市士林區士東路12號之1號').roadName, '士東路');
  assert.deepEqual(reconcileProviderArea({ isTaipeiDistrict: true, taipeiDistrict: '士林區', districtFromAddress: '中山區' }), { districtMismatch: true, warning: 'Administrative area and address mismatch: 士林區 / 中山區' });
  assert.equal(parseMedicalProviderPhone('02-28381770').phoneType, 'taipei_landline');
});

const records: ChildMedicalSubsidyContractedProviderRecord[] = [
  { id: 'a', module: 'child_medical_subsidy_contracted_providers', sourceSequenceNumber: 1, providerCode: '3501', providerCodeNormalized: '3501', providerName: '甲診所', providerNameNormalized: '甲診所', administrativeAreaRaw: '士林區', administrativeArea: '士林區', administrativeAreaNormalized: '士林區', isTaipeiDistrict: true, taipeiDistrict: '士林區', areaDisplayName: '士林區', address: '臺北市士林區士東路1號', addressNormalized: '臺北市士林區士東路1號', districtFromAddress: '士林區', districtMismatch: false, roadName: '士東路', phone: '02-11111111', phoneDisplay: '02-11111111', phoneDialHref: 'tel:0211111111', phoneType: 'taipei_landline', hasPhone: true, duplicateProviderCode: true, locationPrecision: 'district_centroid', source: '臺北市兒童醫療補助特約院所名冊', sourceAgency: '臺北市政府衛生局' },
  { id: 'b', module: 'child_medical_subsidy_contracted_providers', sourceSequenceNumber: 2, providerCode: '3501', providerCodeNormalized: '3501', providerName: '乙診所', providerNameNormalized: '乙診所', administrativeAreaRaw: '新北市', administrativeArea: '新北市', administrativeAreaNormalized: '新北市', isTaipeiDistrict: false, outsideTaipeiArea: '新北市', areaDisplayName: '新北市', address: '新北市板橋區文化路1號', addressNormalized: '新北市板橋區文化路1號', districtMismatch: false, roadName: '文化路', phone: '02-22222222', phoneDisplay: '02-22222222', phoneDialHref: 'tel:0222222222', phoneType: 'taipei_landline', hasPhone: true, duplicateProviderCode: true, locationPrecision: 'address_only', source: '臺北市兒童醫療補助特約院所名冊', sourceAgency: '臺北市政府衛生局' },
];

test('summarizes and filters child medical subsidy providers', () => {
  const summary = buildChildMedicalSubsidyContractedProviderSummary(records);
  assert.equal(summary.totalRecords, 2);
  assert.equal(summary.taipeiProviderCount, 1);
  assert.equal(summary.outsideTaipeiProviderCount, 1);
  assert.equal(summary.dataQuality.duplicateProviderCodeCount, 1);
  assert.equal(summary.outsideTaipeiAreas[0].area, '新北市');
  assert.equal(filterChildMedicalSubsidyContractedProviders(records, { search: '3501', administrativeArea: '', taipeiDistrict: '', outsideTaipeiArea: '', isTaipeiDistrict: '', roadName: '', hasPhone: '', phoneType: '', districtMismatch: '', duplicateProviderCode: 'yes' }).length, 2);
  assert.equal(filterChildMedicalSubsidyContractedProviders(records, { search: '', administrativeArea: '', taipeiDistrict: '', outsideTaipeiArea: '新北市', isTaipeiDistrict: '', roadName: '', hasPhone: '', phoneType: '', districtMismatch: '', duplicateProviderCode: '' }).length, 1);
});
