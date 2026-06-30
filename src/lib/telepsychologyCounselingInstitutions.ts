import { DISTRICTS } from './civicGroups';
import type {
  TelepsychologyContactMethod,
  TelepsychologyCounselingInstitutionFilters,
  TelepsychologyCounselingInstitutionRecord,
  TelepsychologyCounselingInstitutionSummary,
  TelepsychologyInstitutionType,
  TelepsychologyPhoneType,
} from '../types';

export const TELEPSYCHOLOGY_TYPE_LABELS_ZH: Record<TelepsychologyInstitutionType, string> = {
  counseling_clinic: '諮商所',
  psychological_treatment_clinic: '治療所',
  foundation: '基金會',
  school: '學校',
  other: '其他',
  unknown: '未知',
};

export const TELEPSYCHOLOGY_TYPE_LABELS_EN: Record<TelepsychologyInstitutionType, string> = {
  counseling_clinic: 'Counseling clinic',
  psychological_treatment_clinic: 'Psychological treatment clinic',
  foundation: 'Foundation',
  school: 'School',
  other: 'Other',
  unknown: 'Unknown',
};

export function cleanText(raw: unknown) {
  const text = String(raw ?? '').replace(/\u3000/g, ' ').trim();
  return text && !['-', '--', 'NaN', 'nan', 'NULL', 'null'].includes(text) ? text : undefined;
}

export function parseIntegerText(raw: unknown) {
  const text = cleanText(raw)?.replaceAll(',', '');
  return text && /^-?\d+$/.test(text) ? Number(text) : undefined;
}

export const normalizeInstitutionName = (raw: unknown) => cleanText(raw)?.replace(/[，、,.\s]+/g, '').toLocaleLowerCase();
export const parseDistrictCode = (raw: unknown) => cleanText(raw);

export function classifyTelepsychologyInstitutionType(raw: unknown): TelepsychologyInstitutionType {
  const text = cleanText(raw) ?? '';
  if (!text) return 'unknown';
  if (text.includes('諮商所')) return 'counseling_clinic';
  if (text.includes('治療所')) return 'psychological_treatment_clinic';
  if (text.includes('基金會')) return 'foundation';
  if (text.includes('學校')) return 'school';
  return 'other';
}

export function parseTelepsychologyAddress(raw: unknown, districtCodeRaw?: string) {
  const address = cleanText(raw);
  if (!address) return {};
  const addressNormalized = address.replaceAll('台北市', '臺北市');
  const district = DISTRICTS.find((item) => addressNormalized.includes(item));
  const afterDistrict = district ? addressNormalized.slice(addressNormalized.indexOf(district) + district.length) : addressNormalized;
  const roadName = afterDistrict.match(/([^0-9\s,，]+?[路街大道])(?:([0-9一二三四五六七八九十]+段))?/)?.slice(1, 3).filter(Boolean).join('');
  const warning = district ? undefined : `District not parsed${districtCodeRaw ? ` for code ${districtCodeRaw}` : ''}`;
  return { address, addressNormalized, district, roadName, warning };
}

function cleanDialDigits(text: string) {
  return text.replace(/\D/g, '');
}

export function parseTelepsychologyPhone(raw: unknown) {
  const phone = cleanText(raw);
  if (!phone) return { phoneType: 'missing' as const };
  if (/[、/;,，；]/.test(phone)) return { phone, phoneDisplay: phone, phoneType: 'multiple' as const };
  if (/[#＃]|轉|分機/.test(phone)) return { phone, phoneDisplay: phone, phoneType: 'extension' as const };
  const digits = cleanDialDigits(phone);
  let phoneType: TelepsychologyPhoneType = 'unknown';
  if (/^09\d{8}$/.test(digits)) phoneType = 'mobile';
  else if (/^02\d{7,8}$/.test(digits) || /^\(02\)/.test(phone)) phoneType = 'taipei_landline';
  else if (/^0[3-8]\d{6,8}$/.test(digits) || /^\(0[3-8]\)/.test(phone)) phoneType = 'other_landline';
  return { phone, phoneDisplay: phone, phoneDialHref: phoneType !== 'unknown' ? `tel:${digits}` : undefined, phoneType, warning: phoneType === 'unknown' ? 'Unsupported phone format' : undefined };
}

export function parseTelepsychologyExtension(raw: unknown) {
  const text = cleanText(raw)?.replace(/\.0$/, '');
  return { extension: text, extensionDisplay: text, warning: undefined };
}

export function parseTelepsychologyMobile(raw: unknown) {
  const cleaned = cleanText(raw)?.replace(/\.0$/, '');
  if (!cleaned) return {};
  const digits = cleanDialDigits(cleaned);
  const mobile = /^9\d{8}$/.test(digits) ? `0${digits}` : cleaned;
  const normalizedDigits = cleanDialDigits(mobile);
  const isCleanMobile = /^09\d{8}$/.test(normalizedDigits);
  return { mobile, mobileDisplay: mobile, mobileDialHref: isCleanMobile ? `tel:${normalizedDigits}` : undefined, warning: isCleanMobile ? undefined : 'Unsupported mobile format' };
}

export function deriveTelepsychologyContactMethods(record: { hasPhone: boolean; hasExtension: boolean; hasMobile: boolean }) {
  return [
    record.hasPhone ? 'phone' : undefined,
    record.hasExtension ? 'extension' : undefined,
    record.hasMobile ? 'mobile' : undefined,
  ].filter(Boolean) as TelepsychologyContactMethod[];
}

function countBy<T extends string | number>(values: T[]) {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || String(a.key).localeCompare(String(b.key)));
}

export function buildTelepsychologyCounselingInstitutionSummary(records: TelepsychologyCounselingInstitutionRecord[]): TelepsychologyCounselingInstitutionSummary {
  const districtRows = countBy(records.flatMap((record) => record.district ?? []));
  return {
    totalRecords: records.length,
    uniqueInstitutionNameCount: new Set(records.map((record) => record.institutionNameNormalized ?? record.institutionName)).size,
    uniqueAddressCount: new Set(records.flatMap((record) => record.addressNormalized ?? [])).size,
    districtCount: districtRows.length,
    recordsWithPhone: records.filter((record) => record.hasPhone).length,
    recordsWithExtension: records.filter((record) => record.hasExtension).length,
    recordsWithMobile: records.filter((record) => record.hasMobile).length,
    recordsWithAnyContact: records.filter((record) => record.hasAnyContact).length,
    recordsWithParsedRoadName: records.filter((record) => record.roadName).length,
    byInstitutionType: countBy(records.map((record) => record.institutionType)).map(({ key: institutionType, count }) => ({
      institutionType,
      institutionTypeRaw: records.find((record) => record.institutionType === institutionType)?.institutionTypeRaw,
      count,
    })),
    byDistrict: districtRows.map(({ key: district }) => {
      const rows = records.filter((record) => record.district === district);
      return { district, institutionCount: rows.length, typeBreakdown: countBy(rows.map((record) => record.institutionType)).map(({ key: institutionType, count }) => ({ institutionType, count })) };
    }),
    byRoadName: countBy(records.flatMap((record) => record.roadName ?? [])).map(({ key: roadName, count }) => ({ roadName, count })),
    contactAvailability: {
      phoneOnlyCount: records.filter((record) => record.hasPhone && !record.hasMobile).length,
      mobileOnlyCount: records.filter((record) => !record.hasPhone && record.hasMobile).length,
      phoneAndMobileCount: records.filter((record) => record.hasPhone && record.hasMobile).length,
      noContactCount: records.filter((record) => !record.hasAnyContact).length,
    },
  };
}

export function filterTelepsychologyCounselingInstitutions(records: TelepsychologyCounselingInstitutionRecord[], filters: TelepsychologyCounselingInstitutionFilters, language: 'zh' | 'en') {
  const query = filters.search.trim().toLocaleLowerCase();
  const labels = language === 'zh' ? TELEPSYCHOLOGY_TYPE_LABELS_ZH : TELEPSYCHOLOGY_TYPE_LABELS_EN;
  return records.filter((record) => {
    const text = [record.institutionName, record.institutionTypeRaw, labels[record.institutionType], record.district, record.address, record.roadName, record.phone, record.mobile].filter(Boolean).join(' ').toLocaleLowerCase();
    return (!query || text.includes(query))
      && (!filters.institutionType || record.institutionType === filters.institutionType)
      && (!filters.district || record.district === filters.district)
      && (!filters.roadName || record.roadName === filters.roadName)
      && (!filters.contactMethodCount || record.contactMethodCount === Number(filters.contactMethodCount))
      && (!filters.hasPhone || (filters.hasPhone === 'yes' ? record.hasPhone : !record.hasPhone))
      && (!filters.hasExtension || (filters.hasExtension === 'yes' ? record.hasExtension : !record.hasExtension))
      && (!filters.hasMobile || (filters.hasMobile === 'yes' ? record.hasMobile : !record.hasMobile))
      && (!filters.hasAnyContact || (filters.hasAnyContact === 'yes' ? record.hasAnyContact : !record.hasAnyContact));
  });
}
