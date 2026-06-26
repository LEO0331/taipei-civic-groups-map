import type {
  LaborPenaltyAmountBucket, LaborStandardActViolationFilters, LaborStandardActViolationRecord,
  LaborStandardActViolationSummary, LaborViolationTopicTag,
} from '../types';

const splitItems = (raw: unknown) => String(raw ?? '').split(/[;\n；]/).map((item) => item.trim()).filter(Boolean);
const sum = (values: Array<number | undefined>) => values.reduce<number>((total, value) => total + (value ?? 0), 0);
const average = (values: number[]) => values.length ? sum(values) / values.length : undefined;
const median = (values: number[]) => {
  if (!values.length) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const countBy = <T extends string>(items: Array<{ key: T; amount?: number }>) => {
  const counts = new Map<T, { count: number; totalPenaltyAmountNtd: number }>();
  items.forEach(({ key, amount }) => {
    const current = counts.get(key) ?? { count: 0, totalPenaltyAmountNtd: 0 };
    counts.set(key, { count: current.count + 1, totalPenaltyAmountNtd: current.totalPenaltyAmountNtd + (amount ?? 0) });
  });
  return [...counts].map(([key, value]) => ({ key, ...value })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
};

export function parseRocDate(raw: unknown) {
  const value = String(raw ?? '').trim() || undefined;
  if (!value) return {};
  if (!/^\d{7}$/.test(value)) return { raw: value, warning: 'Invalid ROC date format' };
  const rocYear = Number(value.slice(0, 3));
  const month = Number(value.slice(3, 5));
  const day = Number(value.slice(5, 7));
  const gregorianYear = rocYear + 1911;
  const date = new Date(Date.UTC(gregorianYear, month - 1, day));
  if (!rocYear || !month || !day || date.getUTCFullYear() !== gregorianYear || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return { raw: value, warning: 'Invalid ROC date value' };
  }
  return { raw: value, isoDate: `${gregorianYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, rocYear, gregorianYear };
}

export function parsePenaltyAmount(raw: unknown) {
  const value = String(raw ?? '').trim() || undefined;
  if (!value || value === '-' || value.toLowerCase() === 'nan') return { raw: value };
  const normalized = value.replaceAll(',', '');
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return { raw: value, warning: 'Invalid penalty amount' };
  const amountNtd = Number(normalized);
  return Number.isFinite(amountNtd) ? { raw: value, amountNtd } : { raw: value, warning: 'Invalid penalty amount' };
}

export function parseViolatedProvisions(raw: unknown) {
  return splitItems(raw);
}

export function parseViolationContents(raw: unknown) {
  return splitItems(raw);
}

export function classifyLaborPenaltyAmountBucket(amount: number | undefined): LaborPenaltyAmountBucket {
  if (amount === undefined) return 'none_or_missing';
  if (amount <= 20000) return '1_to_20000';
  if (amount <= 50000) return '20001_to_50000';
  if (amount <= 100000) return '50001_to_100000';
  if (amount <= 300000) return '100001_to_300000';
  if (amount <= 1000000) return '300001_to_1000000';
  return '1000001_plus';
}

export function classifyLaborViolationTopicTags(provisions: string[], contents: string[]): LaborViolationTopicTag[] {
  if (!provisions.length && !contents.length) return ['unknown'];
  const text = `${provisions.join(' ')} ${contents.join(' ')}`;
  const tags: LaborViolationTopicTag[] = [];
  const add = (tag: LaborViolationTopicTag, match: boolean) => { if (match && !tags.includes(tag)) tags.push(tag); };
  add('wage_payment', /工資未(?:依法|全額)給付|第22條/.test(text));
  add('overtime_pay', /延長工作時間未依規定加給工資|第24條/.test(text));
  add('working_hours', /延長工作時間超過|正常工作時間|第32條/.test(text));
  add('rest_day', /每7日|例假|休息日|第36條/.test(text));
  add('attendance_record', /出勤紀錄|第30條第[56]項/.test(text));
  add('wage_record', /工資清冊|第23條/.test(text));
  add('leave_or_holiday', /假日工資|特別休假|休假日|第3[89]條/.test(text));
  add('labor_inspection', /拒絕、規避或阻撓|第80條/.test(text));
  add('retirement_or_severance', /資遣|退休|退休金/.test(text));
  add('employment_contract', /勞動契約|契約/.test(text));
  return tags.length ? tags : ['other'];
}

export function buildLaborStandardActViolationSummary(records: LaborStandardActViolationRecord[]): LaborStandardActViolationSummary {
  const penalties = records.flatMap((record) => record.penaltyAmountNtd ?? []);
  const announcementDates = records.flatMap((record) => record.announcementDate ?? []).sort();
  const dispositionDates = records.flatMap((record) => record.dispositionDate ?? []).sort();
  const year = new Map<number, { recordCount: number; recordsWithPenaltyAmount: number; totalPenaltyAmountNtd: number }>();
  const month = new Map<string, { recordCount: number; recordsWithPenaltyAmount: number; totalPenaltyAmountNtd: number }>();
  const dispositionYear = new Map<number, number>();
  const dispositionMonth = new Map<string, number>();
  records.forEach((record) => {
    const add = (map: Map<number | string, { recordCount: number; recordsWithPenaltyAmount: number; totalPenaltyAmountNtd: number }>, key: number | string | undefined) => {
      if (key === undefined) return;
      const current = map.get(key) ?? { recordCount: 0, recordsWithPenaltyAmount: 0, totalPenaltyAmountNtd: 0 };
      map.set(key, { recordCount: current.recordCount + 1, recordsWithPenaltyAmount: current.recordsWithPenaltyAmount + Number(record.hasPenaltyAmount), totalPenaltyAmountNtd: current.totalPenaltyAmountNtd + (record.penaltyAmountNtd ?? 0) });
    };
    add(year, record.announcementYear);
    add(month, record.announcementMonth);
    if (record.dispositionYear) dispositionYear.set(record.dispositionYear, (dispositionYear.get(record.dispositionYear) ?? 0) + 1);
    if (record.dispositionMonth) dispositionMonth.set(record.dispositionMonth, (dispositionMonth.get(record.dispositionMonth) ?? 0) + 1);
  });
  const names = new Map<string, { recordCount: number; totalPenaltyAmountNtd: number; latestAnnouncementDate?: string }>();
  records.forEach((record) => {
    const current = names.get(record.businessOrEmployerName) ?? { recordCount: 0, totalPenaltyAmountNtd: 0 };
    names.set(record.businessOrEmployerName, {
      recordCount: current.recordCount + 1,
      totalPenaltyAmountNtd: current.totalPenaltyAmountNtd + (record.penaltyAmountNtd ?? 0),
      latestAnnouncementDate: [current.latestAnnouncementDate, record.announcementDate].filter(Boolean).sort().at(-1),
    });
  });
  return {
    totalRecords: records.length,
    uniqueBusinessOrEmployerNameCount: new Set(records.map((record) => record.businessOrEmployerName)).size,
    uniqueDispositionNumberCount: new Set(records.flatMap((record) => record.dispositionNumber ?? [])).size,
    minAnnouncementDate: announcementDates[0], maxAnnouncementDate: announcementDates.at(-1),
    minDispositionDate: dispositionDates[0], maxDispositionDate: dispositionDates.at(-1),
    recordsWithPenaltyAmount: penalties.length, recordsMissingPenaltyAmount: records.length - penalties.length,
    recordsWithResponsiblePersonName: records.filter((record) => record.hasResponsiblePersonName).length,
    recordsWithNote: records.filter((record) => record.hasNote).length,
    recordsWithSourceExtraNote: records.filter((record) => record.hasSourceExtraNote).length,
    totalPenaltyAmountNtd: sum(penalties), medianPenaltyAmountNtd: median(penalties),
    averagePenaltyAmountNtd: average(penalties), maxPenaltyAmountNtd: penalties.length ? Math.max(...penalties) : undefined,
    byAnnouncementYear: [...year].map(([key, value]) => ({ year: key, ...value })).sort((a, b) => a.year - b.year),
    byAnnouncementMonth: [...month].map(([key, value]) => ({ month: key, ...value })).sort((a, b) => a.month.localeCompare(b.month)),
    byDispositionYear: [...dispositionYear].map(([year, recordCount]) => ({ year, recordCount })).sort((a, b) => a.year - b.year),
    byDispositionMonth: [...dispositionMonth].map(([month, recordCount]) => ({ month, recordCount })).sort((a, b) => a.month.localeCompare(b.month)),
    byViolatedProvision: countBy(records.flatMap((record) => record.violatedProvisions.map((provision) => ({ key: provision, amount: record.penaltyAmountNtd })))).map(({ key: provision, ...value }) => ({ provision, ...value })),
    byViolationTopicTag: countBy(records.flatMap((record) => record.violationTopicTags.map((topicTag) => ({ key: topicTag, amount: record.penaltyAmountNtd })))).map(({ key: topicTag, ...value }) => ({ topicTag: topicTag as LaborViolationTopicTag, ...value })),
    byViolationContent: countBy(records.flatMap((record) => record.violationContents.map((violationContent) => ({ key: violationContent, amount: record.penaltyAmountNtd })))).map(({ key: violationContent, ...value }) => ({ violationContent, ...value })),
    byPenaltyAmountBucket: (['none_or_missing', '1_to_20000', '20001_to_50000', '50001_to_100000', '100001_to_300000', '300001_to_1000000', '1000001_plus'] as LaborPenaltyAmountBucket[]).map((penaltyAmountBucket) => ({ penaltyAmountBucket, count: records.filter((record) => record.penaltyAmountBucket === penaltyAmountBucket).length })),
    topBusinessOrEmployerNames: [...names].map(([businessOrEmployerName, value]) => ({ businessOrEmployerName, ...value })).sort((a, b) => b.recordCount - a.recordCount || b.totalPenaltyAmountNtd - a.totalPenaltyAmountNtd).slice(0, 25),
  };
}

export function filterLaborStandardActViolationRecords(records: LaborStandardActViolationRecord[], filters: LaborStandardActViolationFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((record) => {
    const text = [record.businessOrEmployerName, record.dispositionNumber, record.violatedProvisionsRaw, record.violationContentRaw, record.note, record.sourceExtraNote].filter(Boolean).join(' ').toLocaleLowerCase();
    return (!query || text.includes(query))
      && (!filters.announcementYear || record.announcementYear === Number(filters.announcementYear))
      && (!filters.announcementMonth || record.announcementMonth === filters.announcementMonth)
      && (!filters.dispositionYear || record.dispositionYear === Number(filters.dispositionYear))
      && (!filters.dispositionMonth || record.dispositionMonth === filters.dispositionMonth)
      && (!filters.violatedProvision || record.violatedProvisions.includes(filters.violatedProvision))
      && (!filters.violationTopicTag || record.violationTopicTags.includes(filters.violationTopicTag as LaborViolationTopicTag))
      && (!filters.penaltyAmountBucket || record.penaltyAmountBucket === filters.penaltyAmountBucket)
      && (!filters.hasPenaltyAmount || (filters.hasPenaltyAmount === 'yes' ? record.hasPenaltyAmount : !record.hasPenaltyAmount))
      && (!filters.hasResponsiblePersonName || (filters.hasResponsiblePersonName === 'yes' ? record.hasResponsiblePersonName : !record.hasResponsiblePersonName))
      && (!filters.hasNote || (filters.hasNote === 'yes' ? record.hasNote : !record.hasNote));
  });
}
