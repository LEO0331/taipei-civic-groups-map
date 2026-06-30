import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildElderlyWelfareInstitutionSummary,
  classifyElderlyWelfareInstitutionAttribute,
  deriveBedCountConsistency,
  parseBedCount,
  parseElderlyCareRecipientCategories,
  parseElderlyWelfareInstitutionAddress,
  parseElderlyWelfareInstitutionPhone,
} from './elderlyWelfareInstitutions';
import type { ElderlyWelfareInstitutionRecord } from '../types';

test('parses elderly welfare institution source fields', () => {
  assert.equal(classifyElderlyWelfareInstitutionAttribute('公設民營'), 'public_private_operated');
  assert.deepEqual(parseElderlyCareRecipientCategories('安養、養護、長照'), ['long_term_care', 'nursing_care', 'residential_care']);
  assert.equal(parseBedCount('1,234床'), 1234);
  assert.equal(parseElderlyWelfareInstitutionAddress('臺北市士林區永福里001鄰仰德大道2段2巷50號').roadName, '仰德大道2段');
  assert.equal(parseElderlyWelfareInstitutionPhone('(02)28832666 ').phoneType, 'taipei_landline');
  assert.deepEqual(deriveBedCountConsistency({ approvedTotalBedCount: 471, longTermCareBedCount: 124, nursingCareBedCount: 194, dementiaCareBedCount: 0, residentialCareBedCount: 153 }), { computedTotalBedCount: 471, totalSpecializedBedCount: 471, bedCountMismatch: false, warning: undefined });
});

test('summarizes elderly welfare institution records', () => {
  const record: ElderlyWelfareInstitutionRecord = {
    id: 'a',
    module: 'elderly_welfare_institutions',
    sourceSequenceNumber: 1,
    institutionAttributeRaw: '公設民營',
    institutionAttribute: 'public_private_operated',
    institutionAttributeNormalized: '公設民營',
    institutionName: '臺北市至善老人安養護中心',
    institutionNameNormalized: '臺北市至善老人安養護中心',
    district: '士林區',
    districtNormalized: '士林區',
    address: '臺北市士林區永福里001鄰仰德大道2段2巷50號',
    addressNormalized: '臺北市士林區永福里001鄰仰德大道2段2巷50號',
    roadName: '仰德大道2段',
    phone: '(02)28832666',
    phoneDisplay: '(02)28832666',
    phoneDialHref: 'tel:0228832666',
    phoneType: 'taipei_landline',
    hasPhone: true,
    careRecipientCategoryRaw: '安養、養護、長照',
    careRecipientCategories: ['long_term_care', 'nursing_care', 'residential_care'],
    approvedTotalBedCount: 471,
    longTermCareBedCount: 124,
    nursingCareBedCount: 194,
    dementiaCareBedCount: 0,
    residentialCareBedCount: 153,
    hasLongTermCareBeds: true,
    hasNursingCareBeds: true,
    hasDementiaCareBeds: false,
    hasResidentialCareBeds: true,
    totalSpecializedBedCount: 471,
    computedTotalBedCount: 471,
    bedCountMismatch: false,
    locationPrecision: 'address_only',
    googleMapsQuery: '臺北市士林區永福里001鄰仰德大道2段2巷50號 臺北市至善老人安養護中心',
    source: '臺北市老人福利機構名冊',
    sourceAgency: '臺北市政府社會局',
  };
  const summary = buildElderlyWelfareInstitutionSummary([record]);
  assert.equal(summary.totalRecords, 1);
  assert.equal(summary.totalApprovedBeds, 471);
  assert.equal(summary.byDistrict[0].district, '士林區');
  assert.equal(summary.byCareRecipientCategory.length, 3);
});
