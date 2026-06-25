import { DISTRICTS } from './civicGroups';
import type { RegisteredCramSchool, RegisteredCramSchoolFilters, RegisteredCramSchoolSummary } from '../types';

export function parseCramSchoolAddress(raw: unknown) {
  const address = String(raw ?? '').trim() || undefined;
  if (!address) return {};
  const postalCode = address.match(/^\d{3}/)?.[0];
  const addressWithoutPostalCode = postalCode ? address.slice(3).trim() : address;
  const district = DISTRICTS.find((item) => addressWithoutPostalCode.includes(item) || address.includes(item));
  return district
    ? { address, postalCode, district, addressWithoutPostalCode }
    : { address, postalCode, addressWithoutPostalCode, warning: 'District not found' };
}

export function parseRegistrationDate(raw: unknown) {
  const registrationDateRaw = String(raw ?? '').trim() || undefined;
  if (!registrationDateRaw) return {};
  const parts = registrationDateRaw.replace(/[年月日./-]/g, ' ').split(/\s+/).filter(Boolean);
  let [yearText, monthText, dayText] = parts;
  if (parts.length === 1 && /^\d{5,8}$/.test(parts[0])) {
    const yearDigits = parts[0].length === 8 ? 4 : parts[0].length - 4;
    yearText = parts[0].slice(0, yearDigits);
    monthText = parts[0].slice(yearDigits, yearDigits + 2);
    dayText = parts[0].slice(yearDigits + 2);
  }
  const rawYear = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const registrationYear = yearText?.length && yearText.length <= 3 ? rawYear + 1911 : rawYear;
  const date = new Date(Date.UTC(registrationYear, month - 1, day));
  if (!rawYear || !month || !day || registrationYear < 1800 || date.getUTCFullYear() !== registrationYear || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return { registrationDateRaw, warning: 'Invalid registration date' };
  }
  return {
    registrationDateRaw,
    registrationDate: `${registrationYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    registrationYear,
    registrationDecade: `${Math.floor(registrationYear / 10) * 10}s`,
  };
}

export function parseNumberField(raw: unknown) {
  const value = String(raw ?? '').replaceAll(',', '').trim();
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

const sum = (values: Array<number | undefined>) => values.reduce<number>((total, value) => total + (value ?? 0), 0);
const average = (values: Array<number | undefined>) => {
  const present = values.filter((value): value is number => value !== undefined);
  return present.length ? sum(present) / present.length : undefined;
};
const round2 = (value: number) => Math.round(value * 100) / 100;
const countBy = <T extends string | number>(values: T[]) => {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts].map(([key, count]) => ({ key, count }));
};
const distribution = (values: number[], buckets: Array<[string, number, number]>) =>
  buckets.map(([bucket, min, max]) => ({ bucket, count: values.filter((value) => value >= min && value < max).length }));

export function buildRegisteredCramSchoolSummary(records: RegisteredCramSchool[]): RegisteredCramSchoolSummary {
  const dates = records.flatMap((record) => record.registrationDate ?? []).sort();
  const districts = new Map<string, RegisteredCramSchool[]>();
  records.forEach((record) => {
    if (record.district) districts.set(record.district, [...(districts.get(record.district) ?? []), record]);
  });
  return {
    totalRecords: records.length,
    uniqueCramSchoolNameCount: new Set(records.map((record) => record.cramSchoolName)).size,
    districtCount: districts.size,
    earliestRegistrationDate: dates[0],
    latestRegistrationDate: dates.at(-1),
    recordsWithPhone: records.filter((record) => record.phone).length,
    recordsWithRegistrationDate: records.filter((record) => record.registrationDate).length,
    recordsWithClassroomCount: records.filter((record) => record.classroomCount !== undefined).length,
    recordsWithClassroomArea: records.filter((record) => record.classroomAreaSqm !== undefined).length,
    recordsWithPremisesArea: records.filter((record) => record.premisesAreaSqm !== undefined).length,
    totalClassroomCount: sum(records.map((record) => record.classroomCount)),
    totalClassroomAreaSqm: round2(sum(records.map((record) => record.classroomAreaSqm))),
    totalPremisesAreaSqm: round2(sum(records.map((record) => record.premisesAreaSqm))),
    averageClassroomCount: average(records.map((record) => record.classroomCount)),
    averageClassroomAreaSqm: average(records.map((record) => record.classroomAreaSqm)),
    averagePremisesAreaSqm: average(records.map((record) => record.premisesAreaSqm)),
    byDistrict: [...districts].map(([district, rows]) => ({
      district,
      recordCount: rows.length,
      totalClassroomCount: sum(rows.map((row) => row.classroomCount)),
      totalClassroomAreaSqm: round2(sum(rows.map((row) => row.classroomAreaSqm))),
      totalPremisesAreaSqm: round2(sum(rows.map((row) => row.premisesAreaSqm))),
    })).sort((a, b) => b.recordCount - a.recordCount),
    byRegistrationYear: countBy(records.flatMap((record) => record.registrationYear ?? []))
      .map(({ key: year, count: recordCount }) => ({ year, recordCount })).sort((a, b) => a.year - b.year),
    byRegistrationDecade: countBy(records.flatMap((record) => record.registrationDecade ?? []))
      .map(({ key: decade, count: recordCount }) => ({ decade, recordCount })).sort((a, b) => a.decade.localeCompare(b.decade)),
    areaDistribution: {
      classroomAreaSqm: distribution(records.flatMap((record) => record.classroomAreaSqm ?? []), [['< 25', 0, 25], ['25-50', 25, 50], ['50-100', 50, 100], ['100+', 100, Infinity]]),
      premisesAreaSqm: distribution(records.flatMap((record) => record.premisesAreaSqm ?? []), [['< 50', 0, 50], ['50-100', 50, 100], ['100-200', 100, 200], ['200+', 200, Infinity]]),
    },
  };
}

export function filterRegisteredCramSchools(records: RegisteredCramSchool[], filters: RegisteredCramSchoolFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  const within = (value: number | undefined, min: string, max: string) =>
    (!min || (value ?? -Infinity) >= Number(min)) && (!max || (value ?? Infinity) <= Number(max));
  return records.filter((record) => {
    const text = [record.cramSchoolName, record.address, record.district, record.phone, record.authorityDocumentCode, record.registrationDocumentNumber].filter(Boolean).join(' ').toLocaleLowerCase();
    return (!query || text.includes(query))
      && (!filters.district || record.district === filters.district)
      && (!filters.registrationYear || record.registrationYear === Number(filters.registrationYear))
      && (!filters.registrationDecade || record.registrationDecade === filters.registrationDecade)
      && (!filters.hasPhone || (filters.hasPhone === 'yes' ? Boolean(record.phone) : !record.phone))
      && (!filters.hasClassroomCount || (filters.hasClassroomCount === 'yes' ? record.classroomCount !== undefined : record.classroomCount === undefined))
      && within(record.classroomCount, filters.classroomCountMin, filters.classroomCountMax)
      && within(record.classroomAreaSqm, filters.classroomAreaMin, filters.classroomAreaMax)
      && within(record.premisesAreaSqm, filters.premisesAreaMin, filters.premisesAreaMax);
  });
}
