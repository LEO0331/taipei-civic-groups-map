import { DISTRICTS } from './civicGroups';
import { parseNumberField } from './registeredCramSchools';
import type { RegisteredHotel, RegisteredHotelFilters, RegisteredHotelSummary } from '../types';

export function parseHotelAddress(raw: unknown) {
  const address = String(raw ?? '').trim() || undefined;
  if (!address) return {};
  const postalCode = address.match(/^\d{3}/)?.[0];
  const addressWithoutPostalCode = postalCode ? address.slice(3).trim() : address;
  const district = DISTRICTS.find((item) => addressWithoutPostalCode.includes(item) || address.includes(item));
  return district ? { address, postalCode, district, addressWithoutPostalCode } : { address, postalCode, addressWithoutPostalCode };
}

export function roomCountBucket(roomCount?: number) {
  if (roomCount === undefined) return undefined;
  if (roomCount < 25) return '< 25';
  if (roomCount < 50) return '25-49';
  if (roomCount < 100) return '50-99';
  return '100+';
}

const sum = (values: Array<number | undefined>) => values.reduce<number>((total, value) => total + (value ?? 0), 0);
const average = (values: Array<number | undefined>) => {
  const present = values.filter((value): value is number => value !== undefined);
  return present.length ? sum(present) / present.length : undefined;
};
const countBuckets = (buckets: string[], values: string[]) =>
  buckets.map((bucket) => ({ bucket, recordCount: values.filter((value) => value === bucket).length }));

export function listedRoomRateBucket(rate?: number) {
  if (rate === undefined) return undefined;
  if (rate < 2000) return '< 2,000';
  if (rate < 5000) return '2,000-4,999';
  if (rate < 10000) return '5,000-9,999';
  return '10,000+';
}

export function buildRegisteredHotelSummary(records: RegisteredHotel[]): RegisteredHotelSummary {
  const districts = new Map<string, RegisteredHotel[]>();
  records.forEach((record) => {
    if (record.district) districts.set(record.district, [...(districts.get(record.district) ?? []), record]);
  });
  const minRates = records.flatMap((record) => record.listedMinRoomRateNtd ?? []);
  const maxRates = records.flatMap((record) => record.listedMaxRoomRateNtd ?? []);
  return {
    totalRecords: records.length,
    uniqueHotelNameCount: new Set(records.map((record) => record.hotelName)).size,
    districtCount: districts.size,
    recordsWithPhone: records.filter((record) => record.hasPhone).length,
    recordsWithListedRoomRate: records.filter((record) => record.hasListedRoomRate).length,
    recordsWithRoomCount: records.filter((record) => record.hasRoomCount).length,
    totalRoomCount: sum(records.map((record) => record.roomCount)),
    averageRoomCount: average(records.map((record) => record.roomCount)),
    lowestListedRoomRateNtd: minRates.length ? Math.min(...minRates) : undefined,
    highestListedRoomRateNtd: maxRates.length ? Math.max(...maxRates) : undefined,
    byDistrict: [...districts].map(([district, rows]) => ({
      district,
      recordCount: rows.length,
      totalRoomCount: sum(rows.map((row) => row.roomCount)),
      averageRoomCount: average(rows.map((row) => row.roomCount)),
    })).sort((a, b) => b.recordCount - a.recordCount),
    roomCountBuckets: countBuckets(['< 25', '25-49', '50-99', '100+'], records.flatMap((record) => record.roomCountBucket ?? [])),
    listedRoomRateBuckets: countBuckets(['< 2,000', '2,000-4,999', '5,000-9,999', '10,000+'], records.flatMap((record) => listedRoomRateBucket(record.listedMinRoomRateNtd) ?? [])),
  };
}

export function filterRegisteredHotels(records: RegisteredHotel[], filters: RegisteredHotelFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  const within = (value: number | undefined, min: string, max: string) =>
    (!min || (value ?? -Infinity) >= Number(min)) && (!max || (value ?? Infinity) <= Number(max));
  return records.filter((record) => {
    const text = [record.registrationId, record.hotelName, record.phone, record.address, record.district].filter(Boolean).join(' ').toLocaleLowerCase();
    return (!query || text.includes(query))
      && (!filters.district || record.district === filters.district)
      && (!filters.hasPhone || (filters.hasPhone === 'yes' ? record.hasPhone : !record.hasPhone))
      && (!filters.hasListedRoomRate || (filters.hasListedRoomRate === 'yes' ? record.hasListedRoomRate : !record.hasListedRoomRate))
      && (!filters.hasRoomCount || (filters.hasRoomCount === 'yes' ? record.hasRoomCount : !record.hasRoomCount))
      && (!filters.roomCountBucket || record.roomCountBucket === filters.roomCountBucket)
      && within(record.roomCount, filters.roomCountMin, filters.roomCountMax)
      && within(record.listedMinRoomRateNtd, filters.listedRoomRateMin, filters.listedRoomRateMax);
  });
}

export { parseNumberField };
