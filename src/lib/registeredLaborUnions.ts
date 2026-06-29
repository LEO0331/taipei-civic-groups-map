import { DISTRICTS } from './civicGroups';
import type {
  LaborUnionAddressLocationCategory, LaborUnionPhoneType, RegisteredLaborUnion, RegisteredLaborUnionFilters,
  RegisteredLaborUnionSummary, RegisteredLaborUnionType,
} from '../types';

export function classifyRegisteredLaborUnionType(raw?: string): RegisteredLaborUnionType {
  const text = raw?.trim() ?? '';
  if (!text) return 'unknown';
  if (text.includes('職業工會')) return 'occupational_union';
  if (text.includes('企業工會')) return 'enterprise_union';
  if (text.includes('產業工會')) return 'industrial_union';
  if (text.includes('工會聯合組織')) return 'union_federation';
  return 'other';
}

export function parsePostalCode(raw: unknown) {
  const value = String(raw ?? '').trim();
  return value && value.toLowerCase() !== 'nan' ? value : undefined;
}

const normalizeCity = (text: string) => text.replaceAll('台北市', '臺北市').replaceAll('台中市', '臺中市').replaceAll('台南市', '臺南市');
const cityPattern = /(臺北市|新北市|桃園市|臺中市|臺南市|高雄市|基隆市|新竹市|嘉義市|新竹縣|苗栗縣|彰化縣|南投縣|雲林縣|嘉義縣|屏東縣|宜蘭縣|花蓮縣|臺東縣|澎湖縣|金門縣|連江縣)/;

export function parseLaborUnionContactAddress(raw: unknown, postalCodeRaw?: unknown) {
  const contactAddress = String(raw ?? '').replace(/\s+/g, ' ').trim() || undefined;
  if (!contactAddress) return { isTaipeiAddress: false, addressLocationCategory: 'missing' as const };
  const addressNormalized = normalizeCity(contactAddress);
  const city = addressNormalized.match(cityPattern)?.[1];
  const district = DISTRICTS.find((item) => addressNormalized.includes(item));
  const postalCode = parsePostalCode(postalCodeRaw);
  const postalBox = /郵政信箱|郵局|信箱/.test(addressNormalized);
  const isTaipeiAddress = (city === '臺北市' || (!city && Boolean(district))) && Boolean(district);
  let addressLocationCategory: LaborUnionAddressLocationCategory = 'postal_box_or_unparsed';
  if (isTaipeiAddress) addressLocationCategory = 'taipei_address';
  else if (city === '新北市') addressLocationCategory = 'new_taipei_address';
  else if (city && city !== '臺北市') addressLocationCategory = 'other_taiwan_address';
  else if (postalBox || postalCode) addressLocationCategory = 'postal_box_or_unparsed';
  const afterDistrict = district ? addressNormalized.slice(addressNormalized.indexOf(district) + district.length) : addressNormalized;
  const roadName = afterDistrict.match(/([^0-9\s,，]+?[路街大道])(?:\d+段)?/)?.[1];
  return { contactAddress, addressNormalized, city, district, roadName, isTaipeiAddress, addressLocationCategory, warning: addressLocationCategory === 'postal_box_or_unparsed' ? 'Address not mapped to Taipei district' : undefined };
}

export function parseLaborUnionPhone(raw: unknown) {
  const phone = String(raw ?? '').trim() || undefined;
  if (!phone) return { phoneType: 'missing' as const };
  if (/[#＃]|轉|分機/.test(phone)) return { phone, phoneDisplay: phone, phoneType: 'extension' as const };
  const digits = phone.replace(/\D/g, '');
  let phoneType: LaborUnionPhoneType = 'unknown';
  if (/^09\d{8}$/.test(digits)) phoneType = 'mobile';
  else if (/^02\d{7,8}$/.test(digits) || /^\(02\)/.test(phone)) phoneType = 'taipei_landline';
  else if (/^0[3-8]\d{6,8}$/.test(digits) || /^\(0[3-8]\)/.test(phone)) phoneType = 'other_landline';
  const phoneDialHref = phoneType !== 'unknown' ? `tel:${digits}` : undefined;
  return { phone, phoneDisplay: phone, phoneDialHref, phoneType, warning: phoneType === 'unknown' ? 'Unsupported phone format' : undefined };
}

function countBy<T extends string>(values: T[]) {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count);
}

export function buildRegisteredLaborUnionSummary(records: RegisteredLaborUnion[]): RegisteredLaborUnionSummary {
  const addressGroups = new Map<string, RegisteredLaborUnion[]>();
  records.forEach((record) => {
    if (record.addressNormalized) addressGroups.set(record.addressNormalized, [...(addressGroups.get(record.addressNormalized) ?? []), record]);
  });
  return {
    totalRecords: records.length,
    uniqueUnionNameCount: new Set(records.map((record) => record.unionName)).size,
    uniqueAddressCount: addressGroups.size,
    uniqueChairpersonNameCount: new Set(records.flatMap((record) => record.chairpersonName ?? [])).size,
    recordsWithPhone: records.filter((record) => record.hasPhone).length,
    recordsMissingPhone: records.filter((record) => !record.hasPhone).length,
    recordsWithChairpersonName: records.filter((record) => record.hasChairpersonName).length,
    recordsMissingChairpersonName: records.filter((record) => !record.hasChairpersonName).length,
    taipeiAddressCount: records.filter((record) => record.addressLocationCategory === 'taipei_address').length,
    nonTaipeiAddressCount: records.filter((record) => ['new_taipei_address', 'other_taiwan_address'].includes(record.addressLocationCategory)).length,
    postalBoxOrUnparsedAddressCount: records.filter((record) => record.addressLocationCategory === 'postal_box_or_unparsed').length,
    districtCount: new Set(records.flatMap((record) => record.district ?? [])).size,
    byUnionType: countBy(records.map((record) => record.unionType)).map(({ key: unionType, count }) => ({
      unionType, unionAttributeRaw: records.find((record) => record.unionType === unionType)?.unionAttributeRaw, count,
    })),
    byDistrict: countBy(records.flatMap((record) => record.isTaipeiAddress && record.district ? [record.district] : [])).map(({ key: district, count }) => {
      const rows = records.filter((record) => record.district === district && record.isTaipeiAddress);
      return { district, count, unionTypes: countBy(rows.map((row) => row.unionType)).map(({ key: unionType, count: typeCount }) => ({ unionType, count: typeCount })) };
    }),
    byAddressLocationCategory: countBy(records.map((record) => record.addressLocationCategory)).map(({ key: addressLocationCategory, count }) => ({ addressLocationCategory, count })),
    byRoadName: countBy(records.flatMap((record) => record.roadName ?? [])).map(({ key: roadName, count }) => ({ roadName, count })),
    byPhoneType: countBy(records.map((record) => record.phoneType)).map(({ key: phoneType, count }) => ({ phoneType, count })),
    duplicateAddressGroups: [...addressGroups].filter(([, rows]) => rows.length > 1).map(([address, rows]) => ({
      address, count: rows.length, sampleUnionNames: rows.slice(0, 5).map((row) => row.unionName),
    })).sort((a, b) => b.count - a.count),
    byPostalCode: countBy(records.flatMap((record) => record.postalCode ?? [])).map(({ key: postalCode, count }) => ({ postalCode, count })),
  };
}

export function filterRegisteredLaborUnions(records: RegisteredLaborUnion[], filters: RegisteredLaborUnionFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((record) => {
    const text = [record.unionName, record.unionAttributeRaw, record.contactAddress, record.district, record.roadName, record.phone, record.postalCode].filter(Boolean).join(' ').toLocaleLowerCase();
    return (!query || text.includes(query))
      && (!filters.unionType || record.unionType === filters.unionType)
      && (!filters.district || record.district === filters.district)
      && (!filters.addressLocationCategory || record.addressLocationCategory === filters.addressLocationCategory)
      && (!filters.city || record.city === filters.city)
      && (!filters.postalCode || record.postalCode === filters.postalCode)
      && (!filters.roadName || record.roadName === filters.roadName)
      && (!filters.phoneType || record.phoneType === filters.phoneType)
      && (!filters.hasPhone || (filters.hasPhone === 'yes' ? record.hasPhone : !record.hasPhone))
      && (!filters.hasChairpersonName || (filters.hasChairpersonName === 'yes' ? record.hasChairpersonName : !record.hasChairpersonName));
  });
}
