import { DISTRICTS } from './civicGroups';
import type { CemeteryBurialStatusCategory, CemeteryCoordinateQuality, CemeteryLocationPrecision, CemeteryOpeningHoursCategory, CemeteryPublicFacilityFilters, CemeteryPublicFacilityRecord, CemeteryPublicFacilitySummary, CemeteryTypeCategory } from '../types';

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
export function classifyCemeteryType(raw: string | undefined): CemeteryTypeCategory {
  const text = raw?.trim() ?? '';
  if (!text) return 'unknown';
  if (text === '列管公墓') return 'managed_cemetery';
  if (text === '公墓') return 'cemetery';
  return 'other';
}
export function classifyCemeteryBurialStatus(raw: string | undefined): CemeteryBurialStatusCategory {
  const text = raw?.trim() ?? '';
  if (!text) return 'unknown';
  if (text.includes('全面禁葬')) return 'fully_burial_prohibited';
  if (text.includes('七年輪葬')) return 'rotational_burial_application_accepted';
  if (text.includes('預留壽穴')) return 'reserved_life_grave_application_accepted';
  return 'other';
}
export function classifyCemeteryOpeningHours(raw: string | undefined): CemeteryOpeningHoursCategory {
  const text = raw?.trim() ?? '';
  if (!text) return 'unknown';
  if (text === '全日') return 'all_day';
  if (/\d{1,2}:\d{2}\s*[~-]\s*\d{1,2}:\d{2}/.test(text)) return 'time_range';
  return 'other';
}
export const parseCemeteryType = (raw: unknown) => {
  const cemeteryTypeRaw = cleanText(raw), cemeteryTypeCategory = classifyCemeteryType(cemeteryTypeRaw);
  return { cemeteryTypeRaw, cemeteryTypeCategory, warning: cemeteryTypeCategory === 'unknown' || cemeteryTypeCategory === 'other' ? 'Unknown cemetery type' : undefined };
};
export const parseTaipeiDistrictName = (raw: unknown) => {
  const districtName = cleanText(raw)?.replaceAll('台', '臺'), districtNameNormalized = normalize(districtName), isTaipeiDistrict = Boolean(districtName && DISTRICTS.includes(districtName));
  return { districtName, districtNameNormalized, isTaipeiDistrict, warning: districtName && !isTaipeiDistrict ? 'Unknown Taipei district' : undefined };
};
export const parseCemeteryName = (raw: unknown) => {
  const cemeteryName = cleanText(raw);
  return { cemeteryName, cemeteryNameNormalized: normalize(cemeteryName), warning: cemeteryName ? undefined : 'Missing cemetery name' };
};
export const parseCemeteryLocationDescription = (raw: unknown) => {
  const cemeteryLocationDescription = cleanText(raw);
  const cemeteryLocationDescriptionNormalized = cemeteryLocationDescription?.replaceAll('台北市', '臺北市').replaceAll('台', '臺');
  const roadName = cemeteryLocationDescriptionNormalized?.match(/([^，,\s\d]+(?:路|街|大道|巷|產業道路))/)?.[1];
  const locationDescriptionLooksApproximate = Boolean(cemeteryLocationDescriptionNormalized && /旁|附近|前方|後方|約|進入|巷底|交叉口|產業道路|停車場內|對面/.test(cemeteryLocationDescriptionNormalized));
  return { cemeteryLocationDescription, cemeteryLocationDescriptionNormalized, roadName, locationDescriptionLooksApproximate, warning: cemeteryLocationDescription ? undefined : 'Missing location description' };
};
export const parseCemeteryBurialStatus = (raw: unknown) => {
  const burialStatusRaw = cleanText(raw), burialStatusCategory = classifyCemeteryBurialStatus(burialStatusRaw);
  return { burialStatusRaw, burialStatusCategory, isBurialProhibited: burialStatusCategory === 'fully_burial_prohibited', isApplicationMentioned: Boolean(burialStatusRaw?.includes('申請')), warning: burialStatusCategory === 'unknown' || burialStatusCategory === 'other' ? 'Unknown burial status' : undefined };
};
export const parseCemeteryOpeningHours = (raw: unknown) => {
  const openingHoursRaw = cleanText(raw), openingHoursCategory = classifyCemeteryOpeningHours(openingHoursRaw);
  return { openingHoursRaw, openingHoursCategory, isAllDayOpen: openingHoursCategory === 'all_day', warning: openingHoursCategory === 'unknown' || openingHoursCategory === 'other' ? 'Unknown opening hours' : undefined };
};
export function parseCemeteryCoordinate(raw: unknown, type: 'longitude' | 'latitude') {
  const text = cleanText(raw);
  if (!text) return { valid: false, coordinateQuality: 'missing' as CemeteryCoordinateQuality, warning: 'Missing coordinate' };
  const value = Number(text);
  if (!Number.isFinite(value)) return { valid: false, coordinateQuality: 'invalid' as CemeteryCoordinateQuality, warning: 'Invalid coordinate' };
  const valid = type === 'longitude' ? value >= 121.30 && value <= 121.80 : value >= 24.85 && value <= 25.30;
  return { value, valid, coordinateQuality: valid ? 'valid_wgs84_taipei' as const : 'outside_taipei_bounds' as const, warning: valid ? undefined : 'Outside Taipei bounds' };
}
export const parseCemeteryNote = (raw: unknown) => {
  const note = cleanText(raw), noteNormalized = normalize(note);
  return { note, noteNormalized, hasNote: Boolean(note && note !== '無') };
};
export const createCemeteryMapQuery = (record: { cemeteryName?: string; districtName?: string; cemeteryLocationDescription?: string }) => cleanText(['臺北市', record.districtName, record.cemeteryName, record.cemeteryLocationDescription].filter(Boolean).join(' '));
export const coordinatePairKey = (longitude?: number, latitude?: number) => longitude === undefined || latitude === undefined ? undefined : `${longitude.toFixed(6)}|${latitude.toFixed(6)}`;
export function getLocationPrecision(record: { coordinateValid: boolean; districtName?: string; cemeteryLocationDescription?: string }): CemeteryLocationPrecision {
  if (record.coordinateValid) return 'official_coordinate';
  if (record.districtName && record.cemeteryLocationDescription) return 'district_location_description';
  if (record.districtName) return 'district_only';
  return 'missing';
}

function countBy<T extends string>(values: T[]) {
  return [...values.reduce((m, v) => m.set(v, (m.get(v) ?? 0) + 1), new Map<T, number>())].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key, 'zh-Hant'));
}
const dupCount = (values: Array<string | undefined>) => countBy(values.filter(Boolean) as string[]).filter((item) => item.count > 1).length;

export function buildCemeteryPublicFacilitySummary(records: CemeteryPublicFacilityRecord[]): CemeteryPublicFacilitySummary {
  return {
    totalRecords: records.length,
    districtCount: new Set(records.map((r) => r.districtName).filter(Boolean)).size,
    uniqueCemeteryNameCount: new Set(records.flatMap((r) => r.cemeteryNameNormalized ?? [])).size,
    uniqueLocationDescriptionCount: new Set(records.flatMap((r) => r.cemeteryLocationDescriptionNormalized ?? [])).size,
    uniqueCoordinatePairCount: new Set(records.flatMap((r) => r.coordinatePairKey ?? [])).size,
    managedCemeteryCount: records.filter((r) => r.cemeteryTypeCategory === 'managed_cemetery').length,
    cemeteryCount: records.filter((r) => r.cemeteryTypeCategory === 'cemetery').length,
    burialProhibitedCount: records.filter((r) => r.isBurialProhibited).length,
    applicationMentionedCount: records.filter((r) => r.isApplicationMentioned).length,
    allDayOpenCount: records.filter((r) => r.isAllDayOpen).length,
    timeRangeOpenCount: records.filter((r) => r.openingHoursCategory === 'time_range').length,
    recordsWithValidCoordinates: records.filter((r) => r.coordinateValid).length,
    recordsWithInvalidCoordinates: records.filter((r) => !r.coordinateValid).length,
    recordsWithApproximateLocationDescription: records.filter((r) => r.locationDescriptionLooksApproximate).length,
    recordsWithNotes: records.filter((r) => r.hasNote).length,
    byDistrict: countBy(records.map((r) => r.districtName).filter(Boolean)).map(({ key: districtName, count }) => {
      const rows = records.filter((r) => r.districtName === districtName);
      return { districtName, count, managedCemeteryCount: rows.filter((r) => r.cemeteryTypeCategory === 'managed_cemetery').length, cemeteryCount: rows.filter((r) => r.cemeteryTypeCategory === 'cemetery').length, burialProhibitedCount: rows.filter((r) => r.isBurialProhibited).length, applicationMentionedCount: rows.filter((r) => r.isApplicationMentioned).length, validCoordinateCount: rows.filter((r) => r.coordinateValid).length };
    }),
    byCemeteryType: countBy(records.map((r) => r.cemeteryTypeRaw).filter(Boolean)).map(({ key: cemeteryTypeRaw, count }) => ({ cemeteryTypeRaw, cemeteryTypeCategory: classifyCemeteryType(cemeteryTypeRaw), count, districtCount: new Set(records.filter((r) => r.cemeteryTypeRaw === cemeteryTypeRaw).map((r) => r.districtName)).size })),
    byBurialStatus: countBy(records.map((r) => r.burialStatusRaw).filter(Boolean)).map(({ key: burialStatusRaw, count }) => ({ burialStatusRaw, burialStatusCategory: classifyCemeteryBurialStatus(burialStatusRaw), count, districtCount: new Set(records.filter((r) => r.burialStatusRaw === burialStatusRaw).map((r) => r.districtName)).size })),
    byOpeningHours: countBy(records.map((r) => r.openingHoursRaw).filter(Boolean)).map(({ key: openingHoursRaw, count }) => ({ openingHoursRaw, openingHoursCategory: classifyCemeteryOpeningHours(openingHoursRaw), count, districtCount: new Set(records.filter((r) => r.openingHoursRaw === openingHoursRaw).map((r) => r.districtName)).size })),
    byRoadName: countBy(records.flatMap((r) => r.roadName ?? [])).map(({ key: roadName, count }) => ({ roadName, count, districtCount: new Set(records.filter((r) => r.roadName === roadName).map((r) => r.districtName)).size })),
    coordinateQuality: { validWgs84Taipei: records.filter((r) => r.coordinateQuality === 'valid_wgs84_taipei').length, outsideTaipeiBounds: records.filter((r) => r.coordinateQuality === 'outside_taipei_bounds').length, invalid: records.filter((r) => r.coordinateQuality === 'invalid').length, missing: records.filter((r) => r.coordinateQuality === 'missing').length, duplicateCoordinatePairCount: dupCount(records.map((r) => r.coordinatePairKey)) },
    dataQuality: {
      missingSequenceNumberCount: records.filter((r) => !r.sourceSequenceNumberNormalized).length,
      duplicateSequenceNumberCount: dupCount(records.map((r) => r.sourceSequenceNumberNormalized)),
      missingCemeteryTypeCount: records.filter((r) => !r.cemeteryTypeRaw).length,
      unknownCemeteryTypeCount: records.filter((r) => r.cemeteryTypeCategory === 'unknown' || r.cemeteryTypeCategory === 'other').length,
      missingDistrictCount: records.filter((r) => !r.districtName).length,
      unknownDistrictCount: records.filter((r) => !r.isTaipeiDistrict).length,
      missingCemeteryNameCount: records.filter((r) => !r.cemeteryName).length,
      duplicateCemeteryNameCount: dupCount(records.map((r) => r.cemeteryNameNormalized)),
      missingLocationDescriptionCount: records.filter((r) => !r.cemeteryLocationDescription).length,
      duplicateLocationDescriptionCount: dupCount(records.map((r) => r.cemeteryLocationDescriptionNormalized)),
      missingBurialStatusCount: records.filter((r) => !r.burialStatusRaw).length,
      unknownBurialStatusCount: records.filter((r) => r.burialStatusCategory === 'unknown' || r.burialStatusCategory === 'other').length,
      missingOpeningHoursCount: records.filter((r) => !r.openingHoursRaw).length,
      unknownOpeningHoursCount: records.filter((r) => r.openingHoursCategory === 'unknown' || r.openingHoursCategory === 'other').length,
      missingLatitudeCount: records.filter((r) => r.latitude === undefined).length,
      missingLongitudeCount: records.filter((r) => r.longitude === undefined).length,
      invalidCoordinateCount: records.filter((r) => !r.coordinateValid).length,
      duplicateCoordinatePairCount: dupCount(records.map((r) => r.coordinatePairKey)),
      duplicateFallbackKeyCount: dupCount(records.map((r) => [r.cemeteryTypeRaw, r.districtName, r.cemeteryName, r.cemeteryLocationDescription].map(normalize).filter(Boolean).join('|'))),
    },
  };
}

export function filterCemeteryPublicFacilities(records: CemeteryPublicFacilityRecord[], filters: CemeteryPublicFacilityFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((r) => (!query || [r.sourceSequenceNumberNormalized, r.cemeteryTypeRaw, r.districtName, r.cemeteryName, r.cemeteryLocationDescription, r.burialStatusRaw, r.openingHoursRaw, r.note, r.roadName].filter(Boolean).join(' ').toLocaleLowerCase().includes(query))
    && (!filters.cemeteryTypeRaw || r.cemeteryTypeRaw === filters.cemeteryTypeRaw)
    && (!filters.districtName || r.districtName === filters.districtName)
    && (!filters.burialStatusRaw || r.burialStatusRaw === filters.burialStatusRaw)
    && (!filters.burialStatusCategory || r.burialStatusCategory === filters.burialStatusCategory)
    && (!filters.isBurialProhibited || (filters.isBurialProhibited === 'yes' ? r.isBurialProhibited : !r.isBurialProhibited))
    && (!filters.isApplicationMentioned || (filters.isApplicationMentioned === 'yes' ? r.isApplicationMentioned : !r.isApplicationMentioned))
    && (!filters.openingHoursRaw || r.openingHoursRaw === filters.openingHoursRaw)
    && (!filters.openingHoursCategory || r.openingHoursCategory === filters.openingHoursCategory)
    && (!filters.isAllDayOpen || (filters.isAllDayOpen === 'yes' ? r.isAllDayOpen : !r.isAllDayOpen))
    && (!filters.coordinateQuality || r.coordinateQuality === filters.coordinateQuality)
    && (!filters.locationPrecision || r.locationPrecision === filters.locationPrecision)
    && (!filters.locationDescriptionLooksApproximate || (filters.locationDescriptionLooksApproximate === 'yes' ? r.locationDescriptionLooksApproximate : !r.locationDescriptionLooksApproximate))
    && (!filters.roadName || r.roadName === filters.roadName)
    && (!filters.hasNote || (filters.hasNote === 'yes' ? r.hasNote : !r.hasNote)));
}
