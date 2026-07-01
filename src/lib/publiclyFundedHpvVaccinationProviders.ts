import { DISTRICTS } from './civicGroups';
import { cleanText, normalizeProviderName, parseHealthcareProviderPhone } from './contractedVaccinationMedicalProviders';
import type { MedicalProviderPhoneType, PubliclyFundedHpvVaccinationProviderFilters, PubliclyFundedHpvVaccinationProviderRecord, PubliclyFundedHpvVaccinationProviderSummary } from '../types';

export const TAIPEI_DISTRICT_CODE_TO_NAME: Record<string, string> = {
  '63000010': '松山區', '63000020': '信義區', '63000030': '大安區', '63000040': '中山區',
  '63000050': '中正區', '63000060': '大同區', '63000070': '萬華區', '63000080': '文山區',
  '63000090': '南港區', '63000100': '內湖區', '63000110': '士林區', '63000120': '北投區',
};
export const parseIntegerText = (raw: unknown) => {
  const text = cleanText(raw)?.replaceAll(',', '');
  if (!text) return undefined;
  const value = Number(text);
  return Number.isInteger(value) ? value : undefined;
};
export const normalizeText = (raw: unknown) => cleanText(raw)?.toLocaleLowerCase();

export function parseTaipeiDistrictCode(raw: unknown) {
  const districtCodeRaw = cleanText(raw);
  const districtCode = districtCodeRaw;
  const districtFromCode = districtCode ? TAIPEI_DISTRICT_CODE_TO_NAME[districtCode] : undefined;
  return { districtCodeRaw, districtCode, districtFromCode, warning: districtCode && !districtFromCode ? 'Unknown district code' : undefined };
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

export function reconcileDistrict({ districtFromCode, districtFromAddress }: { districtFromCode?: string; districtFromAddress?: string }) {
  const district = districtFromCode ?? districtFromAddress;
  const districtMismatch = Boolean(districtFromCode && districtFromAddress && districtFromCode !== districtFromAddress);
  return { district, districtMismatch, warning: districtMismatch ? 'District code and address mismatch' : undefined };
}

export function parseMedicalProviderPhone(raw: unknown) {
  return parseHealthcareProviderPhone(raw) as { phone?: string; phoneDisplay?: string; phoneDialHref?: string; phoneType: MedicalProviderPhoneType; warning?: string };
}

export function createHpvProviderMapQuery(record: { providerName?: string; address?: string }) {
  return cleanText([record.address, record.providerName].filter(Boolean).join(' '));
}

function countBy<T extends string>(values: T[]) {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

export function buildPubliclyFundedHpvVaccinationProviderSummary(records: PubliclyFundedHpvVaccinationProviderRecord[]): PubliclyFundedHpvVaccinationProviderSummary {
  const districts = countBy(records.flatMap((record) => record.district ?? []));
  return {
    totalRecords: records.length,
    uniqueProviderNameCount: new Set(records.map((record) => record.providerNameNormalized ?? record.providerName)).size,
    uniqueAddressCount: new Set(records.flatMap((record) => record.addressNormalized ?? [])).size,
    uniquePhoneCount: new Set(records.flatMap((record) => record.phone ?? [])).size,
    districtCount: districts.length,
    recordsWithPhone: records.filter((record) => record.hasPhone).length,
    recordsWithAddress: records.filter((record) => record.address).length,
    recordsWithParsedDistrictFromAddress: records.filter((record) => record.districtFromAddress).length,
    recordsWithDistrictMismatch: records.filter((record) => record.districtMismatch).length,
    recordsWithParsedRoadName: records.filter((record) => record.roadName).length,
    byDistrict: districts.map(({ key: district, count }) => {
      const rows = records.filter((record) => record.district === district);
      return { district, providerCount: count, uniqueAddressCount: new Set(rows.flatMap((record) => record.addressNormalized ?? [])).size, uniquePhoneCount: new Set(rows.flatMap((record) => record.phone ?? [])).size };
    }),
    byDistrictCode: countBy(records.flatMap((record) => record.districtCode ?? [])).map(({ key: districtCode, count }) => ({ districtCode, districtFromCode: TAIPEI_DISTRICT_CODE_TO_NAME[districtCode], providerCount: count })),
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
      districtCodeMapped: records.filter((record) => record.districtFromCode).length,
      districtFromAddressParsed: records.filter((record) => record.districtFromAddress).length,
      districtMismatch: records.filter((record) => record.districtMismatch).length,
      missingAddress: records.filter((record) => !record.address).length,
    },
  };
}

export function filterPubliclyFundedHpvVaccinationProviders(records: PubliclyFundedHpvVaccinationProviderRecord[], filters: PubliclyFundedHpvVaccinationProviderFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((record) => (!query || [record.providerName, record.district, record.districtCode, record.address, record.roadName, record.phone].filter(Boolean).join(' ').toLocaleLowerCase().includes(query))
    && (!filters.district || record.district === filters.district)
    && (!filters.districtCode || record.districtCode === filters.districtCode)
    && (!filters.roadName || record.roadName === filters.roadName)
    && (!filters.phoneType || record.phoneType === filters.phoneType)
    && (!filters.hasPhone || (filters.hasPhone === 'yes' ? record.hasPhone : !record.hasPhone))
    && (!filters.districtMismatch || (filters.districtMismatch === 'yes' ? record.districtMismatch : !record.districtMismatch)));
}

export { normalizeProviderName };
