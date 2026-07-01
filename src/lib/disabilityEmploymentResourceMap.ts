import { DISTRICTS } from './civicGroups';
import { cleanText as baseCleanText, parseHealthcareProviderPhone } from './contractedVaccinationMedicalProviders';
import type { DisabilityEmploymentBusinessItemCategory, DisabilityEmploymentResourceFilters, DisabilityEmploymentResourceRecord, DisabilityEmploymentResourceSummary, DisabilityEmploymentServiceCategory, ResourcePhoneType } from '../types';

export const cleanText = (raw: unknown) => {
  const text = baseCleanText(raw)?.replace(/\u3000/g, ' ').replace(/\s+/g, ' ').trim();
  return text && !['-', '--', 'NaN', 'NULL', 'null', '尚無資料'].includes(text) ? text : undefined;
};
export const normalizeText = (raw: unknown) => cleanText(raw)?.toLocaleLowerCase();
export const parseIntegerText = (raw: unknown) => { const text = cleanText(raw)?.replaceAll(',', ''); const value = text ? Number.parseInt(text, 10) : undefined; return Number.isFinite(value) ? value : undefined; };

export function parseRocYear(raw: unknown) {
  const sourceRocYearRaw = cleanText(raw), year = parseIntegerText(sourceRocYearRaw?.replace(/[民國年]/g, ''));
  if (!sourceRocYearRaw || year === undefined) return { sourceRocYearRaw, warning: sourceRocYearRaw ? 'Invalid source year' : undefined };
  return year < 1911 ? { sourceRocYearRaw, sourceRocYear: year, sourceYear: year + 1911 } : { sourceRocYearRaw, sourceYear: year };
}

export const normalizeDisabilityEmploymentResourceName = (raw: unknown) => cleanText(raw)?.toLocaleLowerCase();
export const parseContactName = (raw: unknown) => ({ contactName: cleanText(raw), hasContact: Boolean(cleanText(raw)) });

export function parseDisabilityType(raw: unknown) {
  const disabilityTypeRaw = cleanText(raw), disabilityType = disabilityTypeRaw, disabilityTypeNormalized = normalizeText(disabilityType);
  return { disabilityTypeRaw, disabilityType, disabilityTypeNormalized, warning: disabilityType && disabilityType !== '綜合障別' ? 'Unexpected disability type' : undefined };
}

export function classifyDisabilityEmploymentBusinessItem(raw: string | undefined): DisabilityEmploymentBusinessItemCategory {
  const text = raw ?? '';
  if (!text) return 'unknown';
  if (text.includes('職業重建')) return 'vocational_rehabilitation';
  if (text.includes('就業服務機構') || text.includes('就業服務')) return 'employment_service_agency';
  if (text.includes('零售')) return 'retail';
  if (text.includes('餐飲') || text.includes('食品')) return 'food_and_beverage';
  if (text.includes('加油站')) return 'gas_station';
  if (text.includes('製造')) return 'manufacturing';
  if (text.includes('輔具')) return 'assistive_device_service';
  if (text.includes('清潔')) return 'cleaning_service';
  if (text.includes('庇護') || text.includes('社會企業')) return 'social_enterprise_or_sheltered_work';
  if (text.includes('訓練') || text.includes('諮詢') || text.includes('輔導')) return 'training_or_counseling';
  return 'other_service';
}

export function classifyDisabilityEmploymentServiceCategory(raw: string | undefined): DisabilityEmploymentServiceCategory {
  const text = raw ?? '';
  if (!text) return 'unknown';
  if (text.includes('就業服務')) return 'employment_support';
  if (text.includes('職業重建')) return 'vocational_rehabilitation';
  if (text.includes('零售') || text.includes('餐飲') || text.includes('加油站') || text.includes('製造') || text.includes('清潔') || text.includes('食品')) return 'workplace_or_business_resource';
  if (text.includes('訓練') || text.includes('輔導') || text.includes('諮詢')) return 'training_and_counseling';
  if (text.includes('輔具')) return 'assistive_support';
  return 'other';
}

export function parseBusinessItem(raw: unknown) {
  const businessItemRaw = cleanText(raw), businessItem = businessItemRaw, businessItemNormalized = normalizeText(businessItem);
  const businessItemCategory = classifyDisabilityEmploymentBusinessItem(businessItem);
  const serviceCategory = classifyDisabilityEmploymentServiceCategory(businessItem);
  return { businessItemRaw, businessItem, businessItemNormalized, businessItemCategory, serviceCategory, warning: businessItemCategory === 'unknown' || businessItemCategory === 'other_service' ? 'Unclassified business item' : undefined };
}

export function parseResourceAddress(raw: unknown) {
  const address = cleanText(raw);
  if (!address) return { isTaipeiDistrict: false, warning: 'Missing address' };
  const addressNormalized = address.replaceAll('台北市', '臺北市');
  const taipeiDistrict = DISTRICTS.find((district) => addressNormalized.includes(district));
  const afterDistrict = taipeiDistrict ? addressNormalized.slice(addressNormalized.indexOf(taipeiDistrict) + taipeiDistrict.length) : addressNormalized;
  const roadName = afterDistrict.match(/([^0-9\s,，]+?(?:大道|路|街))(?:([0-9一二三四五六七八九十]+段))?/)?.slice(1, 3).filter(Boolean).join('');
  return { address, addressNormalized, districtFromAddress: taipeiDistrict, isTaipeiDistrict: Boolean(taipeiDistrict), taipeiDistrict, outsideTaipeiArea: taipeiDistrict ? undefined : addressNormalized, roadName, warning: taipeiDistrict ? undefined : 'District not parsed from address' };
}

export function parseResourcePhone(raw: unknown) {
  const parsed = parseHealthcareProviderPhone(raw) as { phone?: string; phoneDisplay?: string; phoneDialHref?: string; phoneType: ResourcePhoneType; warning?: string };
  return parsed.phoneType === 'extension' || parsed.phoneType === 'multiple' ? { ...parsed, phoneDialHref: undefined } : parsed;
}

export const createDisabilityEmploymentResourceMapQuery = (record: { resourceName?: string; address?: string }) => cleanText([record.address, record.resourceName].filter(Boolean).join(' '));

function countBy<T extends string>(values: T[]) {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}
const duplicateCount = (values: Array<string | undefined>) => countBy(values.filter(Boolean) as string[]).filter((item) => item.count > 1).length;

export function buildDisabilityEmploymentResourceSummary(records: DisabilityEmploymentResourceRecord[]): DisabilityEmploymentResourceSummary {
  const years = records.flatMap((record) => record.sourceYear ?? []);
  const disabilityTypes = countBy(records.flatMap((record) => record.disabilityType ?? []));
  const businessItems = countBy(records.flatMap((record) => record.businessItem ?? []));
  const businessCategories = countBy(records.map((record) => record.businessItemCategory));
  const serviceCategories = countBy(records.map((record) => record.serviceCategory));
  const districts = countBy(records.flatMap((record) => record.taipeiDistrict ?? []));
  return {
    totalRecords: records.length,
    minSourceYear: years.length ? Math.min(...years) : undefined,
    maxSourceYear: years.length ? Math.max(...years) : undefined,
    latestSourceYear: years.length ? Math.max(...years) : undefined,
    uniqueResourceNameCount: new Set(records.map((record) => record.resourceNameNormalized ?? record.resourceName)).size,
    disabilityTypeCount: disabilityTypes.length,
    businessItemCount: businessItems.length,
    businessItemCategoryCount: businessCategories.length,
    serviceCategoryCount: serviceCategories.length,
    taipeiDistrictCount: districts.length,
    recordsWithAddress: records.filter((record) => record.address).length,
    recordsWithParsedDistrictFromAddress: records.filter((record) => record.districtFromAddress).length,
    recordsWithPhone: records.filter((record) => record.hasPhone).length,
    recordsWithContact: records.filter((record) => record.hasContact).length,
    byDisabilityType: disabilityTypes.map(({ key: disabilityType, count }) => ({ disabilityType, count })),
    byBusinessItemCategory: businessCategories.map(({ key: businessItemCategory, count }) => ({ businessItemCategory, count })),
    byServiceCategory: serviceCategories.map(({ key: serviceCategory, count }) => ({ serviceCategory, count })),
    byDistrict: districts.map(({ key: district, count }) => {
      const rows = records.filter((record) => record.taipeiDistrict === district);
      return { district, resourceCount: count, uniqueBusinessItemCount: new Set(rows.flatMap((record) => record.businessItem ?? [])).size, uniqueServiceCategoryCount: new Set(rows.map((record) => record.serviceCategory)).size };
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
      missingResourceNameCount: records.filter((record) => !record.resourceName).length,
      missingAddressCount: records.filter((record) => !record.address).length,
      unparsedAddressDistrictCount: records.filter((record) => record.address && !record.districtFromAddress).length,
      duplicateResourceNameCount: duplicateCount(records.map((record) => record.resourceNameNormalized)),
      duplicateAddressCount: duplicateCount(records.map((record) => record.addressNormalized)),
      duplicatePhoneCount: duplicateCount(records.map((record) => record.phone)),
      duplicateFallbackKeyCount: duplicateCount(records.map((record) => [record.resourceNameNormalized, record.addressNormalized, record.phone].filter(Boolean).join('|'))),
    },
  };
}

export function filterDisabilityEmploymentResources(records: DisabilityEmploymentResourceRecord[], filters: DisabilityEmploymentResourceFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((record) => (!query || [record.resourceName, record.disabilityType, record.businessItem, record.serviceCategory, record.contactName, record.address, record.roadName, record.phone].filter(Boolean).join(' ').toLocaleLowerCase().includes(query))
    && (!filters.sourceYear || String(record.sourceYear) === filters.sourceYear)
    && (!filters.disabilityType || record.disabilityType === filters.disabilityType)
    && (!filters.businessItem || record.businessItem === filters.businessItem)
    && (!filters.businessItemCategory || record.businessItemCategory === filters.businessItemCategory)
    && (!filters.serviceCategory || record.serviceCategory === filters.serviceCategory)
    && (!filters.district || record.taipeiDistrict === filters.district)
    && (!filters.roadName || record.roadName === filters.roadName)
    && (!filters.phoneType || record.phoneType === filters.phoneType)
    && (!filters.hasContact || (filters.hasContact === 'yes' ? record.hasContact : !record.hasContact))
    && (!filters.hasPhone || (filters.hasPhone === 'yes' ? record.hasPhone : !record.hasPhone))
    && (!filters.addressParsed || (filters.addressParsed === 'yes' ? Boolean(record.districtFromAddress) : !record.districtFromAddress)));
}
