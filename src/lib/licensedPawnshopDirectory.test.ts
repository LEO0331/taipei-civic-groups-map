import assert from 'node:assert/strict';
import test from 'node:test';
import { buildLicensedPawnshopDirectorySummary, filterLicensedPawnshops, normalizePawnshopName, parseCityCounty, parsePawnshopBusinessAddress, parsePawnshopLicenseNumber } from './licensedPawnshopDirectory';
import type { LicensedPawnshopDirectoryRecord } from '../types';

test('parses licensed pawnshop source fields', () => {
  assert.deepEqual(parsePawnshopLicenseNumber('9800251-3'), { licenseNumber: '9800251-3', licenseNumberNormalized: '9800251-3', licenseNumberFormat: 'numeric_with_dash', warning: undefined });
  assert.equal(parsePawnshopLicenseNumber('9100001').licenseNumberFormat, 'simple_numeric');
  assert.equal(parsePawnshopLicenseNumber('A-1').licenseNumberFormat, 'mixed');
  assert.equal(normalizePawnshopName('  大 同  '), '大 同');
  assert.deepEqual(parseCityCounty('台北市'), { cityCounty: '台北市', cityCountyNormalized: '臺北市', cityCountyIsTaipei: true, warning: undefined });
  assert.equal(parsePawnshopBusinessAddress('臺北市大同區重慶北路2段117號1樓').taipeiDistrict, '大同區');
});

test('summarizes and filters licensed pawnshops', () => {
  const records: LicensedPawnshopDirectoryRecord[] = [
    { id: '1', module: 'licensed_pawnshop_directory', sourceSequenceNumber: 1, licenseNumber: '9800251-3', licenseNumberNormalized: '9800251-3', licenseNumberFormat: 'numeric_with_dash', pawnshopName: '一甲', pawnshopNameNormalized: '一甲', businessAddress: '臺北市大同區重慶北路4段107號1樓', businessAddressNormalized: '臺北市大同區重慶北路4段107號1樓', districtFromAddress: '大同區', isTaipeiDistrict: true, taipeiDistrict: '大同區', roadName: '重慶北路4段', cityCounty: '臺北市', cityCountyNormalized: '臺北市', cityCountyIsTaipei: true, locationPrecision: 'district_centroid', source: '臺北市政府警察局當舖業資料清冊', sourceAgency: '臺北市政府警察局刑事警察大隊' },
    { id: '2', module: 'licensed_pawnshop_directory', sourceSequenceNumber: 2, licenseNumber: '9100001', licenseNumberNormalized: '9100001', licenseNumberFormat: 'simple_numeric', pawnshopName: '大同', pawnshopNameNormalized: '大同', businessAddress: '臺北市大同區重慶北路2段117號1樓', businessAddressNormalized: '臺北市大同區重慶北路2段117號1樓', districtFromAddress: '大同區', isTaipeiDistrict: true, taipeiDistrict: '大同區', roadName: '重慶北路2段', cityCounty: '臺北市', cityCountyNormalized: '臺北市', cityCountyIsTaipei: true, locationPrecision: 'district_centroid', source: '臺北市政府警察局當舖業資料清冊', sourceAgency: '臺北市政府警察局刑事警察大隊' },
  ];
  const summary = buildLicensedPawnshopDirectorySummary(records);
  assert.equal(summary.totalRecords, 2);
  assert.equal(summary.uniqueLicenseNumberCount, 2);
  assert.equal(summary.byDistrict[0].pawnshopCount, 2);
  assert.equal(filterLicensedPawnshops(records, { search: '9800251', district: '', cityCounty: '', licenseNumberFormat: '', roadName: '', cityCountyIsTaipei: '', addressParsed: '' }).length, 1);
  assert.equal(filterLicensedPawnshops(records, { search: '', district: '', cityCounty: '', licenseNumberFormat: 'simple_numeric', roadName: '', cityCountyIsTaipei: '', addressParsed: '' }).length, 1);
});
