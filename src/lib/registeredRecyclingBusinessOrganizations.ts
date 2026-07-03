import { DISTRICTS } from './civicGroups';
import type { RecyclingItemCategory, RecyclingOrganizationGeocodingStatus, RecyclingOrganizationLocationPrecision, RegisteredRecyclingBusinessOrganizationFilters, RegisteredRecyclingBusinessOrganizationRecord, RegisteredRecyclingBusinessOrganizationSummary } from '../types';

const missing = new Set(['', '-', '--', 'nan', 'null', '尚無資料']);
const normalize = (raw: unknown) => cleanText(raw)?.replaceAll('台', '臺').toLocaleLowerCase();

export const cleanText = (raw: unknown) => {
  const text = String(raw ?? '').replace(/\u3000/g, ' ').trim().replace(/\s+/g, ' ');
  return missing.has(text.toLowerCase()) ? undefined : text;
};
export const parseSourceSequenceNumber = (raw: unknown) => {
  const sourceSequenceNumberNormalized = cleanText(raw);
  const value = sourceSequenceNumberNormalized ? Number(sourceSequenceNumberNormalized) : undefined;
  return { sourceSequenceNumber: Number.isInteger(value) ? value : undefined, sourceSequenceNumberNormalized, warning: sourceSequenceNumberNormalized && !Number.isInteger(value) ? 'Invalid sequence number' : undefined };
};
export const parseRecyclingOrganizationName = (raw: unknown) => {
  const organizationName = cleanText(raw);
  return { organizationName, organizationNameNormalized: normalize(organizationName), warning: organizationName ? undefined : 'Missing organization name' };
};
export const parseBusinessRegistrationNumber = (raw: unknown) => {
  const businessRegistrationNumber = cleanText(raw), businessRegistrationNumberNormalized = businessRegistrationNumber?.replace(/\s/g, '');
  const businessRegistrationNumberValidFormat = Boolean(businessRegistrationNumberNormalized && /^\d{8}$/.test(businessRegistrationNumberNormalized));
  return { businessRegistrationNumber, businessRegistrationNumberNormalized, businessRegistrationNumberValidFormat, warning: businessRegistrationNumber && !businessRegistrationNumberValidFormat ? 'Invalid business registration number format' : undefined };
};
export const parseResponsiblePersonName = (raw: unknown) => {
  const responsiblePersonName = cleanText(raw);
  return { responsiblePersonName, responsiblePersonNameNormalized: normalize(responsiblePersonName), warning: undefined };
};
export const parseContactPersonName = (raw: unknown) => {
  const contactPersonName = cleanText(raw);
  return { contactPersonName, contactPersonNameNormalized: normalize(contactPersonName), warning: undefined };
};
export const parsePhoneNumber = (raw: unknown) => {
  const phoneNumber = cleanText(raw), phoneNumberNormalized = phoneNumber?.replace(/[^\d#,+]/g, '');
  return { phoneNumber, phoneNumberNormalized, warning: phoneNumber && !/\d/.test(phoneNumber) ? 'Phone has no digits' : undefined };
};
export const parseMobilePhoneNumber = (raw: unknown) => {
  const mobilePhoneNumber = cleanText(raw), mobilePhoneNumberNormalized = mobilePhoneNumber?.replace(/[^\d#,+]/g, '');
  return { mobilePhoneNumber, mobilePhoneNumberNormalized, warning: mobilePhoneNumber && !/\d/.test(mobilePhoneNumber) ? 'Mobile phone has no digits' : undefined };
};
export function parseRecyclingStorageSiteAddress(raw: unknown) {
  const recyclingStorageSiteAddress = cleanText(raw);
  const recyclingStorageSiteAddressNormalized = recyclingStorageSiteAddress?.replaceAll('台北市', '臺北市').replaceAll('台', '臺');
  const districtNameFromAddress = DISTRICTS.find((district) => recyclingStorageSiteAddressNormalized?.includes(district));
  const addressAfterDistrict = districtNameFromAddress && recyclingStorageSiteAddressNormalized ? recyclingStorageSiteAddressNormalized.slice(recyclingStorageSiteAddressNormalized.indexOf(districtNameFromAddress) + districtNameFromAddress.length) : recyclingStorageSiteAddressNormalized;
  const roadName = addressAfterDistrict?.match(/([^，,\s\d]+(?:路|街|大道|巷))/)?.[1];
  const addressLooksLikeOpenLotOrNearby = Boolean(recyclingStorageSiteAddressNormalized && /旁|對面|附近|空地|巷內|之/.test(recyclingStorageSiteAddressNormalized));
  return { recyclingStorageSiteAddress, recyclingStorageSiteAddressNormalized, districtNameFromAddress, isTaipeiDistrict: Boolean(districtNameFromAddress), roadName, addressLooksLikeOpenLotOrNearby, warning: recyclingStorageSiteAddress && !districtNameFromAddress ? 'District not found' : undefined };
}

export function classifyRecyclingItem(raw: string | undefined): RecyclingItemCategory {
  const text = raw?.trim() ?? '';
  if (!text) return 'unknown';
  if (text.includes('廢紙容器')) return 'paper_container';
  if (text.includes('廢塑膠容器')) return 'plastic_container';
  if (text.includes('廢鋁容器')) return 'aluminum_container';
  if (text.includes('廢鐵容器')) return 'iron_container';
  if (text.includes('廢資訊')) return 'it_equipment';
  if (text.includes('廢電子') || text.includes('電器')) return 'electronics';
  if (text.includes('乾電池')) return 'dry_battery';
  if (text.includes('鉛蓄電池')) return 'lead_acid_battery';
  if (text.includes('照明')) return 'lighting';
  if (text.includes('機動車輛')) return 'vehicle';
  if (text.includes('輪胎')) return 'tire';
  if (text.includes('廢五金')) return 'hardware';
  if (text.includes('廢紙')) return 'paper';
  if (text.includes('廢塑膠')) return 'plastic';
  if (text.includes('廢鋁')) return 'aluminum';
  if (text.includes('廢鐵')) return 'iron';
  if (text.includes('廢銅')) return 'copper';
  if (text.includes('廢玻璃')) return 'glass';
  if (text.includes('金屬')) return 'metal';
  return 'other';
}
export function parseRecyclingItems(raw: unknown) {
  const text = cleanText(raw);
  const items = [...new Set((text ?? '').split(/[\n\r、,，;；]+/).map(cleanText).filter(Boolean) as string[])];
  const categories = [...new Set(items.map(classifyRecyclingItem))];
  return { raw: text, items, categories: categories.length ? categories : ['unknown' as const], hasItems: items.length > 0, warnings: categories.includes('other') || categories.includes('unknown') ? ['Unknown recycling item category'] : [] };
}
export const createRecyclingOrganizationMapQuery = (record: { recyclingStorageSiteAddress?: string; organizationName?: string }) => cleanText(['臺北市', record.recyclingStorageSiteAddress, record.organizationName].filter(Boolean).join(' '));
export function getLocationPrecision(district?: string, address?: string): RecyclingOrganizationLocationPrecision {
  if (district && address) return 'district_address';
  if (district) return 'district_only';
  return 'missing';
}

function countBy<T extends string>(values: T[]) {
  return [...values.reduce((m, v) => m.set(v, (m.get(v) ?? 0) + 1), new Map<T, number>())].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key, 'zh-Hant'));
}
const dupCount = (values: Array<string | undefined>) => countBy(values.filter(Boolean) as string[]).filter((item) => item.count > 1).length;

export function buildRegisteredRecyclingBusinessOrganizationSummary(records: RegisteredRecyclingBusinessOrganizationRecord[]): RegisteredRecyclingBusinessOrganizationSummary {
  const sharedAddresses = countBy(records.flatMap((r) => r.recyclingStorageSiteAddressNormalized ?? [])).filter((item) => item.count > 1);
  return {
    totalRecords: records.length,
    districtCount: new Set(records.flatMap((r) => r.districtNameFromAddress ?? [])).size,
    uniqueOrganizationNameCount: new Set(records.flatMap((r) => r.organizationNameNormalized ?? [])).size,
    uniqueBusinessRegistrationNumberCount: new Set(records.flatMap((r) => r.businessRegistrationNumberNormalized ?? [])).size,
    uniqueResponsiblePersonNameCount: new Set(records.flatMap((r) => r.responsiblePersonNameNormalized ?? [])).size,
    uniqueAddressCount: new Set(records.flatMap((r) => r.recyclingStorageSiteAddressNormalized ?? [])).size,
    uniqueRoadNameCount: new Set(records.flatMap((r) => r.roadName ?? [])).size,
    uniqueRegulatedRecyclableItemCount: new Set(records.flatMap((r) => r.regulatedRecyclableItems)).size,
    uniqueGeneralWasteRecyclingItemCount: new Set(records.flatMap((r) => r.generalWasteRecyclingItems)).size,
    recordsWithBusinessRegistrationNumber: records.filter((r) => r.businessRegistrationNumber).length,
    recordsWithValidBusinessRegistrationNumberFormat: records.filter((r) => r.businessRegistrationNumberValidFormat).length,
    recordsWithPhoneNumber: records.filter((r) => r.hasPhoneNumber).length,
    recordsWithMobilePhoneNumber: records.filter((r) => r.hasMobilePhoneNumber).length,
    recordsWithAnyContactNumber: records.filter((r) => r.hasAnyContactNumber).length,
    recordsWithContactPerson: records.filter((r) => r.contactPersonName).length,
    recordsWithRegulatedRecyclableItems: records.filter((r) => r.hasRegulatedRecyclableItems).length,
    recordsWithGeneralWasteRecyclingItems: records.filter((r) => r.hasGeneralWasteRecyclingItems).length,
    recordsWithOpenLotOrNearbyAddress: records.filter((r) => r.addressLooksLikeOpenLotOrNearby).length,
    recordsWithGeocodedCoordinates: records.filter((r) => r.coordinateSource === 'geocoded').length,
    recordsWithOfficialCoordinates: records.filter((r) => r.coordinateSource === 'official').length,
    byDistrict: countBy(records.flatMap((r) => r.districtNameFromAddress ?? [])).map(({ key: districtName, count }) => {
      const rows = records.filter((r) => r.districtNameFromAddress === districtName);
      return { districtName, count, uniqueAddressCount: new Set(rows.flatMap((r) => r.recyclingStorageSiteAddressNormalized ?? [])).size, uniqueOrganizationNameCount: new Set(rows.flatMap((r) => r.organizationNameNormalized ?? [])).size, recordsWithPhoneNumber: rows.filter((r) => r.hasPhoneNumber).length, recordsWithMobilePhoneNumber: rows.filter((r) => r.hasMobilePhoneNumber).length };
    }),
    byRegulatedRecyclableItem: countBy(records.flatMap((r) => r.regulatedRecyclableItems)).map(({ key: item, count }) => ({ item, category: classifyRecyclingItem(item), count, districtCount: new Set(records.filter((r) => r.regulatedRecyclableItems.includes(item)).flatMap((r) => r.districtNameFromAddress ?? [])).size })),
    byGeneralWasteRecyclingItem: countBy(records.flatMap((r) => r.generalWasteRecyclingItems)).map(({ key: item, count }) => ({ item, category: classifyRecyclingItem(item), count, districtCount: new Set(records.filter((r) => r.generalWasteRecyclingItems.includes(item)).flatMap((r) => r.districtNameFromAddress ?? [])).size })),
    byRegulatedRecyclableItemCategory: countBy(records.flatMap((r) => r.regulatedRecyclableItemCategories)).map(({ key, count }) => ({ category: key as RecyclingItemCategory, count })),
    byGeneralWasteRecyclingItemCategory: countBy(records.flatMap((r) => r.generalWasteRecyclingItemCategories)).map(({ key, count }) => ({ category: key as RecyclingItemCategory, count })),
    byRoadName: countBy(records.flatMap((r) => r.roadName ?? [])).map(({ key: roadName, count }) => ({ roadName, count, districtCount: new Set(records.filter((r) => r.roadName === roadName).flatMap((r) => r.districtNameFromAddress ?? [])).size })),
    byBusinessRegistrationNumberAvailability: [{ hasBusinessRegistrationNumber: true, count: records.filter((r) => r.businessRegistrationNumber).length }, { hasBusinessRegistrationNumber: false, count: records.filter((r) => !r.businessRegistrationNumber).length }],
    byAnyContactNumberAvailability: [{ hasAnyContactNumber: true, count: records.filter((r) => r.hasAnyContactNumber).length }, { hasAnyContactNumber: false, count: records.filter((r) => !r.hasAnyContactNumber).length }],
    byOpenLotOrNearbyAddress: [{ addressLooksLikeOpenLotOrNearby: true, count: records.filter((r) => r.addressLooksLikeOpenLotOrNearby).length }, { addressLooksLikeOpenLotOrNearby: false, count: records.filter((r) => !r.addressLooksLikeOpenLotOrNearby).length }],
    topOrganizationsBySharedAddress: sharedAddresses.map(({ key: address, count }) => ({ address, count, districtName: records.find((r) => r.recyclingStorageSiteAddressNormalized === address)?.districtNameFromAddress })).slice(0, 30),
    dataQuality: {
      missingSequenceNumberCount: records.filter((r) => !r.sourceSequenceNumberNormalized).length,
      duplicateSequenceNumberCount: dupCount(records.map((r) => r.sourceSequenceNumberNormalized)),
      missingOrganizationNameCount: records.filter((r) => !r.organizationName).length,
      duplicateOrganizationNameCount: dupCount(records.map((r) => r.organizationNameNormalized)),
      missingBusinessRegistrationNumberCount: records.filter((r) => !r.businessRegistrationNumber).length,
      duplicateBusinessRegistrationNumberCount: dupCount(records.map((r) => r.businessRegistrationNumberNormalized)),
      invalidBusinessRegistrationNumberCount: records.filter((r) => r.businessRegistrationNumber && !r.businessRegistrationNumberValidFormat).length,
      missingResponsiblePersonNameCount: records.filter((r) => !r.responsiblePersonName).length,
      missingPhoneNumberCount: records.filter((r) => !r.phoneNumber).length,
      missingMobilePhoneNumberCount: records.filter((r) => !r.mobilePhoneNumber).length,
      missingContactPersonNameCount: records.filter((r) => !r.contactPersonName).length,
      missingAddressCount: records.filter((r) => !r.recyclingStorageSiteAddress).length,
      duplicateAddressCount: dupCount(records.map((r) => r.recyclingStorageSiteAddressNormalized)),
      unparsedDistrictFromAddressCount: records.filter((r) => !r.districtNameFromAddress).length,
      missingRegulatedRecyclableItemsCount: records.filter((r) => !r.hasRegulatedRecyclableItems).length,
      missingGeneralWasteRecyclingItemsCount: records.filter((r) => !r.hasGeneralWasteRecyclingItems).length,
      unknownRegulatedRecyclableItemCount: records.flatMap((r) => r.regulatedRecyclableItemCategories).filter((c) => c === 'other' || c === 'unknown').length,
      unknownGeneralWasteRecyclingItemCount: records.flatMap((r) => r.generalWasteRecyclingItemCategories).filter((c) => c === 'other' || c === 'unknown').length,
      duplicateFallbackKeyCount: dupCount(records.map((r) => [r.organizationNameNormalized, r.recyclingStorageSiteAddressNormalized, r.regulatedRecyclableItemsRaw, r.generalWasteRecyclingItemsRaw].filter(Boolean).join('|'))),
    },
  };
}

export function filterRegisteredRecyclingBusinessOrganizations(records: RegisteredRecyclingBusinessOrganizationRecord[], filters: RegisteredRecyclingBusinessOrganizationFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((r) => (!query || [r.sourceSequenceNumberNormalized, r.organizationName, r.businessRegistrationNumber, r.responsiblePersonName, r.phoneNumber, r.mobilePhoneNumber, r.contactPersonName, r.districtNameFromAddress, r.recyclingStorageSiteAddress, r.roadName, r.regulatedRecyclableItems.join(' '), r.generalWasteRecyclingItems.join(' ')].filter(Boolean).join(' ').toLocaleLowerCase().includes(query))
    && (!filters.districtName || r.districtNameFromAddress === filters.districtName)
    && (!filters.roadName || r.roadName === filters.roadName)
    && (!filters.regulatedRecyclableItem || r.regulatedRecyclableItems.includes(filters.regulatedRecyclableItem))
    && (!filters.regulatedRecyclableItemCategory || r.regulatedRecyclableItemCategories.includes(filters.regulatedRecyclableItemCategory as RecyclingItemCategory))
    && (!filters.generalWasteRecyclingItem || r.generalWasteRecyclingItems.includes(filters.generalWasteRecyclingItem))
    && (!filters.generalWasteRecyclingItemCategory || r.generalWasteRecyclingItemCategories.includes(filters.generalWasteRecyclingItemCategory as RecyclingItemCategory))
    && (!filters.hasBusinessRegistrationNumber || (filters.hasBusinessRegistrationNumber === 'yes' ? Boolean(r.businessRegistrationNumber) : !r.businessRegistrationNumber))
    && (!filters.businessRegistrationNumberValidFormat || (filters.businessRegistrationNumberValidFormat === 'yes' ? r.businessRegistrationNumberValidFormat : !r.businessRegistrationNumberValidFormat))
    && (!filters.hasPhoneNumber || (filters.hasPhoneNumber === 'yes' ? r.hasPhoneNumber : !r.hasPhoneNumber))
    && (!filters.hasMobilePhoneNumber || (filters.hasMobilePhoneNumber === 'yes' ? r.hasMobilePhoneNumber : !r.hasMobilePhoneNumber))
    && (!filters.hasAnyContactNumber || (filters.hasAnyContactNumber === 'yes' ? r.hasAnyContactNumber : !r.hasAnyContactNumber))
    && (!filters.hasRegulatedRecyclableItems || (filters.hasRegulatedRecyclableItems === 'yes' ? r.hasRegulatedRecyclableItems : !r.hasRegulatedRecyclableItems))
    && (!filters.hasGeneralWasteRecyclingItems || (filters.hasGeneralWasteRecyclingItems === 'yes' ? r.hasGeneralWasteRecyclingItems : !r.hasGeneralWasteRecyclingItems))
    && (!filters.addressLooksLikeOpenLotOrNearby || (filters.addressLooksLikeOpenLotOrNearby === 'yes' ? r.addressLooksLikeOpenLotOrNearby : !r.addressLooksLikeOpenLotOrNearby))
    && (!filters.geocodingStatus || r.geocodingStatus === filters.geocodingStatus as RecyclingOrganizationGeocodingStatus)
    && (!filters.locationPrecision || r.locationPrecision === filters.locationPrecision as RecyclingOrganizationLocationPrecision));
}
