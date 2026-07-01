import { DISTRICTS } from './civicGroups';
import { convertTwd97ToWgs84 } from './nangangSoftwareParkCompanies';
import { haversineDistanceMeters } from './businessRegistrationChanges';
import type { BiotechCompanyDirectoryFilters, BiotechCompanyDirectoryRecord, BiotechCompanyDirectorySummary, BiotechIndustryCategoryType, CompanyPhoneType, CoordinateStatus, CoordinateSystem } from '../types';

export { haversineDistanceMeters };
const bounds = { minLng: 121.43, maxLng: 121.70, minLat: 24.90, maxLat: 25.25 };
export const BIOTECH_CATEGORY_LABELS_ZH: Record<BiotechIndustryCategoryType, string> = { applied_biotechnology: '應用生技', medical_device: '醫療器材產業', pharmaceutical: '製藥產業', other: '其他', unknown: '未知' };
export const BIOTECH_CATEGORY_LABELS_EN: Record<BiotechIndustryCategoryType, string> = { applied_biotechnology: 'Applied biotechnology', medical_device: 'Medical device industry', pharmaceutical: 'Pharmaceutical industry', other: 'Other', unknown: 'Unknown' };

export function cleanText(raw: unknown) {
  const text = String(raw ?? '').replace(/\u3000/g, ' ').trim();
  return text && !['-', '--', 'NaN', 'nan', 'NULL', 'null'].includes(text) ? text : undefined;
}
export const normalizeText = (raw: unknown) => cleanText(raw)?.toLocaleLowerCase();
export const parseUnifiedBusinessNumber = (raw: unknown) => cleanText(raw);
export const normalizeResponsiblePerson = (raw: unknown) => cleanText(raw);

export function classifyBiotechIndustryCategory(raw: unknown): BiotechIndustryCategoryType {
  const text = cleanText(raw);
  if (!text) return 'unknown';
  if (text === '應用生技') return 'applied_biotechnology';
  if (text === '醫療器材產業') return 'medical_device';
  if (text === '製藥產業') return 'pharmaceutical';
  return 'other';
}

export function parseBiotechCompanyAddress(raw: unknown) {
  const registeredAddress = cleanText(raw);
  if (!registeredAddress) return {};
  const registeredAddressNormalized = registeredAddress.replaceAll('台北市', '臺北市');
  const district = DISTRICTS.find((item) => registeredAddressNormalized.includes(item));
  const afterDistrict = district ? registeredAddressNormalized.slice(registeredAddressNormalized.indexOf(district) + district.length) : registeredAddressNormalized;
  const roadName = [...afterDistrict.replace(/^[一-龥]+?里(?:\d+鄰)?/, '').matchAll(/[一-龥]+?(?:大道|路|街)(?:[一二三四五六七八九十0-9]+段)?/g)].at(-1)?.[0];
  return { registeredAddress, registeredAddressNormalized, district, roadName, warning: district ? undefined : 'District not parsed from address' };
}

export function parseCompanyPhone(raw: unknown) {
  const companyPhone = cleanText(raw);
  if (!companyPhone) return { companyPhoneType: 'missing' as CompanyPhoneType };
  const normalized = companyPhone.replace(/\s+/g, '');
  const digits = normalized.replace(/[()\-\s]/g, '');
  const companyPhoneType: CompanyPhoneType = /[、/;,]/.test(normalized) ? 'multiple'
    : /#|轉|分機|ext/i.test(normalized) ? 'extension'
      : digits.startsWith('09') ? 'mobile'
        : digits.startsWith('02') ? 'taipei_landline'
          : /^0[3-8]/.test(digits) ? 'other_landline'
            : 'unknown';
  const companyPhoneDialHref = ['taipei_landline', 'other_landline', 'mobile'].includes(companyPhoneType) ? `tel:${digits}` : undefined;
  return { companyPhone, companyPhoneDisplay: companyPhone, companyPhoneDialHref, companyPhoneType };
}

export function parseBiotechCompanyCoordinates(rawX: unknown, rawY: unknown) {
  const sourceXRaw = cleanText(rawX), sourceYRaw = cleanText(rawY);
  if (!sourceXRaw && !sourceYRaw) return { sourceXRaw, sourceYRaw, coordinateSystem: 'unknown' as CoordinateSystem, coordinateStatus: 'missing' as CoordinateStatus };
  const sourceX = Number(sourceXRaw), sourceY = Number(sourceYRaw);
  if (!Number.isFinite(sourceX) || !Number.isFinite(sourceY)) return { sourceXRaw, sourceYRaw, sourceX, sourceY, coordinateSystem: 'unknown' as CoordinateSystem, coordinateStatus: 'unparsed' as CoordinateStatus, warning: 'Coordinate unparsed' };
  const coordinateSystem: CoordinateSystem = sourceX >= 119 && sourceX <= 123 && sourceY >= 21 && sourceY <= 26 ? 'wgs84' : (sourceX >= 250000 && sourceX <= 350000 && sourceY >= 2700000 && sourceY <= 2800000 ? 'twd97' : 'unknown');
  if (coordinateSystem === 'unknown') return { sourceXRaw, sourceYRaw, sourceX, sourceY, coordinateSystem, coordinateStatus: 'unparsed' as CoordinateStatus, warning: 'Coordinate system unknown' };
  const point = coordinateSystem === 'wgs84' ? { longitude: sourceX, latitude: sourceY } : convertTwd97ToWgs84(sourceX, sourceY);
  const coordinateStatus: CoordinateStatus = point.longitude >= bounds.minLng && point.longitude <= bounds.maxLng && point.latitude >= bounds.minLat && point.latitude <= bounds.maxLat ? 'valid' : 'outlier';
  return { sourceXRaw, sourceYRaw, sourceX, sourceY, coordinateSystem, coordinateStatus, longitude: point.longitude, latitude: point.latitude };
}

export function createBiotechCompanyMapQuery(record: { companyName?: string; registeredAddress?: string }) {
  return cleanText([record.registeredAddress, record.companyName].filter(Boolean).join(' '));
}

const group = <T extends string>(records: BiotechCompanyDirectoryRecord[], value: (record: BiotechCompanyDirectoryRecord) => T | undefined) => {
  const map = new Map<T, BiotechCompanyDirectoryRecord[]>();
  records.forEach((record) => { const key = value(record); if (key) map.set(key, [...(map.get(key) ?? []), record]); });
  return [...map].map(([key, rows]) => ({ key, rows })).sort((a, b) => b.rows.length - a.rows.length || a.key.localeCompare(b.key));
};
export function buildBiotechCompanyDirectorySummary(records: BiotechCompanyDirectoryRecord[]): BiotechCompanyDirectorySummary {
  const byCategory = group(records, (record) => record.industryCategoryType), byDistrict = group(records, (record) => record.district);
  const count = (status: CoordinateStatus) => records.filter((record) => record.coordinateStatus === status).length;
  return {
    totalRecords: records.length,
    uniqueCompanyNameCount: new Set(records.map((record) => record.companyNameNormalized ?? record.companyName)).size,
    uniqueUnifiedBusinessNumberCount: new Set(records.flatMap((record) => record.unifiedBusinessNumberNormalized ?? [])).size,
    uniqueAddressCount: new Set(records.flatMap((record) => record.registeredAddressNormalized ?? [])).size,
    uniquePhoneCount: new Set(records.flatMap((record) => record.companyPhone ?? [])).size,
    districtCount: byDistrict.length,
    industryCategoryCount: byCategory.length,
    recordsWithPhone: records.filter((record) => record.hasPhone).length,
    recordsWithValidCoordinates: records.filter((record) => record.hasValidCoordinates).length,
    recordsWithParsedDistrict: records.filter((record) => record.district).length,
    recordsWithParsedRoadName: records.filter((record) => record.roadName).length,
    byIndustryCategory: byCategory.map(({ key, rows }) => ({ industryCategoryType: key, industryCategoryRaw: rows.find((record) => record.industryCategoryRaw)?.industryCategoryRaw, count: rows.length, districtCount: new Set(rows.flatMap((record) => record.district ?? [])).size })),
    byDistrict: byDistrict.map(({ key, rows }) => ({ district: key, companyCount: rows.length, appliedBiotechnologyCount: rows.filter((r) => r.industryCategoryType === 'applied_biotechnology').length, medicalDeviceCount: rows.filter((r) => r.industryCategoryType === 'medical_device').length, pharmaceuticalCount: rows.filter((r) => r.industryCategoryType === 'pharmaceutical').length, otherCount: rows.filter((r) => !['applied_biotechnology', 'medical_device', 'pharmaceutical'].includes(r.industryCategoryType)).length, validCoordinateCount: rows.filter((r) => r.hasValidCoordinates).length })),
    byRoadName: group(records, (record) => record.roadName).map(({ key, rows }) => ({ roadName: key, count: rows.length })),
    coordinateQuality: { valid: count('valid'), missing: count('missing'), outlier: count('outlier'), unparsed: count('unparsed'), wgs84Detected: records.filter((record) => record.coordinateSystem === 'wgs84').length, twd97Detected: records.filter((record) => record.coordinateSystem === 'twd97').length, unknownDetected: records.filter((record) => record.coordinateSystem === 'unknown').length },
    topDistrictsByCompanyCount: byDistrict.map(({ key, rows }) => ({ district: key, companyCount: rows.length })),
  };
}

export function filterBiotechCompanyDirectory(records: BiotechCompanyDirectoryRecord[], filters: BiotechCompanyDirectoryFilters, language: 'zh' | 'en') {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((record) => (!query || [record.companyName, record.unifiedBusinessNumber, record.registeredAddress, record.district, record.roadName, record.companyPhone, record.industryCategoryRaw, language === 'zh' ? BIOTECH_CATEGORY_LABELS_ZH[record.industryCategoryType] : BIOTECH_CATEGORY_LABELS_EN[record.industryCategoryType]].filter(Boolean).join(' ').toLocaleLowerCase().includes(query))
    && (!filters.industryCategory || record.industryCategoryType === filters.industryCategory)
    && (!filters.district || record.district === filters.district)
    && (!filters.roadName || record.roadName === filters.roadName)
    && (!filters.coordinateSystem || record.coordinateSystem === filters.coordinateSystem)
    && (!filters.phoneType || record.companyPhoneType === filters.phoneType)
    && (!filters.hasValidCoordinates || (filters.hasValidCoordinates === 'yes' ? record.hasValidCoordinates : !record.hasValidCoordinates))
    && (!filters.hasPhone || (filters.hasPhone === 'yes' ? record.hasPhone : !record.hasPhone)));
}
