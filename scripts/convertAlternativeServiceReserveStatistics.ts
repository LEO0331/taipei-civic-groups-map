import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';

const raw = join(process.cwd(), 'data/raw/alternative-service-reserve-statistics');
const out = join(process.cwd(), 'public/data/alternative-service-reserve-statistics');
const clean = (value?: string) => value?.replace(/\s+/g, ' ').trim() ?? '';
const decode = (bytes: Buffer) => { try { return { encoding: 'UTF-8-SIG / UTF-8', text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, '') }; } catch { return { encoding: 'CP950 / Big5-compatible', text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, '') }; } };
const parseCount = (value: string) => /^\d+$/.test(value) ? Number(value) : null;
const parseYear = (value: string) => { const number = Number(value); return Number.isInteger(number) && number > 0 ? (number < 1911 ? number + 1911 : number) : null; };
const parseMonth = (value: string) => { const number = Number(value); return Number.isInteger(number) && number >= 1 && number <= 12 ? number : null; };
const { encoding, text } = decode(await readFile(join(raw, 'source.csv')));
const [headers, ...rows] = parseCsv(text);
const duplicates: string[] = [], invalidDates: string[] = [], invalidCounts: string[] = [], missingGroups: string[] = [], subtotalInconsistencies: string[] = [];
const seen = new Set<string>();
const records = rows.flatMap((row, index) => {
  const [yearRaw = '', monthRaw = '', groupName = '', serviceType = '', cohortRaw = '', zeroRaw = '', transferRaw = '', subtotalRaw = ''] = row.map(clean);
  const id = `${yearRaw}|${monthRaw}|${groupName}|${serviceType}` || `row-${index + 1}`;
  if (seen.has(id)) { duplicates.push(id); return []; } seen.add(id);
  const year = parseYear(yearRaw), month = parseMonth(monthRaw), cohortDischargeCount = parseCount(cohortRaw), zeroDischargeCount = parseCount(zeroRaw), incomingTransferCount = parseCount(transferRaw), subtotalCount = parseCount(subtotalRaw);
  if (!year || !month) invalidDates.push(id); if (!groupName) missingGroups.push(id);
  if ([cohortRaw, zeroRaw, transferRaw, subtotalRaw].some((value, i) => value && [cohortDischargeCount, zeroDischargeCount, incomingTransferCount, subtotalCount][i] === null)) invalidCounts.push(id);
  if (cohortDischargeCount !== null && zeroDischargeCount !== null && incomingTransferCount !== null && subtotalCount !== null && cohortDischargeCount + zeroDischargeCount + incomingTransferCount !== subtotalCount) subtotalInconsistencies.push(id);
  return [{ id, yearRaw, monthRaw, groupName, serviceType, cohortDischargeCount, zeroDischargeCount, incomingTransferCount, subtotalCount, year, month }];
});
await mkdir(out, { recursive: true });
await writeFile(join(out, 'records.json'), JSON.stringify(records));
await writeFile(join(out, 'conversion-report.json'), JSON.stringify({ source: '臺北市替代役備役列管人數分析統計', encoding, sourceFields: headers.map(clean), inputRows: rows.length, recordCount: records.length, duplicates, invalidDates, invalidCounts, missingGroups, subtotalInconsistencies }, null, 2));
console.log(`Converted ${records.length} alternative-service reserve statistic records (${encoding}).`);
