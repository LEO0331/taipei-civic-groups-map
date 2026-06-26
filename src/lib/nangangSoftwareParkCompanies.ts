import { DISTRICTS } from './civicGroups';
import type { CompanyNameKeywordTag, CoordinateSourceType, NangangSoftwareParkCompany, NangangSoftwareParkCompanyFilters, NangangSoftwareParkCompanySummary } from '../types';

const bounds = { minLng: 121.43, maxLng: 121.70, minLat: 24.90, maxLat: 25.25 };

export function normalizeBusinessId(raw: unknown) {
  const text = String(raw ?? '').trim();
  return !text || text.toLowerCase() === 'nan' ? undefined : text.padStart(8, '0');
}

export function parseNangangSoftwareParkAddress(raw: unknown) {
  const address = String(raw ?? '').trim().replace('台北市', '臺北市') || undefined;
  if (!address) return {};
  const postalCode = address.match(/^\d{3}/)?.[0];
  const addressWithoutPostalCode = postalCode ? address.slice(3).trim() : address;
  const district = DISTRICTS.find((item) => addressWithoutPostalCode.includes(item));
  const roadText = (district ? addressWithoutPostalCode.slice(addressWithoutPostalCode.indexOf(district) + district.length) : addressWithoutPostalCode).replace(/^[一-龥]+?里(?:\d+鄰)?/, '');
  const roadName = [...roadText.matchAll(/[一-龥]+?(?:路|街|大道)(?:[一二三四五六七八九十]+段)?/g)].at(-1)?.[0];
  const buildingAddressKey = addressWithoutPostalCode.replace(/(\d+)(?:-|之)(\d+)號/, '$1之$2號').replace(/(?:號|樓).*$/, (match) => match.startsWith('號') ? '號' : match);
  return { address, postalCode, district, addressWithoutPostalCode, roadName, buildingAddressKey };
}

export function detectCoordinateSourceType(x?: number, y?: number): CoordinateSourceType {
  if (x === undefined || y === undefined) return 'unknown';
  if (x >= 119 && x <= 123 && y >= 21 && y <= 26) return 'wgs84';
  if (x >= 250000 && x <= 360000 && y >= 2700000 && y <= 2800000) return 'twd97_epsg_3826';
  return 'unknown';
}

// ponytail: EPSG:3826 inverse projection avoids a dependency; replace with proj4 only if additional CRSs are required.
export function convertTwd97ToWgs84(x: number, y: number) {
  const a = 6378137, e = 0.00669438002290, k0 = 0.9999, lon0 = 121 * Math.PI / 180, x0 = 250000;
  const e1 = (1 - Math.sqrt(1 - e)) / (1 + Math.sqrt(1 - e));
  const m = y / k0;
  const mu = m / (a * (1 - e / 4 - 3 * e ** 2 / 64 - 5 * e ** 3 / 256));
  const phi1 = mu + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu) + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu) + (151 * e1 ** 3 / 96) * Math.sin(6 * mu);
  const ep2 = e / (1 - e), c1 = ep2 * Math.cos(phi1) ** 2, t1 = Math.tan(phi1) ** 2, n1 = a / Math.sqrt(1 - e * Math.sin(phi1) ** 2), r1 = a * (1 - e) / (1 - e * Math.sin(phi1) ** 2) ** 1.5, d = (x - x0) / (n1 * k0);
  const latitude = phi1 - (n1 * Math.tan(phi1) / r1) * (d ** 2 / 2 - (5 + 3 * t1 + 10 * c1 - 4 * c1 ** 2 - 9 * ep2) * d ** 4 / 24 + (61 + 90 * t1 + 298 * c1 + 45 * t1 ** 2 - 252 * ep2 - 3 * c1 ** 2) * d ** 6 / 720);
  const longitude = lon0 + (d - (1 + 2 * t1 + c1) * d ** 3 / 6 + (5 - 2 * c1 + 28 * t1 - 3 * c1 ** 2 + 8 * ep2 + 24 * t1 ** 2) * d ** 5 / 120) / Math.cos(phi1);
  return { longitude: longitude * 180 / Math.PI, latitude: latitude * 180 / Math.PI };
}

export function classifyCompanyNameKeywordTags(name?: string): CompanyNameKeywordTag[] {
  if (!name) return ['unknown'];
  const rules: Array<[CompanyNameKeywordTag, string[]]> = [['technology', ['科技', '技術', '資訊']], ['software', ['軟體', '系統', '雲端']], ['biotech', ['生技', '生物', '基因']], ['medical', ['醫療', '醫材', '醫藥']], ['energy', ['能源', '電能', '電力']], ['semiconductor', ['半導體', '晶片', '積體電路']], ['data_or_digital', ['數位', '資料', '數據', '智能', '智慧']], ['media_or_creative', ['媒體', '創意', '文創', '影像']], ['investment_or_asset', ['投資', '資產']]];
  const tags = rules.filter(([, words]) => words.some((word) => name.includes(word))).map(([tag]) => tag);
  return tags.length ? tags : ['other'];
}

export function coordinateDetails(xRaw?: string, yRaw?: string) {
  const x = xRaw === undefined ? undefined : Number(xRaw), y = yRaw === undefined ? undefined : Number(yRaw);
  if (!xRaw && !yRaw) return { coordinateSourceType: 'unknown' as const, coordinateStatus: 'missing' as const };
  if (x === undefined || y === undefined || !Number.isFinite(x) || !Number.isFinite(y)) return { coordinateSourceType: 'unknown' as const, coordinateStatus: 'unparsed' as const };
  const coordinateSourceType = detectCoordinateSourceType(x, y);
  if (coordinateSourceType === 'unknown') return { coordinateSourceType, coordinateStatus: 'unparsed' as const };
  const point = coordinateSourceType === 'wgs84' ? { longitude: x, latitude: y } : convertTwd97ToWgs84(x, y);
  const coordinateStatus = point.longitude >= bounds.minLng && point.longitude <= bounds.maxLng && point.latitude >= bounds.minLat && point.latitude <= bounds.maxLat ? 'valid' as const : 'outlier' as const;
  return { coordinateSourceType, coordinateStatus, longitude: point.longitude, latitude: point.latitude, ...(coordinateSourceType === 'twd97_epsg_3826' ? { xTwd97: x, yTwd97: y } : {}) };
}

const grouped = <T extends string>(records: NangangSoftwareParkCompany[], value: (record: NangangSoftwareParkCompany) => T | undefined) => {
  const map = new Map<T, NangangSoftwareParkCompany[]>();
  records.forEach((record) => { const key = value(record); if (key) map.set(key, [...(map.get(key) ?? []), record]); });
  return map;
};
export function buildNangangSoftwareParkCompanySummary(records: NangangSoftwareParkCompany[]): NangangSoftwareParkCompanySummary {
  const count = (field: (record: NangangSoftwareParkCompany) => string | undefined) => [...grouped(records, field)].map(([key, rows]) => ({ key, rows })).sort((a, b) => b.rows.length - a.rows.length);
  const pairs = new Map<string, NangangSoftwareParkCompany[]>();
  records.filter((r) => r.coordinateStatus === 'valid' && r.longitude !== undefined && r.latitude !== undefined).forEach((r) => { const key = `${r.longitude!.toFixed(6)},${r.latitude!.toFixed(6)}`; pairs.set(key, [...(pairs.get(key) ?? []), r]); });
  const tags = new Map<CompanyNameKeywordTag, number>(); records.forEach((r) => r.companyNameKeywordTags?.forEach((tag) => tags.set(tag, (tags.get(tag) ?? 0) + 1)));
  return { totalRecords: records.length, uniqueBusinessIdCount: new Set(records.map((r) => r.businessId)).size, uniqueCompanyNameCount: new Set(records.map((r) => r.companyName)).size, uniqueAddressCount: new Set(records.flatMap((r) => r.address ?? [])).size, uniqueBuildingAddressKeyCount: new Set(records.flatMap((r) => r.buildingAddressKey ?? [])).size, recordsWithValidCoordinates: records.filter((r) => r.coordinateStatus === 'valid').length, recordsWithMissingCoordinates: records.filter((r) => r.coordinateStatus === 'missing').length, recordsWithOutlierCoordinates: records.filter((r) => r.coordinateStatus === 'outlier').length, recordsWithUnparsedCoordinates: records.filter((r) => r.coordinateStatus === 'unparsed').length, districtCount: grouped(records, (r) => r.district).size,
    byDistrict: count((r) => r.district).map(({ key, rows }) => ({ district: key, count: rows.length })), byRoadName: count((r) => r.roadName).map(({ key, rows }) => ({ roadName: key, count: rows.length })), byBuildingAddressKey: count((r) => r.buildingAddressKey).map(({ key, rows }) => ({ buildingAddressKey: key, count: rows.length, sampleCompanies: rows.slice(0, 3).map((r) => r.companyName) })), byCoordinatePair: [...pairs.values()].map((rows) => ({ longitude: rows[0].longitude!, latitude: rows[0].latitude!, count: rows.length, sampleCompanies: rows.slice(0, 4).map((r) => r.companyName), sampleAddress: rows[0].address })).sort((a, b) => b.count - a.count), byCompanyNameKeywordTag: [...tags].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count) };
}

export function filterNangangSoftwareParkCompanies(records: NangangSoftwareParkCompany[], filters: NangangSoftwareParkCompanyFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((r) => (!query || [r.businessId, r.companyName, r.address, r.roadName, r.buildingAddressKey, ...(r.companyNameKeywordTags ?? [])].filter(Boolean).join(' ').toLocaleLowerCase().includes(query)) && (!filters.roadName || r.roadName === filters.roadName) && (!filters.buildingAddressKey || r.buildingAddressKey === filters.buildingAddressKey) && (!filters.keywordTag || r.companyNameKeywordTags?.includes(filters.keywordTag as CompanyNameKeywordTag)) && (!filters.coordinateStatus || r.coordinateStatus === filters.coordinateStatus) && (!filters.hasValidCoordinate || (filters.hasValidCoordinate === 'yes' ? r.coordinateStatus === 'valid' : r.coordinateStatus !== 'valid')));
}
