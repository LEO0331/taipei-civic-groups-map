import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBusinessPremisesPublicLiabilityInsuranceSummary,
  classifyPublicLiabilityBusinessCategory,
  getPolicyExpiryStatus,
  haversineDistanceMeters,
  parseBusinessPremisesAddress,
  parseBusinessPremisesCoordinates,
  parsePolicyExpiryDate,
  parseRegistrationNumber,
} from './businessPremisesPublicLiabilityInsurance';
import type { BusinessPremisesPublicLiabilityInsuranceRecord } from '../types';

test('parses public liability insurance source fields', () => {
  assert.equal(parseRegistrationNumber('028715870'), '028715870');
  assert.equal(classifyPublicLiabilityBusinessCategory('餐飲食品業'), 'restaurant_food');
  assert.deepEqual(parseBusinessPremisesAddress('台北市內湖區舊宗路一段150巷25號'), {
    businessAddress: '台北市內湖區舊宗路一段150巷25號',
    businessAddressNormalized: '臺北市內湖區舊宗路一段150巷25號',
    district: '內湖區',
    roadName: '舊宗路一段',
    warning: undefined,
  });
  assert.deepEqual(parsePolicyExpiryDate('115/05/01'), {
    policyExpiryDateRaw: '115/05/01',
    policyExpiryDate: '2026-05-01',
    policyExpiryYear: 2026,
    policyExpiryMonth: 5,
    policyExpiryMonthKey: '2026-05',
    warning: undefined,
  });
  assert.equal(getPolicyExpiryStatus('2026-05-01', '2026-06-30'), 'expired_by_source_date');
  assert.equal(getPolicyExpiryStatus('2026-07-20', '2026-06-30'), 'expiring_soon_30_days');
  assert.equal(getPolicyExpiryStatus('2026-09-15', '2026-06-30'), 'expiring_soon_90_days');
  assert.equal(parseBusinessPremisesCoordinates('121.576432', '25.062097').coordinateStatus, 'valid');
  assert.equal(Math.round(haversineDistanceMeters({ latitude: 25.062097, longitude: 121.576432 }, { latitude: 25.062097, longitude: 121.576432 })), 0);
});

test('summarizes public liability insurance records', () => {
  const record: BusinessPremisesPublicLiabilityInsuranceRecord = {
    id: 'a',
    module: 'business_premises_public_liability_insurance_records',
    sourceSequenceNumber: 1,
    registrationNumber: '28715870',
    registrationNumberNormalized: '28715870',
    hasRegistrationNumber: true,
    businessCategoryRaw: '公司',
    businessCategory: 'other',
    businessCategoryNormalized: '公司',
    businessName: '悅家居企業股份有限公司',
    businessNameNormalized: '悅家居企業股份有限公司',
    businessAddress: '臺北市內湖區舊宗路一段150巷25號',
    businessAddressNormalized: '臺北市內湖區舊宗路一段150巷25號',
    district: '內湖區',
    roadName: '舊宗路一段',
    policyExpiryDateRaw: '115/05/01',
    policyExpiryDate: '2026-05-01',
    policyExpiryYear: 2026,
    policyExpiryMonth: 5,
    policyExpiryMonthKey: '2026-05',
    daysUntilPolicyExpiry: -60,
    policyExpiryStatus: 'expired_by_source_date',
    longitude: 121.576432,
    latitude: 25.062097,
    sourceLongitudeRaw: '121.576432',
    sourceLatitudeRaw: '25.062097',
    coordinateStatus: 'valid',
    coordinateSystem: 'wgs84',
    hasCoordinates: true,
    source: '臺北市營業場所投保公共意外險清冊',
    sourceAgency: '臺北市政府產業發展局商業處',
  };
  const summary = buildBusinessPremisesPublicLiabilityInsuranceSummary([record]);
  assert.equal(summary.totalRecords, 1);
  assert.equal(summary.recordsWithValidCoordinates, 1);
  assert.equal(summary.recordsWithPolicyExpiryDate, 1);
  assert.equal(summary.byDistrict[0].expiredBySourceDateCount, 1);
  assert.deepEqual(summary.coordinateQuality, { valid: 1, missing: 0, outlier: 0, unparsed: 0 });
});
