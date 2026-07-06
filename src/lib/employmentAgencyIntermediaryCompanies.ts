import { DISTRICTS } from './civicGroups';
import type {
  EmploymentAgencyAssociationCategory,
  EmploymentAgencyBusinessItemCategory,
  EmploymentAgencyBusinessScopeCategory,
  EmploymentAgencyEvaluationGradeCategory,
  EmploymentAgencyGeocodingStatus,
  EmploymentAgencyIntermediaryCompanyFilters,
  EmploymentAgencyIntermediaryCompanyRecord,
  EmploymentAgencyIntermediaryCompanySummary,
  EmploymentAgencyLocationPrecision,
  EmploymentAgencyStaffSizeCategory,
} from '../types';

const missing = new Set(['', '-', '--', 'nan', 'null', '尚無資料']);
export const cleanEmploymentAgencyText = (raw: unknown) => {
  const text = String(raw ?? '').replace(/\u3000/g, ' ').trim().replace(/\s+/g, ' ');
  return missing.has(text.toLowerCase()) ? undefined : text;
};
const normalize = (raw: unknown) => cleanEmploymentAgencyText(raw)?.replaceAll('台', '臺').replace(/\s+/g, '').toLocaleLowerCase();

export function classifyEmploymentAgencyEvaluationGrade(raw: string | undefined): EmploymentAgencyEvaluationGradeCategory {
  const text = raw?.trim() ?? '';
  if (!text) return 'unknown';
  if (text.includes('績優免評')) return 'excellent_exempt';
  if (text === 'A') return 'grade_a';
  if (text === 'B') return 'grade_b';
  if (text === 'C') return 'grade_c';
  if (text.includes('尚無')) return 'not_available';
  return 'other';
}
export function classifyEmploymentAgencyBusinessScope(raw: string | undefined): EmploymentAgencyBusinessScopeCategory {
  const text = raw?.trim() ?? '';
  if (!text) return 'unknown';
  if (text.includes('國內') && text.includes('國外')) return 'domestic_and_foreign';
  if (text.includes('國外')) return 'foreign_only';
  if (text.includes('國內')) return 'domestic_only';
  return 'other';
}
export function classifyEmploymentAgencyAssociation(raw: string | undefined): EmploymentAgencyAssociationCategory {
  const text = raw?.trim() ?? '';
  if (!text) return 'missing';
  if (text.includes('臺北市就業服務商業同業公會')) return 'taipei_employment_service_business_association';
  if (text.includes('中華民國人力仲介協會')) return 'national_manpower_intermediary_association';
  if (text.includes('未加入') || text.includes('不詳')) return 'not_joined_or_unknown';
  return 'other';
}
export function classifyEmploymentAgencyStaffSize(employeeCount: number | undefined): EmploymentAgencyStaffSizeCategory {
  if (employeeCount == null || !Number.isFinite(employeeCount)) return 'unknown';
  if (employeeCount <= 5) return 'micro';
  if (employeeCount <= 20) return 'small';
  if (employeeCount <= 50) return 'medium';
  return 'large';
}
export function classifyEmploymentAgencyBusinessItem(raw: string | undefined): EmploymentAgencyBusinessItemCategory {
  const text = raw?.trim() ?? '';
  if (!text) return 'unknown';
  if (text === 'I701011') return 'employment_service';
  return 'other';
}

export function parseEmploymentAgencySequenceNumber(raw: unknown) {
  const text = cleanEmploymentAgencyText(raw);
  const n = text && /^\d+$/.test(text) ? Number(text) : undefined;
  return { sourceSequenceNumber: n, sourceSequenceNumberNormalized: text, warning: n ? undefined : 'Missing or invalid sequence number' };
}
export function parseEmploymentAgencyEvaluationGrade(raw: unknown) {
  const evaluationGradeRaw = cleanEmploymentAgencyText(raw);
  const evaluationGradeCategory = classifyEmploymentAgencyEvaluationGrade(evaluationGradeRaw);
  return { evaluationGradeRaw, evaluationGrade: evaluationGradeRaw, evaluationGradeNormalized: normalize(evaluationGradeRaw), evaluationGradeCategory, warning: evaluationGradeCategory === 'other' || evaluationGradeCategory === 'unknown' ? 'Unknown evaluation grade' : undefined };
}
export function parseEmploymentAgencyInstitutionName(raw: unknown) {
  const institutionName = cleanEmploymentAgencyText(raw);
  return { institutionName, institutionNameNormalized: normalize(institutionName), warning: institutionName ? undefined : 'Missing institution name' };
}
export function parseEmploymentAgencyAddress(raw: unknown) {
  const institutionAddress = cleanEmploymentAgencyText(raw);
  const parsed = institutionAddress?.replaceAll('台北巿', '臺北市').replaceAll('臺北巿', '臺北市').replaceAll('台北市', '臺北市').replaceAll('台', '臺');
  const institutionAddressNormalized = normalize(parsed);
  const districtNameFromAddress = DISTRICTS.find((district) => parsed?.includes(district));
  const body = districtNameFromAddress && parsed ? parsed.slice(parsed.indexOf(districtNameFromAddress) + districtNameFromAddress.length) : parsed;
  const roadName = body?.match(/([一-龥]+?(?:路|街|大道)(?:[一二三四五六七八九十\d]+段)?)/)?.[1];
  return {
    institutionAddress,
    institutionAddressNormalized,
    districtNameFromAddress,
    isTaipeiDistrict: Boolean(districtNameFromAddress),
    roadName,
    addressLooksLikeMultiFloorOrUnit: Boolean(institutionAddress && /樓|之|室|地下|B1|F/i.test(institutionAddress)),
    warning: institutionAddress && !districtNameFromAddress ? 'District not found' : undefined,
  };
}
export function parseEmploymentAgencyPhone(raw: unknown) {
  const phone = cleanEmploymentAgencyText(raw)?.replace(/[()（）]/g, '').replace(/\s+/g, '');
  return { phone, phoneNormalized: phone?.replace(/[^\d#分機,-]/g, ''), warning: phone && !/[0-9]/.test(phone) ? 'Invalid phone format' : undefined };
}
export function parseEmploymentAgencyFax(raw: unknown) {
  const fax = cleanEmploymentAgencyText(raw)?.replace(/[()（）]/g, '').replace(/\s+/g, '');
  return { fax, faxNormalized: fax?.replace(/[^\d#分機,-]/g, ''), warning: fax && !/[0-9]/.test(fax) ? 'Invalid fax format' : undefined };
}
export function parseEmploymentAgencyBusinessScope(raw: unknown) {
  const businessScopeRaw = cleanEmploymentAgencyText(raw);
  const businessScopeCategory = classifyEmploymentAgencyBusinessScope(businessScopeRaw);
  return { businessScopeRaw, businessScope: businessScopeRaw, businessScopeNormalized: normalize(businessScopeRaw), businessScopeCategory, warning: businessScopeCategory === 'other' ? 'Unknown business scope' : undefined };
}
export function parseEmploymentAgencyIntermediaryAssociation(raw: unknown) {
  const intermediaryAssociationRaw = cleanEmploymentAgencyText(raw);
  const intermediaryAssociationCategory = classifyEmploymentAgencyAssociation(intermediaryAssociationRaw);
  return { intermediaryAssociationRaw, intermediaryAssociation: intermediaryAssociationRaw, intermediaryAssociationNormalized: normalize(intermediaryAssociationRaw), intermediaryAssociationCategory, warning: intermediaryAssociationCategory === 'other' ? 'Unknown association' : undefined };
}
export function parseResponsiblePersonOrManagerName(raw: unknown) {
  const responsiblePersonOrManagerName = cleanEmploymentAgencyText(raw);
  return { responsiblePersonOrManagerName, responsiblePersonOrManagerNameNormalized: normalize(responsiblePersonOrManagerName), warning: responsiblePersonOrManagerName ? undefined : 'Missing responsible person or manager name' };
}
export function parseResponsiblePersonOrManagerEnglishName(raw: unknown) {
  const responsiblePersonOrManagerEnglishName = cleanEmploymentAgencyText(raw);
  return { responsiblePersonOrManagerEnglishName, responsiblePersonOrManagerEnglishNameNormalized: cleanEmploymentAgencyText(responsiblePersonOrManagerEnglishName)?.toLocaleLowerCase(), warning: responsiblePersonOrManagerEnglishName ? undefined : 'Missing responsible person or manager English name' };
}
export function parseTaiwanUnifiedBusinessNumber(raw: unknown) {
  const companyUnifiedBusinessNumber = cleanEmploymentAgencyText(raw);
  const companyUnifiedBusinessNumberNormalized = companyUnifiedBusinessNumber?.replace(/\D/g, '');
  const companyUnifiedBusinessNumberValidFormat = Boolean(companyUnifiedBusinessNumberNormalized && /^\d{8}$/.test(companyUnifiedBusinessNumberNormalized));
  return { companyUnifiedBusinessNumber, companyUnifiedBusinessNumberNormalized, companyUnifiedBusinessNumberValidFormat, warning: companyUnifiedBusinessNumber && !companyUnifiedBusinessNumberValidFormat ? 'Invalid unified business number format' : undefined };
}
export function parseEmploymentAgencyBusinessItemCode(raw: unknown) {
  const businessItemCode = cleanEmploymentAgencyText(raw);
  const businessItemCodeNormalized = businessItemCode?.replace(/\s+/g, '').toUpperCase();
  const businessItemCategory = classifyEmploymentAgencyBusinessItem(businessItemCodeNormalized);
  return { businessItemCode, businessItemCodeNormalized, businessItemCategory, warning: businessItemCategory === 'other' ? 'Unknown business item code' : undefined };
}
export function parseNonNegativeIntegerCount(raw: unknown, fieldName: string) {
  const text = cleanEmploymentAgencyText(raw);
  if (!text) return { value: undefined, warning: `Missing ${fieldName}` };
  if (!/^\d+$/.test(text)) return { value: undefined, warning: `Invalid ${fieldName}` };
  return { value: Number(text) };
}
export const createEmploymentAgencyExternalMapQuery = (record: { institutionName?: string; institutionAddress?: string }) => cleanEmploymentAgencyText([record.institutionAddress, record.institutionName].filter(Boolean).join(' '));
export function employmentAgencyLocationPrecision(record: { institutionAddress?: string; districtNameFromAddress?: string }): EmploymentAgencyLocationPrecision {
  if (record.districtNameFromAddress && record.institutionAddress) return 'district_address';
  if (record.institutionAddress) return 'address_only_unparsed_district';
  if (record.districtNameFromAddress) return 'district_only';
  return 'missing';
}

const group = <T extends string>(records: EmploymentAgencyIntermediaryCompanyRecord[], key: (record: EmploymentAgencyIntermediaryCompanyRecord) => T | undefined) => records.reduce((map, record) => { const value = key(record); if (value) map.set(value, [...(map.get(value) ?? []), record]); return map; }, new Map<T, EmploymentAgencyIntermediaryCompanyRecord[]>());
const dupCount = (values: Array<string | undefined>) => values.filter(Boolean).length - new Set(values.filter(Boolean)).size;
const rows = <T extends string>(records: EmploymentAgencyIntermediaryCompanyRecord[], field: (record: EmploymentAgencyIntermediaryCompanyRecord) => T | undefined) => [...group(records, field)].map(([key, items]) => ({ key, items })).sort((a, b) => b.items.length - a.items.length || a.key.localeCompare(b.key, 'zh-Hant'));
const sum = (records: EmploymentAgencyIntermediaryCompanyRecord[], key: 'professionalStaffCount' | 'bilingualEmploymentPermitStaffCount' | 'employeeCount') => records.reduce((total, record) => total + (record[key] ?? 0), 0);
const avg = (records: EmploymentAgencyIntermediaryCompanyRecord[], key: 'professionalStaffCount' | 'bilingualEmploymentPermitStaffCount' | 'employeeCount') => {
  const values = records.flatMap((record) => record[key] ?? []);
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
};
const topGrade = (records: EmploymentAgencyIntermediaryCompanyRecord[]) => rows(records, (r) => r.evaluationGradeCategory)[0]?.key;

export function buildEmploymentAgencyIntermediaryCompanySummary(records: EmploymentAgencyIntermediaryCompanyRecord[]): EmploymentAgencyIntermediaryCompanySummary {
  return {
    totalRecords: records.length,
    districtCount: group(records, (r) => r.districtNameFromAddress).size,
    uniqueInstitutionNameCount: new Set(records.map((r) => r.institutionNameNormalized).filter(Boolean)).size,
    uniqueInstitutionAddressCount: new Set(records.map((r) => r.institutionAddressNormalized).filter(Boolean)).size,
    uniqueUnifiedBusinessNumberCount: new Set(records.map((r) => r.companyUnifiedBusinessNumberNormalized).filter(Boolean)).size,
    uniquePhoneCount: new Set(records.map((r) => r.phoneNormalized).filter(Boolean)).size,
    uniqueResponsiblePersonOrManagerNameCount: new Set(records.map((r) => r.responsiblePersonOrManagerNameNormalized).filter(Boolean)).size,
    recordsWithPhone: records.filter((r) => r.hasPhone).length,
    recordsWithFax: records.filter((r) => r.hasFax).length,
    recordsWithBusinessScope: records.filter((r) => r.businessScope).length,
    recordsWithIntermediaryAssociation: records.filter((r) => r.hasIntermediaryAssociation).length,
    recordsWithParsedDistrict: records.filter((r) => r.districtNameFromAddress).length,
    recordsWithApproximateGeocodedCoordinates: records.filter((r) => r.coordinateSource === 'geocoded').length,
    totalProfessionalStaffCount: sum(records, 'professionalStaffCount'),
    totalBilingualEmploymentPermitStaffCount: sum(records, 'bilingualEmploymentPermitStaffCount'),
    totalEmployeeCount: sum(records, 'employeeCount'),
    averageProfessionalStaffCount: avg(records, 'professionalStaffCount'),
    averageBilingualEmploymentPermitStaffCount: avg(records, 'bilingualEmploymentPermitStaffCount'),
    averageEmployeeCount: avg(records, 'employeeCount'),
    byDistrict: rows(records, (r) => r.districtNameFromAddress).map(({ key, items }) => ({ districtName: key, count: items.length, uniqueInstitutionNameCount: new Set(items.map((r) => r.institutionNameNormalized).filter(Boolean)).size, totalProfessionalStaffCount: sum(items, 'professionalStaffCount'), totalBilingualEmploymentPermitStaffCount: sum(items, 'bilingualEmploymentPermitStaffCount'), totalEmployeeCount: sum(items, 'employeeCount'), topEvaluationGradeCategory: topGrade(items) })),
    byEvaluationGrade: rows(records, (r) => r.evaluationGrade ?? r.evaluationGradeCategory).map(({ key, items }) => ({ evaluationGrade: key, evaluationGradeCategory: items[0].evaluationGradeCategory, count: items.length, totalEmployeeCount: sum(items, 'employeeCount') })),
    byBusinessScope: rows(records, (r) => r.businessScopeCategory).map(({ key, items }) => ({ businessScopeCategory: key, count: items.length })),
    byIntermediaryAssociation: rows(records, (r) => r.intermediaryAssociationCategory).map(({ key, items }) => ({ intermediaryAssociationCategory: key, intermediaryAssociationLabel: items[0].intermediaryAssociation, count: items.length })),
    byStaffSizeCategory: rows(records, (r) => r.staffSizeCategory).map(({ key, items }) => ({ staffSizeCategory: key, count: items.length, averageEmployeeCount: avg(items, 'employeeCount') })),
    byRoadName: rows(records, (r) => r.roadName).map(({ key, items }) => ({ roadName: key, count: items.length, districtCount: new Set(items.map((r) => r.districtNameFromAddress).filter(Boolean)).size, totalEmployeeCount: sum(items, 'employeeCount') })),
    topAgenciesByEmployeeCount: [...records].filter((r) => r.employeeCount != null).sort((a, b) => (b.employeeCount ?? 0) - (a.employeeCount ?? 0)).slice(0, 30).map((r) => ({ institutionName: r.institutionName, districtName: r.districtNameFromAddress, employeeCount: r.employeeCount ?? 0, evaluationGrade: r.evaluationGrade })),
    topAgenciesByProfessionalStaffCount: [...records].filter((r) => r.professionalStaffCount != null).sort((a, b) => (b.professionalStaffCount ?? 0) - (a.professionalStaffCount ?? 0)).slice(0, 30).map((r) => ({ institutionName: r.institutionName, districtName: r.districtNameFromAddress, professionalStaffCount: r.professionalStaffCount ?? 0, evaluationGrade: r.evaluationGrade })),
    dataQuality: {
      missingSequenceNumberCount: records.filter((r) => r.sourceSequenceNumber == null).length,
      duplicateSequenceNumberCount: dupCount(records.map((r) => r.sourceSequenceNumberNormalized)),
      missingEvaluationGradeCount: records.filter((r) => !r.evaluationGrade).length,
      unknownEvaluationGradeCount: records.filter((r) => ['other', 'unknown'].includes(r.evaluationGradeCategory)).length,
      missingInstitutionNameCount: records.filter((r) => !r.institutionName).length,
      duplicateInstitutionNameCount: dupCount(records.map((r) => r.institutionNameNormalized)),
      missingInstitutionAddressCount: records.filter((r) => !r.institutionAddress).length,
      duplicateInstitutionAddressCount: dupCount(records.map((r) => r.institutionAddressNormalized)),
      unparsedDistrictFromAddressCount: records.filter((r) => r.institutionAddress && !r.districtNameFromAddress).length,
      missingPhoneCount: records.filter((r) => !r.phone).length,
      duplicatePhoneCount: dupCount(records.map((r) => r.phoneNormalized)),
      missingFaxCount: records.filter((r) => !r.fax).length,
      missingBusinessScopeCount: records.filter((r) => !r.businessScope).length,
      unknownBusinessScopeCount: records.filter((r) => ['other', 'unknown'].includes(r.businessScopeCategory)).length,
      missingIntermediaryAssociationCount: records.filter((r) => !r.intermediaryAssociation).length,
      missingResponsiblePersonOrManagerNameCount: records.filter((r) => !r.responsiblePersonOrManagerName).length,
      duplicateResponsiblePersonOrManagerNameCount: dupCount(records.map((r) => r.responsiblePersonOrManagerNameNormalized)),
      missingResponsiblePersonOrManagerEnglishNameCount: records.filter((r) => !r.responsiblePersonOrManagerEnglishName).length,
      missingUnifiedBusinessNumberCount: records.filter((r) => !r.companyUnifiedBusinessNumber).length,
      invalidUnifiedBusinessNumberCount: records.filter((r) => r.companyUnifiedBusinessNumber && !r.companyUnifiedBusinessNumberValidFormat).length,
      duplicateUnifiedBusinessNumberCount: dupCount(records.map((r) => r.companyUnifiedBusinessNumberNormalized)),
      missingBusinessItemCodeCount: records.filter((r) => !r.businessItemCode).length,
      unknownBusinessItemCodeCount: records.filter((r) => r.businessItemCategory !== 'employment_service').length,
      invalidProfessionalStaffCount: records.filter((r) => r.professionalStaffCount == null).length,
      invalidBilingualEmploymentPermitStaffCount: records.filter((r) => r.bilingualEmploymentPermitStaffCount == null).length,
      invalidEmployeeCount: records.filter((r) => r.employeeCount == null).length,
      duplicateFallbackKeyCount: dupCount(records.map((r) => [r.institutionNameNormalized, r.institutionAddressNormalized, r.phoneNormalized].filter(Boolean).join('|'))),
    },
  };
}

export function filterEmploymentAgencyIntermediaryCompanies(records: EmploymentAgencyIntermediaryCompanyRecord[], filters: EmploymentAgencyIntermediaryCompanyFilters) {
  const q = filters.search.trim().toLocaleLowerCase();
  const yesNo = (filter: string, value: boolean) => !filter || (filter === 'yes' ? value : !value);
  const inRange = (value: number | undefined, min: string, max: string) => (value == null ? !min && !max : (!min || value >= Number(min)) && (!max || value <= Number(max)));
  return records.filter((r) => (!q || [r.sourceSequenceNumberNormalized, r.evaluationGrade, r.institutionName, r.institutionAddress, r.districtNameFromAddress, r.roadName, r.phone, r.fax, r.businessScope, r.intermediaryAssociation, r.responsiblePersonOrManagerName, r.responsiblePersonOrManagerEnglishName, r.companyUnifiedBusinessNumber, r.businessItemCode].filter(Boolean).join(' ').toLocaleLowerCase().includes(q))
    && (!filters.districtNameFromAddress || r.districtNameFromAddress === filters.districtNameFromAddress)
    && (!filters.roadName || r.roadName === filters.roadName)
    && (!filters.evaluationGrade || r.evaluationGrade === filters.evaluationGrade)
    && (!filters.evaluationGradeCategory || r.evaluationGradeCategory === filters.evaluationGradeCategory)
    && (!filters.businessScope || r.businessScope === filters.businessScope)
    && (!filters.businessScopeCategory || r.businessScopeCategory === filters.businessScopeCategory)
    && (!filters.intermediaryAssociation || r.intermediaryAssociation === filters.intermediaryAssociation)
    && (!filters.intermediaryAssociationCategory || r.intermediaryAssociationCategory === filters.intermediaryAssociationCategory)
    && yesNo(filters.hasPhone, r.hasPhone)
    && yesNo(filters.hasFax, r.hasFax)
    && yesNo(filters.hasIntermediaryAssociation, r.hasIntermediaryAssociation)
    && (!filters.businessItemCode || r.businessItemCode === filters.businessItemCode)
    && yesNo(filters.companyUnifiedBusinessNumberValidFormat, r.companyUnifiedBusinessNumberValidFormat)
    && (!filters.staffSizeCategory || r.staffSizeCategory === filters.staffSizeCategory)
    && inRange(r.professionalStaffCount, filters.professionalStaffMin, filters.professionalStaffMax)
    && inRange(r.bilingualEmploymentPermitStaffCount, filters.bilingualStaffMin, filters.bilingualStaffMax)
    && inRange(r.employeeCount, filters.employeeMin, filters.employeeMax)
    && yesNo(filters.hasBilingualEmploymentPermitStaff, r.hasBilingualEmploymentPermitStaff)
    && (!filters.locationPrecision || r.locationPrecision === filters.locationPrecision)
    && (!filters.geocodingStatus || (r.geocodingStatus as EmploymentAgencyGeocodingStatus) === filters.geocodingStatus));
}
