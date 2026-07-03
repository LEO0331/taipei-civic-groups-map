import { DISTRICTS } from './civicGroups';
import type { LicensedArcadeGeocodingStatus, LicensedArcadeLocationPrecision, LicensedElectronicGameArcadeOperatorFilters, LicensedElectronicGameArcadeOperatorRecord, LicensedElectronicGameArcadeOperatorSummary } from '../types';

const missing = new Set(['', '-', '--', 'nan', 'null', '尚無資料']);
export const cleanArcadeText = (raw: unknown) => {
  const text = String(raw ?? '').replace(/\u3000/g, ' ').trim().replace(/[ \t]+/g, ' ');
  return missing.has(text.toLowerCase()) ? undefined : text;
};
const normalize = (raw: unknown) => cleanArcadeText(raw)?.replaceAll('台', '臺').toLocaleLowerCase();
export const parseSourceSequenceNumber = (raw: unknown) => {
  const sourceSequenceNumberNormalized = cleanArcadeText(raw);
  const value = sourceSequenceNumberNormalized ? Number(sourceSequenceNumberNormalized) : undefined;
  return { sourceSequenceNumber: Number.isInteger(value) ? value : undefined, sourceSequenceNumberNormalized, warning: sourceSequenceNumberNormalized && !Number.isInteger(value) ? 'Invalid sequence number' : undefined };
};
export const parseCompanyOrBusinessName = (raw: unknown) => {
  const companyOrBusinessName = cleanArcadeText(raw);
  return { companyOrBusinessName, companyOrBusinessNameNormalized: normalize(companyOrBusinessName), warning: companyOrBusinessName ? undefined : 'Missing company or business name' };
};
export const parseBusinessRegistrationNumber = (raw: unknown) => {
  const businessRegistrationNumber = cleanArcadeText(raw), businessRegistrationNumberNormalized = businessRegistrationNumber?.replace(/\s/g, '');
  const validBusinessRegistrationNumberFormat = Boolean(businessRegistrationNumberNormalized && /^\d{8}$/.test(businessRegistrationNumberNormalized));
  return { businessRegistrationNumber, businessRegistrationNumberNormalized, validBusinessRegistrationNumberFormat, warning: businessRegistrationNumber && !validBusinessRegistrationNumberFormat ? 'Invalid business registration number format' : undefined };
};
export const parseTaipeiDistrictName = (raw: unknown) => {
  const districtName = cleanArcadeText(raw)?.replaceAll('台', '臺'), isTaipeiDistrict = Boolean(districtName && (DISTRICTS as readonly string[]).includes(districtName));
  return { districtName, districtNameNormalized: normalize(districtName), isTaipeiDistrict, warning: districtName && !isTaipeiDistrict ? 'Unknown Taipei district' : undefined };
};
export const parseBusinessPremisesAddress = (raw: unknown) => {
  const businessPremisesAddress = cleanArcadeText(raw), businessPremisesAddressNormalized = businessPremisesAddress?.replaceAll('台北市', '臺北市').replaceAll('台', '臺');
  const roadName = businessPremisesAddressNormalized?.match(/([^，,\s\d]+(?:路|街|大道|巷))/)?.[1];
  const addressLooksLikeComplexUnit = Boolean(businessPremisesAddressNormalized && /樓|之|、|室|地下/.test(businessPremisesAddressNormalized));
  return { businessPremisesAddress, businessPremisesAddressNormalized, roadName, addressLooksLikeComplexUnit, warning: businessPremisesAddress && !roadName ? 'Road name not parsed' : undefined };
};
export const parseNote = (raw: unknown) => {
  const note = cleanArcadeText(raw);
  return { note, noteNormalized: normalize(note), hasNote: Boolean(note) };
};
export const createLicensedArcadeMapQuery = (record: { districtName?: string; businessPremisesAddress?: string; companyOrBusinessName?: string }) => cleanArcadeText(['臺北市', record.districtName, record.businessPremisesAddress, record.companyOrBusinessName].filter(Boolean).join(' '));

function countBy<T extends string>(values: T[]) {
  return [...values.reduce((m, v) => m.set(v, (m.get(v) ?? 0) + 1), new Map<T, number>())].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key, 'zh-Hant'));
}
const dupCount = (values: Array<string | undefined>) => countBy(values.filter(Boolean) as string[]).filter((item) => item.count > 1).length;

export function buildLicensedElectronicGameArcadeOperatorSummary(records: LicensedElectronicGameArcadeOperatorRecord[]): LicensedElectronicGameArcadeOperatorSummary {
  return {
    totalRecords: records.length,
    districtCount: new Set(records.flatMap((r) => r.districtNameNormalized ?? [])).size,
    uniqueCompanyOrBusinessNameCount: new Set(records.flatMap((r) => r.companyOrBusinessNameNormalized ?? [])).size,
    uniqueBusinessRegistrationNumberCount: new Set(records.flatMap((r) => r.businessRegistrationNumberNormalized ?? [])).size,
    uniqueAddressCount: new Set(records.flatMap((r) => r.businessPremisesAddressNormalized ?? [])).size,
    uniqueRoadNameCount: new Set(records.flatMap((r) => r.roadName ?? [])).size,
    recordsWithNote: records.filter((r) => r.hasNote).length,
    recordsWithAddress: records.filter((r) => r.businessPremisesAddress).length,
    recordsWithDistrict: records.filter((r) => r.districtName).length,
    recordsWithGeocodedCoordinates: records.filter((r) => r.coordinateSource === 'geocoded').length,
    recordsWithOfficialCoordinates: records.filter((r) => r.coordinateSource === 'official').length,
    recordsWithComplexUnitAddress: records.filter((r) => r.addressLooksLikeComplexUnit).length,
    recordsWithValidBusinessRegistrationNumberFormat: records.filter((r) => r.validBusinessRegistrationNumberFormat).length,
    byDistrict: countBy(records.flatMap((r) => r.districtName ?? [])).map(({ key: districtName, count }) => {
      const rows = records.filter((r) => r.districtName === districtName);
      return { districtName, count, uniqueAddressCount: new Set(rows.flatMap((r) => r.businessPremisesAddressNormalized ?? [])).size, uniqueBusinessRegistrationNumberCount: new Set(rows.flatMap((r) => r.businessRegistrationNumberNormalized ?? [])).size };
    }),
    byRoadName: countBy(records.flatMap((r) => r.roadName ?? [])).map(({ key: roadName, count }) => ({ roadName, count, districtCount: new Set(records.filter((r) => r.roadName === roadName).map((r) => r.districtNameNormalized)).size })),
    byBusinessRegistrationNumberFormatValidity: countBy(records.map((r) => r.validBusinessRegistrationNumberFormat ? 'valid' : 'invalid')).map(({ key, count }) => ({ valid: key === 'valid', count })),
    byNoteAvailability: [{ hasNote: true, count: records.filter((r) => r.hasNote).length }, { hasNote: false, count: records.filter((r) => !r.hasNote).length }],
    byComplexUnitAddress: [{ addressLooksLikeComplexUnit: true, count: records.filter((r) => r.addressLooksLikeComplexUnit).length }, { addressLooksLikeComplexUnit: false, count: records.filter((r) => !r.addressLooksLikeComplexUnit).length }],
    byGeocodingStatus: countBy(records.map((r) => r.geocodingStatus)).map(({ key, count }) => ({ geocodingStatus: key as LicensedArcadeGeocodingStatus, count })),
    byLocationPrecision: countBy(records.map((r) => r.locationPrecision)).map(({ key, count }) => ({ locationPrecision: key as LicensedArcadeLocationPrecision, count })),
    topCompanyOrBusinessNames: countBy(records.map((r) => r.companyOrBusinessNameNormalized ?? r.companyOrBusinessName)).map(({ key, count }) => ({ companyOrBusinessName: records.find((r) => (r.companyOrBusinessNameNormalized ?? r.companyOrBusinessName) === key)?.companyOrBusinessName ?? key, count, districtName: records.find((r) => (r.companyOrBusinessNameNormalized ?? r.companyOrBusinessName) === key)?.districtName })).slice(0, 30),
    dataQuality: {
      missingSequenceNumberCount: records.filter((r) => !r.sourceSequenceNumberNormalized).length,
      duplicateSequenceNumberCount: dupCount(records.map((r) => r.sourceSequenceNumberNormalized)),
      missingCompanyOrBusinessNameCount: records.filter((r) => !r.companyOrBusinessName).length,
      duplicateCompanyOrBusinessNameCount: dupCount(records.map((r) => r.companyOrBusinessNameNormalized)),
      missingBusinessRegistrationNumberCount: records.filter((r) => !r.businessRegistrationNumber).length,
      duplicateBusinessRegistrationNumberCount: dupCount(records.map((r) => r.businessRegistrationNumberNormalized)),
      invalidBusinessRegistrationNumberCount: records.filter((r) => !r.validBusinessRegistrationNumberFormat).length,
      missingDistrictCount: records.filter((r) => !r.districtName).length,
      unknownDistrictCount: records.filter((r) => r.districtName && !r.isTaipeiDistrict).length,
      missingAddressCount: records.filter((r) => !r.businessPremisesAddress).length,
      duplicateAddressCount: dupCount(records.map((r) => r.businessPremisesAddressNormalized)),
      missingNoteCount: records.filter((r) => !r.hasNote).length,
      duplicateFallbackKeyCount: dupCount(records.map((r) => [r.companyOrBusinessNameNormalized, r.districtNameNormalized, r.businessPremisesAddressNormalized].filter(Boolean).join('|'))),
    },
  };
}

export function filterLicensedElectronicGameArcadeOperators(records: LicensedElectronicGameArcadeOperatorRecord[], filters: LicensedElectronicGameArcadeOperatorFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((r) => (!query || [r.sourceSequenceNumberNormalized, r.companyOrBusinessName, r.businessRegistrationNumber, r.districtName, r.businessPremisesAddress, r.roadName, r.note].filter(Boolean).join(' ').toLocaleLowerCase().includes(query))
    && (!filters.districtName || r.districtName === filters.districtName)
    && (!filters.roadName || r.roadName === filters.roadName)
    && (!filters.hasNote || (filters.hasNote === 'yes' ? r.hasNote : !r.hasNote))
    && (!filters.addressLooksLikeComplexUnit || (filters.addressLooksLikeComplexUnit === 'yes' ? r.addressLooksLikeComplexUnit : !r.addressLooksLikeComplexUnit))
    && (!filters.geocodingStatus || r.geocodingStatus === filters.geocodingStatus)
    && (!filters.locationPrecision || r.locationPrecision === filters.locationPrecision)
    && (!filters.validBusinessRegistrationNumberFormat || (filters.validBusinessRegistrationNumberFormat === 'yes' ? r.validBusinessRegistrationNumberFormat : !r.validBusinessRegistrationNumberFormat)));
}
