import assert from 'node:assert/strict';
import test from 'node:test';
import { buildLicensedSpecialEntertainmentBusinessOperatorSummary, filterLicensedSpecialEntertainmentBusinessOperators, getCoordinateQuality, getLocationPrecision, parseBusinessRegistrationNumber, parseOperatingIndustry } from './licensedSpecialEntertainmentBusinessOperators';
import type { LicensedSpecialEntertainmentBusinessOperatorRecord } from '../types';

const base: LicensedSpecialEntertainmentBusinessOperatorRecord = {
  id: 'a',
  module: 'licensed_special_entertainment_business_operators',
  sourceSequenceNumber: 1,
  sourceSequenceNumberNormalized: '1',
  companyOrBusinessName: '測試商業',
  companyOrBusinessNameNormalized: '測試商業',
  businessRegistrationNumber: '12345678',
  businessRegistrationNumberNormalized: '12345678',
  businessRegistrationNumberValidFormat: true,
  responsiblePersonName: '王小明',
  responsiblePersonNameNormalized: '王小明',
  operatingIndustryRaw: '酒吧業\n視聽歌唱業',
  operatingIndustryDisplay: '酒吧業 / 視聽歌唱業',
  operatingIndustryItems: ['酒吧業', '視聽歌唱業'],
  operatingIndustryCategories: ['bar', 'karaoke_or_audio_visual_singing', 'multi_category'],
  isMultiIndustryOperator: true,
  districtName: '中山區',
  districtNameNormalized: '中山區',
  isTaipeiDistrict: true,
  businessPremisesAddress: '南京東路1段1號地下1樓',
  businessPremisesAddressNormalized: '南京東路1段1號地下1樓',
  roadName: '南京東路',
  addressLooksLikeComplexUnit: true,
  longitude: 121.52,
  latitude: 25.05,
  coordinateQuality: 'valid_wgs84_taipei',
  coordinateValid: true,
  coordinatePairKey: '121.520000,25.050000',
  locationPrecision: 'official_coordinate',
  googleMapsQuery: '臺北市 中山區 南京東路1段1號地下1樓 測試商業',
  source: '臺北市合法八大行業業者清冊',
  sourceAgency: '臺北市政府產業發展局商業處',
};

test('parses multi-line operating industry and classifies categories', () => {
  const parsed = parseOperatingIndustry('酒吧業\n視聽歌唱業 ');
  assert.deepEqual(parsed.operatingIndustryItems, ['酒吧業', '視聽歌唱業']);
  assert.deepEqual(parsed.operatingIndustryCategories, ['bar', 'karaoke_or_audio_visual_singing', 'multi_category']);
  assert.equal(parsed.isMultiIndustryOperator, true);
  assert.equal(parsed.operatingIndustryDisplay, '酒吧業 / 視聽歌唱業');
});

test('validates business registration number and coordinate quality', () => {
  assert.equal(parseBusinessRegistrationNumber('01234567').businessRegistrationNumberValidFormat, true);
  assert.equal(parseBusinessRegistrationNumber('123').businessRegistrationNumberValidFormat, false);
  assert.equal(getCoordinateQuality(121.52, 25.05, 'valid', 'valid'), 'valid_wgs84_taipei');
  assert.equal(getCoordinateQuality(120, 25.05, 'valid', 'valid'), 'outside_taipei_bounds');
  assert.equal(getLocationPrecision('valid_wgs84_taipei', '中山區', '南京東路'), 'official_coordinate');
});

test('summarizes and filters licensed special entertainment records', () => {
  const records: LicensedSpecialEntertainmentBusinessOperatorRecord[] = [base, { ...base, id: 'b', sourceSequenceNumber: 2, sourceSequenceNumberNormalized: '2', districtName: '大安區', districtNameNormalized: '大安區', companyOrBusinessName: '第二商業', companyOrBusinessNameNormalized: '第二商業', operatingIndustryRaw: '三溫暖業', operatingIndustryDisplay: '三溫暖業', operatingIndustryItems: ['三溫暖業'], operatingIndustryCategories: ['sauna'], isMultiIndustryOperator: false }];
  const summary = buildLicensedSpecialEntertainmentBusinessOperatorSummary(records);
  assert.equal(summary.totalRecords, 2);
  assert.equal(summary.districtCount, 2);
  assert.equal(summary.multiIndustryOperatorCount, 1);
  assert.equal(summary.duplicateCoordinatePairCount, 1);
  assert.equal(filterLicensedSpecialEntertainmentBusinessOperators(records, { search: '王小明', districtName: '', operatingIndustryItem: '', operatingIndustryCategory: '', isMultiIndustryOperator: '', roadName: '', addressLooksLikeComplexUnit: '', coordinateQuality: '', locationPrecision: '', businessRegistrationNumberValidFormat: '' }).length, 2);
  assert.equal(filterLicensedSpecialEntertainmentBusinessOperators(records, { search: '', districtName: '中山區', operatingIndustryItem: '酒吧業', operatingIndustryCategory: 'bar', isMultiIndustryOperator: 'yes', roadName: '南京東路', addressLooksLikeComplexUnit: 'yes', coordinateQuality: 'valid_wgs84_taipei', locationPrecision: 'official_coordinate', businessRegistrationNumberValidFormat: 'yes' }).length, 1);
});
