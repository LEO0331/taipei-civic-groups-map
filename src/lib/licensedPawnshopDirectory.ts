import { cleanText, normalizeText, parseIntegerText, parseResourceAddress } from './disabilityEmploymentResourceMap';
import type { LicensedPawnshopDirectoryFilters, LicensedPawnshopDirectoryRecord, LicensedPawnshopDirectorySummary, PawnshopLicenseNumberFormat } from '../types';

export const normalizePawnshopName = (raw: unknown) => cleanText(raw)?.replace(/\s+/g, ' ').toLocaleLowerCase();

export function parsePawnshopLicenseNumber(raw: unknown) {
  const licenseNumber = cleanText(raw), licenseNumberNormalized = licenseNumber?.replace(/\s/g, '');
  let licenseNumberFormat: PawnshopLicenseNumberFormat = 'missing';
  if (licenseNumberNormalized) licenseNumberFormat = /^\d+$/.test(licenseNumberNormalized) ? 'simple_numeric' : (/^[\d-]+$/.test(licenseNumberNormalized) ? 'numeric_with_dash' : 'mixed');
  return { licenseNumber, licenseNumberNormalized, licenseNumberFormat, warning: licenseNumberFormat === 'mixed' ? 'Unusual license number format' : undefined };
}

export function parseCityCounty(raw: unknown) {
  const cityCounty = cleanText(raw), cityCountyNormalized = cityCounty?.replaceAll('台北市', '臺北市');
  const cityCountyIsTaipei = cityCountyNormalized === '臺北市';
  return { cityCounty, cityCountyNormalized, cityCountyIsTaipei, warning: cityCounty && !cityCountyIsTaipei ? 'Non-Taipei city/county' : undefined };
}

export function parsePawnshopBusinessAddress(raw: unknown) {
  const address = parseResourceAddress(raw);
  return { businessAddress: address.address, businessAddressNormalized: address.addressNormalized, districtFromAddress: address.districtFromAddress, isTaipeiDistrict: address.isTaipeiDistrict, taipeiDistrict: address.taipeiDistrict, outsideTaipeiArea: address.outsideTaipeiArea, roadName: address.roadName, warning: address.warning };
}

export const createPawnshopMapQuery = (record: { pawnshopName?: string; businessAddress?: string }) => cleanText([record.businessAddress, record.pawnshopName].filter(Boolean).join(' '));

function countBy<T extends string>(values: T[]) {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}
const duplicateCount = (values: Array<string | undefined>) => countBy(values.filter(Boolean) as string[]).filter((item) => item.count > 1).length;

export function buildLicensedPawnshopDirectorySummary(records: LicensedPawnshopDirectoryRecord[]): LicensedPawnshopDirectorySummary {
  const districts = countBy(records.flatMap((record) => record.taipeiDistrict ?? []));
  return {
    totalRecords: records.length,
    uniqueLicenseNumberCount: new Set(records.flatMap((record) => record.licenseNumberNormalized ?? [])).size,
    uniquePawnshopNameCount: new Set(records.map((record) => record.pawnshopNameNormalized ?? record.pawnshopName)).size,
    uniqueBusinessAddressCount: new Set(records.flatMap((record) => record.businessAddressNormalized ?? [])).size,
    cityCountyCount: new Set(records.flatMap((record) => record.cityCountyNormalized ?? [])).size,
    taipeiDistrictCount: districts.length,
    recordsWithAddress: records.filter((record) => record.businessAddress).length,
    recordsWithParsedDistrictFromAddress: records.filter((record) => record.districtFromAddress).length,
    recordsWithCityCountyTaipei: records.filter((record) => record.cityCountyIsTaipei).length,
    byDistrict: districts.map(({ key: district, count }) => {
      const rows = records.filter((record) => record.taipeiDistrict === district);
      return { district, pawnshopCount: count, uniqueAddressCount: new Set(rows.flatMap((record) => record.businessAddressNormalized ?? [])).size, uniqueLicenseNumberCount: new Set(rows.flatMap((record) => record.licenseNumberNormalized ?? [])).size };
    }),
    byRoadName: countBy(records.flatMap((record) => record.roadName ?? [])).map(({ key: roadName, count }) => ({ roadName, count })),
    byLicenseNumberFormat: countBy(records.map((record) => record.licenseNumberFormat)).map(({ key: licenseNumberFormat, count }) => ({ licenseNumberFormat, count })),
    byCityCounty: countBy(records.flatMap((record) => record.cityCountyNormalized ?? [])).map(({ key: cityCounty, count }) => ({ cityCounty, count })),
    dataQuality: {
      missingLicenseNumberCount: records.filter((record) => !record.licenseNumber).length,
      missingPawnshopNameCount: records.filter((record) => !record.pawnshopName).length,
      missingBusinessAddressCount: records.filter((record) => !record.businessAddress).length,
      unparsedAddressDistrictCount: records.filter((record) => record.businessAddress && !record.districtFromAddress).length,
      duplicateLicenseNumberCount: duplicateCount(records.map((record) => record.licenseNumberNormalized)),
      duplicatePawnshopNameCount: duplicateCount(records.map((record) => record.pawnshopNameNormalized)),
      duplicateBusinessAddressCount: duplicateCount(records.map((record) => record.businessAddressNormalized)),
      duplicateFallbackKeyCount: duplicateCount(records.map((record) => [record.licenseNumberNormalized, record.pawnshopNameNormalized, record.businessAddressNormalized].filter(Boolean).join('|'))),
      nonTaipeiCityCountyCount: records.filter((record) => record.cityCounty && !record.cityCountyIsTaipei).length,
    },
  };
}

export function filterLicensedPawnshops(records: LicensedPawnshopDirectoryRecord[], filters: LicensedPawnshopDirectoryFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((record) => (!query || [record.licenseNumber, record.pawnshopName, record.businessAddress, record.roadName, record.cityCounty].filter(Boolean).join(' ').toLocaleLowerCase().includes(query))
    && (!filters.district || record.taipeiDistrict === filters.district)
    && (!filters.cityCounty || record.cityCountyNormalized === filters.cityCounty)
    && (!filters.licenseNumberFormat || record.licenseNumberFormat === filters.licenseNumberFormat)
    && (!filters.roadName || record.roadName === filters.roadName)
    && (!filters.cityCountyIsTaipei || (filters.cityCountyIsTaipei === 'yes' ? record.cityCountyIsTaipei : !record.cityCountyIsTaipei))
    && (!filters.addressParsed || (filters.addressParsed === 'yes' ? Boolean(record.districtFromAddress) : !record.districtFromAddress)));
}

export { cleanText, normalizeText, parseIntegerText };
