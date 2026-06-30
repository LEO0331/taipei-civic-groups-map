import { DISTRICTS } from './civicGroups';
import { convertTwd97ToWgs84 } from './nangangSoftwareParkCompanies';
import type {
  BusinessPremisesPublicLiabilityInsuranceFilters,
  BusinessPremisesPublicLiabilityInsuranceRecord,
  BusinessPremisesPublicLiabilityInsuranceSummary,
  CoordinateStatus,
  CoordinateSystem,
  PublicLiabilityBusinessCategory,
  PublicLiabilityPolicyExpiryStatus,
} from '../types';

const bounds = { minLng: 121.43, maxLng: 121.70, minLat: 24.90, maxLat: 25.25 };

export const PUBLIC_LIABILITY_CATEGORY_LABELS_ZH: Record<PublicLiabilityBusinessCategory, string> = {
  lodging: '住宿',
  restaurant_food: '餐飲食品',
  entertainment: '娛樂',
  retail: '零售',
  education_training: '教育訓練',
  sports_recreation: '運動休閒',
  other: '其他',
  unknown: '未知',
};
export const PUBLIC_LIABILITY_CATEGORY_LABELS_EN: Record<PublicLiabilityBusinessCategory, string> = {
  lodging: 'Lodging',
  restaurant_food: 'Restaurant / food',
  entertainment: 'Entertainment',
  retail: 'Retail',
  education_training: 'Education / training',
  sports_recreation: 'Sports / recreation',
  other: 'Other',
  unknown: 'Unknown',
};
export const PUBLIC_LIABILITY_EXPIRY_STATUS_LABELS_ZH: Record<PublicLiabilityPolicyExpiryStatus, string> = {
  active_by_source_date: '依來源到期日尚未到期',
  expiring_soon_30_days: '30日內到期',
  expiring_soon_90_days: '90日內到期',
  expired_by_source_date: '依來源到期日已逾期',
  missing: '缺少到期日',
  invalid: '日期無法解析',
  unknown: '未知',
};
export const PUBLIC_LIABILITY_EXPIRY_STATUS_LABELS_EN: Record<PublicLiabilityPolicyExpiryStatus, string> = {
  active_by_source_date: 'Not expired by source date',
  expiring_soon_30_days: 'Expiring within 30 days',
  expiring_soon_90_days: 'Expiring within 90 days',
  expired_by_source_date: 'Expired by source date',
  missing: 'Missing expiry date',
  invalid: 'Invalid date',
  unknown: 'Unknown',
};

export function cleanText(raw: unknown) {
  const text = String(raw ?? '').replace(/\u3000/g, ' ').trim();
  return text && !['-', '--', 'NaN', 'nan', 'NULL', 'null'].includes(text) ? text : undefined;
}
export function parseIntegerText(raw: unknown) {
  const text = cleanText(raw)?.replaceAll(',', '');
  return text && /^\d+$/.test(text) ? Number(text) : undefined;
}
export const parseRegistrationNumber = (raw: unknown) => cleanText(raw);
export const normalizeBusinessName = (raw: unknown) => cleanText(raw)?.toLocaleLowerCase();

export function classifyPublicLiabilityBusinessCategory(raw: unknown): PublicLiabilityBusinessCategory {
  const text = cleanText(raw) ?? '';
  if (!text) return 'unknown';
  if (text.includes('旅館') || text.includes('住宿') || text.includes('飯店')) return 'lodging';
  if (text.includes('餐') || text.includes('飲') || text.includes('食品') || text.includes('小吃') || text.includes('咖啡')) return 'restaurant_food';
  if (text.includes('娛樂') || text.includes('視聽') || text.includes('舞廳') || text.includes('遊藝')) return 'entertainment';
  if (text.includes('零售') || text.includes('百貨') || text.includes('商場') || text.includes('賣場')) return 'retail';
  if (text.includes('補習') || text.includes('訓練') || text.includes('教育')) return 'education_training';
  if (text.includes('健身') || text.includes('運動') || text.includes('休閒')) return 'sports_recreation';
  return 'other';
}

export function parseBusinessPremisesAddress(raw: unknown) {
  const businessAddress = cleanText(raw);
  if (!businessAddress) return {};
  const businessAddressNormalized = businessAddress.replaceAll('台北市', '臺北市');
  const district = DISTRICTS.find((item) => businessAddressNormalized.includes(item));
  const afterDistrict = district ? businessAddressNormalized.slice(businessAddressNormalized.indexOf(district) + district.length) : businessAddressNormalized;
  const roadName = afterDistrict.match(/([^0-9\s,，]+?[路街大道])(?:([0-9一二三四五六七八九十]+段))?/)?.slice(1, 3).filter(Boolean).join('');
  return { businessAddress, businessAddressNormalized, district, roadName, warning: district ? undefined : 'District not parsed' };
}

function isoDate(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return undefined;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function parsePolicyExpiryDate(raw: unknown) {
  const policyExpiryDateRaw = cleanText(raw);
  if (!policyExpiryDateRaw) return {};
  const parts = policyExpiryDateRaw.includes('/') || policyExpiryDateRaw.includes('-') ? policyExpiryDateRaw.split(/[/-]/) : [policyExpiryDateRaw.slice(0, -4), policyExpiryDateRaw.slice(-4, -2), policyExpiryDateRaw.slice(-2)];
  const [yearText, monthText, dayText] = parts;
  const rawYear = Number(yearText), month = Number(monthText), day = Number(dayText);
  if (!Number.isInteger(rawYear) || !Number.isInteger(month) || !Number.isInteger(day)) return { policyExpiryDateRaw, warning: 'Invalid policy expiry date' };
  const year = yearText.length === 3 ? rawYear + 1911 : rawYear;
  const policyExpiryDate = isoDate(year, month, day);
  return policyExpiryDate ? { policyExpiryDateRaw, policyExpiryDate, policyExpiryYear: year, policyExpiryMonth: month, policyExpiryMonthKey: `${year}-${String(month).padStart(2, '0')}`, warning: undefined } : { policyExpiryDateRaw, warning: 'Invalid policy expiry date' };
}

export function getPolicyExpiryStatus(policyExpiryDate: string | undefined, buildDate: string): PublicLiabilityPolicyExpiryStatus {
  if (!policyExpiryDate) return 'missing';
  const expiry = Date.parse(`${policyExpiryDate}T00:00:00Z`), build = Date.parse(`${buildDate.slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(expiry) || !Number.isFinite(build)) return 'invalid';
  const days = Math.ceil((expiry - build) / 86400000);
  if (days < 0) return 'expired_by_source_date';
  if (days <= 30) return 'expiring_soon_30_days';
  if (days <= 90) return 'expiring_soon_90_days';
  return 'active_by_source_date';
}

export function daysUntil(policyExpiryDate: string | undefined, buildDate: string) {
  const expiry = policyExpiryDate ? Date.parse(`${policyExpiryDate}T00:00:00Z`) : NaN, build = Date.parse(`${buildDate.slice(0, 10)}T00:00:00Z`);
  return Number.isFinite(expiry) && Number.isFinite(build) ? Math.ceil((expiry - build) / 86400000) : undefined;
}

export function parseBusinessPremisesCoordinates(rawLng: unknown, rawLat: unknown) {
  const sourceLongitudeRaw = cleanText(rawLng), sourceLatitudeRaw = cleanText(rawLat);
  if (!sourceLongitudeRaw && !sourceLatitudeRaw) return { sourceLongitudeRaw, sourceLatitudeRaw, coordinateStatus: 'missing' as CoordinateStatus, coordinateSystem: 'unknown' as CoordinateSystem };
  const x = Number(sourceLongitudeRaw), y = Number(sourceLatitudeRaw);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return { sourceLongitudeRaw, sourceLatitudeRaw, coordinateStatus: 'unparsed' as CoordinateStatus, coordinateSystem: 'unknown' as CoordinateSystem, warning: 'Coordinate unparsed' };
  const coordinateSystem: CoordinateSystem = x >= 119 && x <= 123 && y >= 21 && y <= 26 ? 'wgs84' : (x >= 250000 && x <= 320000 && y >= 2750000 && y <= 2785000 ? 'twd97' : 'unknown');
  if (coordinateSystem === 'unknown') return { sourceLongitudeRaw, sourceLatitudeRaw, coordinateStatus: 'unparsed' as CoordinateStatus, coordinateSystem, warning: 'Coordinate system unknown' };
  const point = coordinateSystem === 'wgs84' ? { longitude: x, latitude: y } : convertTwd97ToWgs84(x, y);
  const coordinateStatus: CoordinateStatus = point.longitude >= bounds.minLng && point.longitude <= bounds.maxLng && point.latitude >= bounds.minLat && point.latitude <= bounds.maxLat ? 'valid' : 'outlier';
  return { sourceLongitudeRaw, sourceLatitudeRaw, longitude: point.longitude, latitude: point.latitude, coordinateStatus, coordinateSystem, warning: coordinateStatus === 'outlier' ? 'Coordinate outside Taipei bounds' : undefined };
}

function countBy<T extends string | number>(values: T[]) {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || String(a.key).localeCompare(String(b.key)));
}

export function buildBusinessPremisesPublicLiabilityInsuranceSummary(records: BusinessPremisesPublicLiabilityInsuranceRecord[]): BusinessPremisesPublicLiabilityInsuranceSummary {
  const dates = records.flatMap((record) => record.policyExpiryDate ?? []).sort();
  const districtRows = countBy(records.flatMap((record) => record.district ?? []));
  return {
    totalRecords: records.length,
    uniqueBusinessNameCount: new Set(records.map((record) => record.businessNameNormalized ?? record.businessName)).size,
    uniqueAddressCount: new Set(records.flatMap((record) => record.businessAddressNormalized ?? [])).size,
    uniqueRegistrationNumberCount: new Set(records.flatMap((record) => record.registrationNumberNormalized ?? [])).size,
    districtCount: districtRows.length,
    recordsWithRegistrationNumber: records.filter((record) => record.hasRegistrationNumber).length,
    recordsWithValidCoordinates: records.filter((record) => record.coordinateStatus === 'valid').length,
    recordsWithParsedDistrict: records.filter((record) => record.district).length,
    recordsWithParsedRoadName: records.filter((record) => record.roadName).length,
    recordsWithPolicyExpiryDate: records.filter((record) => record.policyExpiryDate).length,
    minPolicyExpiryDate: dates[0],
    maxPolicyExpiryDate: dates.at(-1),
    byPolicyExpiryStatus: countBy(records.map((record) => record.policyExpiryStatus)).map(({ key: policyExpiryStatus, count }) => ({ policyExpiryStatus, count })),
    byBusinessCategory: countBy(records.map((record) => record.businessCategory)).map(({ key: businessCategory, count }) => ({ businessCategory, businessCategoryRaw: records.find((record) => record.businessCategory === businessCategory)?.businessCategoryRaw, count })),
    byDistrict: districtRows.map(({ key: district }) => {
      const rows = records.filter((record) => record.district === district);
      return {
        district,
        recordCount: rows.length,
        validCoordinateCount: rows.filter((record) => record.coordinateStatus === 'valid').length,
        expiringSoonCount: rows.filter((record) => record.policyExpiryStatus === 'expiring_soon_30_days' || record.policyExpiryStatus === 'expiring_soon_90_days').length,
        expiredBySourceDateCount: rows.filter((record) => record.policyExpiryStatus === 'expired_by_source_date').length,
        categoryBreakdown: countBy(rows.map((record) => record.businessCategory)).map(({ key: businessCategory, count }) => ({ businessCategory, count })),
      };
    }),
    byPolicyExpiryMonth: countBy(records.flatMap((record) => record.policyExpiryMonthKey ?? [])).map(({ key: monthKey, count }) => ({ monthKey, count })),
    byRoadName: countBy(records.flatMap((record) => record.roadName ?? [])).map(({ key: roadName, count }) => ({ roadName, count })),
    coordinateQuality: {
      valid: records.filter((record) => record.coordinateStatus === 'valid').length,
      missing: records.filter((record) => record.coordinateStatus === 'missing').length,
      outlier: records.filter((record) => record.coordinateStatus === 'outlier').length,
      unparsed: records.filter((record) => record.coordinateStatus === 'unparsed').length,
    },
  };
}

export function filterBusinessPremisesPublicLiabilityInsuranceRecords(records: BusinessPremisesPublicLiabilityInsuranceRecord[], filters: BusinessPremisesPublicLiabilityInsuranceFilters, language: 'zh' | 'en') {
  const query = filters.search.trim().toLocaleLowerCase();
  const categoryLabels = language === 'zh' ? PUBLIC_LIABILITY_CATEGORY_LABELS_ZH : PUBLIC_LIABILITY_CATEGORY_LABELS_EN;
  const statusLabels = language === 'zh' ? PUBLIC_LIABILITY_EXPIRY_STATUS_LABELS_ZH : PUBLIC_LIABILITY_EXPIRY_STATUS_LABELS_EN;
  return records.filter((record) => {
    const text = [record.businessName, record.businessCategoryRaw, categoryLabels[record.businessCategory], record.registrationNumber, record.businessAddress, record.district, record.roadName, record.policyExpiryDateRaw, record.policyExpiryDate, statusLabels[record.policyExpiryStatus]].filter(Boolean).join(' ').toLocaleLowerCase();
    return (!query || text.includes(query))
      && (!filters.businessCategory || record.businessCategory === filters.businessCategory)
      && (!filters.district || record.district === filters.district)
      && (!filters.roadName || record.roadName === filters.roadName)
      && (!filters.policyExpiryStatus || record.policyExpiryStatus === filters.policyExpiryStatus)
      && (!filters.policyExpiryYear || record.policyExpiryYear === Number(filters.policyExpiryYear))
      && (!filters.policyExpiryMonth || record.policyExpiryMonthKey === filters.policyExpiryMonth)
      && (!filters.policyExpiryFrom || (record.policyExpiryDate !== undefined && record.policyExpiryDate >= filters.policyExpiryFrom))
      && (!filters.policyExpiryTo || (record.policyExpiryDate !== undefined && record.policyExpiryDate <= filters.policyExpiryTo))
      && (!filters.coordinateStatus || record.coordinateStatus === filters.coordinateStatus)
      && (!filters.hasRegistrationNumber || (filters.hasRegistrationNumber === 'yes' ? record.hasRegistrationNumber : !record.hasRegistrationNumber))
      && (!filters.hasValidCoordinates || (filters.hasValidCoordinates === 'yes' ? record.coordinateStatus === 'valid' : record.coordinateStatus !== 'valid'));
  });
}

export function haversineDistanceMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const toRad = (value: number) => value * Math.PI / 180;
  const dLat = toRad(b.latitude - a.latitude), dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude), lat2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
