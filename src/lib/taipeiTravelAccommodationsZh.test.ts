import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildTaipeiTravelAccommodationZhSummary, classifyRoomCountBucket, classifyTaipeiTravelAccommodationCategory,
  cleanText, parseAccommodationPhone, parseRoomCount, parseTaipeiTravelAccommodationAddress,
} from './taipeiTravelAccommodationsZh';
import type { TaipeiTravelAccommodationZhRecord } from '../types';

test('parses Taipei Travel accommodation source fields', () => {
  assert.equal(cleanText('　NULL '), undefined);
  assert.equal(classifyTaipeiTravelAccommodationCategory('觀光旅館'), 'tourist_hotel');
  assert.equal(classifyTaipeiTravelAccommodationCategory('青年旅館'), 'hostel');
  assert.equal(parseRoomCount('1,234'), 1234);
  assert.equal(classifyRoomCountBucket(101), 'very_large_101_plus');
  assert.equal(parseTaipeiTravelAccommodationAddress('台北市中山區中山北路2段1號').district, '中山區');
  assert.equal(parseTaipeiTravelAccommodationAddress('台北市中山區中山北路2段1號').roadName, '中山北路2段');
  assert.equal(parseAccommodationPhone('(02)23456789').phoneType, 'taipei_landline');
});

test('summarizes accommodation room counts without treating missing as zero', () => {
  const base = {
    module: 'taipei_travel_accommodations_zh' as const, accommodationCategoryRaw: '旅館', accommodationCategory: 'hotel' as const,
    address: '臺北市中山區A路1號', addressNormalized: '臺北市中山區A路1號', district: '中山區', roadName: 'A路',
    phoneType: 'taipei_landline' as const, hasPhone: true, hasFax: false, roomCountBucket: 'small_1_20' as const,
    locationPrecision: 'district_centroid' as const, source: '臺北市臺北旅遊網住宿資料(中文)', sourceAgency: '臺北市政府觀光傳播局',
  };
  const records: TaipeiTravelAccommodationZhRecord[] = [
    { ...base, id: 'a', accommodationName: '甲旅館', roomCount: 10, hasRoomCount: true },
    { ...base, id: 'b', accommodationName: '乙旅館', hasRoomCount: false, roomCountBucket: 'missing' },
  ];
  const summary = buildTaipeiTravelAccommodationZhSummary(records);
  assert.equal(summary.totalRecords, 2);
  assert.equal(summary.totalRoomCount, 10);
  assert.equal(summary.recordsWithRoomCount, 1);
  assert.equal(summary.byDistrict[0].totalRoomCount, 10);
});
