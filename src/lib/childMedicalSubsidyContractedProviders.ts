import { DISTRICTS } from './civicGroups';
import { cleanText, normalizeProviderName, parseHealthcareProviderPhone } from './contractedVaccinationMedicalProviders';
import type { ChildMedicalSubsidyContractedProviderFilters, ChildMedicalSubsidyContractedProviderRecord, ChildMedicalSubsidyContractedProviderSummary, MedicalProviderPhoneType } from '../types';

export const parseIntegerText = (raw: unknown) => {
  const text = cleanText(raw)?.replaceAll(',', '');
  if (!text) return undefined;
  const value = Number(text);
  return Number.isInteger(value) ? value : undefined;
};

export const normalizeText = (raw: unknown) => cleanText(raw)?.toLocaleLowerCase();
export const parseProviderCode = (raw: unknown) => cleanText(raw);

export function parseAdministrativeArea(raw: unknown) {
  const administrativeAreaRaw = cleanText(raw);
  const administrativeArea = administrativeAreaRaw;
  const administrativeAreaNormalized = administrativeAreaRaw;
  const taipeiDistrict = DISTRICTS.find((district) => district === administrativeAreaRaw);
  return {
    administrativeAreaRaw,
    administrativeArea,
    administrativeAreaNormalized,
    isTaipeiDistrict: Boolean(taipeiDistrict),
    taipeiDistrict,
    outsideTaipeiArea: taipeiDistrict ? undefined : administrativeAreaRaw,
    areaDisplayName: administrativeAreaRaw,
    warning: administrativeAreaRaw ? undefined : 'Missing administrative area',
  };
}

export function parseMedicalProviderAddress(raw: unknown) {
  const address = cleanText(raw);
  if (!address) return {};
  const addressNormalized = address.replaceAll('台北市', '臺北市');
  const districtFromAddress = DISTRICTS.find((district) => addressNormalized.includes(district));
  const afterDistrict = districtFromAddress ? addressNormalized.slice(addressNormalized.indexOf(districtFromAddress) + districtFromAddress.length) : addressNormalized;
  const roadName = afterDistrict.match(/([^0-9\s,，]+?(?:大道|路|街))(?:([0-9一二三四五六七八九十]+段))?/)?.slice(1, 3).filter(Boolean).join('');
  return { address, addressNormalized, districtFromAddress, roadName, warning: districtFromAddress ? undefined : 'District not parsed from address' };
}

export function reconcileProviderArea({ isTaipeiDistrict, taipeiDistrict, districtFromAddress }: { isTaipeiDistrict: boolean; taipeiDistrict?: string; districtFromAddress?: string }) {
  const districtMismatch = Boolean(isTaipeiDistrict && taipeiDistrict && districtFromAddress && taipeiDistrict !== districtFromAddress);
  return { districtMismatch, warning: districtMismatch ? `Administrative area and address mismatch: ${taipeiDistrict} / ${districtFromAddress}` : undefined };
}

export function parseMedicalProviderPhone(raw: unknown) {
  return parseHealthcareProviderPhone(raw) as { phone?: string; phoneDisplay?: string; phoneDialHref?: string; phoneType: MedicalProviderPhoneType; warning?: string };
}

export function createChildMedicalProviderMapQuery(record: { providerName?: string; address?: string }) {
  return cleanText([record.address, record.providerName].filter(Boolean).join(' '));
}

function countBy<T extends string>(values: T[]) {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

const duplicateCount = (values: Array<string | undefined>) => countBy(values.filter(Boolean) as string[]).filter((item) => item.count > 1).length;

export function buildChildMedicalSubsidyContractedProviderSummary(records: ChildMedicalSubsidyContractedProviderRecord[]): ChildMedicalSubsidyContractedProviderSummary {
  const administrativeAreas = countBy(records.flatMap((record) => record.areaDisplayName ?? record.administrativeArea ?? []));
  const taipeiDistricts = countBy(records.flatMap((record) => record.taipeiDistrict ?? []));
  return {
    totalRecords: records.length,
    uniqueProviderNameCount: new Set(records.map((record) => record.providerNameNormalized ?? record.providerName)).size,
    uniqueProviderCodeCount: new Set(records.flatMap((record) => record.providerCodeNormalized ?? [])).size,
    uniqueAddressCount: new Set(records.flatMap((record) => record.addressNormalized ?? [])).size,
    uniquePhoneCount: new Set(records.flatMap((record) => record.phone ?? [])).size,
    taipeiProviderCount: records.filter((record) => record.isTaipeiDistrict).length,
    outsideTaipeiProviderCount: records.filter((record) => !record.isTaipeiDistrict).length,
    taipeiDistrictCount: taipeiDistricts.length,
    administrativeAreaCount: administrativeAreas.length,
    recordsWithPhone: records.filter((record) => record.hasPhone).length,
    recordsWithAddress: records.filter((record) => record.address).length,
    recordsWithParsedDistrictFromAddress: records.filter((record) => record.districtFromAddress).length,
    recordsWithDistrictMismatch: records.filter((record) => record.districtMismatch).length,
    recordsWithParsedRoadName: records.filter((record) => record.roadName).length,
    byAdministrativeArea: administrativeAreas.map(({ key: administrativeArea, count }) => {
      const rows = records.filter((record) => (record.areaDisplayName ?? record.administrativeArea) === administrativeArea);
      return { administrativeArea, providerCount: count, isTaipeiDistrict: rows.some((record) => record.isTaipeiDistrict), uniqueAddressCount: new Set(rows.flatMap((record) => record.addressNormalized ?? [])).size, uniquePhoneCount: new Set(rows.flatMap((record) => record.phone ?? [])).size };
    }),
    byTaipeiDistrict: taipeiDistricts.map(({ key: district, count }) => {
      const rows = records.filter((record) => record.taipeiDistrict === district);
      return { district, providerCount: count, uniqueAddressCount: new Set(rows.flatMap((record) => record.addressNormalized ?? [])).size, uniquePhoneCount: new Set(rows.flatMap((record) => record.phone ?? [])).size };
    }),
    outsideTaipeiAreas: countBy(records.flatMap((record) => record.outsideTaipeiArea ?? [])).map(({ key: area, count }) => ({ area, providerCount: count })),
    byRoadName: countBy(records.flatMap((record) => record.roadName ?? [])).map(({ key: roadName, count }) => ({ roadName, count })),
    phoneQuality: {
      hasPhone: records.filter((record) => record.hasPhone).length,
      missingPhone: records.filter((record) => record.phoneType === 'missing').length,
      taipeiLandline: records.filter((record) => record.phoneType === 'taipei_landline').length,
      otherLandline: records.filter((record) => record.phoneType === 'other_landline').length,
      mobile: records.filter((record) => record.phoneType === 'mobile').length,
      extension: records.filter((record) => record.phoneType === 'extension').length,
      multiple: records.filter((record) => record.phoneType === 'multiple').length,
      unknown: records.filter((record) => record.phoneType === 'unknown').length,
    },
    dataQuality: {
      duplicateProviderCodeCount: duplicateCount(records.map((record) => record.providerCodeNormalized)),
      duplicateAddressCount: duplicateCount(records.map((record) => record.addressNormalized)),
      duplicatePhoneCount: duplicateCount(records.map((record) => record.phone)),
      districtFromAddressParsed: records.filter((record) => record.districtFromAddress).length,
      districtMismatch: records.filter((record) => record.districtMismatch).length,
      outsideTaipeiAreaCount: new Set(records.flatMap((record) => record.outsideTaipeiArea ?? [])).size,
      missingAddress: records.filter((record) => !record.address).length,
    },
  };
}

export function filterChildMedicalSubsidyContractedProviders(records: ChildMedicalSubsidyContractedProviderRecord[], filters: ChildMedicalSubsidyContractedProviderFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((record) => (!query || [record.providerName, record.providerCode, record.administrativeArea, record.address, record.roadName, record.phone].filter(Boolean).join(' ').toLocaleLowerCase().includes(query))
    && (!filters.administrativeArea || record.areaDisplayName === filters.administrativeArea)
    && (!filters.taipeiDistrict || record.taipeiDistrict === filters.taipeiDistrict)
    && (!filters.outsideTaipeiArea || record.outsideTaipeiArea === filters.outsideTaipeiArea)
    && (!filters.isTaipeiDistrict || (filters.isTaipeiDistrict === 'yes' ? record.isTaipeiDistrict : !record.isTaipeiDistrict))
    && (!filters.roadName || record.roadName === filters.roadName)
    && (!filters.phoneType || record.phoneType === filters.phoneType)
    && (!filters.hasPhone || (filters.hasPhone === 'yes' ? record.hasPhone : !record.hasPhone))
    && (!filters.districtMismatch || (filters.districtMismatch === 'yes' ? record.districtMismatch : !record.districtMismatch))
    && (!filters.duplicateProviderCode || (filters.duplicateProviderCode === 'yes' ? record.duplicateProviderCode : !record.duplicateProviderCode)));
}

export { cleanText, normalizeProviderName };
