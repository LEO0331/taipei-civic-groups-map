import { DISTRICTS } from './civicGroups';
import type { SpecificPetBusinessEvaluationFilters, SpecificPetBusinessEvaluationGradeCategory, SpecificPetBusinessEvaluationRecord, SpecificPetBusinessEvaluationResourceType, SpecificPetBusinessEvaluationSummary, SpecificPetBusinessItemCategory, SpecificPetBusinessLocationPrecision } from '../types';

const missing = new Set(['', '-', '--', 'nan', 'null', '尚無資料']);
export const cleanPetBusinessText = (raw: unknown) => {
  const text = String(raw ?? '').replace(/\u3000/g, ' ').trim().replace(/\s+/g, ' ');
  return missing.has(text.toLowerCase()) ? undefined : text;
};
const normalize = (raw: unknown) => cleanPetBusinessText(raw)?.replaceAll('台', '臺').replace(/\s+/g, '').toLocaleLowerCase();

export function parseEvaluationResourceYear(resourceName: string): { sourceEvaluationYearRoc?: number; sourceEvaluationYearGregorian?: number; resourceType: SpecificPetBusinessEvaluationResourceType; warning?: string } {
  const roc = Number(resourceName.match(/(\d{3})年度/)?.[1]);
  if (!Number.isFinite(roc)) return { resourceType: 'unknown_year', warning: 'Unknown evaluation year' };
  return { sourceEvaluationYearRoc: roc, sourceEvaluationYearGregorian: roc + 1911, resourceType: roc === 114 ? 'evaluation_114' : roc === 113 ? 'evaluation_113' : roc === 111 ? 'evaluation_111' : 'unknown_year' };
}
export const parseCityName = (raw: unknown) => {
  const cityName = cleanPetBusinessText(raw)?.replaceAll('台北市', '臺北市');
  return { cityName, cityNameNormalized: normalize(cityName), warning: cityName && cityName !== '臺北市' ? 'Non-Taipei city' : undefined };
};
export const parseTaipeiDistrictName = (raw: unknown) => {
  const districtName = cleanPetBusinessText(raw)?.replaceAll('台', '臺');
  return { districtName, districtNameNormalized: normalize(districtName), isTaipeiDistrict: Boolean(districtName && DISTRICTS.includes(districtName)), warning: districtName && !DISTRICTS.includes(districtName) ? 'Unknown Taipei district' : undefined };
};
export const parsePostalCode = (raw: unknown) => {
  const postalCode = cleanPetBusinessText(raw), postalCodeNormalized = postalCode?.replace(/\D/g, '');
  return { postalCode, postalCodeNormalized, validFormat: Boolean(postalCodeNormalized && /^\d{3}(\d{2})?$/.test(postalCodeNormalized)), warning: postalCode && !/^\d{3}(\d{2})?$/.test(postalCodeNormalized ?? '') ? 'Invalid postal code' : undefined };
};
export const parseSpecificPetBusinessLicenseNumber = (raw: unknown) => {
  const text = cleanPetBusinessText(raw);
  const specificPetBusinessLicenseNumber = text?.match(/[A-Z]?\d{3,}[A-Z0-9-]*/i)?.[0] ?? text;
  const specificPetBusinessLicenseNumberNormalized = specificPetBusinessLicenseNumber?.replace(/\s+/g, '');
  return { specificPetBusinessLicenseNumber, specificPetBusinessLicenseNumberNormalized, licenseNumberSequence: specificPetBusinessLicenseNumber?.match(/(\d+)$/)?.[1] ? Number(specificPetBusinessLicenseNumber.match(/(\d+)$/)![1]) : undefined, warning: specificPetBusinessLicenseNumber ? undefined : 'Missing license number' };
};
export function parseLicenseExpirationDate(raw: unknown) {
  const licenseExpirationDateRaw = cleanPetBusinessText(raw);
  const m = licenseExpirationDateRaw?.match(/(\d{2,4})[./年-](\d{1,2})[./月-](\d{1,2})/);
  if (!licenseExpirationDateRaw) return {};
  if (!m) return { licenseExpirationDateRaw, warning: 'Invalid or partial license expiration date' };
  const y = Number(m[1]), year = y < 1911 ? y + 1911 : y, month = Number(m[2]), day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return { licenseExpirationDateRaw, warning: 'Invalid license expiration date' };
  const iso = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  return { licenseExpirationDateRaw, licenseExpirationDateParsed: iso, licenseExpirationGregorianDate: iso, licenseExpirationRocDate: `${year - 1911}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` };
}
export const parseSpecificPetBusinessCompanyName = (raw: unknown) => {
  const registeredCompanyName = cleanPetBusinessText(raw);
  return { registeredCompanyName, registeredCompanyNameNormalized: normalize(registeredCompanyName), warning: registeredCompanyName ? undefined : 'Missing company name' };
};
export const parseSpecificPetBusinessPhone = (raw: unknown) => {
  const phone = cleanPetBusinessText(raw)?.replace(/[()（）\s]/g, '');
  return { phone, phoneNormalized: phone?.replace(/[^\d#分機-]/g, ''), warning: phone && !/[0-9]/.test(phone) ? 'Invalid phone' : undefined };
};
export function parseSpecificPetBusinessAddress(raw: unknown) {
  const address = cleanPetBusinessText(raw), normalizedAddress = address?.replaceAll('台北市', '臺北市').replaceAll('台', '臺');
  const addressBody = normalizedAddress?.replace(/^.*?(?:區)/, '');
  const roadName = addressBody?.match(/([一-龥]+?(?:路|街|大道)(?:[一二三四五六七八九十\d]+段)?)/)?.[1];
  return { address, addressNormalized: normalize(normalizedAddress), roadName, addressLooksLikeMultiFloorOrUnit: Boolean(address && /樓|之|室|地下|B1|F/i.test(address)), warning: address ? undefined : 'Missing address' };
}
export const classifySpecificPetBusinessEvaluationGrade = (raw: string | undefined): SpecificPetBusinessEvaluationGradeCategory => {
  const text = raw?.trim() ?? '';
  if (!text) return 'unknown';
  if (text.includes('優')) return 'excellent';
  if (text.includes('良') || text.includes('甲')) return 'good';
  if (text.includes('乙') || text.includes('合格') || text.includes('通過')) return 'passed';
  if (text.includes('丙') || text.includes('丁') || text.includes('待改善') || text.includes('改善') || text.includes('不合格')) return 'needs_improvement';
  if (text.includes('未評') || text === '無') return 'not_rated';
  return 'other';
};
export const classifySpecificPetBusinessItem = (raw: string | undefined): SpecificPetBusinessItemCategory => {
  const text = raw?.trim() ?? '';
  if (!text) return 'unknown';
  if (text.includes('買賣') || text.includes('販賣')) return 'sale';
  if (text.includes('繁殖')) return 'breeding';
  if (text.includes('寄養') || text.includes('住宿')) return 'boarding';
  if (text.includes('零售')) return 'retail';
  return 'other';
};
export function parseSpecificPetBusinessItems(raw: unknown) {
  const businessItemsRaw = cleanPetBusinessText(raw);
  const businessItems = businessItemsRaw?.split(/[、,\/；;]/).map((item) => cleanPetBusinessText(item)).filter(Boolean) as string[] | undefined;
  const items = businessItems?.length ? businessItems : businessItemsRaw ? [businessItemsRaw] : [];
  return { businessItemsRaw, businessItems: items, businessItemCategories: [...new Set(items.map(classifySpecificPetBusinessItem))], warning: items.length ? undefined : 'Missing business items' };
}
export function parseSpecificPetBusinessEvaluationGrade(raw: unknown) {
  const evaluationGradeRaw = cleanPetBusinessText(raw), evaluationGrade = evaluationGradeRaw;
  const evaluationGradeCategory = classifySpecificPetBusinessEvaluationGrade(evaluationGrade);
  return { evaluationGradeRaw, evaluationGrade, evaluationGradeNormalized: normalize(evaluationGrade), evaluationGradeCategory, warning: evaluationGradeCategory === 'unknown' || evaluationGradeCategory === 'other' ? 'Unknown evaluation grade' : undefined };
}
export const createSpecificPetBusinessExternalMapQuery = (record: { registeredCompanyName?: string; address?: string }) => cleanPetBusinessText([record.address, record.registeredCompanyName].filter(Boolean).join(' '));
export function petBusinessLocationPrecision(record: { districtName?: string; address?: string }): SpecificPetBusinessLocationPrecision {
  if (record.districtName && record.address) return 'district_address';
  if (record.address) return 'address_only_unparsed_district';
  if (record.districtName) return 'district_only';
  return 'missing';
}

const group = <T extends string | number>(records: SpecificPetBusinessEvaluationRecord[], key: (record: SpecificPetBusinessEvaluationRecord) => T | undefined) => records.reduce((map, record) => { const value = key(record); if (value !== undefined) map.set(value, [...(map.get(value) ?? []), record]); return map; }, new Map<T, SpecificPetBusinessEvaluationRecord[]>());
const rows = <T extends string | number>(records: SpecificPetBusinessEvaluationRecord[], field: (record: SpecificPetBusinessEvaluationRecord) => T | undefined) => [...group(records, field)].map(([key, items]) => ({ key, items })).sort((a, b) => b.items.length - a.items.length || String(a.key).localeCompare(String(b.key), 'zh-Hant'));
const dupWithinYear = (records: SpecificPetBusinessEvaluationRecord[], field: (record: SpecificPetBusinessEvaluationRecord) => string | undefined) => records.length - new Set(records.map((r) => `${r.sourceEvaluationYearRoc}|${field(r) ?? ''}`).filter((v) => !v.endsWith('|'))).size;

export function buildSpecificPetBusinessEvaluationSummary(records: SpecificPetBusinessEvaluationRecord[]): SpecificPetBusinessEvaluationSummary {
  const latest = Math.max(...records.map((r) => r.sourceEvaluationYearRoc), 0);
  const latestRows = records.filter((r) => r.sourceEvaluationYearRoc === latest);
  const latestCount = (items: SpecificPetBusinessEvaluationRecord[]) => items.filter((r) => r.sourceEvaluationYearRoc === latest).length;
  return {
    totalRecords: records.length,
    latestEvaluationYearRoc: latest || undefined,
    latestEvaluationYearGregorian: latest ? latest + 1911 : undefined,
    evaluationYearCount: group(records, (r) => r.sourceEvaluationYearRoc).size,
    districtCount: group(records, (r) => r.districtName).size,
    uniqueLicenseNumberCount: new Set(records.map((r) => r.specificPetBusinessLicenseNumberNormalized).filter(Boolean)).size,
    uniqueCompanyNameCount: new Set(records.map((r) => r.registeredCompanyNameNormalized).filter(Boolean)).size,
    uniqueAddressCount: new Set(records.map((r) => r.addressNormalized).filter(Boolean)).size,
    uniquePhoneCount: new Set(records.map((r) => r.phoneNormalized).filter(Boolean)).size,
    recordsInLatestYear: latestRows.length,
    recordsWithLicenseExpirationDate: records.filter((r) => r.licenseExpirationDateRaw).length,
    recordsWithPhone: records.filter((r) => r.hasPhone).length,
    recordsWithParsedDistrict: records.filter((r) => r.isTaipeiDistrict).length,
    recordsWithApproximateGeocodedCoordinates: records.filter((r) => r.coordinateSource === 'geocoded').length,
    byEvaluationYear: rows(records, (r) => r.sourceEvaluationYearRoc).map(({ key, items }) => ({ sourceEvaluationYearRoc: Number(key), sourceEvaluationYearGregorian: Number(key) + 1911, count: items.length, districtCount: group(items, (r) => r.districtName).size, uniqueCompanyNameCount: new Set(items.map((r) => r.registeredCompanyNameNormalized).filter(Boolean)).size })).sort((a, b) => b.sourceEvaluationYearRoc - a.sourceEvaluationYearRoc),
    byDistrict: rows(records, (r) => r.districtName).map(({ key, items }) => ({ districtName: String(key), count: items.length, latestYearCount: latestCount(items), uniqueCompanyNameCount: new Set(items.map((r) => r.registeredCompanyNameNormalized).filter(Boolean)).size, uniqueLicenseNumberCount: new Set(items.map((r) => r.specificPetBusinessLicenseNumberNormalized).filter(Boolean)).size })),
    byEvaluationGrade: rows(records, (r) => r.evaluationGrade ?? r.evaluationGradeCategory).map(({ key, items }) => ({ evaluationGrade: String(key), evaluationGradeCategory: items[0].evaluationGradeCategory, count: items.length, latestYearCount: latestCount(items) })),
    byBusinessItemCategory: rows(records.flatMap((record) => record.businessItemCategories.map((category) => ({ ...record, businessItemCategories: [category] }))), (r) => r.businessItemCategories[0]).map(({ key, items }) => ({ businessItemCategory: key as any, count: items.length, latestYearCount: latestCount(items) })),
    yearComparison: rows(records, (r) => r.sourceEvaluationYearRoc).map(({ key, items }) => ({ sourceEvaluationYearRoc: Number(key), sourceEvaluationYearGregorian: Number(key) + 1911, totalRecords: items.length, byEvaluationGrade: rows(items, (r) => r.evaluationGrade ?? r.evaluationGradeCategory).map(({ key: grade, items: gradeItems }) => ({ evaluationGrade: String(grade), count: gradeItems.length })) })).sort((a, b) => b.sourceEvaluationYearRoc - a.sourceEvaluationYearRoc),
    dataQuality: {
      missingCityNameCount: records.filter((r) => !r.cityName).length,
      nonTaipeiCityNameCount: records.filter((r) => r.cityNameNormalized !== '臺北市'.toLocaleLowerCase()).length,
      missingDistrictCount: records.filter((r) => !r.districtName).length,
      unknownDistrictCount: records.filter((r) => !r.isTaipeiDistrict).length,
      missingPostalCodeCount: records.filter((r) => !r.postalCode).length,
      invalidPostalCodeCount: records.filter((r) => r.postalCode && !r.postalCodeValidFormat).length,
      missingLicenseNumberCount: records.filter((r) => !r.specificPetBusinessLicenseNumber).length,
      duplicateLicenseNumberWithinSameYearCount: dupWithinYear(records, (r) => r.specificPetBusinessLicenseNumberNormalized),
      missingLicenseExpirationDateCount: records.filter((r) => !r.licenseExpirationDateRaw).length,
      invalidLicenseExpirationDateCount: records.filter((r) => r.licenseExpirationDateRaw && !r.licenseExpirationDateParsed).length,
      missingCompanyNameCount: records.filter((r) => !r.registeredCompanyName).length,
      duplicateCompanyNameWithinSameYearCount: dupWithinYear(records, (r) => r.registeredCompanyNameNormalized),
      missingPhoneCount: records.filter((r) => !r.phone).length,
      invalidPhoneCount: records.filter((r) => r.phone && !/[0-9]/.test(r.phone)).length,
      missingAddressCount: records.filter((r) => !r.address).length,
      duplicateAddressWithinSameYearCount: dupWithinYear(records, (r) => r.addressNormalized),
      missingBusinessItemsCount: records.filter((r) => !r.businessItems.length).length,
      unknownBusinessItemCategoryCount: records.filter((r) => r.businessItemCategories.includes('unknown')).length,
      missingEvaluationGradeCount: records.filter((r) => !r.evaluationGrade).length,
      unknownEvaluationGradeCount: records.filter((r) => r.evaluationGradeCategory === 'unknown' || r.evaluationGradeCategory === 'other').length,
      duplicateFallbackKeyCount: dupWithinYear(records, (r) => [r.registeredCompanyNameNormalized, r.addressNormalized, r.phoneNormalized].filter(Boolean).join('|')),
    },
  };
}

export function filterSpecificPetBusinessEvaluations(records: SpecificPetBusinessEvaluationRecord[], filters: SpecificPetBusinessEvaluationFilters, latestYear?: number) {
  const q = filters.search.trim().toLocaleLowerCase();
  const yesNo = (filter: string, value: boolean) => !filter || (filter === 'yes' ? value : !value);
  return records.filter((r) => (!q || [r.sourceEvaluationYearRoc, r.specificPetBusinessLicenseNumber, r.registeredCompanyName, r.districtName, r.postalCode, r.phone, r.address, r.businessItemsRaw, r.evaluationGrade].filter(Boolean).join(' ').toLocaleLowerCase().includes(q))
    && (!filters.evaluationYear || String(r.sourceEvaluationYearRoc) === filters.evaluationYear)
    && (!filters.latestYearOnly || r.sourceEvaluationYearRoc === latestYear)
    && (!filters.districtName || r.districtName === filters.districtName)
    && (!filters.evaluationGrade || r.evaluationGrade === filters.evaluationGrade)
    && (!filters.evaluationGradeCategory || r.evaluationGradeCategory === filters.evaluationGradeCategory)
    && (!filters.businessItem || r.businessItems.includes(filters.businessItem))
    && (!filters.businessItemCategory || r.businessItemCategories.includes(filters.businessItemCategory as any))
    && (!filters.licenseExpirationYear || r.licenseExpirationGregorianDate?.startsWith(filters.licenseExpirationYear))
    && yesNo(filters.hasPhone, r.hasPhone)
    && yesNo(filters.hasPostalCode, Boolean(r.postalCode))
    && yesNo(filters.postalCodeValidFormat, r.postalCodeValidFormat)
    && (!filters.locationPrecision || r.locationPrecision === filters.locationPrecision)
    && (!filters.geocodingStatus || r.geocodingStatus === filters.geocodingStatus));
}
