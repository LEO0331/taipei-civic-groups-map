import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildPubliclyFundedHpvVaccinationProviderSummary,
  parseMedicalProviderAddress,
  parseMedicalProviderPhone,
  parseTaipeiDistrictCode,
  reconcileDistrict,
} from './publiclyFundedHpvVaccinationProviders';
import type { PubliclyFundedHpvVaccinationProviderRecord } from '../types';

test('parses HPV provider district code, address, and phone', () => {
  assert.equal(parseTaipeiDistrictCode('63000010').districtFromCode, '松山區');
  const address = parseMedicalProviderAddress('台北市松山區八德路二段424號');
  assert.equal(address.addressNormalized, '臺北市松山區八德路二段424號');
  assert.equal(address.districtFromAddress, '松山區');
  assert.equal(address.roadName, '八德路二段');
  assert.deepEqual(reconcileDistrict({ districtFromCode: '松山區', districtFromAddress: '大安區' }), { district: '松山區', districtMismatch: true, warning: 'District code and address mismatch' });
  const phone = parseMedicalProviderPhone('(02)27718151');
  assert.equal(phone.phoneType, 'taipei_landline');
  assert.equal(phone.phoneDialHref, 'tel:0227718151');
});

test('summarizes HPV provider records', () => {
  const records: PubliclyFundedHpvVaccinationProviderRecord[] = [
    { id: 'a', module: 'publicly_funded_hpv_vaccination_providers', districtCode: '63000010', districtFromCode: '松山區', providerName: '甲診所', providerNameNormalized: '甲診所', address: '臺北市松山區八德路二段1號', addressNormalized: '臺北市松山區八德路二段1號', districtFromAddress: '松山區', district: '松山區', districtMismatch: false, roadName: '八德路二段', phone: '(02)1', phoneType: 'taipei_landline', hasPhone: true, locationPrecision: 'address_only', source: 'x', sourceAgency: 'x' },
    { id: 'b', module: 'publicly_funded_hpv_vaccination_providers', districtCode: '63000020', districtFromCode: '信義區', providerName: '乙診所', providerNameNormalized: '乙診所', address: '臺北市信義區松仁路1號', addressNormalized: '臺北市信義區松仁路1號', districtFromAddress: '信義區', district: '信義區', districtMismatch: false, roadName: '松仁路', phoneType: 'missing', hasPhone: false, locationPrecision: 'address_only', source: 'x', sourceAgency: 'x' },
  ];
  const summary = buildPubliclyFundedHpvVaccinationProviderSummary(records);
  assert.equal(summary.totalRecords, 2);
  assert.equal(summary.districtCount, 2);
  assert.equal(summary.recordsWithPhone, 1);
  assert.equal(summary.byDistrictCode[0].providerCount, 1);
});
