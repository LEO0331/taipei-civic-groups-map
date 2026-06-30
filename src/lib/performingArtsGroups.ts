import { DISTRICTS } from './civicGroups';
import type {
  PerformingArtsGroupApplicationCategory,
  PerformingArtsGroupFilters,
  PerformingArtsGroupRecord,
  PerformingArtsGroupSummary,
} from '../types';

export function cleanText(raw: unknown) {
  const text = String(raw ?? '').replace(/\u3000/g, ' ').trim();
  return text && !['-', '--', 'NaN', 'nan', 'NULL', 'null'].includes(text) ? text : undefined;
}

export function normalizePerformingArtsGroupName(raw: unknown) {
  return cleanText(raw)?.replace(/[，、,.\s]+/g, '').toLocaleLowerCase();
}

export function classifyPerformingArtsApplicationCategory(raw?: string): PerformingArtsGroupApplicationCategory {
  const text = raw?.trim() ?? '';
  if (!text) return 'unknown';
  if (text.includes('傳統戲曲')) return 'traditional_opera';
  if (text.includes('戲劇') || text.includes('劇場') || text.includes('劇團')) return 'theater';
  if (text.includes('舞蹈') || text.includes('舞團')) return 'dance';
  if (text.includes('音樂') || text.includes('樂團') || text.includes('合唱')) return 'music';
  if (text.includes('民俗') || text.includes('民藝') || text.includes('曲藝') || text.includes('雜技')) return 'folk_art';
  if (text.includes('跨域') || text.includes('跨界') || text.includes('綜合')) return 'cross_disciplinary';
  return 'other';
}

export const parseRegistrationNumber = (raw: unknown) => cleanText(raw);

export function parsePerformingArtsGroupAddress(raw: unknown) {
  const registeredAddress = cleanText(raw);
  if (!registeredAddress) return {};
  const addressNormalized = registeredAddress.replaceAll('台北市', '臺北市');
  const district = DISTRICTS.find((item) => addressNormalized.includes(item));
  const afterDistrict = district ? addressNormalized.slice(addressNormalized.indexOf(district) + district.length) : addressNormalized;
  const roadName = afterDistrict.match(/([^0-9\s,，]+?[路街大道])(?:([0-9一二三四五六七八九十]+段))?/)?.slice(1, 3).filter(Boolean).join('');
  return { registeredAddress, addressNormalized, district, roadName, warning: district ? undefined : 'District not parsed' };
}

export function parsePerformingArtsWebsite(raw: unknown) {
  const websiteUrl = cleanText(raw);
  if (!websiteUrl) return {};
  const candidate = /^https?:\/\//i.test(websiteUrl) ? websiteUrl : `https://${websiteUrl}`;
  try {
    const url = new URL(candidate);
    if (!url.hostname.includes('.')) throw new Error('Hostname missing dot');
    return { websiteUrl, websiteUrlNormalized: url.href, websiteDisplay: websiteUrl, websiteHostname: url.hostname.replace(/^www\./, '') };
  } catch {
    return { websiteUrl, websiteDisplay: websiteUrl, warning: 'Malformed website URL' };
  }
}

export const performingArtsMatchKey = (name?: string, address?: string, website?: string) =>
  [normalizePerformingArtsGroupName(name), cleanText(address)?.replace(/\s+/g, '').toLocaleLowerCase(), cleanText(website)?.replace(/^https?:\/\//i, '').replace(/^www\./, '').replace(/\/$/, '').toLocaleLowerCase()]
    .map((value) => value ?? '').join('|');

function countBy<T extends string>(values: T[]) {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count);
}

export function buildPerformingArtsGroupSummary(records: PerformingArtsGroupRecord[]): PerformingArtsGroupSummary {
  const categoryRows = countBy(records.map((record) => record.applicationCategory));
  const districtRows = countBy(records.flatMap((record) => record.district ?? []));
  const matchedCount = records.filter((record) => record.possibleCivicGroupMatchKey).length;
  return {
    totalRecords: records.length,
    uniqueGroupNameCount: new Set(records.map((record) => record.groupNameNormalized ?? record.groupName)).size,
    uniqueRegisteredAddressCount: new Set(records.flatMap((record) => record.addressNormalized ?? [])).size,
    districtCount: districtRows.length,
    recordsWithRegistrationNumber: records.filter((record) => record.hasRegistrationNumber).length,
    recordsWithWebsite: records.filter((record) => record.hasWebsite).length,
    recordsWithParsedDistrict: records.filter((record) => record.district).length,
    recordsWithParsedRoadName: records.filter((record) => record.roadName).length,
    byApplicationCategory: categoryRows.map(({ key: applicationCategory, count }) => ({
      applicationCategory,
      applicationCategoryRaw: records.find((record) => record.applicationCategory === applicationCategory)?.applicationCategoryRaw,
      count,
    })),
    byDistrict: districtRows.map(({ key: district }) => {
      const rows = records.filter((record) => record.district === district);
      return {
        district,
        groupCount: rows.length,
        categoryBreakdown: countBy(rows.map((record) => record.applicationCategory)).map(({ key: applicationCategory, count }) => ({ applicationCategory, count })),
      };
    }),
    byCompetentAuthority: countBy(records.flatMap((record) => record.competentAuthority ?? [])).map(({ key: competentAuthority, count }) => ({
      competentAuthority,
      competentAuthorityCode: records.find((record) => record.competentAuthority === competentAuthority)?.competentAuthorityCode,
      count,
    })),
    byRoadName: countBy(records.flatMap((record) => record.roadName ?? [])).map(({ key: roadName, count }) => ({ roadName, count })),
    byWebsiteHostname: countBy(records.flatMap((record) => record.websiteHostname ?? [])).map(({ key: websiteHostname, count }) => ({ websiteHostname, count })),
    possibleOverlapWithCivicGroups: { matchedCount, unmatchedCount: records.length - matchedCount },
  };
}

export function filterPerformingArtsGroups(records: PerformingArtsGroupRecord[], filters: PerformingArtsGroupFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((record) => {
    const text = [record.groupName, record.applicationCategoryRaw, record.registrationNumber, record.competentAuthority, record.competentAuthorityCode, record.registeredAddress, record.district, record.roadName, record.websiteUrl]
      .filter(Boolean).join(' ').toLocaleLowerCase();
    return (!query || text.includes(query))
      && (!filters.applicationCategory || record.applicationCategory === filters.applicationCategory)
      && (!filters.district || record.district === filters.district)
      && (!filters.roadName || record.roadName === filters.roadName)
      && (!filters.competentAuthority || record.competentAuthority === filters.competentAuthority)
      && (!filters.websiteHostname || record.websiteHostname === filters.websiteHostname)
      && (!filters.hasRegistrationNumber || (filters.hasRegistrationNumber === 'yes' ? record.hasRegistrationNumber : !record.hasRegistrationNumber))
      && (!filters.hasWebsite || (filters.hasWebsite === 'yes' ? record.hasWebsite : !record.hasWebsite));
  });
}
