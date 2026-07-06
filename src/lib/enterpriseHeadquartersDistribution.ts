import { DISTRICTS } from './civicGroups';
import { convertTwd97ToWgs84 } from './nangangSoftwareParkCompanies';
import type { EnterpriseHeadquartersCoordinateConversionStatus, EnterpriseHeadquartersCoordinateQuality, EnterpriseHeadquartersFilters, EnterpriseHeadquartersIndustryCategoryGroup, EnterpriseHeadquartersLocationPrecision, EnterpriseHeadquartersRecord, EnterpriseHeadquartersSummary } from '../types';

const missing = new Set(['', '-', '--', 'nan', 'null', '尚無資料']);
const taipei = { minLng: 121.30, maxLng: 121.80, minLat: 24.85, maxLat: 25.30 };
export const cleanEnterpriseHeadquartersText = (raw: unknown) => {
  const text = String(raw ?? '').replace(/\u3000/g, ' ').trim().replace(/\s+/g, ' ');
  return missing.has(text.toLowerCase()) ? undefined : text;
};
const normalize = (raw: unknown) => cleanEnterpriseHeadquartersText(raw)?.replaceAll('台', '臺').replace(/\s+/g, '').toLocaleLowerCase();

export const parseEnterpriseHeadquartersCompanyName = (raw: unknown) => {
  const companyName = cleanEnterpriseHeadquartersText(raw);
  return { companyName, companyNameNormalized: normalize(companyName), warning: companyName ? undefined : 'Missing company name' };
};

const parseRocDate = (text: string) => {
  const match = text.match(/^(\d{3})(\d{2})(\d{2})$/);
  if (!match) return undefined;
  const year = Number(match[1]) + 1911, month = Number(match[2]), day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return undefined;
  return { roc: `${Number(match[1])}-${match[2]}-${match[3]}`, gregorian: `${year}-${match[2]}-${match[3]}` };
};

export function parseEnterpriseHeadquartersUseDate(raw: unknown) {
  const useDateRaw = cleanEnterpriseHeadquartersText(raw), recognitionPeriodRaw = useDateRaw;
  if (!useDateRaw) return { recognitionPeriodParsed: false, warning: 'Missing recognition period' };
  const match = useDateRaw.match(/^(\d{7})-(\d{7})$/);
  if (!match) return { useDateRaw, recognitionPeriodRaw, recognitionPeriodParsed: false, warning: 'Invalid recognition period' };
  const start = parseRocDate(match[1]), end = parseRocDate(match[2]);
  if (!start || !end) return { useDateRaw, recognitionPeriodRaw, recognitionPeriodParsed: false, warning: 'Invalid ROC date' };
  const today = new Date().toISOString().slice(0, 10);
  const recognitionStatusRelativeToBuildDate = start.gregorian > today ? 'future_on_build_date' : end.gregorian >= today ? 'active_on_build_date' : 'expired_on_build_date';
  return { useDateRaw, recognitionPeriodRaw, recognitionStartRocDate: start.roc, recognitionEndRocDate: end.roc, recognitionStartGregorianDate: start.gregorian, recognitionEndGregorianDate: end.gregorian, recognitionPeriodParsed: true, recognitionStatusRelativeToBuildDate };
}

export function parseEnterpriseHeadquartersAddress(raw: unknown) {
  const companyAddress = cleanEnterpriseHeadquartersText(raw)?.replaceAll('台北市', '臺北市').replaceAll('台', '臺');
  const companyAddressNormalized = normalize(companyAddress);
  const districtNameFromAddress = DISTRICTS.find((district) => companyAddress?.includes(district));
  const body = districtNameFromAddress && companyAddress ? companyAddress.slice(companyAddress.indexOf(districtNameFromAddress) + districtNameFromAddress.length) : companyAddress;
  const roadBody = body?.replace(/^[一-龥]{1,6}里/, '');
  const roadName = roadBody?.match(/([一-龥]+?(?:路|街|大道)(?:[一二三四五六七八九十\d]+段)?)/)?.[1];
  const addressLooksLikeMultiFloorOrUnit = Boolean(companyAddress && /樓|之|室|地下|B1|F/i.test(companyAddress));
  return { companyAddress, companyAddressNormalized, districtNameFromAddress, isTaipeiDistrict: Boolean(districtNameFromAddress), roadName, addressLooksLikeMultiFloorOrUnit, warning: companyAddress && !districtNameFromAddress ? 'District not found' : undefined };
}

export function normalizeEnterpriseHeadquartersIndustryCategory(raw: string | undefined): { normalized?: string; group: EnterpriseHeadquartersIndustryCategoryGroup } {
  const text = raw?.trim() ?? '';
  if (!text) return { group: 'unknown' };
  if (text.includes('電子資訊')) return { normalized: '電子資訊類', group: 'electronic_information' };
  if (text.includes('民生化工')) return { normalized: '民生化工類', group: 'consumer_life_chemical' };
  if (text.includes('金屬機電')) return { normalized: '金屬機電類', group: 'metal_machinery_electrical' };
  if (text.includes('技術服務')) return { normalized: '技術服務業', group: 'technical_services' };
  if (text.includes('其他')) return { normalized: '其他類', group: 'other' };
  return { normalized: text, group: 'other' };
}

export function parseEnterpriseHeadquartersIndustryCategory(raw: unknown) {
  const industryCategoryRaw = cleanEnterpriseHeadquartersText(raw);
  const { normalized: industryCategoryNormalized, group: industryCategoryGroup } = normalizeEnterpriseHeadquartersIndustryCategory(industryCategoryRaw);
  return { industryCategoryRaw, industryCategoryNormalized, industryCategoryGroup, warning: industryCategoryRaw ? undefined : 'Missing industry category' };
}

export function parseEnterpriseHeadquartersSourceCoordinate(raw: unknown) {
  const text = cleanEnterpriseHeadquartersText(raw), value = text === undefined ? undefined : Number(text.replaceAll(',', ''));
  return { raw: text, value: Number.isFinite(value) ? value : undefined, warning: text && !Number.isFinite(value) ? 'Invalid source coordinate' : undefined };
}

export function convertEnterpriseHeadquartersTwd97Tm2ToWgs84(x: number, y: number): { longitude?: number; latitude?: number; status: EnterpriseHeadquartersCoordinateConversionStatus; warning?: string } {
  try {
    const point = convertTwd97ToWgs84(x, y);
    if (!Number.isFinite(point.longitude) || !Number.isFinite(point.latitude)) return { status: 'conversion_failed', warning: 'Converted coordinate is not finite' };
    if (point.longitude < taipei.minLng || point.longitude > taipei.maxLng || point.latitude < taipei.minLat || point.latitude > taipei.maxLat) return { longitude: point.longitude, latitude: point.latitude, status: 'outside_taipei_bounds_after_conversion', warning: 'Converted coordinate is outside Taipei-nearby bounds' };
    return { longitude: point.longitude, latitude: point.latitude, status: 'converted_from_twd97_tm2' };
  } catch (error) {
    return { status: 'conversion_failed', warning: String(error) };
  }
}

export const enterpriseCoordinatePairKey = (longitude?: number, latitude?: number) => longitude === undefined || latitude === undefined ? undefined : `${longitude.toFixed(6)}|${latitude.toFixed(6)}`;
export const enterpriseCoordinateQuality = (status: EnterpriseHeadquartersCoordinateConversionStatus): EnterpriseHeadquartersCoordinateQuality => status === 'converted_from_twd97_tm2' ? 'valid_converted_wgs84_taipei' : status === 'already_wgs84' ? 'valid_wgs84_taipei' : status === 'outside_taipei_bounds_after_conversion' ? 'outside_taipei_bounds' : status === 'missing' ? 'missing' : 'invalid';
export function enterpriseLocationPrecision(record: { coordinateConversionStatus: EnterpriseHeadquartersCoordinateConversionStatus; districtNameFromAddress?: string; companyAddress?: string }): EnterpriseHeadquartersLocationPrecision {
  if (record.coordinateConversionStatus === 'converted_from_twd97_tm2') return 'converted_source_coordinate';
  if (record.coordinateConversionStatus === 'already_wgs84') return 'official_wgs84_coordinate';
  if (record.districtNameFromAddress && record.companyAddress) return 'district_address';
  if (record.districtNameFromAddress) return 'district_only';
  return 'missing';
}
export const createEnterpriseHeadquartersMapQuery = (record: { companyName?: string; companyAddress?: string }) => cleanEnterpriseHeadquartersText([record.companyAddress, record.companyName].filter(Boolean).join(' '));

const labels: Record<EnterpriseHeadquartersIndustryCategoryGroup, string> = { electronic_information: '電子資訊', consumer_life_chemical: '民生化工', metal_machinery_electrical: '金屬機電', technical_services: '技術服務', other: '其他', unknown: '未知' };
const group = <T extends string | number>(records: EnterpriseHeadquartersRecord[], key: (record: EnterpriseHeadquartersRecord) => T | undefined) => records.reduce((map, record) => { const value = key(record); if (value !== undefined) map.set(value, [...(map.get(value) ?? []), record]); return map; }, new Map<T, EnterpriseHeadquartersRecord[]>());
const rows = <T extends string | number>(records: EnterpriseHeadquartersRecord[], key: (record: EnterpriseHeadquartersRecord) => T | undefined) => [...group(records, key)].map(([key, items]) => ({ key, items })).sort((a, b) => b.items.length - a.items.length || String(a.key).localeCompare(String(b.key), 'zh-Hant'));
const dupCount = (values: Array<string | undefined>) => values.filter(Boolean).length - new Set(values.filter(Boolean)).size;

export function buildEnterpriseHeadquartersSummary(records: EnterpriseHeadquartersRecord[]): EnterpriseHeadquartersSummary {
  const addressGroups = rows(records, (r) => r.companyAddressNormalized), coordinateGroups = rows(records, (r) => r.coordinatePairKey);
  return {
    totalRecords: records.length,
    districtCount: group(records, (r) => r.districtNameFromAddress).size,
    uniqueCompanyNameCount: new Set(records.map((r) => r.companyNameNormalized).filter(Boolean)).size,
    uniqueCompanyAddressCount: new Set(records.map((r) => r.companyAddressNormalized).filter(Boolean)).size,
    uniqueIndustryCategoryRawCount: group(records, (r) => r.industryCategoryRaw).size,
    uniqueIndustryCategoryGroupCount: group(records, (r) => r.industryCategoryGroup === 'unknown' ? undefined : r.industryCategoryGroup).size,
    uniqueCoordinatePairCount: group(records, (r) => r.coordinatePairKey).size,
    recordsWithParsedRecognitionPeriod: records.filter((r) => r.recognitionPeriodParsed).length,
    recordsActiveOnBuildDate: records.filter((r) => r.recognitionStatusRelativeToBuildDate === 'active_on_build_date').length,
    recordsExpiredOnBuildDate: records.filter((r) => r.recognitionStatusRelativeToBuildDate === 'expired_on_build_date').length,
    recordsWithValidConvertedCoordinates: records.filter((r) => r.coordinateValid).length,
    recordsWithInvalidCoordinates: records.filter((r) => !r.coordinateValid).length,
    recordsWithMultiFloorOrUnitAddress: records.filter((r) => r.addressLooksLikeMultiFloorOrUnit).length,
    byDistrict: rows(records, (r) => r.districtNameFromAddress).map(({ key, items }) => ({ districtName: key, count: items.length, uniqueCompanyNameCount: new Set(items.map((r) => r.companyNameNormalized).filter(Boolean)).size, uniqueAddressCount: new Set(items.map((r) => r.companyAddressNormalized).filter(Boolean)).size, validCoordinateCount: items.filter((r) => r.coordinateValid).length, topIndustryCategoryGroup: rows(items, (r) => r.industryCategoryGroup)[0]?.key })),
    byIndustryCategoryGroup: rows(records, (r) => r.industryCategoryGroup).map(({ key, items }) => ({ industryCategoryGroup: key, industryCategoryLabelZh: labels[key], count: items.length, districtCount: new Set(items.map((r) => r.districtNameFromAddress).filter(Boolean)).size, uniqueAddressCount: new Set(items.map((r) => r.companyAddressNormalized).filter(Boolean)).size })),
    byIndustryCategoryRaw: rows(records, (r) => r.industryCategoryRaw).map(({ key, items }) => ({ industryCategoryRaw: key, count: items.length })),
    byRoadName: rows(records, (r) => r.roadName).map(({ key, items }) => ({ roadName: key, count: items.length, districtCount: new Set(items.map((r) => r.districtNameFromAddress).filter(Boolean)).size, industryCategoryGroupCount: new Set(items.map((r) => r.industryCategoryGroup).filter(Boolean)).size })),
    byRecognitionStartYear: rows(records, (r) => r.recognitionStartGregorianDate ? Number(r.recognitionStartGregorianDate.slice(0, 4)) : undefined).map(({ key, items }) => ({ year: key, count: items.length })),
    byRecognitionEndYear: rows(records, (r) => r.recognitionEndGregorianDate ? Number(r.recognitionEndGregorianDate.slice(0, 4)) : undefined).map(({ key, items }) => ({ year: key, count: items.length })),
    byRecognitionStatus: rows(records, (r) => r.recognitionStatusRelativeToBuildDate).map(({ key, items }) => ({ recognitionStatusRelativeToBuildDate: key, count: items.length })),
    byCoordinateConversionStatus: rows(records, (r) => r.coordinateConversionStatus).map(({ key, items }) => ({ coordinateConversionStatus: key, count: items.length })),
    byCoordinateQuality: rows(records, (r) => r.coordinateQuality).map(({ key, items }) => ({ coordinateQuality: key, count: items.length })),
    byCoordinatePair: coordinateGroups.map(({ key, items }) => ({ key, count: items.length, sampleAddress: items[0].companyAddress, sampleCompanyNames: items.slice(0, 6).map((r) => r.companyName), longitude: items[0].longitude, latitude: items[0].latitude })),
    topSharedAddresses: addressGroups.filter((g) => g.items.length > 1).slice(0, 30).map(({ items }) => ({ companyAddress: items[0].companyAddress, count: items.length, districtName: items[0].districtNameFromAddress })),
    coordinateQuality: { validConvertedWgs84Taipei: records.filter((r) => r.coordinateQuality === 'valid_converted_wgs84_taipei').length, validWgs84Taipei: records.filter((r) => r.coordinateQuality === 'valid_wgs84_taipei').length, outsideTaipeiBounds: records.filter((r) => r.coordinateQuality === 'outside_taipei_bounds').length, invalid: records.filter((r) => r.coordinateQuality === 'invalid').length, missing: records.filter((r) => r.coordinateQuality === 'missing').length, duplicateCoordinatePairCount: dupCount(records.map((r) => r.coordinatePairKey)) },
    dataQuality: {
      missingCompanyNameCount: records.filter((r) => !r.companyName).length,
      duplicateCompanyNameCount: dupCount(records.map((r) => r.companyNameNormalized)),
      missingUseDateCount: records.filter((r) => !r.useDateRaw).length,
      invalidUseDateCount: records.filter((r) => r.useDateRaw && !r.recognitionPeriodParsed).length,
      missingCompanyAddressCount: records.filter((r) => !r.companyAddress).length,
      duplicateCompanyAddressCount: dupCount(records.map((r) => r.companyAddressNormalized)),
      unparsedDistrictFromAddressCount: records.filter((r) => r.companyAddress && !r.districtNameFromAddress).length,
      missingIndustryCategoryCount: records.filter((r) => !r.industryCategoryRaw).length,
      unknownIndustryCategoryGroupCount: records.filter((r) => r.industryCategoryGroup === 'unknown').length,
      missingSourceCoordinateXCount: records.filter((r) => !r.sourceCoordinateX).length,
      missingSourceCoordinateYCount: records.filter((r) => !r.sourceCoordinateY).length,
      invalidSourceCoordinateCount: records.filter((r) => (r.sourceCoordinateX && r.sourceCoordinateXNumber === undefined) || (r.sourceCoordinateY && r.sourceCoordinateYNumber === undefined)).length,
      coordinateConversionFailedCount: records.filter((r) => r.coordinateConversionStatus === 'conversion_failed').length,
      outsideTaipeiBoundsAfterConversionCount: records.filter((r) => r.coordinateConversionStatus === 'outside_taipei_bounds_after_conversion').length,
      duplicateCoordinatePairCount: dupCount(records.map((r) => r.coordinatePairKey)),
      duplicateFallbackKeyCount: dupCount(records.map((r) => [r.companyNameNormalized, r.companyAddressNormalized, r.industryCategoryRaw, r.useDateRaw].filter(Boolean).join('|'))),
    },
  };
}

export function filterEnterpriseHeadquarters(records: EnterpriseHeadquartersRecord[], filters: EnterpriseHeadquartersFilters) {
  const q = filters.search.trim().toLocaleLowerCase();
  return records.filter((r) => (!q || [r.companyName, r.recognitionPeriodRaw, r.companyAddress, r.districtNameFromAddress, r.roadName, r.industryCategoryRaw, r.industryCategoryNormalized].filter(Boolean).join(' ').toLocaleLowerCase().includes(q))
    && (!filters.districtNameFromAddress || r.districtNameFromAddress === filters.districtNameFromAddress)
    && (!filters.roadName || r.roadName === filters.roadName)
    && (!filters.industryCategoryRaw || r.industryCategoryRaw === filters.industryCategoryRaw)
    && (!filters.industryCategoryNormalized || r.industryCategoryNormalized === filters.industryCategoryNormalized)
    && (!filters.industryCategoryGroup || r.industryCategoryGroup === filters.industryCategoryGroup)
    && (!filters.recognitionStartYear || r.recognitionStartGregorianDate?.startsWith(filters.recognitionStartYear))
    && (!filters.recognitionEndYear || r.recognitionEndGregorianDate?.startsWith(filters.recognitionEndYear))
    && (!filters.recognitionStatusRelativeToBuildDate || r.recognitionStatusRelativeToBuildDate === filters.recognitionStatusRelativeToBuildDate)
    && (!filters.addressLooksLikeMultiFloorOrUnit || (filters.addressLooksLikeMultiFloorOrUnit === 'yes' ? r.addressLooksLikeMultiFloorOrUnit : !r.addressLooksLikeMultiFloorOrUnit))
    && (!filters.coordinateConversionStatus || r.coordinateConversionStatus === filters.coordinateConversionStatus)
    && (!filters.coordinateQuality || r.coordinateQuality === filters.coordinateQuality)
    && (!filters.locationPrecision || r.locationPrecision === filters.locationPrecision)
    && (!filters.hasValidConvertedCoordinates || (filters.hasValidConvertedCoordinates === 'yes' ? r.coordinateValid : !r.coordinateValid)));
}
