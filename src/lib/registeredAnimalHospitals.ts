import { DISTRICTS } from './civicGroups';
import type {
  AnimalHospitalPhoneType, RegisteredAnimalHospital, RegisteredAnimalHospitalFilters, RegisteredAnimalHospitalSummary,
} from '../types';

export function parseAnimalHospitalAddress(raw: unknown) {
  const address = String(raw ?? '').trim() || undefined;
  if (!address) return {};
  const addressNormalized = address.replace(/^台北市/, '臺北市');
  const postalCode = addressNormalized.match(/^\d{3}/)?.[0];
  const withoutPostal = postalCode ? addressNormalized.slice(3).trim() : addressNormalized;
  const district = DISTRICTS.find((item) => withoutPostal.includes(item));
  const afterDistrict = district ? withoutPostal.slice(withoutPostal.indexOf(district) + district.length) : withoutPostal;
  const roadName = afterDistrict.match(/([^0-9\s,，]+?[路街大道])(?:\d+段)?/)?.[1];
  return { address, addressNormalized, postalCode, district, roadName, warning: district ? undefined : 'District not found' };
}

export function parseAnimalHospitalPhone(raw: unknown) {
  const phone = String(raw ?? '').trim() || undefined;
  if (!phone) return { phoneType: 'unknown' as const };
  if (phone.includes('#')) return { phone, phoneDisplay: phone, phoneType: 'extension' as const };
  const digits = phone.replace(/\D/g, '');
  let phoneType: AnimalHospitalPhoneType = 'unknown';
  let phoneDialHref: string | undefined;
  if (/^09\d{8}$/.test(digits) || /^9\d{8}$/.test(digits)) {
    phoneType = 'mobile';
    phoneDialHref = `tel:${digits.startsWith('09') ? digits : `0${digits}`}`;
  } else if (/^\d{8}$/.test(digits)) {
    phoneType = 'landline';
    phoneDialHref = `tel:02${digits}`;
  } else if (/^02\d{8}$/.test(digits)) {
    phoneType = 'landline';
    phoneDialHref = `tel:${digits}`;
  }
  return { phone, phoneDisplay: phone, phoneDialHref, phoneType, warning: phoneType === 'unknown' ? 'Unsupported phone format' : undefined };
}

function countBy<T extends string>(values: T[]) {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count);
}

export function buildRegisteredAnimalHospitalSummary(records: RegisteredAnimalHospital[]): RegisteredAnimalHospitalSummary {
  const addressGroups = new Map<string, RegisteredAnimalHospital[]>();
  records.forEach((record) => {
    if (record.addressNormalized) addressGroups.set(record.addressNormalized, [...(addressGroups.get(record.addressNormalized) ?? []), record]);
  });
  return {
    totalRecords: records.length,
    uniqueAnimalHospitalNameCount: new Set(records.map((record) => record.animalHospitalName)).size,
    uniqueAddressCount: addressGroups.size,
    districtCount: new Set(records.flatMap((record) => record.district ?? [])).size,
    recordsWithPhone: records.filter((record) => record.hasPhone).length,
    recordsWithResponsiblePersonName: records.filter((record) => record.hasResponsiblePersonName).length,
    recordsWithAddress: records.filter((record) => record.address).length,
    byDistrict: countBy(records.flatMap((record) => record.district ?? [])).map(({ key: district, count }) => ({ district, count })),
    byRoadName: countBy(records.flatMap((record) => record.roadName ?? [])).map(({ key: roadName, count }) => ({ roadName, count })),
    byPhoneType: countBy(records.map((record) => record.phoneType)).map(({ key: phoneType, count }) => ({ phoneType, count })),
    duplicateAddressGroups: [...addressGroups].filter(([, rows]) => rows.length > 1).map(([address, rows]) => ({
      address, count: rows.length, sampleAnimalHospitalNames: rows.slice(0, 5).map((row) => row.animalHospitalName),
    })).sort((a, b) => b.count - a.count),
  };
}

export function filterRegisteredAnimalHospitals(records: RegisteredAnimalHospital[], filters: RegisteredAnimalHospitalFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((record) => {
    const text = [record.animalHospitalName, record.address, record.district, record.roadName, record.phone].filter(Boolean).join(' ').toLocaleLowerCase();
    return (!query || text.includes(query))
      && (!filters.district || record.district === filters.district)
      && (!filters.roadName || record.roadName === filters.roadName)
      && (!filters.phoneType || record.phoneType === filters.phoneType)
      && (!filters.hasPhone || (filters.hasPhone === 'yes' ? record.hasPhone : !record.hasPhone))
      && (!filters.hasResponsiblePersonName || (filters.hasResponsiblePersonName === 'yes' ? record.hasResponsiblePersonName : !record.hasResponsiblePersonName));
  });
}
