import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildShelteredWorkshopDirectorySummary, classifyShelteredWorkshopBusinessItem,
  classifyShelteredWorkshopServiceCategory, filterShelteredWorkshops, parseShelteredWorkshopBusinessItem,
  parseResourceAddress, parseResourcePhone, parseRocYear, parseUnifiedBusinessNumber,
} from './shelteredWorkshopDirectory';
import type { ShelteredWorkshopDirectoryRecord } from '../types';

test('parses sheltered workshop source fields', () => {
  assert.deepEqual(parseRocYear('115'), { sourceRocYearRaw: '115', sourceRocYear: 115, sourceYear: 2026 });
  assert.deepEqual(classifyShelteredWorkshopBusinessItem('餐飲業、零售業'), ['retail', 'food_and_beverage', 'mixed']);
  assert.deepEqual(classifyShelteredWorkshopServiceCategory('輔具清潔、販售'), ['workshop_business', 'cleaning_or_laundry', 'assistive_support']);
  assert.equal(parseShelteredWorkshopBusinessItem('食品製迼業、批發及零售業').businessItemCategories.includes('manufacturing'), true);
  assert.equal(parseResourceAddress('台北市信義區市府路1號1樓').taipeiDistrict, '信義區');
  assert.equal(parseResourcePhone('2711-5842轉2740、7418').phoneType, 'multiple');
  assert.deepEqual(parseUnifiedBusinessNumber('42313026'), { unifiedBusinessNumber: '42313026', unifiedBusinessNumberNormalized: '42313026', unifiedBusinessNumberValidFormat: true, warning: undefined });
});

test('summarizes and filters sheltered workshops', () => {
  const records: ShelteredWorkshopDirectoryRecord[] = [
    { id: '1', module: 'sheltered_workshop_directory', sourceYear: 2026, sourceRocYear: 115, workshopName: '甲工場', workshopNameNormalized: '甲工場', businessItem: '餐飲業', businessItemCategories: ['food_and_beverage'], serviceCategories: ['food_retail_service'], contactName: '王小姐', hasContact: true, address: '臺北市信義區市府路1號', addressNormalized: '臺北市信義區市府路1號', districtFromAddress: '信義區', isTaipeiDistrict: true, taipeiDistrict: '信義區', roadName: '市府路', phone: '2720-5208', phoneType: 'taipei_landline', hasPhone: true, unifiedBusinessNumber: '42313026', unifiedBusinessNumberNormalized: '42313026', unifiedBusinessNumberValidFormat: true, locationPrecision: 'district_centroid', source: '臺北市庇護工場名冊', sourceAgency: '臺北市政府勞動局勞動力重建運用處' },
    { id: '2', module: 'sheltered_workshop_directory', sourceYear: 2026, sourceRocYear: 115, workshopName: '乙工場', workshopNameNormalized: '乙工場', businessItem: '清潔服務業', businessItemCategories: ['cleaning_service'], serviceCategories: ['cleaning_or_laundry'], hasContact: false, address: '新北市中和區捷運路6號', addressNormalized: '新北市中和區捷運路6號', isTaipeiDistrict: false, outsideTaipeiArea: '新北市中和區捷運路6號', roadName: '新北市中和區捷運路', phone: '2943-3994', phoneType: 'unknown', hasPhone: true, unifiedBusinessNumber: '34897357', unifiedBusinessNumberNormalized: '34897357', unifiedBusinessNumberValidFormat: true, locationPrecision: 'address_only', source: '臺北市庇護工場名冊', sourceAgency: '臺北市政府勞動局勞動力重建運用處' },
  ];
  const summary = buildShelteredWorkshopDirectorySummary(records);
  assert.equal(summary.totalRecords, 2);
  assert.equal(summary.latestSourceYear, 2026);
  assert.equal(summary.taipeiDistrictCount, 1);
  assert.equal(summary.recordsWithUnifiedBusinessNumber, 2);
  assert.equal(summary.dataQuality.unparsedAddressDistrictCount, 1);
  assert.equal(filterShelteredWorkshops(records, { search: '餐飲', sourceYear: '', businessItem: '', businessItemCategory: '', serviceCategory: '', district: '', roadName: '', hasContact: '', hasPhone: '', phoneType: '', unifiedBusinessNumberValid: '', addressParsed: '' }).length, 1);
  assert.equal(filterShelteredWorkshops(records, { search: '', sourceYear: '', businessItem: '', businessItemCategory: 'cleaning_service', serviceCategory: '', district: '', roadName: '', hasContact: '', hasPhone: '', phoneType: '', unifiedBusinessNumberValid: '', addressParsed: '' }).length, 1);
});
