import { DISTRICTS } from './civicGroups';
import {
  cleanText,
  haversineDistanceMeters,
  parseBusinessRegistrationCoordinates,
  parseBusinessRegistrationDate,
} from './businessRegistrationChanges';
import type { CompanyRegistrationChangeEventType, CompanyRegistrationChangeFilters, CompanyRegistrationChangeRecord, CompanyRegistrationChangeSummary } from '../types';

export { haversineDistanceMeters };

export const COMPANY_CHANGE_EVENT_LABELS_ZH: Record<CompanyRegistrationChangeEventType, string> = { establishment: '設立', modification: '變更', dissolution: '解散', unknown: '未知' };
export const COMPANY_CHANGE_EVENT_LABELS_EN: Record<CompanyRegistrationChangeEventType, string> = { establishment: 'Establishment', modification: 'Modification', dissolution: 'Dissolution', unknown: 'Unknown' };

export const parseUnifiedBusinessNumber = (raw: unknown) => cleanText(raw);
export const normalizeCompanyName = (raw: unknown) => cleanText(raw)?.toLocaleLowerCase();

export function classifyCompanyRegistrationChangeEventType(resourceName: string): CompanyRegistrationChangeEventType {
  if (resourceName.includes('設立')) return 'establishment';
  if (resourceName.includes('變更')) return 'modification';
  if (resourceName.includes('解散')) return 'dissolution';
  return 'unknown';
}

export function parseCompanyRegistrationAddress(raw: unknown) {
  const companyAddress = cleanText(raw);
  if (!companyAddress) return {};
  const companyAddressNormalized = companyAddress.replaceAll('台北市', '臺北市');
  const district = DISTRICTS.find((item) => companyAddressNormalized.includes(item));
  const afterDistrict = district ? companyAddressNormalized.slice(companyAddressNormalized.indexOf(district) + district.length) : companyAddressNormalized;
  const roadName = afterDistrict.match(/([^0-9\s,，]+?(?:大道|路|街))(?:([0-9一二三四五六七八九十]+段))?/)?.slice(1, 3).filter(Boolean).join('');
  return { companyAddress, companyAddressNormalized, district, roadName, warning: district ? undefined : 'District not parsed' };
}

export const parseCompanyRegistrationDate = parseBusinessRegistrationDate;
export const parseCompanyRegistrationCoordinates = parseBusinessRegistrationCoordinates;

export function deriveCompanyRegistrationEventDate(record: { eventType: CompanyRegistrationChangeEventType; approvalDate?: string; modificationApprovalDate?: string; dissolutionApprovalDate?: string }) {
  return record.eventType === 'establishment' ? record.approvalDate ?? record.modificationApprovalDate ?? record.dissolutionApprovalDate
    : record.eventType === 'modification' ? record.modificationApprovalDate ?? record.approvalDate ?? record.dissolutionApprovalDate
      : record.eventType === 'dissolution' ? record.dissolutionApprovalDate ?? record.modificationApprovalDate ?? record.approvalDate
        : record.approvalDate ?? record.modificationApprovalDate ?? record.dissolutionApprovalDate;
}

function countBy<T extends string | number>(values: T[]) {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || String(a.key).localeCompare(String(b.key)));
}

export function buildCompanyRegistrationChangeSummary(records: CompanyRegistrationChangeRecord[]): CompanyRegistrationChangeSummary {
  const dates = records.flatMap((record) => record.eventDate ?? []).sort();
  const months = countBy(records.flatMap((record) => record.eventMonthKey ?? []));
  const districts = countBy(records.flatMap((record) => record.district ?? []));
  const byType = (rows: CompanyRegistrationChangeRecord[], type: CompanyRegistrationChangeEventType) => rows.filter((record) => record.eventType === type).length;
  return {
    totalRecords: records.length,
    uniqueCompanyNameCount: new Set(records.map((record) => record.companyNameNormalized ?? record.companyName)).size,
    uniqueBusinessNumberCount: new Set(records.flatMap((record) => record.unifiedBusinessNumberNormalized ?? [])).size,
    uniqueAddressCount: new Set(records.flatMap((record) => record.companyAddressNormalized ?? [])).size,
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
      return { monthKey, establishmentCount: byType(rows, 'establishment'), modificationCount: byType(rows, 'modification'), dissolutionCount: byType(rows, 'dissolution'), totalCount: rows.length };
    }).sort((a, b) => a.monthKey.localeCompare(b.monthKey)),
    byDistrict: districts.map(({ key: district }) => {
      const rows = records.filter((record) => record.district === district);
      return { district, totalCount: rows.length, establishmentCount: byType(rows, 'establishment'), modificationCount: byType(rows, 'modification'), dissolutionCount: byType(rows, 'dissolution'), validCoordinateCount: rows.filter((record) => record.coordinateStatus === 'valid').length };
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

export function filterCompanyRegistrationChanges(records: CompanyRegistrationChangeRecord[], filters: CompanyRegistrationChangeFilters, language: 'zh' | 'en') {
  const query = filters.search.trim().toLocaleLowerCase();
  const labels = language === 'zh' ? COMPANY_CHANGE_EVENT_LABELS_ZH : COMPANY_CHANGE_EVENT_LABELS_EN;
  return records.filter((record) => {
    const text = [record.unifiedBusinessNumber, record.companyName, record.companyAddress, record.district, record.roadName, record.eventDateRaw, record.eventDate, record.resourceName, labels[record.eventType]].filter(Boolean).join(' ').toLocaleLowerCase();
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
