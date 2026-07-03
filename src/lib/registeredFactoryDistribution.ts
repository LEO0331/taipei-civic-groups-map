import { DISTRICTS } from './civicGroups';
import { convertTwd97ToWgs84 } from './nangangSoftwareParkCompanies';
import type { FactoryCoordinateConversionStatus, RegisteredFactoryCoordinateQuality, RegisteredFactoryFilters, RegisteredFactoryLocationPrecision, RegisteredFactoryRecord, RegisteredFactorySummary } from '../types';

const missing = new Set(['', '-', '--', 'nan', 'null', '尚無資料']);
const taipei = { minLng: 121.30, maxLng: 121.80, minLat: 24.85, maxLat: 25.30 };
const clean = (raw: unknown) => {
  const text = String(raw ?? '').replace(/\u3000/g, ' ').trim().replace(/\s+/g, ' ');
  return missing.has(text.toLowerCase()) ? undefined : text;
};
const normalized = (raw: unknown) => clean(raw)?.replaceAll('台', '臺').replace(/\s+/g, '').toLocaleLowerCase();
export const cleanFactoryText = clean;

export const parseFactoryRegistrationId = (raw: unknown) => {
  const factoryRegistrationId = clean(raw), factoryRegistrationIdNormalized = factoryRegistrationId?.replace(/\s+/g, '');
  return { factoryRegistrationId, factoryRegistrationIdNormalized, warning: factoryRegistrationId ? undefined : 'Missing factory registration ID' };
};
export const parseFactoryName = (raw: unknown) => {
  const factoryName = clean(raw);
  return { factoryName, factoryNameNormalized: normalized(factoryName), warning: factoryName ? undefined : 'Missing factory name' };
};
export function parseFactoryAddress(raw: unknown) {
  const factoryAddress = clean(raw)?.replaceAll('台北市', '臺北市').replaceAll('台', '臺');
  const factoryAddressNormalized = normalized(factoryAddress);
  const districtNameFromAddress = DISTRICTS.find((district) => factoryAddress?.includes(district));
  const body = districtNameFromAddress && factoryAddress ? factoryAddress.slice(factoryAddress.indexOf(districtNameFromAddress) + districtNameFromAddress.length) : factoryAddress;
  const roadBody = body?.replace(/^[一-龥]{1,6}里/, '');
  const roadName = roadBody?.match(/([一-龥]+?(?:路|街|大道)(?:[一二三四五六七八九十\d]+段)?)/)?.[1];
  const addressLooksLikeMultiFloorOrUnit = Boolean(factoryAddress && /樓|之|室|地下|B1|[0-9一二三四五六七八九十]+至[0-9一二三四五六七八九十]+樓/i.test(factoryAddress));
  return { factoryAddress, factoryAddressNormalized, districtNameFromAddress, isTaipeiDistrict: Boolean(districtNameFromAddress), roadName, addressLooksLikeMultiFloorOrUnit, warning: factoryAddress && !districtNameFromAddress ? 'District not found' : undefined };
}
export const parseResponsiblePersonName = (raw: unknown) => {
  const responsiblePersonName = clean(raw);
  return { responsiblePersonName, responsiblePersonNameNormalized: normalized(responsiblePersonName), warning: responsiblePersonName ? undefined : 'Missing responsible person' };
};
export function parseFactorySourceCoordinate(raw: unknown) {
  const text = clean(raw), value = text === undefined ? undefined : Number(text.replaceAll(',', ''));
  return { raw: text, value: Number.isFinite(value) ? value : undefined, warning: text && !Number.isFinite(value) ? 'Invalid source coordinate' : undefined };
}
export function convertTwd97Tm2ToWgs84(x: number, y: number): { longitude?: number; latitude?: number; status: FactoryCoordinateConversionStatus; warning?: string } {
  try {
    const point = convertTwd97ToWgs84(x, y);
    if (!Number.isFinite(point.longitude) || !Number.isFinite(point.latitude)) return { status: 'conversion_failed', warning: 'Converted coordinate is not finite' };
    if (point.longitude < taipei.minLng || point.longitude > taipei.maxLng || point.latitude < taipei.minLat || point.latitude > taipei.maxLat) return { longitude: point.longitude, latitude: point.latitude, status: 'outside_taipei_bounds_after_conversion', warning: 'Converted coordinate is outside Taipei-nearby bounds' };
    return { longitude: point.longitude, latitude: point.latitude, status: 'converted_from_twd97_tm2' };
  } catch (error) {
    return { status: 'conversion_failed', warning: String(error) };
  }
}
export const createRegisteredFactoryMapQuery = (record: { factoryName?: string; factoryAddress?: string }) => clean([record.factoryAddress, record.factoryName].filter(Boolean).join(' '));
export const coordinatePairKey = (longitude?: number, latitude?: number) => longitude === undefined || latitude === undefined ? undefined : `${longitude.toFixed(6)}|${latitude.toFixed(6)}`;
export const factoryCoordinateQuality = (status: FactoryCoordinateConversionStatus): RegisteredFactoryCoordinateQuality => status === 'converted_from_twd97_tm2' ? 'valid_converted_wgs84_taipei' : status === 'already_wgs84' ? 'valid_wgs84_taipei' : status === 'outside_taipei_bounds_after_conversion' ? 'outside_taipei_bounds' : status === 'missing' ? 'missing' : 'invalid';
export function factoryLocationPrecision(record: { coordinateConversionStatus: FactoryCoordinateConversionStatus; districtNameFromAddress?: string; factoryAddress?: string }): RegisteredFactoryLocationPrecision {
  if (record.coordinateConversionStatus === 'converted_from_twd97_tm2') return 'converted_source_coordinate';
  if (record.coordinateConversionStatus === 'already_wgs84') return 'official_wgs84_coordinate';
  if (record.districtNameFromAddress && record.factoryAddress) return 'district_address';
  if (record.districtNameFromAddress) return 'district_only';
  return 'missing';
}

function group<T extends string>(records: RegisteredFactoryRecord[], key: (record: RegisteredFactoryRecord) => T | undefined) {
  const map = new Map<T, RegisteredFactoryRecord[]>();
  records.forEach((record) => { const value = key(record); if (value) map.set(value, [...(map.get(value) ?? []), record]); });
  return map;
}
const dupCount = (values: Array<string | undefined>) => values.filter(Boolean).length - new Set(values.filter(Boolean)).size;
const rows = <T extends string>(records: RegisteredFactoryRecord[], field: (record: RegisteredFactoryRecord) => T | undefined) => [...group(records, field)].map(([key, items]) => ({ key, items })).sort((a, b) => b.items.length - a.items.length || a.key.localeCompare(b.key, 'zh-Hant'));

export function buildRegisteredFactorySummary(records: RegisteredFactoryRecord[]): RegisteredFactorySummary {
  const coordinateGroups = rows(records, (r) => r.coordinatePairKey), addressGroups = rows(records, (r) => r.factoryAddressNormalized);
  return {
    totalRecords: records.length,
    districtCount: group(records, (r) => r.districtNameFromAddress).size,
    uniqueFactoryRegistrationIdCount: new Set(records.map((r) => r.factoryRegistrationIdNormalized).filter(Boolean)).size,
    uniqueFactoryNameCount: new Set(records.map((r) => r.factoryNameNormalized).filter(Boolean)).size,
    uniqueFactoryAddressCount: new Set(records.map((r) => r.factoryAddressNormalized).filter(Boolean)).size,
    uniqueResponsiblePersonNameCount: new Set(records.map((r) => r.responsiblePersonNameNormalized).filter(Boolean)).size,
    uniqueRoadNameCount: group(records, (r) => r.roadName).size,
    uniqueCoordinatePairCount: group(records, (r) => r.coordinatePairKey).size,
    recordsWithConvertedCoordinates: records.filter((r) => r.coordinateConversionStatus === 'converted_from_twd97_tm2').length,
    recordsWithValidCoordinates: records.filter((r) => r.coordinateValid).length,
    recordsWithInvalidCoordinates: records.filter((r) => !r.coordinateValid).length,
    recordsWithMultiFloorOrUnitAddress: records.filter((r) => r.addressLooksLikeMultiFloorOrUnit).length,
    byDistrict: rows(records, (r) => r.districtNameFromAddress).map(({ key, items }) => ({ districtName: key, count: items.length, uniqueFactoryNameCount: new Set(items.map((r) => r.factoryNameNormalized).filter(Boolean)).size, uniqueAddressCount: new Set(items.map((r) => r.factoryAddressNormalized).filter(Boolean)).size, uniqueResponsiblePersonNameCount: new Set(items.map((r) => r.responsiblePersonNameNormalized).filter(Boolean)).size, validCoordinateCount: items.filter((r) => r.coordinateValid).length })),
    byRoadName: rows(records, (r) => r.roadName).map(({ key, items }) => ({ roadName: key, count: items.length, districtCount: new Set(items.map((r) => r.districtNameFromAddress).filter(Boolean)).size, uniqueFactoryNameCount: new Set(items.map((r) => r.factoryNameNormalized).filter(Boolean)).size })),
    topResponsiblePersonNames: rows(records, (r) => r.responsiblePersonName).slice(0, 30).map(({ key, items }) => ({ responsiblePersonName: key, count: items.length, districtCount: new Set(items.map((r) => r.districtNameFromAddress).filter(Boolean)).size })),
    topSharedAddresses: addressGroups.filter((g) => g.items.length > 1).slice(0, 30).map(({ items }) => ({ factoryAddress: items[0].factoryAddress, count: items.length, districtName: items[0].districtNameFromAddress })),
    byCoordinatePair: coordinateGroups.map(({ key, items }) => ({ key, count: items.length, sampleAddress: items[0].factoryAddress, sampleFactoryNames: items.slice(0, 6).map((r) => r.factoryName), longitude: items[0].longitude, latitude: items[0].latitude })),
    byCoordinateConversionStatus: rows(records, (r) => r.coordinateConversionStatus).map(({ key, items }) => ({ coordinateConversionStatus: key, count: items.length })),
    coordinateQuality: { validConvertedWgs84Taipei: records.filter((r) => r.coordinateQuality === 'valid_converted_wgs84_taipei').length, validWgs84Taipei: records.filter((r) => r.coordinateQuality === 'valid_wgs84_taipei').length, outsideTaipeiBounds: records.filter((r) => r.coordinateQuality === 'outside_taipei_bounds').length, invalid: records.filter((r) => r.coordinateQuality === 'invalid').length, missing: records.filter((r) => r.coordinateQuality === 'missing').length, duplicateCoordinatePairCount: dupCount(records.map((r) => r.coordinatePairKey)) },
    dataQuality: {
      missingFactoryRegistrationIdCount: records.filter((r) => !r.factoryRegistrationId).length,
      duplicateFactoryRegistrationIdCount: dupCount(records.map((r) => r.factoryRegistrationIdNormalized)),
      missingFactoryNameCount: records.filter((r) => !r.factoryName).length,
      duplicateFactoryNameCount: dupCount(records.map((r) => r.factoryNameNormalized)),
      missingFactoryAddressCount: records.filter((r) => !r.factoryAddress).length,
      duplicateFactoryAddressCount: dupCount(records.map((r) => r.factoryAddressNormalized)),
      unparsedDistrictFromAddressCount: records.filter((r) => r.factoryAddress && !r.districtNameFromAddress).length,
      missingResponsiblePersonNameCount: records.filter((r) => !r.responsiblePersonName).length,
      missingSourceCoordinateXCount: records.filter((r) => !r.sourceCoordinateX).length,
      missingSourceCoordinateYCount: records.filter((r) => !r.sourceCoordinateY).length,
      invalidSourceCoordinateCount: records.filter((r) => (r.sourceCoordinateX && r.sourceCoordinateXNumber === undefined) || (r.sourceCoordinateY && r.sourceCoordinateYNumber === undefined)).length,
      coordinateConversionFailedCount: records.filter((r) => r.coordinateConversionStatus === 'conversion_failed').length,
      outsideTaipeiBoundsAfterConversionCount: records.filter((r) => r.coordinateConversionStatus === 'outside_taipei_bounds_after_conversion').length,
      duplicateConvertedCoordinatePairCount: dupCount(records.map((r) => r.coordinatePairKey)),
      duplicateFallbackKeyCount: dupCount(records.map((r) => [r.factoryNameNormalized, r.factoryAddressNormalized, r.sourceCoordinateX, r.sourceCoordinateY].filter(Boolean).join('|'))),
    },
  };
}

export function filterRegisteredFactories(records: RegisteredFactoryRecord[], filters: RegisteredFactoryFilters) {
  const q = filters.search.trim().toLocaleLowerCase();
  return records.filter((r) => (!q || [r.factoryRegistrationId, r.factoryName, r.factoryAddress, r.responsiblePersonName, r.districtNameFromAddress, r.roadName].filter(Boolean).join(' ').toLocaleLowerCase().includes(q))
    && (!filters.districtNameFromAddress || r.districtNameFromAddress === filters.districtNameFromAddress)
    && (!filters.roadName || r.roadName === filters.roadName)
    && (!filters.addressLooksLikeMultiFloorOrUnit || (filters.addressLooksLikeMultiFloorOrUnit === 'yes' ? r.addressLooksLikeMultiFloorOrUnit : !r.addressLooksLikeMultiFloorOrUnit))
    && (!filters.coordinateConversionStatus || r.coordinateConversionStatus === filters.coordinateConversionStatus)
    && (!filters.coordinateQuality || r.coordinateQuality === filters.coordinateQuality)
    && (!filters.locationPrecision || r.locationPrecision === filters.locationPrecision)
    && (!filters.hasValidConvertedCoordinates || (filters.hasValidConvertedCoordinates === 'yes' ? r.coordinateValid : !r.coordinateValid)));
}
