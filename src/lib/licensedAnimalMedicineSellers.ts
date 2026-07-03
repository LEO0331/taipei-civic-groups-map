import { DISTRICTS } from './civicGroups';
import type { AnimalMedicineSellerGeocodingStatus, AnimalMedicineSellerLocationPrecision, LicensedAnimalMedicineSellerFilters, LicensedAnimalMedicineSellerRecord, LicensedAnimalMedicineSellerSummary } from '../types';

const missing = new Set(['', '-', '--', 'nan', 'null', '尚無資料']);
export const cleanAnimalMedicineSellerText = (raw: unknown) => {
  const text = String(raw ?? '').replace(/\u3000/g, ' ').trim().replace(/\s+/g, ' ');
  return missing.has(text.toLowerCase()) ? undefined : text;
};
const normalize = (raw: unknown) => cleanAnimalMedicineSellerText(raw)?.replaceAll('台', '臺').replace(/\s+/g, '').toLocaleLowerCase();

export function parseAnimalMedicineSellerLicenseNumber(raw: unknown) {
  const sellerLicenseNumber = cleanAnimalMedicineSellerText(raw);
  return { sellerLicenseNumber, sellerLicenseNumberNormalized: sellerLicenseNumber?.replace(/\s+/g, ''), sellerLicenseNumberSequence: sellerLicenseNumber?.match(/(\d+)$/)?.[1] ? Number(sellerLicenseNumber.match(/(\d+)$/)![1]) : undefined, warning: sellerLicenseNumber ? undefined : 'Missing seller license number' };
}
export function parseAnimalMedicineSellerBusinessRegistrationNumber(raw: unknown) {
  const businessRegistrationNumber = cleanAnimalMedicineSellerText(raw), businessRegistrationNumberNormalized = businessRegistrationNumber?.replace(/\D/g, '');
  return { businessRegistrationNumber, businessRegistrationNumberNormalized, validFormat: Boolean(businessRegistrationNumberNormalized && /^\d{8}$/.test(businessRegistrationNumberNormalized)), warning: businessRegistrationNumber && !/^\d{8}$/.test(businessRegistrationNumberNormalized ?? '') ? 'Invalid business registration number format' : undefined };
}
export function parseAnimalMedicineSellerCompanyName(raw: unknown) {
  const companyName = cleanAnimalMedicineSellerText(raw);
  return { companyName, companyNameNormalized: normalize(companyName), warning: companyName ? undefined : 'Missing company name' };
}
export function parseAnimalMedicineSellerAddress(raw: unknown) {
  const companyAddress = cleanAnimalMedicineSellerText(raw);
  const parseAddress = companyAddress?.replaceAll('台北巿', '臺北市').replaceAll('臺北巿', '臺北市').replaceAll('台北市', '臺北市').replaceAll('台', '臺');
  const companyAddressNormalized = normalize(parseAddress);
  const districtNameFromAddress = DISTRICTS.find((district) => parseAddress?.includes(district));
  const body = districtNameFromAddress && parseAddress ? parseAddress.slice(parseAddress.indexOf(districtNameFromAddress) + districtNameFromAddress.length) : parseAddress;
  const roadName = body?.match(/([一-龥]+?(?:路|街|大道)(?:[一二三四五六七八九十\d]+段)?)/)?.[1];
  const addressUsesOldTaipeiText = Boolean(companyAddress && (/台北市|台北巿|臺北巿/.test(companyAddress) || /[一二三四五六七八九十]+段/.test(companyAddress)));
  const addressOutsideTaipeiHint = Boolean(parseAddress && /(臺北縣|新北市|基隆市|桃園市|新竹|宜蘭|臺中|臺南|高雄)/.test(parseAddress));
  return { companyAddress, companyAddressNormalized, districtNameFromAddress, isTaipeiDistrict: Boolean(districtNameFromAddress), addressUsesOldTaipeiText, addressOutsideTaipeiHint, roadName, addressLooksLikeMultiFloorOrUnit: Boolean(companyAddress && /樓|之|室|地下|B1|F/i.test(companyAddress)), warning: companyAddress && !districtNameFromAddress ? 'District not found' : undefined };
}
export function parseAnimalMedicineSellerPhone(raw: unknown) {
  const companyPhone = cleanAnimalMedicineSellerText(raw)?.replace(/[()（）]/g, '').replace(/\s+/g, '');
  return { companyPhone, companyPhoneNormalized: companyPhone?.replace(/[^\d#分機-]/g, ''), warning: companyPhone && !/[0-9]/.test(companyPhone) ? 'Invalid phone format' : undefined };
}
export const createAnimalMedicineSellerMapQuery = (record: { companyName?: string; companyAddress?: string }) => cleanAnimalMedicineSellerText([record.companyAddress, record.companyName].filter(Boolean).join(' '));
export function animalMedicineSellerLocationPrecision(record: { companyAddress?: string; districtNameFromAddress?: string; addressOutsideTaipeiHint: boolean; addressUsesOldTaipeiText: boolean }): AnimalMedicineSellerLocationPrecision {
  if (record.addressOutsideTaipeiHint) return 'outside_taipei_or_old_address_hint';
  if (record.districtNameFromAddress && record.companyAddress) return 'district_address';
  if (record.companyAddress) return record.addressUsesOldTaipeiText ? 'outside_taipei_or_old_address_hint' : 'address_only_unparsed_district';
  if (record.districtNameFromAddress) return 'district_only';
  return 'missing';
}
const group = <T extends string>(records: LicensedAnimalMedicineSellerRecord[], key: (record: LicensedAnimalMedicineSellerRecord) => T | undefined) => records.reduce((map, record) => { const value = key(record); if (value) map.set(value, [...(map.get(value) ?? []), record]); return map; }, new Map<T, LicensedAnimalMedicineSellerRecord[]>());
const dupCount = (values: Array<string | undefined>) => values.filter(Boolean).length - new Set(values.filter(Boolean)).size;
const rows = <T extends string>(records: LicensedAnimalMedicineSellerRecord[], field: (record: LicensedAnimalMedicineSellerRecord) => T | undefined) => [...group(records, field)].map(([key, items]) => ({ key, items })).sort((a, b) => b.items.length - a.items.length || a.key.localeCompare(b.key, 'zh-Hant'));

export function buildLicensedAnimalMedicineSellerSummary(records: LicensedAnimalMedicineSellerRecord[]): LicensedAnimalMedicineSellerSummary {
  const addressGroups = rows(records, (r) => r.companyAddressNormalized);
  return {
    totalRecords: records.length,
    districtCount: group(records, (r) => r.districtNameFromAddress).size,
    uniqueSellerLicenseNumberCount: new Set(records.map((r) => r.sellerLicenseNumberNormalized).filter(Boolean)).size,
    uniqueBusinessRegistrationNumberCount: new Set(records.map((r) => r.businessRegistrationNumberNormalized).filter(Boolean)).size,
    uniqueCompanyNameCount: new Set(records.map((r) => r.companyNameNormalized).filter(Boolean)).size,
    uniqueAddressCount: new Set(records.map((r) => r.companyAddressNormalized).filter(Boolean)).size,
    uniquePhoneCount: new Set(records.map((r) => r.companyPhoneNormalized).filter(Boolean)).size,
    uniqueRoadNameCount: group(records, (r) => r.roadName).size,
    recordsWithBusinessRegistrationNumber: records.filter((r) => r.businessRegistrationNumber).length,
    recordsWithValidBusinessRegistrationNumberFormat: records.filter((r) => r.businessRegistrationNumberValidFormat).length,
    recordsWithCompanyPhone: records.filter((r) => r.hasCompanyPhone).length,
    recordsWithParsedDistrict: records.filter((r) => r.districtNameFromAddress).length,
    recordsWithUnparsedDistrict: records.filter((r) => r.companyAddress && !r.districtNameFromAddress).length,
    recordsWithOldTaipeiAddressText: records.filter((r) => r.addressUsesOldTaipeiText).length,
    recordsWithOutsideTaipeiAddressHint: records.filter((r) => r.addressOutsideTaipeiHint).length,
    recordsWithMultiFloorOrUnitAddress: records.filter((r) => r.addressLooksLikeMultiFloorOrUnit).length,
    recordsWithGeocodedCoordinates: records.filter((r) => r.coordinateSource === 'geocoded').length,
    byDistrict: rows(records, (r) => r.districtNameFromAddress).map(({ key, items }) => ({ districtName: key, count: items.length, uniqueCompanyNameCount: new Set(items.map((r) => r.companyNameNormalized).filter(Boolean)).size, uniqueAddressCount: new Set(items.map((r) => r.companyAddressNormalized).filter(Boolean)).size, recordsWithBusinessRegistrationNumber: items.filter((r) => r.businessRegistrationNumber).length, recordsWithCompanyPhone: items.filter((r) => r.hasCompanyPhone).length })),
    byRoadName: rows(records, (r) => r.roadName).map(({ key, items }) => ({ roadName: key, count: items.length, districtCount: new Set(items.map((r) => r.districtNameFromAddress).filter(Boolean)).size, uniqueCompanyNameCount: new Set(items.map((r) => r.companyNameNormalized).filter(Boolean)).size })),
    topSharedAddresses: addressGroups.filter((g) => g.items.length > 1).slice(0, 30).map(({ items }) => ({ companyAddress: items[0].companyAddress, count: items.length, districtName: items[0].districtNameFromAddress })),
    dataQuality: { missingSellerLicenseNumberCount: records.filter((r) => !r.sellerLicenseNumber).length, duplicateSellerLicenseNumberCount: dupCount(records.map((r) => r.sellerLicenseNumberNormalized)), missingBusinessRegistrationNumberCount: records.filter((r) => !r.businessRegistrationNumber).length, duplicateBusinessRegistrationNumberCount: dupCount(records.map((r) => r.businessRegistrationNumberNormalized)), invalidBusinessRegistrationNumberCount: records.filter((r) => r.businessRegistrationNumber && !r.businessRegistrationNumberValidFormat).length, missingCompanyNameCount: records.filter((r) => !r.companyName).length, duplicateCompanyNameCount: dupCount(records.map((r) => r.companyNameNormalized)), missingCompanyAddressCount: records.filter((r) => !r.companyAddress).length, duplicateCompanyAddressCount: dupCount(records.map((r) => r.companyAddressNormalized)), unparsedDistrictFromAddressCount: records.filter((r) => r.companyAddress && !r.districtNameFromAddress).length, oldTaipeiAddressTextCount: records.filter((r) => r.addressUsesOldTaipeiText).length, outsideTaipeiAddressHintCount: records.filter((r) => r.addressOutsideTaipeiHint).length, missingCompanyPhoneCount: records.filter((r) => !r.companyPhone).length, invalidCompanyPhoneCount: records.filter((r) => r.companyPhone ? !/[0-9]/.test(r.companyPhone) : false).length, duplicateFallbackKeyCount: dupCount(records.map((r) => [r.companyNameNormalized, r.companyAddressNormalized, r.companyPhoneNormalized].filter(Boolean).join('|'))) },
  };
}

export function filterLicensedAnimalMedicineSellers(records: LicensedAnimalMedicineSellerRecord[], filters: LicensedAnimalMedicineSellerFilters) {
  const q = filters.search.trim().toLocaleLowerCase();
  const yesNo = (filter: string, value: boolean) => !filter || (filter === 'yes' ? value : !value);
  return records.filter((r) => (!q || [r.sellerLicenseNumber, r.businessRegistrationNumber, r.companyName, r.companyAddress, r.companyPhone, r.districtNameFromAddress, r.roadName].filter(Boolean).join(' ').toLocaleLowerCase().includes(q))
    && (!filters.districtNameFromAddress || r.districtNameFromAddress === filters.districtNameFromAddress)
    && (!filters.roadName || r.roadName === filters.roadName)
    && yesNo(filters.hasBusinessRegistrationNumber, Boolean(r.businessRegistrationNumber))
    && yesNo(filters.businessRegistrationNumberValidFormat, r.businessRegistrationNumberValidFormat)
    && yesNo(filters.hasCompanyPhone, r.hasCompanyPhone)
    && yesNo(filters.addressUsesOldTaipeiText, r.addressUsesOldTaipeiText)
    && yesNo(filters.addressOutsideTaipeiHint, r.addressOutsideTaipeiHint)
    && yesNo(filters.addressLooksLikeMultiFloorOrUnit, r.addressLooksLikeMultiFloorOrUnit)
    && (!filters.locationPrecision || r.locationPrecision === filters.locationPrecision)
    && (!filters.geocodingStatus || (r.geocodingStatus as AnimalMedicineSellerGeocodingStatus) === filters.geocodingStatus));
}
