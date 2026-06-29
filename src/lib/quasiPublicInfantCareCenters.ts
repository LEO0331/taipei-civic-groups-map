import { DISTRICTS } from './civicGroups';
import type {
  InfantCareCapacityStatus, InfantCareCenterOperationType, InfantCareCenterPhoneType, InfantCareEvaluationGrade,
  QuasiPublicInfantCareCenter, QuasiPublicInfantCareCenterFilters, QuasiPublicInfantCareCenterSummary,
} from '../types';

export function parseIntegerValue(raw: unknown) {
  const text = String(raw ?? '').trim().replaceAll(',', '');
  if (!text || ['-', '--', 'NaN', 'nan'].includes(text)) return undefined;
  return /^-?\d+$/.test(text) ? Number(text) : undefined;
}

export function classifyInfantCareCapacityStatus(approvedCapacity?: number, actualEnrollment?: number): InfantCareCapacityStatus {
  if (approvedCapacity === undefined || actualEnrollment === undefined) return 'unknown';
  return approvedCapacity - actualEnrollment <= 0 ? 'apparent_full' : 'apparent_remaining_capacity';
}

export function deriveCapacityMetrics(approvedCapacity?: number, actualEnrollment?: number) {
  const capacityStatus = classifyInfantCareCapacityStatus(approvedCapacity, actualEnrollment);
  if (approvedCapacity === undefined || actualEnrollment === undefined) return { capacityStatus };
  const apparentRemainingCapacity = approvedCapacity - actualEnrollment;
  return {
    apparentRemainingCapacity,
    occupancyRatePercent: approvedCapacity > 0 ? Math.round((actualEnrollment / approvedCapacity) * 1000) / 10 : undefined,
    capacityStatus,
    warning: apparentRemainingCapacity < 0 ? 'Actual enrollment exceeds approved capacity' : undefined,
  };
}

export function classifyInfantCareEvaluationGrade(rawGrade?: string): InfantCareEvaluationGrade {
  const text = rawGrade?.trim() ?? '';
  if (!text) return 'missing';
  if (text === '優') return 'excellent';
  if (text === '甲') return 'grade_a';
  if (text === '乙') return 'grade_b';
  if (text === '丙') return 'grade_c';
  return 'other';
}

export function parseInfantCareEvaluationResult(raw: unknown) {
  const evaluationResultRaw = String(raw ?? '').trim() || undefined;
  if (!evaluationResultRaw) return { evaluationGrade: 'missing' as const };
  const [yearText, gradeText] = evaluationResultRaw.split(/[-－—–]/).map((part) => part.trim());
  const evaluationRocYear = /^\d{2,3}$/.test(yearText ?? '') ? Number(yearText) : undefined;
  const evaluationGrade = classifyInfantCareEvaluationGrade(gradeText);
  return {
    evaluationResultRaw,
    evaluationRocYear,
    evaluationGregorianYear: evaluationRocYear ? evaluationRocYear + 1911 : undefined,
    evaluationGrade,
    warning: !evaluationRocYear || evaluationGrade === 'other' ? 'Unknown evaluation result format' : undefined,
  };
}

export function classifyInfantCareCenterOperationType(centerName?: string): InfantCareCenterOperationType {
  const text = centerName?.trim() ?? '';
  if (!text) return 'unknown';
  if (text.includes('私立') && text.includes('托嬰中心')) return 'private_infant_care_center';
  if (text.includes('公共托育家園')) return 'public_childcare_home';
  if (text.includes('委託') || text.includes('社區公共托育')) return 'public_or_commissioned_center';
  return 'other';
}

export function parseInfantCareCenterAddress(raw: unknown, sourceDistrict?: string) {
  const address = String(raw ?? '').replace(/\s+/g, ' ').trim() || undefined;
  if (!address) return {};
  const addressNormalized = address.replaceAll('台北市', '臺北市');
  const district = DISTRICTS.find((item) => addressNormalized.includes(item)) ?? sourceDistrict;
  const afterDistrict = district ? addressNormalized.slice(addressNormalized.indexOf(district) + district.length) : addressNormalized;
  const roadName = afterDistrict.match(/([^0-9\s,，]+?[路街大道])(?:([0-9一二三四五六七八九十]+段))?/)?.slice(1, 3).filter(Boolean).join('');
  return {
    address,
    addressNormalized,
    district,
    roadName,
    warning: sourceDistrict && district && sourceDistrict !== district ? `District mismatch: ${sourceDistrict} / ${district}` : undefined,
  };
}

export function parseInfantCareCenterPhone(raw: unknown) {
  const phone = String(raw ?? '').replace(/\s+/g, ' ').trim() || undefined;
  if (!phone) return { phoneType: 'missing' as const };
  if (/[#＃]|轉|分機/.test(phone)) return { phone, phoneDisplay: phone, phoneType: 'extension' as const };
  const digits = phone.replace(/\D/g, '');
  let phoneType: InfantCareCenterPhoneType = 'unknown';
  if (/^09\d{8}$/.test(digits)) phoneType = 'mobile';
  else if (/^02\d{7,8}$/.test(digits) || /^\(02\)/.test(phone)) phoneType = 'taipei_landline';
  return { phone, phoneDisplay: phone, phoneDialHref: phoneType !== 'unknown' ? `tel:${digits}` : undefined, phoneType, warning: phoneType === 'unknown' ? 'Unsupported phone format' : undefined };
}

function countBy<T extends string>(values: T[]) {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count);
}
function median(values: number[]) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return undefined;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round(((sorted[middle - 1] + sorted[middle]) / 2) * 10) / 10;
}
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export function buildQuasiPublicInfantCareCenterSummary(records: QuasiPublicInfantCareCenter[]): QuasiPublicInfantCareCenterSummary {
  const rates = records.flatMap((record) => record.occupancyRatePercent ?? []);
  const districts = countBy(records.flatMap((record) => record.district ?? []));
  return {
    totalRecords: records.length,
    uniqueCenterNameCount: new Set(records.map((record) => record.centerName)).size,
    uniqueAddressCount: new Set(records.flatMap((record) => record.addressNormalized ?? [])).size,
    districtCount: districts.length,
    recordsWithPhone: records.filter((record) => record.hasPhone).length,
    recordsWithEvaluationResult: records.filter((record) => record.hasEvaluationResult).length,
    recordsMissingEvaluationResult: records.filter((record) => !record.hasEvaluationResult).length,
    totalApprovedCapacity: sum(records.flatMap((record) => record.approvedCapacity ?? [])),
    totalActualEnrollment: sum(records.flatMap((record) => record.actualEnrollment ?? [])),
    totalApparentRemainingCapacity: sum(records.flatMap((record) => record.apparentRemainingCapacity ?? [])),
    averageOccupancyRatePercent: rates.length ? Math.round((sum(rates) / rates.length) * 10) / 10 : undefined,
    medianOccupancyRatePercent: median(rates),
    apparentFullRecordCount: records.filter((record) => record.capacityStatus === 'apparent_full').length,
    apparentRemainingCapacityRecordCount: records.filter((record) => record.capacityStatus === 'apparent_remaining_capacity').length,
    byDistrict: districts.map(({ key: district }) => {
      const rows = records.filter((record) => record.district === district), districtRates = rows.flatMap((record) => record.occupancyRatePercent ?? []);
      return {
        district,
        centerCount: rows.length,
        totalApprovedCapacity: sum(rows.flatMap((record) => record.approvedCapacity ?? [])),
        totalActualEnrollment: sum(rows.flatMap((record) => record.actualEnrollment ?? [])),
        totalApparentRemainingCapacity: sum(rows.flatMap((record) => record.apparentRemainingCapacity ?? [])),
        averageOccupancyRatePercent: districtRates.length ? Math.round((sum(districtRates) / districtRates.length) * 10) / 10 : undefined,
      };
    }).sort((a, b) => b.centerCount - a.centerCount),
    byEvaluationGrade: countBy(records.map((record) => record.evaluationGrade)).map(({ key: evaluationGrade, count }) => ({ evaluationGrade, count })),
    byEvaluationYear: countBy(records.flatMap((record) => record.evaluationRocYear ? [String(record.evaluationRocYear)] : [])).map(({ key, count }) => ({ evaluationRocYear: Number(key), evaluationGregorianYear: Number(key) + 1911, count })),
    byCapacityStatus: countBy(records.map((record) => record.capacityStatus)).map(({ key: capacityStatus, count }) => ({ capacityStatus, count })),
    byCenterOperationType: countBy(records.map((record) => record.centerOperationType)).map(({ key: centerOperationType, count }) => ({ centerOperationType, count })),
    byRoadName: countBy(records.flatMap((record) => record.roadName ?? [])).map(({ key: roadName, count }) => ({ roadName, count })),
  };
}

const inRange = (value: number | undefined, min: string, max: string) =>
  (min === '' || (value !== undefined && value >= Number(min))) && (max === '' || (value !== undefined && value <= Number(max)));

export function filterQuasiPublicInfantCareCenters(records: QuasiPublicInfantCareCenter[], filters: QuasiPublicInfantCareCenterFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((record) => {
    const text = [record.centerName, record.district, record.address, record.roadName, record.phone, record.evaluationResultRaw].filter(Boolean).join(' ').toLocaleLowerCase();
    return (!query || text.includes(query))
      && (!filters.district || record.district === filters.district)
      && (!filters.roadName || record.roadName === filters.roadName)
      && (!filters.centerOperationType || record.centerOperationType === filters.centerOperationType)
      && (!filters.capacityStatus || record.capacityStatus === filters.capacityStatus)
      && (!filters.evaluationGrade || record.evaluationGrade === filters.evaluationGrade)
      && (!filters.evaluationYear || String(record.evaluationRocYear ?? '') === filters.evaluationYear)
      && (!filters.hasEvaluationResult || (filters.hasEvaluationResult === 'yes' ? record.hasEvaluationResult : !record.hasEvaluationResult))
      && (!filters.phoneType || record.phoneType === filters.phoneType)
      && inRange(record.approvedCapacity, filters.approvedMin, filters.approvedMax)
      && inRange(record.actualEnrollment, filters.actualMin, filters.actualMax)
      && inRange(record.apparentRemainingCapacity, filters.gapMin, filters.gapMax)
      && inRange(record.occupancyRatePercent, filters.occupancyMin, filters.occupancyMax);
  });
}
