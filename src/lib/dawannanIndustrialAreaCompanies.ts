import { DISTRICTS, normalizeText } from './civicGroups';
import { convertTwd97ToWgs84 } from './nangangSoftwareParkCompanies';
import type { CoordinateConversionStatus, DawannanIndustrialAreaCompanyFilters, DawannanIndustrialAreaCompanyRecord, DawannanIndustrialAreaCompanySummary } from '../types';

const taipeiBounds = { minLng: 121.30, maxLng: 121.80, minLat: 24.85, maxLat: 25.30 };
const missingValues = new Set(['', '-', '--', 'nan', 'null', '尚無資料']);

export function cleanDawannanText(raw: unknown) {
  const text = String(raw ?? '').replace(/\u3000/g, ' ').trim();
  return missingValues.has(text.toLowerCase()) ? undefined : text;
}

export function parseUnifiedBusinessNumber(raw: unknown) {
  const unifiedBusinessNumber = cleanDawannanText(raw);
  const unifiedBusinessNumberNormalized = unifiedBusinessNumber?.replace(/[\s-]/g, '');
  return { unifiedBusinessNumber, unifiedBusinessNumberNormalized, unifiedBusinessNumberValidFormat: /^\d{8}$/.test(unifiedBusinessNumberNormalized ?? '') };
}

export function parseIndustrialAreaCompanyName(raw: unknown) {
  const companyName = cleanDawannanText(raw);
  return { companyName, companyNameNormalized: companyName?.replace(/\s+/g, '') };
}

export function parseDawannanCompanyAddress(raw: unknown) {
  const companyAddress = cleanDawannanText(raw)?.replace('台北市', '臺北市');
  if (!companyAddress) return { isTaipeiDistrict: false };
  const postalCode = companyAddress.match(/^\d{3}/)?.[0], companyAddressNormalized = companyAddress.replace(/\s+/g, '');
  const body = postalCode ? companyAddress.slice(3).trim() : companyAddress;
  const districtFromAddress = DISTRICTS.find((district) => body.includes(district));
  const roadText = districtFromAddress ? body.slice(body.indexOf(districtFromAddress) + districtFromAddress.length) : body;
  const roadName = [...roadText.matchAll(/[一-龥]+?(?:路|街|大道)(?:[一二三四五六七八九十]+段)?/g)].at(-1)?.[0];
  return { companyAddress, companyAddressNormalized, postalCode, districtFromAddress, isTaipeiDistrict: Boolean(districtFromAddress), taipeiDistrict: districtFromAddress, roadName };
}

export function parseProjectedCoordinate(raw: unknown) {
  const text = cleanDawannanText(raw);
  const value = text === undefined ? undefined : Number(text.replaceAll(',', ''));
  return { raw: text, value: Number.isFinite(value) ? value : undefined };
}

export function convertProjectedTaipeiCoordinateToWgs84({ projectedX, projectedY }: { projectedX?: number; projectedY?: number }) {
  if (projectedX === undefined || projectedY === undefined) return { coordinateConversionStatus: 'missing_projected_coordinate' as CoordinateConversionStatus };
  const point = convertTwd97ToWgs84(projectedX, projectedY);
  const valid = point.longitude >= taipeiBounds.minLng && point.longitude <= taipeiBounds.maxLng && point.latitude >= taipeiBounds.minLat && point.latitude <= taipeiBounds.maxLat;
  return valid ? { longitude: point.longitude, latitude: point.latitude, projectedCoordinateSystemAssumption: 'TWD97_TM2_121' as const, coordinateConversionStatus: 'converted_to_wgs84' as const } : { projectedCoordinateSystemAssumption: 'TWD97_TM2_121' as const, coordinateConversionStatus: 'invalid_projected_coordinate' as const };
}

export function createDawannanCompanyMapQuery(record: { companyName?: string; companyAddress?: string }) {
  return [record.companyAddress, record.companyName].filter(Boolean).join(' ') || undefined;
}

const group = <T extends string>(records: DawannanIndustrialAreaCompanyRecord[], key: (record: DawannanIndustrialAreaCompanyRecord) => T | undefined) => {
  const map = new Map<T, DawannanIndustrialAreaCompanyRecord[]>();
  records.forEach((record) => { const value = key(record); if (value) map.set(value, [...(map.get(value) ?? []), record]); });
  return map;
};
const duplicateCount = (values: string[]) => values.length - new Set(values).size;

export function buildDawannanIndustrialAreaCompanySummary(records: DawannanIndustrialAreaCompanyRecord[]): DawannanIndustrialAreaCompanySummary {
  const coordinateKey = (r: DawannanIndustrialAreaCompanyRecord) => r.projectedX !== undefined && r.projectedY !== undefined ? `${r.projectedX},${r.projectedY}` : undefined;
  const coordinates = group(records, coordinateKey), addresses = group(records, (r) => r.companyAddressNormalized);
  const rows = <T extends string>(field: (record: DawannanIndustrialAreaCompanyRecord) => T | undefined) => [...group(records, field)].map(([key, items]) => ({ key, items })).sort((a, b) => b.items.length - a.items.length);
  return {
    totalRecords: records.length,
    uniqueUnifiedBusinessNumberCount: new Set(records.map((r) => r.unifiedBusinessNumberNormalized).filter(Boolean)).size,
    uniqueCompanyNameCount: new Set(records.map((r) => r.companyNameNormalized).filter(Boolean)).size,
    uniqueCompanyAddressCount: addresses.size,
    uniqueCoordinatePairCount: coordinates.size,
    taipeiDistrictCount: group(records, (r) => r.taipeiDistrict).size,
    recordsWithAddress: records.filter((r) => r.companyAddress).length,
    recordsWithParsedDistrictFromAddress: records.filter((r) => r.districtFromAddress).length,
    recordsWithProjectedCoordinates: records.filter((r) => r.hasProjectedCoordinates).length,
    recordsWithConvertedWgs84Coordinates: records.filter((r) => r.coordinateConversionStatus === 'converted_to_wgs84').length,
    byDistrict: rows((r) => r.taipeiDistrict).map(({ key, items }) => ({ district: key, companyCount: items.length, uniqueAddressCount: new Set(items.map((r) => r.companyAddressNormalized).filter(Boolean)).size, uniqueCoordinatePairCount: new Set(items.map(coordinateKey).filter(Boolean)).size })),
    byRoadName: rows((r) => r.roadName).map(({ key, items }) => ({ roadName: key, companyCount: items.length, uniqueAddressCount: new Set(items.map((r) => r.companyAddressNormalized).filter(Boolean)).size })),
    byAddress: [...addresses].map(([companyAddress, items]) => ({ companyAddress, companyCount: items.length, coordinatePair: { projectedX: items[0].projectedX, projectedY: items[0].projectedY, wgs84Longitude: items[0].wgs84Longitude, wgs84Latitude: items[0].wgs84Latitude } })).sort((a, b) => b.companyCount - a.companyCount),
    byCoordinatePair: [...coordinates].map(([key, items]) => ({ key, companyCount: items.length, sampleAddress: items[0].companyAddress, sampleCompanies: items.slice(0, 4).map((r) => r.companyName), projectedX: items[0].projectedX, projectedY: items[0].projectedY, wgs84Longitude: items[0].wgs84Longitude, wgs84Latitude: items[0].wgs84Latitude })).sort((a, b) => b.companyCount - a.companyCount),
    coordinateQuality: {
      hasProjectedCoordinates: records.filter((r) => r.hasProjectedCoordinates).length,
      convertedToWgs84: records.filter((r) => r.coordinateConversionStatus === 'converted_to_wgs84').length,
      notConvertedProjectedCoordinate: records.filter((r) => r.coordinateConversionStatus === 'not_converted_projected_coordinate').length,
      invalidProjectedCoordinate: records.filter((r) => r.coordinateConversionStatus === 'invalid_projected_coordinate').length,
      missingProjectedCoordinate: records.filter((r) => r.coordinateConversionStatus === 'missing_projected_coordinate').length,
      uniqueProjectedXCount: new Set(records.map((r) => r.projectedX).filter((v) => v !== undefined)).size,
      uniqueProjectedYCount: new Set(records.map((r) => r.projectedY).filter((v) => v !== undefined)).size,
      uniqueCoordinatePairCount: coordinates.size,
    },
    dataQuality: {
      missingUnifiedBusinessNumberCount: records.filter((r) => !r.unifiedBusinessNumber).length,
      invalidUnifiedBusinessNumberFormatCount: records.filter((r) => !r.unifiedBusinessNumberValidFormat).length,
      missingCompanyNameCount: records.filter((r) => !r.companyName).length,
      missingCompanyAddressCount: records.filter((r) => !r.companyAddress).length,
      unparsedAddressDistrictCount: records.filter((r) => r.companyAddress && !r.districtFromAddress).length,
      duplicateUnifiedBusinessNumberCount: duplicateCount(records.map((r) => r.unifiedBusinessNumberNormalized).filter(Boolean) as string[]),
      duplicateCompanyNameCount: duplicateCount(records.map((r) => r.companyNameNormalized).filter(Boolean) as string[]),
      duplicateCompanyAddressCount: duplicateCount(records.map((r) => r.companyAddressNormalized).filter(Boolean) as string[]),
      duplicateCoordinatePairCount: duplicateCount(records.map(coordinateKey).filter(Boolean) as string[]),
      duplicateFallbackKeyCount: duplicateCount(records.map((r) => `${r.companyNameNormalized}|${r.companyAddressNormalized}`).filter((v) => !v.includes('undefined'))),
    },
  };
}

export function filterDawannanIndustrialAreaCompanies(records: DawannanIndustrialAreaCompanyRecord[], filters: DawannanIndustrialAreaCompanyFilters) {
  const q = filters.search.trim().toLowerCase(), addressCounts = group(records, (r) => r.companyAddressNormalized), coordinateCounts = group(records, (r): string | undefined => r.projectedX !== undefined && r.projectedY !== undefined ? `${r.projectedX},${r.projectedY}` : undefined);
  return records.filter((r) => {
    const coordinate = r.projectedX !== undefined && r.projectedY !== undefined ? `${r.projectedX},${r.projectedY}` : undefined;
    return (!q || [r.unifiedBusinessNumber, r.companyName, r.companyAddress, r.taipeiDistrict, r.roadName].filter(Boolean).join(' ').toLowerCase().includes(q))
      && (!filters.district || r.taipeiDistrict === filters.district)
      && (!filters.roadName || r.roadName === filters.roadName)
      && (!filters.postalCode || r.postalCode === filters.postalCode)
      && (!filters.unifiedBusinessNumberValidFormat || (filters.unifiedBusinessNumberValidFormat === 'yes' ? r.unifiedBusinessNumberValidFormat : !r.unifiedBusinessNumberValidFormat))
      && (!filters.hasProjectedCoordinates || (filters.hasProjectedCoordinates === 'yes' ? r.hasProjectedCoordinates : !r.hasProjectedCoordinates))
      && (!filters.coordinateConversionStatus || r.coordinateConversionStatus === filters.coordinateConversionStatus)
      && (!filters.duplicateAddressGroup || ((addressCounts.get(r.companyAddressNormalized ?? '')?.length ?? 0) > 1) === (filters.duplicateAddressGroup === 'yes'))
      && (!filters.duplicateCoordinateGroup || (((coordinate ? coordinateCounts.get(coordinate)?.length : 0) ?? 0) > 1) === (filters.duplicateCoordinateGroup === 'yes'));
  });
}
