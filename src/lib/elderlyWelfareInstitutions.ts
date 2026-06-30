import { DISTRICTS } from './civicGroups';
import type { ElderlyWelfareCareRecipientCategory, ElderlyWelfareInstitutionAttribute, ElderlyWelfareInstitutionFilters, ElderlyWelfareInstitutionPhoneType, ElderlyWelfareInstitutionRecord, ElderlyWelfareInstitutionSummary } from '../types';

export const ELDERLY_ATTRIBUTE_LABELS_ZH: Record<ElderlyWelfareInstitutionAttribute, string> = { public: '公立', public_private_operated: '公設民營', private: '私立', other: '其他', unknown: '未知' };
export const ELDERLY_ATTRIBUTE_LABELS_EN: Record<ElderlyWelfareInstitutionAttribute, string> = { public: 'Public', public_private_operated: 'Public-owned, privately operated', private: 'Private', other: 'Other', unknown: 'Unknown' };
export const ELDERLY_CARE_LABELS_ZH: Record<ElderlyWelfareCareRecipientCategory, string> = { long_term_care: '長照', nursing_care: '養護', dementia_care: '失智', residential_care: '安養', other: '其他', unknown: '未知' };
export const ELDERLY_CARE_LABELS_EN: Record<ElderlyWelfareCareRecipientCategory, string> = { long_term_care: 'Long-term care', nursing_care: 'Nursing care', dementia_care: 'Dementia care', residential_care: 'Residential care', other: 'Other', unknown: 'Unknown' };

export function cleanText(raw: unknown) {
  const text = String(raw ?? '').replace(/\u3000/g, ' ').trim();
  return text && !['-', '--', 'NaN', 'nan', 'NULL', 'null'].includes(text) ? text : undefined;
}
export function parseIntegerText(raw: unknown) {
  const text = cleanText(raw)?.replaceAll(',', '').replace('床', '');
  if (!text) return undefined;
  const value = Number(text);
  return Number.isInteger(value) ? value : undefined;
}
export const parseBedCount = parseIntegerText;
export const normalizeText = (raw: unknown) => cleanText(raw)?.toLocaleLowerCase();

export function classifyElderlyWelfareInstitutionAttribute(raw: unknown): ElderlyWelfareInstitutionAttribute {
  const text = cleanText(raw);
  if (!text) return 'unknown';
  if (text === '公立') return 'public';
  if (text === '公設民營') return 'public_private_operated';
  if (text === '私立') return 'private';
  return 'other';
}

export function parseElderlyCareRecipientCategories(raw: unknown): ElderlyWelfareCareRecipientCategory[] {
  const text = cleanText(raw);
  if (!text) return ['unknown'];
  const categories: ElderlyWelfareCareRecipientCategory[] = [];
  if (text.includes('長照')) categories.push('long_term_care');
  if (text.includes('養護')) categories.push('nursing_care');
  if (text.includes('失智')) categories.push('dementia_care');
  if (text.includes('安養')) categories.push('residential_care');
  return categories.length ? categories : ['other'];
}

export function normalizeTaipeiDistrict(raw: unknown, address?: string) {
  const text = cleanText(raw);
  if (text && DISTRICTS.includes(text)) return text;
  return DISTRICTS.find((district) => address?.includes(district));
}

export function parseElderlyWelfareInstitutionAddress(raw: unknown) {
  const address = cleanText(raw);
  if (!address) return {};
  const addressNormalized = address.replaceAll('台北市', '臺北市');
  const districtFromAddress = DISTRICTS.find((district) => addressNormalized.includes(district));
  const afterDistrict = districtFromAddress ? addressNormalized.slice(addressNormalized.indexOf(districtFromAddress) + districtFromAddress.length) : addressNormalized;
  const roadSource = afterDistrict.replace(/^[^大道路街]+鄰/, '');
  const roadName = roadSource.match(/([^0-9\s,，]+?(?:大道|路|街))(?:([0-9一二三四五六七八九十]+段))?/)?.slice(1, 3).filter(Boolean).join('');
  return { address, addressNormalized, districtFromAddress, roadName, warning: districtFromAddress ? undefined : 'District not parsed from address' };
}

export function parseElderlyWelfareInstitutionPhone(raw: unknown) {
  const phone = cleanText(raw);
  if (!phone) return { phoneType: 'missing' as ElderlyWelfareInstitutionPhoneType };
  const normalized = phone.replace(/\s+/g, '');
  const digits = normalized.replace(/[()\-\s]/g, '');
  const phoneType: ElderlyWelfareInstitutionPhoneType = /[、/;,]/.test(normalized) ? 'multiple'
    : /#|轉|分機/.test(normalized) ? 'extension'
      : digits.startsWith('09') ? 'mobile'
        : digits.startsWith('02') ? 'taipei_landline'
          : /^0[3-8]/.test(digits) ? 'other_landline'
            : 'unknown';
  const phoneDialHref = ['taipei_landline', 'other_landline', 'mobile'].includes(phoneType) ? `tel:${digits}` : undefined;
  return { phone, phoneDisplay: phone, phoneDialHref, phoneType };
}

export function deriveBedCountConsistency(record: Pick<ElderlyWelfareInstitutionRecord, 'approvedTotalBedCount' | 'longTermCareBedCount' | 'nursingCareBedCount' | 'dementiaCareBedCount' | 'residentialCareBedCount'>) {
  const beds = [record.longTermCareBedCount, record.nursingCareBedCount, record.dementiaCareBedCount, record.residentialCareBedCount];
  const allSpecializedPresent = beds.every((value) => value !== undefined);
  const computedTotalBedCount = allSpecializedPresent ? beds.reduce((sum, value) => sum + value!, 0) : undefined;
  const bedCountMismatch = computedTotalBedCount !== undefined && record.approvedTotalBedCount !== undefined && computedTotalBedCount !== record.approvedTotalBedCount;
  return { computedTotalBedCount, totalSpecializedBedCount: computedTotalBedCount, bedCountMismatch, warning: bedCountMismatch ? 'Bed count mismatch' : undefined };
}

export function createElderlyWelfareInstitutionMapQuery(record: { institutionName?: string; address?: string }) {
  return cleanText([record.address, record.institutionName].filter(Boolean).join(' '));
}

function sum(records: ElderlyWelfareInstitutionRecord[], key: keyof ElderlyWelfareInstitutionRecord) {
  return records.reduce((total, record) => total + (typeof record[key] === 'number' ? record[key] as number : 0), 0);
}
function countBy<T extends string>(values: T[]) {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

export function buildElderlyWelfareInstitutionSummary(records: ElderlyWelfareInstitutionRecord[]): ElderlyWelfareInstitutionSummary {
  const districts = countBy(records.flatMap((record) => record.district ?? []));
  const attributes = countBy(records.map((record) => record.institutionAttribute));
  const careCategories = countBy(records.flatMap((record) => record.careRecipientCategories));
  return {
    totalRecords: records.length,
    uniqueInstitutionNameCount: new Set(records.map((record) => record.institutionNameNormalized ?? record.institutionName)).size,
    uniqueAddressCount: new Set(records.flatMap((record) => record.addressNormalized ?? [])).size,
    districtCount: districts.length,
    recordsWithPhone: records.filter((record) => record.hasPhone).length,
    recordsWithAddress: records.filter((record) => record.address).length,
    recordsWithParsedRoadName: records.filter((record) => record.roadName).length,
    totalApprovedBeds: sum(records, 'approvedTotalBedCount'),
    totalLongTermCareBeds: sum(records, 'longTermCareBedCount'),
    totalNursingCareBeds: sum(records, 'nursingCareBedCount'),
    totalDementiaCareBeds: sum(records, 'dementiaCareBedCount'),
    totalResidentialCareBeds: sum(records, 'residentialCareBedCount'),
    recordsWithBedCountMismatch: records.filter((record) => record.bedCountMismatch).length,
    byInstitutionAttribute: attributes.map(({ key, count }) => {
      const rows = records.filter((record) => record.institutionAttribute === key);
      return { institutionAttribute: key, institutionAttributeRaw: rows.find((record) => record.institutionAttributeRaw)?.institutionAttributeRaw, count, approvedTotalBedCount: sum(rows, 'approvedTotalBedCount') };
    }),
    byCareRecipientCategory: careCategories.map(({ key, count }) => {
      const rows = records.filter((record) => record.careRecipientCategories.includes(key));
      return { careRecipientCategory: key, count, approvedTotalBedCount: sum(rows, 'approvedTotalBedCount') };
    }),
    byDistrict: districts.map(({ key: district, count }) => {
      const rows = records.filter((record) => record.district === district);
      return { district, institutionCount: count, approvedTotalBedCount: sum(rows, 'approvedTotalBedCount'), longTermCareBedCount: sum(rows, 'longTermCareBedCount'), nursingCareBedCount: sum(rows, 'nursingCareBedCount'), dementiaCareBedCount: sum(rows, 'dementiaCareBedCount'), residentialCareBedCount: sum(rows, 'residentialCareBedCount'), attributeBreakdown: countBy(rows.map((record) => record.institutionAttribute)).map(({ key, count }) => ({ institutionAttribute: key, count })) };
    }),
    byRoadName: countBy(records.flatMap((record) => record.roadName ?? [])).map(({ key: roadName, count }) => ({ roadName, count })),
    topInstitutionsByApprovedBeds: [...records].sort((a, b) => (b.approvedTotalBedCount ?? 0) - (a.approvedTotalBedCount ?? 0)).slice(0, 20).map((record) => ({ institutionName: record.institutionName, district: record.district, approvedTotalBedCount: record.approvedTotalBedCount })),
  };
}

export function filterElderlyWelfareInstitutions(records: ElderlyWelfareInstitutionRecord[], filters: ElderlyWelfareInstitutionFilters, language: 'zh' | 'en') {
  const query = filters.search.trim().toLocaleLowerCase();
  const attributeLabels = language === 'zh' ? ELDERLY_ATTRIBUTE_LABELS_ZH : ELDERLY_ATTRIBUTE_LABELS_EN;
  const careLabels = language === 'zh' ? ELDERLY_CARE_LABELS_ZH : ELDERLY_CARE_LABELS_EN;
  const yes = (filter: string, value: boolean) => !filter || (filter === 'yes' ? value : !value);
  return records.filter((record) => {
    const text = [record.institutionName, record.institutionAttributeRaw, attributeLabels[record.institutionAttribute], record.district, record.address, record.roadName, record.phone, record.careRecipientCategoryRaw, ...record.careRecipientCategories.map((item) => careLabels[item])].filter(Boolean).join(' ').toLocaleLowerCase();
    return (!query || text.includes(query))
      && (!filters.institutionAttribute || record.institutionAttribute === filters.institutionAttribute)
      && (!filters.district || record.district === filters.district)
      && (!filters.careRecipientCategory || record.careRecipientCategories.includes(filters.careRecipientCategory as ElderlyWelfareCareRecipientCategory))
      && (!filters.roadName || record.roadName === filters.roadName)
      && yes(filters.hasPhone, record.hasPhone)
      && yes(filters.hasLongTermCareBeds, record.hasLongTermCareBeds)
      && yes(filters.hasNursingCareBeds, record.hasNursingCareBeds)
      && yes(filters.hasDementiaCareBeds, record.hasDementiaCareBeds)
      && yes(filters.hasResidentialCareBeds, record.hasResidentialCareBeds)
      && (!filters.approvedMin || (record.approvedTotalBedCount ?? -Infinity) >= Number(filters.approvedMin))
      && (!filters.approvedMax || (record.approvedTotalBedCount ?? Infinity) <= Number(filters.approvedMax))
      && yes(filters.bedCountMismatch, record.bedCountMismatch);
  });
}
