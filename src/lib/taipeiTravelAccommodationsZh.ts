import { DISTRICTS } from './civicGroups';
import type {
  AccommodationPhoneType, AccommodationRoomCountBucket, TaipeiTravelAccommodationCategory,
  TaipeiTravelAccommodationZhFilters, TaipeiTravelAccommodationZhRecord, TaipeiTravelAccommodationZhSummary,
} from '../types';

export function cleanText(raw: unknown) {
  const text = String(raw ?? '').replace(/\u3000/g, ' ').trim();
  return text && !['-', '--', 'NaN', 'nan', 'NULL', 'null'].includes(text) ? text : undefined;
}

export function classifyTaipeiTravelAccommodationCategory(raw?: string): TaipeiTravelAccommodationCategory {
  const text = raw?.trim() ?? '';
  if (!text) return 'unknown';
  if (text.includes('觀光旅館')) return 'tourist_hotel';
  if (text.includes('青年旅館') || text.includes('青旅')) return 'hostel';
  if (text.includes('民宿')) return 'guesthouse';
  if (text.includes('旅館')) return 'hotel';
  return 'other';
}

export function parseRoomCount(raw: unknown) {
  const text = cleanText(raw)?.replaceAll(',', '');
  if (!text || !/^\d+$/.test(text)) return undefined;
  return Number(text);
}

export function classifyRoomCountBucket(roomCount?: number): AccommodationRoomCountBucket {
  if (roomCount === undefined) return 'missing';
  if (!Number.isFinite(roomCount) || roomCount < 0) return 'unknown';
  if (roomCount <= 20) return 'small_1_20';
  if (roomCount <= 50) return 'medium_21_50';
  if (roomCount <= 100) return 'large_51_100';
  return 'very_large_101_plus';
}

export function parseTaipeiTravelAccommodationAddress(raw: unknown) {
  const address = cleanText(raw);
  if (!address) return {};
  const addressNormalized = address.replaceAll('台北市', '臺北市');
  const district = DISTRICTS.find((item) => addressNormalized.includes(item));
  const afterDistrict = district ? addressNormalized.slice(addressNormalized.indexOf(district) + district.length) : addressNormalized;
  const roadName = afterDistrict.match(/([^0-9\s,，]+?[路街大道])(?:([0-9一二三四五六七八九十]+段))?/)?.slice(1, 3).filter(Boolean).join('');
  return { address, addressNormalized, district, roadName, warning: district ? undefined : 'District not parsed' };
}

export function parseAccommodationPhone(raw: unknown) {
  const phone = cleanText(raw);
  if (!phone) return { phoneType: 'missing' as const };
  if (/[#＃]|轉|分機/.test(phone)) return { phone, phoneDisplay: phone, phoneType: 'extension' as const };
  const digits = phone.replace(/\D/g, '');
  let phoneType: AccommodationPhoneType = 'unknown';
  if (/^09\d{8}$/.test(digits)) phoneType = 'mobile';
  else if (/^02\d{7,8}$/.test(digits) || /^\(02\)/.test(phone)) phoneType = 'taipei_landline';
  else if (/^0[3-8]\d{6,8}$/.test(digits) || /^\(0[3-8]\)/.test(phone)) phoneType = 'other_landline';
  return { phone, phoneDisplay: phone, phoneDialHref: phoneType !== 'unknown' ? `tel:${digits}` : undefined, phoneType, warning: phoneType === 'unknown' ? 'Unsupported phone format' : undefined };
}

export function parseAccommodationFax(raw: unknown) {
  const fax = cleanText(raw);
  return { fax, faxDisplay: fax };
}

export const accommodationMatchKey = (name?: string, address?: string, phone?: string) =>
  [name, address, phone].map((value) => cleanText(value)?.replace(/\s+/g, '').toLocaleLowerCase() ?? '').join('|');

function countBy<T extends string>(values: T[]) {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count);
}
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
function median(values: number[]) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return undefined;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function buildTaipeiTravelAccommodationZhSummary(records: TaipeiTravelAccommodationZhRecord[]): TaipeiTravelAccommodationZhSummary {
  const rooms = records.flatMap((record) => record.roomCount ?? []);
  const categoryRows = countBy(records.map((record) => record.accommodationCategory));
  const districtRows = countBy(records.flatMap((record) => record.district ?? []));
  const matchedCount = records.filter((record) => record.possibleRegisteredHotelMatchKey).length;
  return {
    totalRecords: records.length,
    uniqueAccommodationNameCount: new Set(records.map((record) => record.accommodationName)).size,
    uniqueAddressCount: new Set(records.flatMap((record) => record.addressNormalized ?? [])).size,
    districtCount: districtRows.length,
    recordsWithPhone: records.filter((record) => record.hasPhone).length,
    recordsWithFax: records.filter((record) => record.hasFax).length,
    recordsWithRoomCount: rooms.length,
    totalRoomCount: sum(rooms),
    averageRoomCount: rooms.length ? Math.round(sum(rooms) / rooms.length) : undefined,
    medianRoomCount: median(rooms),
    byAccommodationCategory: categoryRows.map(({ key: accommodationCategory, count }) => ({
      accommodationCategory,
      accommodationCategoryRaw: records.find((record) => record.accommodationCategory === accommodationCategory)?.accommodationCategoryRaw,
      count,
      totalRoomCount: sum(records.filter((record) => record.accommodationCategory === accommodationCategory).flatMap((record) => record.roomCount ?? [])),
    })),
    byDistrict: districtRows.map(({ key: district }) => {
      const rows = records.filter((record) => record.district === district);
      return {
        district,
        accommodationCount: rows.length,
        totalRoomCount: sum(rows.flatMap((record) => record.roomCount ?? [])),
        categoryBreakdown: countBy(rows.map((row) => row.accommodationCategory)).map(({ key: accommodationCategory, count }) => ({ accommodationCategory, count })),
      };
    }).sort((a, b) => b.accommodationCount - a.accommodationCount),
    byRoomCountBucket: countBy(records.map((record) => record.roomCountBucket)).map(({ key: roomCountBucket, count }) => ({ roomCountBucket, count })),
    byRoadName: countBy(records.flatMap((record) => record.roadName ?? [])).map(({ key: roadName, count }) => ({
      roadName, count, totalRoomCount: sum(records.filter((record) => record.roadName === roadName).flatMap((record) => record.roomCount ?? [])),
    })),
    possibleOverlapWithRegisteredHotels: { matchedCount, unmatchedCount: records.length - matchedCount },
  };
}

export function filterTaipeiTravelAccommodationZh(records: TaipeiTravelAccommodationZhRecord[], filters: TaipeiTravelAccommodationZhFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  const inRange = (value: number | undefined) => (!filters.roomCountMin || (value !== undefined && value >= Number(filters.roomCountMin))) && (!filters.roomCountMax || (value !== undefined && value <= Number(filters.roomCountMax)));
  return records.filter((record) => {
    const text = [record.accommodationName, record.accommodationCategoryRaw, record.address, record.district, record.roadName, record.phone].filter(Boolean).join(' ').toLocaleLowerCase();
    return (!query || text.includes(query))
      && (!filters.accommodationCategory || record.accommodationCategory === filters.accommodationCategory)
      && (!filters.district || record.district === filters.district)
      && (!filters.roadName || record.roadName === filters.roadName)
      && (!filters.roomCountBucket || record.roomCountBucket === filters.roomCountBucket)
      && (!filters.hasPhone || (filters.hasPhone === 'yes' ? record.hasPhone : !record.hasPhone))
      && (!filters.hasFax || (filters.hasFax === 'yes' ? record.hasFax : !record.hasFax))
      && inRange(record.roomCount);
  });
}
