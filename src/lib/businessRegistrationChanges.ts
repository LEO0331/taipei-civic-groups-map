import { DISTRICTS } from './civicGroups';
import { convertTwd97ToWgs84 } from './nangangSoftwareParkCompanies';
import type { BusinessRegistrationChangeEventType, BusinessRegistrationChangeFilters, BusinessRegistrationChangeRecord, BusinessRegistrationChangeSummary, CoordinateStatus, CoordinateSystem } from '../types';

const bounds = { minLng: 121.43, maxLng: 121.70, minLat: 24.90, maxLat: 25.25 };

export const BUSINESS_CHANGE_EVENT_LABELS_ZH: Record<BusinessRegistrationChangeEventType, string> = { establishment: '設立', modification: '變更', closure: '歇業', unknown: '未知' };
export const BUSINESS_CHANGE_EVENT_LABELS_EN: Record<BusinessRegistrationChangeEventType, string> = { establishment: 'Establishment', modification: 'Modification', closure: 'Closure', unknown: 'Unknown' };

export function cleanText(raw: unknown) {
  const text = String(raw ?? '').replace(/\u3000/g, ' ').trim();
  return text && !['-', '--', 'NaN', 'nan', 'NULL', 'null'].includes(text) ? text : undefined;
}
export const parseUnifiedBusinessNumber = (raw: unknown) => cleanText(raw);
export const normalizeBusinessName = (raw: unknown) => cleanText(raw)?.toLocaleLowerCase();

export function classifyBusinessRegistrationChangeEventType(resourceName: string): BusinessRegistrationChangeEventType {
  if (resourceName.includes('設立')) return 'establishment';
  if (resourceName.includes('變更')) return 'modification';
  if (resourceName.includes('歇業')) return 'closure';
  return 'unknown';
}

export function parseBusinessRegistrationAddress(raw: unknown) {
  const businessAddress = cleanText(raw);
  if (!businessAddress) return {};
  const businessAddressNormalized = businessAddress.replaceAll('台北市', '臺北市');
  const district = DISTRICTS.find((item) => businessAddressNormalized.includes(item));
  const afterDistrict = district ? businessAddressNormalized.slice(businessAddressNormalized.indexOf(district) + district.length) : businessAddressNormalized;
  const roadName = afterDistrict.match(/([^0-9\s,，]+?(?:大道|路|街))(?:([0-9一二三四五六七八九十]+段))?/)?.slice(1, 3).filter(Boolean).join('');
  return { businessAddress, businessAddressNormalized, district, roadName, warning: district ? undefined : 'District not parsed' };
}

function isoDate(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return undefined;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function parseBusinessRegistrationDate(raw: unknown) {
  const text = cleanText(raw);
  if (!text) return {};
  const normalized = text.replace(/[年月]/g, '/').replace('日', '');
  const parts = normalized.includes('/') || normalized.includes('-') ? normalized.split(/[/-]/) : [normalized.slice(0, -4), normalized.slice(-4, -2), normalized.slice(-2)];
  const [yearText, monthText, dayText] = parts;
  const rawYear = Number(yearText), month = Number(monthText), day = Number(dayText);
  if (!Number.isInteger(rawYear) || !Number.isInteger(month) || !Number.isInteger(day)) return { raw: text, warning: 'Invalid date' };
  const year = yearText.length === 3 ? rawYear + 1911 : rawYear;
  const date = isoDate(year, month, day);
  return date ? { raw: text, date, year, month, monthKey: `${year}-${String(month).padStart(2, '0')}`, quarter: `${year}-Q${Math.ceil(month / 3)}`, warning: undefined } : { raw: text, warning: 'Invalid date' };
}

export function deriveBusinessRegistrationEventDate(record: { eventType: BusinessRegistrationChangeEventType; establishmentDate?: string; modificationDate?: string; closureDate?: string }) {
  return record.eventType === 'establishment' ? record.establishmentDate ?? record.modificationDate ?? record.closureDate
    : record.eventType === 'modification' ? record.modificationDate ?? record.establishmentDate ?? record.closureDate
      : record.eventType === 'closure' ? record.closureDate ?? record.modificationDate ?? record.establishmentDate
        : record.establishmentDate ?? record.modificationDate ?? record.closureDate;
}

export function parseBusinessRegistrationCoordinates(rawLng: unknown, rawLat: unknown) {
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

export function haversineDistanceMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const toRad = (value: number) => value * Math.PI / 180;
  const dLat = toRad(b.latitude - a.latitude), dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude), lat2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function countBy<T extends string | number>(values: T[]) {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || String(a.key).localeCompare(String(b.key)));
}

export function buildBusinessRegistrationChangeSummary(records: BusinessRegistrationChangeRecord[]): BusinessRegistrationChangeSummary {
  const dates = records.flatMap((record) => record.eventDate ?? []).sort();
  const months = countBy(records.flatMap((record) => record.eventMonthKey ?? []));
  const districts = countBy(records.flatMap((record) => record.district ?? []));
  const byType = (rows: BusinessRegistrationChangeRecord[], type: BusinessRegistrationChangeEventType) => rows.filter((record) => record.eventType === type).length;
  return {
    totalRecords: records.length,
    uniqueBusinessNameCount: new Set(records.map((record) => record.businessNameNormalized ?? record.businessName)).size,
    uniqueBusinessNumberCount: new Set(records.flatMap((record) => record.unifiedBusinessNumberNormalized ?? [])).size,
    uniqueAddressCount: new Set(records.flatMap((record) => record.businessAddressNormalized ?? [])).size,
    districtCount: districts.length,
    recordsWithUnifiedBusinessNumber: records.filter((record) => record.hasUnifiedBusinessNumber).length,
    recordsWithValidCoordinates: records.filter((record) => record.coordinateStatus === 'valid').length,
    recordsWithParsedDistrict: records.filter((record) => record.district).length,
    recordsWithParsedRoadName: records.filter((record) => record.roadName).length,
    recordsWithEventDate: records.filter((record) => record.eventDate).length,
    minEventDate: dates[0],
    maxEventDate: dates.at(-1),
    latestEventMonth: months.map((item) => String(item.key)).sort().at(-1),
    byEventType: countBy(records.map((record) => record.eventType)).map(({ key: eventType, count }) => ({ eventType, count })),
    byMonth: months.map(({ key: monthKey }) => {
      const rows = records.filter((record) => record.eventMonthKey === monthKey);
      return { monthKey, establishmentCount: byType(rows, 'establishment'), modificationCount: byType(rows, 'modification'), closureCount: byType(rows, 'closure'), totalCount: rows.length };
    }).sort((a, b) => a.monthKey.localeCompare(b.monthKey)),
    byDistrict: districts.map(({ key: district }) => {
      const rows = records.filter((record) => record.district === district);
      return { district, totalCount: rows.length, establishmentCount: byType(rows, 'establishment'), modificationCount: byType(rows, 'modification'), closureCount: byType(rows, 'closure'), validCoordinateCount: rows.filter((record) => record.coordinateStatus === 'valid').length };
    }),
    byRoadName: countBy(records.flatMap((record) => record.roadName ?? [])).map(({ key: roadName, count }) => ({ roadName, count })),
    coordinateQuality: {
      valid: records.filter((record) => record.coordinateStatus === 'valid').length,
      missing: records.filter((record) => record.coordinateStatus === 'missing').length,
      outlier: records.filter((record) => record.coordinateStatus === 'outlier').length,
      unparsed: records.filter((record) => record.coordinateStatus === 'unparsed').length,
    },
  };
}

export function filterBusinessRegistrationChanges(records: BusinessRegistrationChangeRecord[], filters: BusinessRegistrationChangeFilters, language: 'zh' | 'en') {
  const query = filters.search.trim().toLocaleLowerCase();
  const labels = language === 'zh' ? BUSINESS_CHANGE_EVENT_LABELS_ZH : BUSINESS_CHANGE_EVENT_LABELS_EN;
  return records.filter((record) => {
    const text = [record.unifiedBusinessNumber, record.businessName, record.businessAddress, record.district, record.roadName, record.eventDateRaw, record.eventDate, record.resourceName, labels[record.eventType]].filter(Boolean).join(' ').toLocaleLowerCase();
    return (!query || text.includes(query))
      && (!filters.eventType || record.eventType === filters.eventType)
      && (!filters.eventYear || record.eventYear === Number(filters.eventYear))
      && (!filters.eventMonth || record.eventMonthKey === filters.eventMonth)
      && (!filters.eventFrom || (record.eventDate !== undefined && record.eventDate >= filters.eventFrom))
      && (!filters.eventTo || (record.eventDate !== undefined && record.eventDate <= filters.eventTo))
      && (!filters.district || record.district === filters.district)
      && (!filters.roadName || record.roadName === filters.roadName)
      && (!filters.resourceName || record.resourceName === filters.resourceName)
      && (!filters.coordinateStatus || record.coordinateStatus === filters.coordinateStatus)
      && (!filters.hasUnifiedBusinessNumber || (filters.hasUnifiedBusinessNumber === 'yes' ? record.hasUnifiedBusinessNumber : !record.hasUnifiedBusinessNumber))
      && (!filters.hasValidCoordinates || (filters.hasValidCoordinates === 'yes' ? record.coordinateStatus === 'valid' : record.coordinateStatus !== 'valid'));
  });
}
