import { DISTRICTS } from './civicGroups';
import type { LicensedSpecialEntertainmentBusinessOperatorFilters, LicensedSpecialEntertainmentBusinessOperatorRecord, LicensedSpecialEntertainmentBusinessOperatorSummary, LicensedSpecialEntertainmentCoordinateQuality, LicensedSpecialEntertainmentLocationPrecision, SpecialEntertainmentBusinessIndustryCategory } from '../types';

const missing = new Set(['', '-', '--', 'nan', 'null', '尚無資料']);
const normalize = (raw: unknown) => cleanSpecialEntertainmentText(raw)?.replaceAll('台', '臺').toLocaleLowerCase();

export const cleanSpecialEntertainmentText = (raw: unknown, preserveLineBreaks = false) => {
  const text = String(raw ?? '').replace(/\u3000/g, ' ').trim();
  const cleaned = preserveLineBreaks ? text.replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n') : text.replace(/\s+/g, ' ');
  return missing.has(cleaned.toLowerCase()) ? undefined : cleaned;
};

export const parseSourceSequenceNumber = (raw: unknown) => {
  const sourceSequenceNumberNormalized = cleanSpecialEntertainmentText(raw);
  const value = sourceSequenceNumberNormalized ? Number(sourceSequenceNumberNormalized) : undefined;
  return { sourceSequenceNumber: Number.isInteger(value) ? value : undefined, sourceSequenceNumberNormalized, warning: sourceSequenceNumberNormalized && !Number.isInteger(value) ? 'Invalid sequence number' : undefined };
};

export const parseCompanyOrBusinessName = (raw: unknown) => {
  const companyOrBusinessName = cleanSpecialEntertainmentText(raw);
  return { companyOrBusinessName, companyOrBusinessNameNormalized: normalize(companyOrBusinessName), warning: companyOrBusinessName ? undefined : 'Missing company or business name' };
};

export const parseBusinessRegistrationNumber = (raw: unknown) => {
  const businessRegistrationNumber = cleanSpecialEntertainmentText(raw);
  const businessRegistrationNumberNormalized = businessRegistrationNumber?.replace(/\s/g, '');
  const businessRegistrationNumberValidFormat = Boolean(businessRegistrationNumberNormalized && /^\d{8}$/.test(businessRegistrationNumberNormalized));
  return { businessRegistrationNumber, businessRegistrationNumberNormalized, businessRegistrationNumberValidFormat, warning: businessRegistrationNumber && !businessRegistrationNumberValidFormat ? 'Invalid business registration number format' : undefined };
};

export const parseResponsiblePersonName = (raw: unknown) => {
  const responsiblePersonName = cleanSpecialEntertainmentText(raw);
  return { responsiblePersonName, responsiblePersonNameNormalized: normalize(responsiblePersonName) };
};

export function classifySpecialEntertainmentIndustryItem(item: string): SpecialEntertainmentBusinessIndustryCategory {
  if (/視聽歌唱/.test(item)) return 'karaoke_or_audio_visual_singing';
  if (/酒吧/.test(item)) return 'bar';
  if (/舞廳/.test(item)) return 'dance_hall';
  if (/舞場/.test(item)) return 'dance_club';
  if (/夜店/.test(item)) return 'nightclub';
  if (/酒店|酒家/.test(item)) return 'hostess_bar_or_jiujia';
  if (/三溫暖/.test(item)) return 'sauna';
  return item ? 'other' : 'unknown';
}

export const parseOperatingIndustry = (raw: unknown) => {
  const operatingIndustryRaw = cleanSpecialEntertainmentText(raw, true);
  const operatingIndustryItems = [...new Set((operatingIndustryRaw ?? '').split(/[\n\r;；、,，]+|\s{2,}/).map((item) => cleanSpecialEntertainmentText(item)).filter(Boolean) as string[])];
  const itemCategories = operatingIndustryItems.map(classifySpecialEntertainmentIndustryItem);
  const operatingIndustryCategories = [...new Set([...itemCategories, ...(new Set(itemCategories).size > 1 ? ['multi_category' as const] : [])])];
  return {
    operatingIndustryRaw,
    operatingIndustryDisplay: operatingIndustryItems.join(' / ') || '',
    operatingIndustryItems,
    operatingIndustryCategories: operatingIndustryCategories.length ? operatingIndustryCategories : ['unknown' as const],
    isMultiIndustryOperator: operatingIndustryItems.length > 1,
    warning: !operatingIndustryRaw ? 'Missing operating industry' : itemCategories.some((category) => category === 'other' || category === 'unknown') ? 'Unknown operating industry category' : undefined,
  };
};

export const parseTaipeiDistrictName = (raw: unknown) => {
  const districtName = cleanSpecialEntertainmentText(raw)?.replaceAll('台', '臺');
  const isTaipeiDistrict = Boolean(districtName && (DISTRICTS as readonly string[]).includes(districtName));
  return { districtName, districtNameNormalized: normalize(districtName), isTaipeiDistrict, warning: districtName && !isTaipeiDistrict ? 'Unknown Taipei district' : undefined };
};

export const parseBusinessPremisesAddress = (raw: unknown) => {
  const businessPremisesAddress = cleanSpecialEntertainmentText(raw);
  const businessPremisesAddressNormalized = businessPremisesAddress?.replaceAll('台北市', '臺北市').replaceAll('台', '臺');
  const roadName = businessPremisesAddressNormalized?.match(/([^，,\s\d]+(?:路|街|大道|巷))/)?.[1];
  const addressLooksLikeComplexUnit = Boolean(businessPremisesAddressNormalized && /樓|之|、|室|地下/.test(businessPremisesAddressNormalized));
  return { businessPremisesAddress, businessPremisesAddressNormalized, roadName, addressLooksLikeComplexUnit, warning: businessPremisesAddress && !roadName ? 'Road name not parsed' : undefined };
};

export const parseCoordinateNumber = (raw: unknown) => {
  const text = cleanSpecialEntertainmentText(raw);
  if (!text) return { value: undefined, quality: 'missing' as const };
  const value = Number(text);
  return Number.isFinite(value) ? { value, quality: 'valid' as const } : { value: undefined, quality: 'invalid' as const };
};

export function getCoordinateQuality(longitude?: number, latitude?: number, longitudeQuality?: string, latitudeQuality?: string): LicensedSpecialEntertainmentCoordinateQuality {
  if (longitudeQuality === 'missing' || latitudeQuality === 'missing') return 'missing';
  if (longitudeQuality === 'invalid' || latitudeQuality === 'invalid' || longitude === undefined || latitude === undefined) return 'invalid';
  return longitude >= 121.30 && longitude <= 121.80 && latitude >= 24.85 && latitude <= 25.30 ? 'valid_wgs84_taipei' : 'outside_taipei_bounds';
}

export const coordinatePairKey = (longitude?: number, latitude?: number) => longitude === undefined || latitude === undefined ? undefined : `${longitude.toFixed(6)},${latitude.toFixed(6)}`;

export function getLocationPrecision(coordinateQuality: LicensedSpecialEntertainmentCoordinateQuality, districtName?: string, address?: string): LicensedSpecialEntertainmentLocationPrecision {
  if (coordinateQuality === 'valid_wgs84_taipei') return 'official_coordinate';
  if (districtName && address) return 'district_address';
  if (districtName) return 'district_only';
  return 'missing';
}

export const createSpecialEntertainmentMapQuery = (record: { districtName?: string; businessPremisesAddress?: string; companyOrBusinessName?: string }) => cleanSpecialEntertainmentText(['臺北市', record.districtName, record.businessPremisesAddress, record.companyOrBusinessName].filter(Boolean).join(' '));

function countBy<T extends string>(values: T[]) {
  return [...values.reduce((m, v) => m.set(v, (m.get(v) ?? 0) + 1), new Map<T, number>())].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key, 'zh-Hant'));
}
const dupCount = (values: Array<string | undefined>) => countBy(values.filter(Boolean) as string[]).filter((item) => item.count > 1).length;

export function buildLicensedSpecialEntertainmentBusinessOperatorSummary(records: LicensedSpecialEntertainmentBusinessOperatorRecord[]): LicensedSpecialEntertainmentBusinessOperatorSummary {
  const duplicateCoordinatePairs = countBy(records.flatMap((r) => r.coordinatePairKey ?? [])).filter((item) => item.count > 1).map(({ key, count }) => ({ coordinatePairKey: key, count, districtNames: [...new Set(records.filter((r) => r.coordinatePairKey === key).map((r) => r.districtName).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-Hant')) }));
  return {
    totalRecords: records.length,
    districtCount: new Set(records.flatMap((r) => r.districtNameNormalized ?? [])).size,
    uniqueCompanyOrBusinessNameCount: new Set(records.flatMap((r) => r.companyOrBusinessNameNormalized ?? [])).size,
    uniqueBusinessRegistrationNumberCount: new Set(records.flatMap((r) => r.businessRegistrationNumberNormalized ?? [])).size,
    uniqueResponsiblePersonNameCount: new Set(records.flatMap((r) => r.responsiblePersonNameNormalized ?? [])).size,
    uniqueAddressCount: new Set(records.flatMap((r) => r.businessPremisesAddressNormalized ?? [])).size,
    uniqueRoadNameCount: new Set(records.flatMap((r) => r.roadName ?? [])).size,
    operatingIndustryItemCount: new Set(records.flatMap((r) => r.operatingIndustryItems)).size,
    operatingIndustryCategoryCount: new Set(records.flatMap((r) => r.operatingIndustryCategories)).size,
    recordsWithValidCoordinates: records.filter((r) => r.coordinateValid).length,
    recordsWithComplexUnitAddress: records.filter((r) => r.addressLooksLikeComplexUnit).length,
    recordsWithValidBusinessRegistrationNumberFormat: records.filter((r) => r.businessRegistrationNumberValidFormat).length,
    multiIndustryOperatorCount: records.filter((r) => r.isMultiIndustryOperator).length,
    duplicateCoordinatePairCount: duplicateCoordinatePairs.length,
    byDistrict: countBy(records.flatMap((r) => r.districtName ?? [])).map(({ key: districtName, count }) => {
      const rows = records.filter((r) => r.districtName === districtName);
      return { districtName, count, uniqueAddressCount: new Set(rows.flatMap((r) => r.businessPremisesAddressNormalized ?? [])).size, uniqueBusinessRegistrationNumberCount: new Set(rows.flatMap((r) => r.businessRegistrationNumberNormalized ?? [])).size };
    }),
    byRoadName: countBy(records.flatMap((r) => r.roadName ?? [])).map(({ key: roadName, count }) => ({ roadName, count, districtCount: new Set(records.filter((r) => r.roadName === roadName).map((r) => r.districtNameNormalized)).size })),
    byOperatingIndustryItem: countBy(records.flatMap((r) => r.operatingIndustryItems)).map(({ key, count }) => ({ operatingIndustryItem: key, count })),
    byOperatingIndustryCategory: countBy(records.flatMap((r) => r.operatingIndustryCategories)).map(({ key, count }) => ({ operatingIndustryCategory: key as SpecialEntertainmentBusinessIndustryCategory, count })),
    byCoordinateQuality: countBy(records.map((r) => r.coordinateQuality)).map(({ key, count }) => ({ coordinateQuality: key as LicensedSpecialEntertainmentCoordinateQuality, count })),
    byLocationPrecision: countBy(records.map((r) => r.locationPrecision)).map(({ key, count }) => ({ locationPrecision: key as LicensedSpecialEntertainmentLocationPrecision, count })),
    byBusinessRegistrationNumberFormatValidity: countBy(records.map((r) => r.businessRegistrationNumberValidFormat ? 'valid' : 'invalid')).map(({ key, count }) => ({ valid: key === 'valid', count })),
    byComplexUnitAddress: [{ addressLooksLikeComplexUnit: true, count: records.filter((r) => r.addressLooksLikeComplexUnit).length }, { addressLooksLikeComplexUnit: false, count: records.filter((r) => !r.addressLooksLikeComplexUnit).length }],
    byMultiIndustryOperator: [{ isMultiIndustryOperator: true, count: records.filter((r) => r.isMultiIndustryOperator).length }, { isMultiIndustryOperator: false, count: records.filter((r) => !r.isMultiIndustryOperator).length }],
    topCompanyOrBusinessNames: countBy(records.map((r) => r.companyOrBusinessNameNormalized ?? r.companyOrBusinessName)).map(({ key, count }) => ({ companyOrBusinessName: records.find((r) => (r.companyOrBusinessNameNormalized ?? r.companyOrBusinessName) === key)?.companyOrBusinessName ?? key, count, districtName: records.find((r) => (r.companyOrBusinessNameNormalized ?? r.companyOrBusinessName) === key)?.districtName })).slice(0, 30),
    duplicateCoordinatePairs,
    dataQuality: {
      missingSequenceNumberCount: records.filter((r) => !r.sourceSequenceNumberNormalized).length,
      duplicateSequenceNumberCount: dupCount(records.map((r) => r.sourceSequenceNumberNormalized)),
      missingCompanyOrBusinessNameCount: records.filter((r) => !r.companyOrBusinessName).length,
      duplicateCompanyOrBusinessNameCount: dupCount(records.map((r) => r.companyOrBusinessNameNormalized)),
      missingBusinessRegistrationNumberCount: records.filter((r) => !r.businessRegistrationNumber).length,
      duplicateBusinessRegistrationNumberCount: dupCount(records.map((r) => r.businessRegistrationNumberNormalized)),
      invalidBusinessRegistrationNumberCount: records.filter((r) => !r.businessRegistrationNumberValidFormat).length,
      missingResponsiblePersonNameCount: records.filter((r) => !r.responsiblePersonName).length,
      missingOperatingIndustryCount: records.filter((r) => !r.operatingIndustryRaw).length,
      unknownOperatingIndustryCategoryCount: records.filter((r) => r.operatingIndustryCategories.includes('other') || r.operatingIndustryCategories.includes('unknown')).length,
      missingDistrictCount: records.filter((r) => !r.districtName).length,
      unknownDistrictCount: records.filter((r) => r.districtName && !r.isTaipeiDistrict).length,
      missingAddressCount: records.filter((r) => !r.businessPremisesAddress).length,
      duplicateAddressCount: dupCount(records.map((r) => r.businessPremisesAddressNormalized)),
      missingCoordinateCount: records.filter((r) => r.coordinateQuality === 'missing').length,
      invalidCoordinateCount: records.filter((r) => r.coordinateQuality === 'invalid').length,
      outsideTaipeiCoordinateCount: records.filter((r) => r.coordinateQuality === 'outside_taipei_bounds').length,
      duplicateFallbackKeyCount: dupCount(records.map((r) => [r.companyOrBusinessNameNormalized, r.districtNameNormalized, r.businessPremisesAddressNormalized].filter(Boolean).join('|'))),
    },
  };
}

export function filterLicensedSpecialEntertainmentBusinessOperators(records: LicensedSpecialEntertainmentBusinessOperatorRecord[], filters: LicensedSpecialEntertainmentBusinessOperatorFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((r) => (!query || [r.sourceSequenceNumberNormalized, r.companyOrBusinessName, r.businessRegistrationNumber, r.responsiblePersonName, r.operatingIndustryDisplay, r.districtName, r.businessPremisesAddress, r.roadName].filter(Boolean).join(' ').toLocaleLowerCase().includes(query))
    && (!filters.districtName || r.districtName === filters.districtName)
    && (!filters.operatingIndustryItem || r.operatingIndustryItems.includes(filters.operatingIndustryItem))
    && (!filters.operatingIndustryCategory || r.operatingIndustryCategories.includes(filters.operatingIndustryCategory as SpecialEntertainmentBusinessIndustryCategory))
    && (!filters.isMultiIndustryOperator || (filters.isMultiIndustryOperator === 'yes' ? r.isMultiIndustryOperator : !r.isMultiIndustryOperator))
    && (!filters.roadName || r.roadName === filters.roadName)
    && (!filters.addressLooksLikeComplexUnit || (filters.addressLooksLikeComplexUnit === 'yes' ? r.addressLooksLikeComplexUnit : !r.addressLooksLikeComplexUnit))
    && (!filters.coordinateQuality || r.coordinateQuality === filters.coordinateQuality)
    && (!filters.locationPrecision || r.locationPrecision === filters.locationPrecision)
    && (!filters.businessRegistrationNumberValidFormat || (filters.businessRegistrationNumberValidFormat === 'yes' ? r.businessRegistrationNumberValidFormat : !r.businessRegistrationNumberValidFormat)));
}
