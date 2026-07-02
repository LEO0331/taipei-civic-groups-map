import { TAIPEI_DISTRICT_CENTROIDS } from './civicGroups';
import { cleanText, normalizeText, parseIntegerText, parseResourceAddress, parseResourcePhone, parseRocYear } from './disabilityEmploymentResourceMap';
import type { ShelteredWorkshopBusinessItemCategory, ShelteredWorkshopDirectoryFilters, ShelteredWorkshopDirectoryRecord, ShelteredWorkshopDirectorySummary, ShelteredWorkshopServiceCategory } from '../types';

export const normalizeShelteredWorkshopName = (raw: unknown) => cleanText(raw)?.toLocaleLowerCase();
export const parseContactName = (raw: unknown) => ({ contactName: cleanText(raw), hasContact: Boolean(cleanText(raw)) });

export function classifyShelteredWorkshopBusinessItem(raw: string | undefined): ShelteredWorkshopBusinessItemCategory[] {
  const text = raw ?? '';
  const categories = new Set<ShelteredWorkshopBusinessItemCategory>();
  if (!text) return ['unknown'];
  if (text.includes('零售') || text.includes('販售') || text.includes('批發')) categories.add('retail');
  if (text.includes('餐飲') || text.includes('食品') || text.includes('飲料') || text.includes('麵包') || text.includes('烘焙')) categories.add('food_and_beverage');
  if (text.includes('加油站') || text.includes('汽車充電')) categories.add('gas_station');
  if (text.includes('製造') || text.includes('製迼') || text.includes('加工')) categories.add('manufacturing');
  if (text.includes('清潔')) categories.add('cleaning_service');
  if (text.includes('輔具')) categories.add('assistive_device_service');
  if (text.includes('洗衣')) categories.add('laundry');
  if (text.includes('汽車美容') || text.includes('汽車')) categories.add('auto_service');
  if (text.includes('辦公室') || text.includes('業務支援') || text.includes('行政')) categories.add('office_support');
  if (text.includes('印刷') || text.includes('包裝')) categories.add('printing_packaging');
  if (text.includes('維修') || text.includes('修繕')) categories.add('maintenance_repair');
  if (text.includes('農') || text.includes('園藝') || text.includes('蔬果')) categories.add('agriculture_food_processing');
  if (categories.size > 1) categories.add('mixed');
  if (!categories.size) categories.add('other_service');
  return [...categories];
}

export function classifyShelteredWorkshopServiceCategory(raw: string | undefined): ShelteredWorkshopServiceCategory[] {
  const text = raw ?? '';
  const categories = new Set<ShelteredWorkshopServiceCategory>();
  if (!text) return ['unknown'];
  if (text.includes('零售') || text.includes('販售') || text.includes('批發') || text.includes('製造') || text.includes('製迼') || text.includes('加工')) categories.add('workshop_business');
  if (text.includes('餐飲') || text.includes('食品') || text.includes('飲料') || text.includes('麵包')) categories.add('food_retail_service');
  if (text.includes('清潔') || text.includes('洗衣')) categories.add('cleaning_or_laundry');
  if (text.includes('輔具')) categories.add('assistive_support');
  if (text.includes('汽車') || text.includes('加油站') || text.includes('充電')) categories.add('vehicle_related_service');
  if (text.includes('辦公室') || text.includes('業務支援') || text.includes('印刷') || text.includes('包裝')) categories.add('office_or_packaging_support');
  if (!categories.size) categories.add('other');
  return [...categories];
}

export function parseShelteredWorkshopBusinessItem(raw: unknown) {
  const businessItemRaw = cleanText(raw), businessItem = businessItemRaw, businessItemNormalized = normalizeText(businessItem);
  const businessItemCategories = classifyShelteredWorkshopBusinessItem(businessItem);
  const serviceCategories = classifyShelteredWorkshopServiceCategory(businessItem);
  return { businessItemRaw, businessItem, businessItemNormalized, businessItemCategories, serviceCategories, warning: businessItemCategories.includes('other_service') || businessItemCategories.includes('unknown') ? 'Unclassified business item' : undefined };
}

export function parseUnifiedBusinessNumber(raw: unknown) {
  const unifiedBusinessNumber = cleanText(raw);
  const unifiedBusinessNumberNormalized = unifiedBusinessNumber?.replace(/[\s-]/g, '');
  const unifiedBusinessNumberValidFormat = Boolean(unifiedBusinessNumberNormalized?.match(/^\d{8}$/));
  return { unifiedBusinessNumber, unifiedBusinessNumberNormalized, unifiedBusinessNumberValidFormat, warning: unifiedBusinessNumber && !unifiedBusinessNumberValidFormat ? 'Invalid unified business number format' : undefined };
}

export const createShelteredWorkshopMapQuery = (record: { workshopName?: string; address?: string }) => cleanText([record.address, record.workshopName].filter(Boolean).join(' '));

function countBy<T extends string>(values: T[]) {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}
const duplicateCount = (values: Array<string | undefined>) => countBy(values.filter(Boolean) as string[]).filter((item) => item.count > 1).length;

export function buildShelteredWorkshopDirectorySummary(records: ShelteredWorkshopDirectoryRecord[]): ShelteredWorkshopDirectorySummary {
  const years = records.flatMap((record) => record.sourceYear ?? []);
  const businessItems = countBy(records.flatMap((record) => record.businessItem ?? []));
  const businessCategories = countBy(records.flatMap((record) => record.businessItemCategories));
  const serviceCategories = countBy(records.flatMap((record) => record.serviceCategories));
  const districts = countBy(records.flatMap((record) => record.taipeiDistrict ?? []));
  return {
    totalRecords: records.length,
    minSourceYear: years.length ? Math.min(...years) : undefined,
    maxSourceYear: years.length ? Math.max(...years) : undefined,
    latestSourceYear: years.length ? Math.max(...years) : undefined,
    uniqueWorkshopNameCount: new Set(records.map((record) => record.workshopNameNormalized ?? record.workshopName)).size,
    uniqueBusinessItemCount: businessItems.length,
    businessItemCategoryCount: businessCategories.length,
    serviceCategoryCount: serviceCategories.length,
    uniqueUnifiedBusinessNumberCount: new Set(records.flatMap((record) => record.unifiedBusinessNumberNormalized ?? [])).size,
    taipeiDistrictCount: districts.length,
    recordsWithAddress: records.filter((record) => record.address).length,
    recordsWithParsedDistrictFromAddress: records.filter((record) => record.districtFromAddress).length,
    recordsWithPhone: records.filter((record) => record.hasPhone).length,
    recordsWithContact: records.filter((record) => record.hasContact).length,
    recordsWithUnifiedBusinessNumber: records.filter((record) => record.unifiedBusinessNumber).length,
    byBusinessItemCategory: businessCategories.map(({ key: businessItemCategory, count }) => ({ businessItemCategory, count })),
    byServiceCategory: serviceCategories.map(({ key: serviceCategory, count }) => ({ serviceCategory, count })),
    byDistrict: districts.map(({ key: district, count }) => {
      const rows = records.filter((record) => record.taipeiDistrict === district);
      return { district, workshopCount: count, uniqueBusinessItemCount: new Set(rows.flatMap((record) => record.businessItem ?? [])).size, uniqueServiceCategoryCount: new Set(rows.flatMap((record) => record.serviceCategories)).size };
    }),
    byRoadName: countBy(records.flatMap((record) => record.roadName ?? [])).map(({ key: roadName, count }) => ({ roadName, count })),
    topBusinessItems: businessItems.map(({ key: businessItem, count }) => ({ businessItem, count })),
    phoneQuality: {
      hasPhone: records.filter((record) => record.hasPhone).length,
      missingPhone: records.filter((record) => record.phoneType === 'missing').length,
      taipeiLandline: records.filter((record) => record.phoneType === 'taipei_landline').length,
      otherLandline: records.filter((record) => record.phoneType === 'other_landline').length,
      mobile: records.filter((record) => record.phoneType === 'mobile').length,
      extension: records.filter((record) => record.phoneType === 'extension').length,
      multiple: records.filter((record) => record.phoneType === 'multiple').length,
      unknown: records.filter((record) => record.phoneType === 'unknown').length,
    },
    dataQuality: {
      missingWorkshopNameCount: records.filter((record) => !record.workshopName).length,
      missingAddressCount: records.filter((record) => !record.address).length,
      unparsedAddressDistrictCount: records.filter((record) => record.address && !record.districtFromAddress).length,
      duplicateWorkshopNameCount: duplicateCount(records.map((record) => record.workshopNameNormalized)),
      duplicateAddressCount: duplicateCount(records.map((record) => record.addressNormalized)),
      duplicatePhoneCount: duplicateCount(records.map((record) => record.phone)),
      duplicateUnifiedBusinessNumberCount: duplicateCount(records.map((record) => record.unifiedBusinessNumberNormalized)),
      invalidUnifiedBusinessNumberFormatCount: records.filter((record) => record.unifiedBusinessNumber && !record.unifiedBusinessNumberValidFormat).length,
      duplicateFallbackKeyCount: duplicateCount(records.map((record) => [record.workshopNameNormalized, record.addressNormalized, record.phone].filter(Boolean).join('|'))),
    },
  };
}

export function filterShelteredWorkshops(records: ShelteredWorkshopDirectoryRecord[], filters: ShelteredWorkshopDirectoryFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((record) => (!query || [record.workshopName, record.businessItem, record.contactName, record.address, record.roadName, record.phone, record.unifiedBusinessNumber].filter(Boolean).join(' ').toLocaleLowerCase().includes(query))
    && (!filters.sourceYear || String(record.sourceYear) === filters.sourceYear)
    && (!filters.businessItem || record.businessItem === filters.businessItem)
    && (!filters.businessItemCategory || record.businessItemCategories.includes(filters.businessItemCategory as ShelteredWorkshopBusinessItemCategory))
    && (!filters.serviceCategory || record.serviceCategories.includes(filters.serviceCategory as ShelteredWorkshopServiceCategory))
    && (!filters.district || record.taipeiDistrict === filters.district)
    && (!filters.roadName || record.roadName === filters.roadName)
    && (!filters.phoneType || record.phoneType === filters.phoneType)
    && (!filters.hasContact || (filters.hasContact === 'yes' ? record.hasContact : !record.hasContact))
    && (!filters.hasPhone || (filters.hasPhone === 'yes' ? record.hasPhone : !record.hasPhone))
    && (!filters.unifiedBusinessNumberValid || (filters.unifiedBusinessNumberValid === 'yes' ? record.unifiedBusinessNumberValidFormat : !record.unifiedBusinessNumberValidFormat))
    && (!filters.addressParsed || (filters.addressParsed === 'yes' ? Boolean(record.districtFromAddress) : !record.districtFromAddress)));
}

export function districtPoint(district?: string) {
  return district ? TAIPEI_DISTRICT_CENTROIDS[district] : undefined;
}

export { cleanText, normalizeText, parseIntegerText, parseResourceAddress, parseResourcePhone, parseRocYear };
