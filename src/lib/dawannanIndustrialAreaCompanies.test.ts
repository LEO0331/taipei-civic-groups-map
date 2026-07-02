import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDawannanIndustrialAreaCompanySummary, convertProjectedTaipeiCoordinateToWgs84, filterDawannanIndustrialAreaCompanies, parseDawannanCompanyAddress, parseProjectedCoordinate, parseUnifiedBusinessNumber } from './dawannanIndustrialAreaCompanies';
import type { DawannanIndustrialAreaCompanyRecord } from '../types';

test('parses Dawannan company IDs, addresses, and projected coordinates', () => {
  assert.deepEqual(parseUnifiedBusinessNumber(' 00026167 '), { unifiedBusinessNumber: '00026167', unifiedBusinessNumberNormalized: '00026167', unifiedBusinessNumberValidFormat: true });
  assert.equal(parseUnifiedBusinessNumber('123-456').unifiedBusinessNumberNormalized, '123456');
  assert.equal(parseDawannanCompanyAddress('114台北市內湖區新湖三路268號5樓').roadName, '新湖三路');
  assert.equal(parseDawannanCompanyAddress('114台北市內湖區行愛路140巷27號5樓').taipeiDistrict, '內湖區');
  assert.deepEqual(parseProjectedCoordinate('308,619'), { raw: '308,619', value: 308619 });
  const converted = convertProjectedTaipeiCoordinateToWgs84({ projectedX: 308619, projectedY: 2773194 });
  assert.equal(converted.coordinateConversionStatus, 'converted_to_wgs84');
  assert.equal(converted.projectedCoordinateSystemAssumption, 'TWD97_TM2_121');
  assert.ok(converted.longitude! > 121.55 && converted.longitude! < 121.65);
  assert.ok(converted.latitude! > 25.04 && converted.latitude! < 25.08);
});

test('summarizes and filters Dawannan industrial area companies', () => {
  const records: DawannanIndustrialAreaCompanyRecord[] = [
    { id: 'a', module: 'dawannan_industrial_area_company_directory', unifiedBusinessNumber: '00026167', unifiedBusinessNumberNormalized: '00026167', unifiedBusinessNumberValidFormat: true, companyName: '英捷智能股份有限公司', companyNameNormalized: '英捷智能股份有限公司', companyAddress: '114臺北市內湖區新湖三路268號5樓', companyAddressNormalized: '114臺北市內湖區新湖三路268號5樓', postalCode: '114', districtFromAddress: '內湖區', isTaipeiDistrict: true, taipeiDistrict: '內湖區', roadName: '新湖三路', projectedXRaw: '308619', projectedYRaw: '2773194', projectedX: 308619, projectedY: 2773194, hasProjectedCoordinates: true, projectedCoordinateSystemAssumption: 'TWD97_TM2_121', wgs84Longitude: 121.581, wgs84Latitude: 25.064, coordinateConversionStatus: 'converted_to_wgs84', locationPrecision: 'projected_coordinate_converted', googleMapsQuery: '114臺北市內湖區新湖三路268號5樓 英捷智能股份有限公司', source: '臺北市大彎南段工業區廠商名錄', sourceAgency: '臺北市政府產業發展局', industrialAreaName: '大彎南段工業區' },
    { id: 'b', module: 'dawannan_industrial_area_company_directory', unifiedBusinessNumber: '00026764', unifiedBusinessNumberNormalized: '00026764', unifiedBusinessNumberValidFormat: true, companyName: '築想投資股份有限公司', companyNameNormalized: '築想投資股份有限公司', companyAddress: '114臺北市內湖區新湖一路218號1樓', companyAddressNormalized: '114臺北市內湖區新湖一路218號1樓', postalCode: '114', districtFromAddress: '內湖區', isTaipeiDistrict: true, taipeiDistrict: '內湖區', roadName: '新湖一路', projectedXRaw: '308629', projectedYRaw: '2772723', projectedX: 308629, projectedY: 2772723, hasProjectedCoordinates: true, projectedCoordinateSystemAssumption: 'TWD97_TM2_121', wgs84Longitude: 121.581, wgs84Latitude: 25.06, coordinateConversionStatus: 'converted_to_wgs84', locationPrecision: 'projected_coordinate_converted', googleMapsQuery: '114臺北市內湖區新湖一路218號1樓 築想投資股份有限公司', source: '臺北市大彎南段工業區廠商名錄', sourceAgency: '臺北市政府產業發展局', industrialAreaName: '大彎南段工業區' },
    { id: 'c', module: 'dawannan_industrial_area_company_directory', unifiedBusinessNumber: '00036284', unifiedBusinessNumberNormalized: '00036284', unifiedBusinessNumberValidFormat: true, companyName: '築新投資股份有限公司', companyNameNormalized: '築新投資股份有限公司', companyAddress: '114臺北市內湖區新湖一路218號1樓', companyAddressNormalized: '114臺北市內湖區新湖一路218號1樓', postalCode: '114', districtFromAddress: '內湖區', isTaipeiDistrict: true, taipeiDistrict: '內湖區', roadName: '新湖一路', projectedXRaw: '308629', projectedYRaw: '2772723', projectedX: 308629, projectedY: 2772723, hasProjectedCoordinates: true, projectedCoordinateSystemAssumption: 'TWD97_TM2_121', wgs84Longitude: 121.581, wgs84Latitude: 25.06, coordinateConversionStatus: 'converted_to_wgs84', locationPrecision: 'projected_coordinate_converted', googleMapsQuery: '114臺北市內湖區新湖一路218號1樓 築新投資股份有限公司', source: '臺北市大彎南段工業區廠商名錄', sourceAgency: '臺北市政府產業發展局', industrialAreaName: '大彎南段工業區' },
  ];
  const summary = buildDawannanIndustrialAreaCompanySummary(records);
  assert.equal(summary.totalRecords, 3);
  assert.equal(summary.uniqueCompanyAddressCount, 2);
  assert.equal(summary.dataQuality.duplicateCompanyAddressCount, 1);
  assert.equal(summary.dataQuality.duplicateCoordinatePairCount, 1);
  assert.equal(summary.byRoadName[0].roadName, '新湖一路');
  assert.deepEqual(filterDawannanIndustrialAreaCompanies(records, { search: '築想', district: '', roadName: '', postalCode: '', unifiedBusinessNumberValidFormat: '', hasProjectedCoordinates: '', coordinateConversionStatus: '', duplicateAddressGroup: '', duplicateCoordinateGroup: '' }).map((r) => r.id), ['b']);
  assert.equal(filterDawannanIndustrialAreaCompanies(records, { search: '', district: '', roadName: '', postalCode: '', unifiedBusinessNumberValidFormat: '', hasProjectedCoordinates: '', coordinateConversionStatus: '', duplicateAddressGroup: 'yes', duplicateCoordinateGroup: '' }).length, 2);
});
