import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildDentureSubsidyMedicalProviderSummary, filterDentureSubsidyMedicalProviders, normalizeMedicalProviderName,
  parseAdministrativeArea, parseDentureSubsidyType, parseMedicalProviderAddress, parseMedicalProviderPhone, reconcileProviderArea,
} from './dentureSubsidyMedicalProviders';
import type { DentureSubsidyMedicalProviderRecord } from '../types';

test('parses denture subsidy provider source fields conservatively', () => {
  assert.equal(parseDentureSubsidyType('假牙補助').subsidyTypeNormalized, '假牙補助');
  assert.equal(parseAdministrativeArea('大同區').taipeiDistrict, '大同區');
  assert.equal(parseMedicalProviderAddress('台北市大同區鄭州路145號').addressNormalized, '臺北市大同區鄭州路145號');
  assert.equal(parseMedicalProviderAddress('臺北市大同區鄭州路145號').roadName, '鄭州路');
  assert.deepEqual(reconcileProviderArea({ isTaipeiDistrict: true, taipeiDistrict: '大同區', districtFromAddress: '中正區' }), { districtMismatch: true, warning: 'Administrative area and address mismatch: 大同區 / 中正區' });
  assert.equal(normalizeMedicalProviderName('臺北市立聯合醫院 中興院區'), '臺北市立聯合醫院 中興院區');
  assert.equal(parseMedicalProviderPhone('(02)25523234').phoneType, 'taipei_landline');
});

const records: DentureSubsidyMedicalProviderRecord[] = [
  { id: 'a', module: 'denture_subsidy_medical_providers', subsidyTypeRaw: '假牙補助', subsidyType: '假牙補助', subsidyTypeNormalized: '假牙補助', providerName: '臺北市立聯合醫院中興院區', providerNameNormalized: '臺北市立聯合醫院中興院區', administrativeAreaRaw: '大同區', administrativeArea: '大同區', administrativeAreaNormalized: '大同區', isTaipeiDistrict: true, taipeiDistrict: '大同區', areaDisplayName: '大同區', address: '臺北市大同區鄭州路145號', addressNormalized: '臺北市大同區鄭州路145號', districtFromAddress: '大同區', districtMismatch: false, roadName: '鄭州路', phone: '(02)25523234', phoneDisplay: '(02)25523234', phoneDialHref: 'tel:0225523234', phoneType: 'taipei_landline', hasPhone: true, locationPrecision: 'district_centroid', source: '臺北市假牙補助醫療院所名單', sourceAgency: '臺北市政府社會局' },
  { id: 'b', module: 'denture_subsidy_medical_providers', subsidyTypeRaw: '假牙補助', subsidyType: '假牙補助', subsidyTypeNormalized: '假牙補助', providerName: '臺北市立聯合醫院仁愛院區', providerNameNormalized: '臺北市立聯合醫院仁愛院區', administrativeAreaRaw: '大安區', administrativeArea: '大安區', administrativeAreaNormalized: '大安區', isTaipeiDistrict: true, taipeiDistrict: '大安區', areaDisplayName: '大安區', address: '臺北市大安區仁愛路4段10號', addressNormalized: '臺北市大安區仁愛路4段10號', districtFromAddress: '大安區', districtMismatch: false, roadName: '仁愛路', phone: '(02)27093600', phoneDisplay: '(02)27093600', phoneDialHref: 'tel:0227093600', phoneType: 'taipei_landline', hasPhone: true, locationPrecision: 'district_centroid', source: '臺北市假牙補助醫療院所名單', sourceAgency: '臺北市政府社會局' },
];

test('summarizes and filters denture subsidy medical providers', () => {
  const summary = buildDentureSubsidyMedicalProviderSummary(records);
  assert.equal(summary.totalRecords, 2);
  assert.equal(summary.subsidyTypeCount, 1);
  assert.equal(summary.taipeiProviderCount, 2);
  assert.equal(summary.byAdministrativeArea[0].providerCount, 1);
  assert.equal(filterDentureSubsidyMedicalProviders(records, { search: '仁愛', subsidyType: '', administrativeArea: '', taipeiDistrict: '', roadName: '', hasPhone: '', phoneType: '', districtMismatch: '' }).length, 1);
  assert.equal(filterDentureSubsidyMedicalProviders(records, { search: '', subsidyType: '假牙補助', administrativeArea: '', taipeiDistrict: '大同區', roadName: '', hasPhone: '', phoneType: '', districtMismatch: '' }).length, 1);
});
