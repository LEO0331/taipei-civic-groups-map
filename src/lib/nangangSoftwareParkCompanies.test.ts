import assert from 'node:assert/strict';
import test from 'node:test';
import { buildNangangSoftwareParkCompanySummary, classifyCompanyNameKeywordTags, convertTwd97ToWgs84, coordinateDetails, filterNangangSoftwareParkCompanies, normalizeBusinessId, parseNangangSoftwareParkAddress } from './nangangSoftwareParkCompanies';
import type { NangangSoftwareParkCompany } from '../types';

test('parses IDs, Nangang addresses, coordinates, and company keywords', () => {
  assert.equal(normalizeBusinessId('30129'), '00030129');
  assert.deepEqual(parseNangangSoftwareParkAddress('115臺北市南港區三重路19-11號4樓'), { address: '115臺北市南港區三重路19-11號4樓', postalCode: '115', district: '南港區', addressWithoutPostalCode: '臺北市南港區三重路19-11號4樓', roadName: '三重路', buildingAddressKey: '臺北市南港區三重路19之11號' });
  assert.equal(parseNangangSoftwareParkAddress('115臺北市南港區三重里13鄰三重路19號').roadName, '三重路');
  assert.equal(parseNangangSoftwareParkAddress('115臺北市南港區三重里園區街3號').roadName, '園區街');
  const point = convertTwd97ToWgs84(311855, 2772300); assert.ok(point.longitude > 121.61 && point.longitude < 121.62); assert.ok(point.latitude > 25.05 && point.latitude < 25.06);
  assert.equal(coordinateDetails('311855', '2772300').coordinateStatus, 'valid');
  assert.deepEqual(classifyCompanyNameKeywordTags('神燈智能科技股份有限公司'), ['technology', 'data_or_digital']);
});

test('summarizes and filters company directory records', () => {
  const records: NangangSoftwareParkCompany[] = [{ id: 'a', module: 'nangang_software_park_companies', businessId: '00030129', companyName: '甲科技', address: '115臺北市南港區三重路19號5樓', district: '南港區', roadName: '三重路', buildingAddressKey: '臺北市南港區三重路19號', coordinateSourceType: 'twd97_epsg_3826', longitude: 121.612, latitude: 25.057, coordinateStatus: 'valid', companyNameKeywordTags: ['technology'], source: 'x', sourceAgency: 'x' }];
  assert.equal(buildNangangSoftwareParkCompanySummary(records).recordsWithValidCoordinates, 1);
  assert.deepEqual(filterNangangSoftwareParkCompanies(records, { search: '00030129', roadName: '', buildingAddressKey: '', keywordTag: '', coordinateStatus: '', hasValidCoordinate: '' }).map((r) => r.id), ['a']);
});
