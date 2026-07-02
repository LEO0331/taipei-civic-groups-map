import { cleanText, normalizeText } from './disabilityEmploymentResourceMap';
import type { VeterinarianPracticeLicenseNumberFormat, VeterinarianProfessionalRegistryFilters, VeterinarianProfessionalRegistryRecord, VeterinarianProfessionalRegistrySummary } from '../types';

export function parseVeterinarianCityCode(raw: unknown) {
  const cityCode = cleanText(raw), cityCodeNormalized = cityCode?.replace(/\s+/g, '');
  return { cityCode, cityCodeNormalized, warning: cityCodeNormalized && cityCodeNormalized !== '63000' ? 'Unexpected city code' : undefined };
}

export function parseVeterinarianCityCounty(raw: unknown) {
  const cityCounty = cleanText(raw), cityCountyNormalized = cityCounty?.replaceAll('台北市', '臺北市');
  const cityCountyIsTaipei = cityCountyNormalized === '臺北市';
  return { cityCounty, cityCountyNormalized, cityCountyIsTaipei, warning: cityCounty && !cityCountyIsTaipei ? 'Non-Taipei city/county' : undefined };
}

export const normalizeVeterinarianName = (raw: unknown) => normalizeText(raw);
export const createAnimalHospitalMatchKey = (raw: unknown) => cleanText(raw)?.replaceAll('台', '臺').replace(/\s+/g, '').toLocaleLowerCase();

export function parseVeterinarianPracticeLicenseNumber(raw: unknown) {
  const practiceLicenseNumber = cleanText(raw), practiceLicenseNumberNormalized = practiceLicenseNumber?.replace(/\s+/g, '');
  let practiceLicenseNumberFormat: VeterinarianPracticeLicenseNumberFormat = 'missing';
  if (practiceLicenseNumberNormalized) {
    practiceLicenseNumberFormat = /北市獸師執字第.+號/.test(practiceLicenseNumberNormalized) ? 'taipei_veterinarian_practice_license'
      : (/獸師|獸醫/.test(practiceLicenseNumberNormalized) ? 'other_veterinarian_license'
        : (/^\d+$/.test(practiceLicenseNumberNormalized) ? 'numeric_only'
          : (/[\p{Script=Han}A-Za-z0-9]/u.test(practiceLicenseNumberNormalized) ? 'mixed' : 'unknown')));
  }
  const practiceLicenseIssuedCityCodeCandidate = practiceLicenseNumberFormat === 'taipei_veterinarian_practice_license' ? '北市' : undefined;
  return { practiceLicenseNumber, practiceLicenseNumberNormalized, practiceLicenseNumberFormat, practiceLicenseIssuedCityCodeCandidate };
}

function countBy<T extends string>(values: T[]) {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key, 'zh-Hant'));
}

const duplicateRowCount = (values: Array<string | undefined>) => countBy(values.filter(Boolean) as string[]).filter((item) => item.count > 1).reduce((sum, item) => sum + item.count - 1, 0);

export function buildVeterinarianProfessionalRegistrySummary(records: VeterinarianProfessionalRegistryRecord[]): VeterinarianProfessionalRegistrySummary {
  const institutions = countBy(records.flatMap((record) => record.serviceVeterinaryInstitutionNameNormalized ?? []))
    .map(({ key: serviceVeterinaryInstitutionName, count }) => {
      const rows = records.filter((record) => record.serviceVeterinaryInstitutionNameNormalized === serviceVeterinaryInstitutionName);
      return { serviceVeterinaryInstitutionName, veterinarianCount: count, uniquePracticeLicenseNumberCount: new Set(rows.flatMap((record) => record.practiceLicenseNumberNormalized ?? [])).size };
    });
  return {
    totalRecords: records.length,
    uniqueVeterinarianNameCount: new Set(records.flatMap((record) => record.veterinarianNameNormalized ?? [])).size,
    uniquePracticeLicenseNumberCount: new Set(records.flatMap((record) => record.practiceLicenseNumberNormalized ?? [])).size,
    uniqueServiceVeterinaryInstitutionNameCount: new Set(records.flatMap((record) => record.serviceVeterinaryInstitutionNameNormalized ?? [])).size,
    cityCodeCount: new Set(records.flatMap((record) => record.cityCodeNormalized ?? [])).size,
    cityCountyCount: new Set(records.flatMap((record) => record.cityCountyNormalized ?? [])).size,
    recordsWithTaipeiCityCounty: records.filter((record) => record.cityCountyIsTaipei).length,
    byCityCounty: countBy(records.flatMap((record) => record.cityCountyNormalized ?? [])).map(({ key: cityCounty, count }) => ({ cityCounty, count })),
    byServiceVeterinaryInstitution: institutions,
    byLicenseNumberFormat: countBy(records.map((record) => record.practiceLicenseNumberFormat)).map(({ key: practiceLicenseNumberFormat, count }) => ({ practiceLicenseNumberFormat, count })),
    topServiceVeterinaryInstitutions: institutions.slice(0, 30),
    dataQuality: {
      missingCityCodeCount: records.filter((record) => !record.cityCode).length,
      missingCityCountyCount: records.filter((record) => !record.cityCounty).length,
      missingVeterinarianNameCount: records.filter((record) => !record.veterinarianName).length,
      missingPracticeLicenseNumberCount: records.filter((record) => !record.practiceLicenseNumber).length,
      missingServiceVeterinaryInstitutionNameCount: records.filter((record) => !record.serviceVeterinaryInstitutionName).length,
      duplicateVeterinarianNameCount: duplicateRowCount(records.map((record) => record.veterinarianNameNormalized)),
      duplicatePracticeLicenseNumberCount: duplicateRowCount(records.map((record) => record.practiceLicenseNumberNormalized)),
      duplicateVeterinarianNameInstitutionPairCount: duplicateRowCount(records.map((record) => [record.veterinarianNameNormalized, record.serviceVeterinaryInstitutionNameNormalized].filter(Boolean).join('|'))),
      duplicateFallbackKeyCount: duplicateRowCount(records.map((record) => [record.practiceLicenseNumberNormalized, record.veterinarianNameNormalized, record.serviceVeterinaryInstitutionNameNormalized].filter(Boolean).join('|'))),
      nonTaipeiCityCountyCount: records.filter((record) => record.cityCounty && !record.cityCountyIsTaipei).length,
    },
  };
}

export function filterVeterinarianProfessionalRegistry(records: VeterinarianProfessionalRegistryRecord[], filters: VeterinarianProfessionalRegistryFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((record) => (!query || [record.cityCode, record.cityCounty, record.veterinarianName, record.practiceLicenseNumber, record.serviceVeterinaryInstitutionName].filter(Boolean).join(' ').toLocaleLowerCase().includes(query))
    && (!filters.cityCode || record.cityCodeNormalized === filters.cityCode)
    && (!filters.cityCounty || record.cityCountyNormalized === filters.cityCounty)
    && (!filters.licenseNumberFormat || record.practiceLicenseNumberFormat === filters.licenseNumberFormat)
    && (!filters.serviceVeterinaryInstitutionName || record.serviceVeterinaryInstitutionNameNormalized === filters.serviceVeterinaryInstitutionName)
    && (!filters.cityCountyIsTaipei || (filters.cityCountyIsTaipei === 'yes' ? record.cityCountyIsTaipei : !record.cityCountyIsTaipei)));
}

export { cleanText, normalizeText };
