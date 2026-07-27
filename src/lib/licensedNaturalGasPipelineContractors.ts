import { convertTwd97ToWgs84 } from './nangangSoftwareParkCompanies';

export type CoordinateSystem = 'twd97_tm2_121' | 'wgs84' | 'unknown';
export type CoordinateResult = { coordinateSystem: CoordinateSystem; longitude: number | null; latitude: number | null; hasValidCoordinates: boolean };
const taipei = (longitude: number, latitude: number) => longitude >= 121.30 && longitude <= 121.80 && latitude >= 24.85 && latitude <= 25.30;

export function parseNaturalGasContractorCoordinates(xRaw: string, yRaw: string): CoordinateResult {
  const x = Number(xRaw), y = Number(yRaw);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return { coordinateSystem: 'unknown', longitude: null, latitude: null, hasValidCoordinates: false };
  if (x >= 119 && x <= 123 && y >= 21 && y <= 26) return { coordinateSystem: 'wgs84', longitude: x, latitude: y, hasValidCoordinates: taipei(x, y) };
  if (x >= 250000 && x <= 350000 && y >= 2700000 && y <= 2800000) { const point = convertTwd97ToWgs84(x, y); return { coordinateSystem: 'twd97_tm2_121', longitude: point.longitude, latitude: point.latitude, hasValidCoordinates: taipei(point.longitude, point.latitude) }; }
  return { coordinateSystem: 'unknown', longitude: null, latitude: null, hasValidCoordinates: false };
}

export function parseApprovalDate(raw: string): { approvalDate: string | null; approvalYear: number | null } {
  const digits = raw.trim().replace(/\D/g, ''); if (!/^\d{7}$|^\d{8}$/.test(digits)) return { approvalDate: null, approvalYear: null };
  const roc = digits.length === 7, year = roc ? Number(digits.slice(0, 3)) + 1911 : Number(digits.slice(0, 4)), month = Number(digits.slice(roc ? 3 : 4, roc ? 5 : 6)), day = Number(digits.slice(roc ? 5 : 6)); const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day ? { approvalDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, approvalYear: year } : { approvalDate: null, approvalYear: null };
}
