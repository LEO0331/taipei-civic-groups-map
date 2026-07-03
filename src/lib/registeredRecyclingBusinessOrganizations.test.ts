import assert from 'node:assert/strict';
import test from 'node:test';
import { buildRegisteredRecyclingBusinessOrganizationSummary, classifyRecyclingItem, filterRegisteredRecyclingBusinessOrganizations, parseRecyclingItems, parseRecyclingStorageSiteAddress } from './registeredRecyclingBusinessOrganizations';
import type { RegisteredRecyclingBusinessOrganizationRecord } from '../types';

const base: RegisteredRecyclingBusinessOrganizationRecord = {
  id: 'r1',
  module: 'registered_recycling_business_organizations',
  sourceSequenceNumber: 1,
  sourceSequenceNumberNormalized: '1',
  organizationName: '測試回收社',
  organizationNameNormalized: '測試回收社',
  businessRegistrationNumber: '12345678',
  businessRegistrationNumberNormalized: '12345678',
  businessRegistrationNumberValidFormat: true,
  responsiblePersonName: '王小明',
  phoneNumber: '(02)23062339',
  phoneNumberNormalized: '0223062339',
  mobilePhoneNumber: '0922384757',
  mobilePhoneNumberNormalized: '0922384757',
  contactPersonName: '王先生',
  recyclingStorageSiteAddress: '士林區延平北路8段133巷65號旁',
  recyclingStorageSiteAddressNormalized: '士林區延平北路8段133巷65號旁',
  districtNameFromAddress: '士林區',
  isTaipeiDistrict: true,
  roadName: '延平北路',
  addressLooksLikeOpenLotOrNearby: true,
  regulatedRecyclableItemsRaw: '廢塑膠容器、廢鋁容器、廢資訊物品',
  regulatedRecyclableItems: ['廢塑膠容器', '廢鋁容器', '廢資訊物品'],
  regulatedRecyclableItemCategories: ['plastic_container', 'aluminum_container', 'it_equipment'],
  hasRegulatedRecyclableItems: true,
  generalWasteRecyclingItemsRaw: '廢紙、廢鐵',
  generalWasteRecyclingItems: ['廢紙', '廢鐵'],
  generalWasteRecyclingItemCategories: ['paper', 'iron'],
  hasGeneralWasteRecyclingItems: true,
  hasPhoneNumber: true,
  hasMobilePhoneNumber: true,
  hasAnyContactNumber: true,
  coordinateSource: 'none',
  geocodingStatus: 'not_geocoded_address_only',
  locationPrecision: 'district_address',
  source: '臺北市回收業機構名冊',
  sourceAgency: '臺北市政府環境保護局',
};

test('classifies and parses recycling item lists', () => {
  assert.equal(classifyRecyclingItem('廢塑膠容器'), 'plastic_container');
  assert.equal(classifyRecyclingItem('廢電子電器'), 'electronics');
  const parsed = parseRecyclingItems('廢紙、廢鋁,廢鐵');
  assert.deepEqual(parsed.items, ['廢紙', '廢鋁', '廢鐵']);
  assert.deepEqual(parsed.categories, ['paper', 'aluminum', 'iron']);
});

test('parses district, road, and nearby-style address', () => {
  const parsed = parseRecyclingStorageSiteAddress('台北市士林區延平北路8段133巷65號旁');
  assert.equal(parsed.districtNameFromAddress, '士林區');
  assert.equal(parsed.roadName, '延平北路');
  assert.equal(parsed.addressLooksLikeOpenLotOrNearby, true);
});

test('summarizes and filters recycling organizations', () => {
  const records = [base, { ...base, id: 'r2', sourceSequenceNumber: 2, sourceSequenceNumberNormalized: '2', organizationName: '第二回收社', organizationNameNormalized: '第二回收社', districtNameFromAddress: '內湖區', recyclingStorageSiteAddress: '內湖區安康路296號', recyclingStorageSiteAddressNormalized: '內湖區安康路296號', roadName: '安康路', regulatedRecyclableItems: ['廢電子電器'], regulatedRecyclableItemCategories: ['electronics'], generalWasteRecyclingItems: [], generalWasteRecyclingItemCategories: ['unknown'], hasGeneralWasteRecyclingItems: false }] satisfies RegisteredRecyclingBusinessOrganizationRecord[];
  const summary = buildRegisteredRecyclingBusinessOrganizationSummary(records);
  assert.equal(summary.totalRecords, 2);
  assert.equal(summary.districtCount, 2);
  assert.equal(summary.recordsWithGeneralWasteRecyclingItems, 1);
  assert.equal(filterRegisteredRecyclingBusinessOrganizations(records, { search: '0922384757', districtName: '', roadName: '', regulatedRecyclableItem: '', regulatedRecyclableItemCategory: '', generalWasteRecyclingItem: '', generalWasteRecyclingItemCategory: '', hasBusinessRegistrationNumber: '', businessRegistrationNumberValidFormat: '', hasPhoneNumber: '', hasMobilePhoneNumber: '', hasAnyContactNumber: '', hasRegulatedRecyclableItems: '', hasGeneralWasteRecyclingItems: '', addressLooksLikeOpenLotOrNearby: '', geocodingStatus: '', locationPrecision: '' }).length, 2);
  assert.equal(filterRegisteredRecyclingBusinessOrganizations(records, { search: '', districtName: '士林區', roadName: '延平北路', regulatedRecyclableItem: '廢塑膠容器', regulatedRecyclableItemCategory: 'plastic_container', generalWasteRecyclingItem: '廢紙', generalWasteRecyclingItemCategory: 'paper', hasBusinessRegistrationNumber: 'yes', businessRegistrationNumberValidFormat: 'yes', hasPhoneNumber: 'yes', hasMobilePhoneNumber: 'yes', hasAnyContactNumber: 'yes', hasRegulatedRecyclableItems: 'yes', hasGeneralWasteRecyclingItems: 'yes', addressLooksLikeOpenLotOrNearby: 'yes', geocodingStatus: 'not_geocoded_address_only', locationPrecision: 'district_address' }).length, 1);
});
