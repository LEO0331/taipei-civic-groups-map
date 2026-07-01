import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildBiotechCompanyDirectorySummary,
  classifyBiotechIndustryCategory,
  parseBiotechCompanyAddress,
  parseBiotechCompanyCoordinates,
  parseCompanyPhone,
} from './biotechCompanyDirectory';
import type { BiotechCompanyDirectoryRecord } from '../types';

test('parses biotech company source fields', () => {
  assert.equal(classifyBiotechIndustryCategory('應用生技'), 'applied_biotechnology');
  assert.equal(classifyBiotechIndustryCategory('醫療器材產業'), 'medical_device');
  assert.equal(classifyBiotechIndustryCategory('製藥產業'), 'pharmaceutical');
  const address = parseBiotechCompanyAddress('台北市南港區忠孝東路7段508號3樓之8');
  assert.equal(address.registeredAddressNormalized, '臺北市南港區忠孝東路7段508號3樓之8');
  assert.equal(address.district, '南港區');
  assert.equal(address.roadName, '忠孝東路7段');
  const phone = parseCompanyPhone('02-2700-6006');
  assert.equal(phone.companyPhoneType, 'taipei_landline');
  assert.equal(phone.companyPhoneDialHref, 'tel:0227006006');
  const point = parseBiotechCompanyCoordinates('311506', '2771689');
  assert.equal(point.coordinateSystem, 'twd97');
  assert.equal(point.coordinateStatus, 'valid');
  assert.ok(point.longitude && point.longitude > 121.5);
  assert.ok(point.latitude && point.latitude > 25);
});

test('summarizes biotech company directory records', () => {
  const records: BiotechCompanyDirectoryRecord[] = [
    { id: 'a', module: 'biotech_company_directory', companyName: '甲生技', companyNameNormalized: '甲生技', unifiedBusinessNumber: '00112233', unifiedBusinessNumberNormalized: '00112233', registeredAddress: '臺北市南港區忠孝東路7段1號', registeredAddressNormalized: '臺北市南港區忠孝東路7段1號', district: '南港區', roadName: '忠孝東路7段', companyPhone: '02-1', companyPhoneType: 'taipei_landline', hasPhone: true, industryCategoryRaw: '應用生技', industryCategoryType: 'applied_biotechnology', coordinateSystem: 'twd97', coordinateStatus: 'valid', longitude: 121.6, latitude: 25.05, hasValidCoordinates: true, source: 'x', sourceAgency: 'x' },
    { id: 'b', module: 'biotech_company_directory', companyName: '乙醫材', companyNameNormalized: '乙醫材', unifiedBusinessNumber: '44556677', unifiedBusinessNumberNormalized: '44556677', registeredAddress: '臺北市內湖區民權東路6段1號', registeredAddressNormalized: '臺北市內湖區民權東路6段1號', district: '內湖區', roadName: '民權東路6段', companyPhoneType: 'missing', hasPhone: false, industryCategoryRaw: '醫療器材產業', industryCategoryType: 'medical_device', coordinateSystem: 'unknown', coordinateStatus: 'missing', hasValidCoordinates: false, source: 'x', sourceAgency: 'x' },
  ];
  const summary = buildBiotechCompanyDirectorySummary(records);
  assert.equal(summary.totalRecords, 2);
  assert.equal(summary.uniqueUnifiedBusinessNumberCount, 2);
  assert.equal(summary.recordsWithValidCoordinates, 1);
  assert.equal(summary.byDistrict[0].companyCount, 1);
  assert.equal(summary.coordinateQuality.twd97Detected, 1);
});
