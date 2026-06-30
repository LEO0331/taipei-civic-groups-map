import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPerformingArtsGroupSummary,
  classifyPerformingArtsApplicationCategory,
  parsePerformingArtsGroupAddress,
  parsePerformingArtsWebsite,
  parseRegistrationNumber,
} from './performingArtsGroups';
import type { PerformingArtsGroupRecord } from '../types';

test('parses performing-arts group source fields', () => {
  assert.equal(classifyPerformingArtsApplicationCategory('傳統戲曲'), 'traditional_opera');
  assert.equal(classifyPerformingArtsApplicationCategory('戲劇'), 'theater');
  assert.equal(classifyPerformingArtsApplicationCategory('舞蹈'), 'dance');
  assert.equal(classifyPerformingArtsApplicationCategory('音樂'), 'music');
  assert.equal(classifyPerformingArtsApplicationCategory('民俗曲藝'), 'folk_art');
  assert.equal(classifyPerformingArtsApplicationCategory('跨域綜合'), 'cross_disciplinary');
  assert.equal(parseRegistrationNumber('0998'), '0998');
  assert.deepEqual(parsePerformingArtsGroupAddress('台北市北投區石牌路2段315巷28弄14之7號4樓'), {
    registeredAddress: '台北市北投區石牌路2段315巷28弄14之7號4樓',
    addressNormalized: '臺北市北投區石牌路2段315巷28弄14之7號4樓',
    district: '北投區',
    roadName: '石牌路2段',
    warning: undefined,
  });
  assert.equal(parsePerformingArtsWebsite('example.org/team').websiteUrlNormalized, 'https://example.org/team');
  assert.equal(parsePerformingArtsWebsite('not a url').websiteUrlNormalized, undefined);
});

test('summarizes performing-arts groups without deduping shared names', () => {
  const base: PerformingArtsGroupRecord = {
    id: 'a',
    module: 'performing_arts_groups',
    groupName: '測試劇團',
    groupNameNormalized: '測試劇團',
    applicationCategoryRaw: '戲劇',
    applicationCategory: 'theater',
    registrationNumber: '001',
    hasRegistrationNumber: true,
    competentAuthority: '臺北市政府文化局',
    competentAuthorityCode: '379590000E',
    registeredAddress: '臺北市大安區和平東路一段1號',
    addressNormalized: '臺北市大安區和平東路一段1號',
    district: '大安區',
    roadName: '和平東路一段',
    hasWebsite: false,
    locationPrecision: 'district_centroid',
    source: '臺北市演藝團體名冊',
    sourceAgency: '臺北市政府文化局',
  };
  const summary = buildPerformingArtsGroupSummary([
    base,
    { ...base, id: 'b', registrationNumber: '002', district: '中山區', roadName: '南京東路', hasRegistrationNumber: true },
  ]);
  assert.equal(summary.totalRecords, 2);
  assert.equal(summary.uniqueGroupNameCount, 1);
  assert.equal(summary.districtCount, 2);
  assert.equal(summary.recordsWithRegistrationNumber, 2);
});
