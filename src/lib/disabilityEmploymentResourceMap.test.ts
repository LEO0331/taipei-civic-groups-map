import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildDisabilityEmploymentResourceSummary, classifyDisabilityEmploymentBusinessItem,
  classifyDisabilityEmploymentServiceCategory, filterDisabilityEmploymentResources, parseBusinessItem,
  parseDisabilityType, parseResourceAddress, parseResourcePhone, parseRocYear,
} from './disabilityEmploymentResourceMap';
import type { DisabilityEmploymentResourceRecord } from '../types';

test('parses disability employment resource source fields', () => {
  assert.deepEqual(parseRocYear('115'), { sourceRocYearRaw: '115', sourceRocYear: 115, sourceYear: 2026 });
  assert.equal(parseDisabilityType('綜合障別').disabilityTypeNormalized, '綜合障別');
  assert.equal(classifyDisabilityEmploymentBusinessItem('食品製造業、批發及零售業'), 'retail');
  assert.equal(classifyDisabilityEmploymentServiceCategory('食品製造業、批發及零售業'), 'workplace_or_business_resource');
  assert.equal(parseBusinessItem('職業重建服務').serviceCategory, 'vocational_rehabilitation');
  assert.deepEqual(parseResourceAddress('台北市文山區萬和街8號1樓'), {
    address: '台北市文山區萬和街8號1樓',
    addressNormalized: '臺北市文山區萬和街8號1樓',
    districtFromAddress: '文山區',
    isTaipeiDistrict: true,
    taipeiDistrict: '文山區',
    outsideTaipeiArea: undefined,
    roadName: '萬和街',
    warning: undefined,
  });
  assert.equal(parseResourcePhone('2239-5319轉210、212').phoneType, 'multiple');
  assert.equal(parseResourcePhone('2239-5319轉210、212').phoneDialHref, undefined);
});

test('summarizes and filters disability employment resources', () => {
  const records: DisabilityEmploymentResourceRecord[] = [
    { id: '1', module: 'disability_employment_resource_map', sourceYear: 2026, sourceRocYear: 115, resourceName: '甲機構', resourceNameNormalized: '甲機構', disabilityType: '綜合障別', businessItem: '職業重建服務', businessItemCategory: 'vocational_rehabilitation', serviceCategory: 'vocational_rehabilitation', contactName: '王小明', hasContact: true, address: '臺北市文山區萬和街8號', addressNormalized: '臺北市文山區萬和街8號', districtFromAddress: '文山區', isTaipeiDistrict: true, taipeiDistrict: '文山區', roadName: '萬和街', phone: '2239-5319', phoneType: 'taipei_landline', hasPhone: true, locationPrecision: 'district_centroid', source: '臺北市身障就業資源地圖', sourceAgency: '臺北市政府勞動局勞動力重建運用處' },
    { id: '2', module: 'disability_employment_resource_map', sourceYear: 2026, sourceRocYear: 115, resourceName: '乙商店', resourceNameNormalized: '乙商店', disabilityType: '綜合障別', businessItem: '零售業', businessItemCategory: 'retail', serviceCategory: 'workplace_or_business_resource', hasContact: false, address: '臺北市大安區仁愛路4段1號', addressNormalized: '臺北市大安區仁愛路4段1號', districtFromAddress: '大安區', isTaipeiDistrict: true, taipeiDistrict: '大安區', roadName: '仁愛路4段', phoneType: 'missing', hasPhone: false, locationPrecision: 'district_centroid', source: '臺北市身障就業資源地圖', sourceAgency: '臺北市政府勞動局勞動力重建運用處' },
  ];
  const summary = buildDisabilityEmploymentResourceSummary(records);
  assert.equal(summary.totalRecords, 2);
  assert.equal(summary.latestSourceYear, 2026);
  assert.equal(summary.taipeiDistrictCount, 2);
  assert.equal(summary.recordsWithContact, 1);
  assert.equal(summary.recordsWithPhone, 1);
  assert.equal(summary.byServiceCategory[0].serviceCategory, 'vocational_rehabilitation');
  assert.equal(filterDisabilityEmploymentResources(records, { search: '零售', sourceYear: '', disabilityType: '', businessItem: '', businessItemCategory: '', serviceCategory: '', district: '', roadName: '', hasContact: '', hasPhone: '', phoneType: '', addressParsed: '' }).length, 1);
  assert.equal(filterDisabilityEmploymentResources(records, { search: '', sourceYear: '', disabilityType: '', businessItem: '', businessItemCategory: '', serviceCategory: 'vocational_rehabilitation', district: '', roadName: '', hasContact: '', hasPhone: '', phoneType: '', addressParsed: '' }).length, 1);
});
