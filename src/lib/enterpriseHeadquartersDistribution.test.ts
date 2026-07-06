import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildEnterpriseHeadquartersSummary, convertEnterpriseHeadquartersTwd97Tm2ToWgs84, filterEnterpriseHeadquarters, parseEnterpriseHeadquartersAddress, parseEnterpriseHeadquartersIndustryCategory, parseEnterpriseHeadquartersUseDate } from './enterpriseHeadquartersDistribution';
import type { EnterpriseHeadquartersRecord } from '../types';

test('parses enterprise headquarters source fields conservatively', () => {
  const period = parseEnterpriseHeadquartersUseDate('1120605-1150604');
  assert.equal(period.recognitionStartGregorianDate, '2023-06-05');
  assert.equal(period.recognitionEndGregorianDate, '2026-06-04');
  assert.equal(period.recognitionStartRocDate, '112-06-05');
  assert.equal(parseEnterpriseHeadquartersAddress('台北市內湖區瑞光路550號9樓').districtNameFromAddress, '內湖區');
  assert.equal(parseEnterpriseHeadquartersAddress('台北市內湖區瑞光路550號9樓').roadName, '瑞光路');
  assert.equal(parseEnterpriseHeadquartersAddress('台北市內湖區瑞光路550號9樓').addressLooksLikeMultiFloorOrUnit, true);
  assert.deepEqual(parseEnterpriseHeadquartersIndustryCategory('電子資訊'), { industryCategoryRaw: '電子資訊', industryCategoryNormalized: '電子資訊類', industryCategoryGroup: 'electronic_information', warning: undefined });
  const converted = convertEnterpriseHeadquartersTwd97Tm2ToWgs84(308619, 2773194);
  assert.equal(converted.status, 'converted_from_twd97_tm2');
  assert.ok(converted.longitude! > 121.55 && converted.longitude! < 121.65);
  assert.ok(converted.latitude! > 25.04 && converted.latitude! < 25.08);
});

test('summarizes and filters enterprise headquarters records', () => {
  const base: EnterpriseHeadquartersRecord = { id: 'a', module: 'enterprise_headquarters_distribution', companyName: '甲公司', companyNameNormalized: '甲公司', useDateRaw: '1120605-1150604', recognitionPeriodRaw: '1120605-1150604', recognitionStartGregorianDate: '2023-06-05', recognitionEndGregorianDate: '2026-06-04', recognitionPeriodParsed: true, recognitionStatusRelativeToBuildDate: 'active_on_build_date', companyAddress: '臺北市內湖區瑞光路1號9樓', companyAddressNormalized: '臺北市內湖區瑞光路1號9樓', districtNameFromAddress: '內湖區', isTaipeiDistrict: true, roadName: '瑞光路', addressLooksLikeMultiFloorOrUnit: true, industryCategoryRaw: '電子資訊', industryCategoryNormalized: '電子資訊類', industryCategoryGroup: 'electronic_information', sourceCoordinateX: '308619', sourceCoordinateY: '2773194', sourceCoordinateXNumber: 308619, sourceCoordinateYNumber: 2773194, sourceCoordinateSystem: 'twd97_tm2_zone_121', latitude: 25.064, longitude: 121.581, coordinateConversionStatus: 'converted_from_twd97_tm2', coordinateValid: true, coordinateQuality: 'valid_converted_wgs84_taipei', coordinatePairKey: '121.581000|25.064000', locationPrecision: 'converted_source_coordinate', source: '臺北市企業營運總部分布圖', sourceAgency: '臺北市政府產業發展局' };
  const records = [base, { ...base, id: 'b', companyName: '乙公司', companyNameNormalized: '乙公司', industryCategoryRaw: '民生化工', industryCategoryNormalized: '民生化工類', industryCategoryGroup: 'consumer_life_chemical' as const }];
  const summary = buildEnterpriseHeadquartersSummary(records);
  assert.equal(summary.totalRecords, 2);
  assert.equal(summary.recordsWithValidConvertedCoordinates, 2);
  assert.equal(summary.coordinateQuality.duplicateCoordinatePairCount, 1);
  assert.equal(filterEnterpriseHeadquarters(records, { search: '乙', districtNameFromAddress: '', roadName: '', industryCategoryRaw: '', industryCategoryNormalized: '', industryCategoryGroup: '', recognitionStartYear: '', recognitionEndYear: '', recognitionStatusRelativeToBuildDate: '', addressLooksLikeMultiFloorOrUnit: '', coordinateConversionStatus: '', coordinateQuality: '', locationPrecision: '', hasValidConvertedCoordinates: '' }).length, 1);
});
