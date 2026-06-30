import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import {
  buildCompanyRegistrationChangeSummary,
  classifyCompanyRegistrationChangeEventType,
  deriveCompanyRegistrationEventDate,
  normalizeCompanyName,
  parseCompanyRegistrationAddress,
  parseCompanyRegistrationCoordinates,
  parseCompanyRegistrationDate,
  parseUnifiedBusinessNumber,
} from '../src/lib/companyRegistrationChanges';
import { cleanText } from '../src/lib/businessRegistrationChanges';
import type { CompanyRegistrationChangeRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/company-registration-change-records');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市核准公司設立變更解散清冊';
const sourceAgency = '臺北市政府產業發展局商業處';

function decodeCsv(bytes: Uint8Array) {
  try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; }
  catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; }
}
const duplicateSamples = (values: string[]) => [...values.reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map<string, number>())].filter(([, count]) => count > 1).slice(0, 20).map(([value, count]) => ({ value, count }));

export async function convertCompanyRegistrationChangeRecords() {
  const files = (await readdir(rawDir)).filter((file) => file.toLowerCase().endsWith('.csv')).sort();
  if (!files.length) throw new Error('No company registration change CSVs found. Run npm run data:fetch:company-changes.');
  const seen = new Set<string>(), duplicateKeys: string[] = [], addressWarnings: string[] = [], dateWarnings: string[] = [], coordinateWarnings: string[] = [];
  const names: string[] = [], numbers: string[] = [], addresses: string[] = [], fallbackKeys: string[] = [], resourceReports = [];
  const records: CompanyRegistrationChangeRecord[] = [];

  for (const file of files) {
    const inputPath = join(rawDir, file), { text, encoding } = decodeCsv(await readFile(inputPath));
    const [rawHeaders, ...rows] = parseCsv(text);
    if (!rawHeaders) throw new Error(`Invalid company registration change CSV ${file}: file is empty.`);
    const headers = rawHeaders.map((header) => cleanText(header) ?? '');
    const lngHeader = headers.includes('經度') ? '經度' : 'Longitude';
    const latHeader = headers.includes('緯度') ? '緯度' : 'Latitude';
    const eventType = classifyCompanyRegistrationChangeEventType(file);
    const dateHeader = eventType === 'establishment' ? '核准日期' : eventType === 'modification' ? '核准變更日期' : eventType === 'dissolution' ? '核准解散日期' : '';
    const required = ['統一編號', '公司名稱', '公司地址', dateHeader, lngHeader, latHeader].filter(Boolean);
    const missing = required.filter((header) => !headers.includes(header));
    if (missing.length) throw new Error(`Invalid company registration change CSV ${file}: missing columns ${missing.join(', ')}.`);

    const before = records.length;
    for (const row of rows) {
      const values = Object.fromEntries(headers.map((header, column) => [header, cleanText(row[column])]));
      const companyName = values['公司名稱'];
      if (!companyName) continue;
      const unifiedBusinessNumber = parseUnifiedBusinessNumber(values['統一編號']);
      const address = parseCompanyRegistrationAddress(values['公司地址']);
      if (address.warning && addressWarnings.length < 20) addressWarnings.push(`${companyName}:${address.warning}`);
      const approval = parseCompanyRegistrationDate(values['核准日期']);
      const modification = parseCompanyRegistrationDate(values['核准變更日期']);
      const dissolution = parseCompanyRegistrationDate(values['核准解散日期']);
      const eventDate = deriveCompanyRegistrationEventDate({ eventType, approvalDate: approval.date, modificationApprovalDate: modification.date, dissolutionApprovalDate: dissolution.date });
      const eventParsed = eventType === 'establishment' ? approval : eventType === 'modification' ? modification : dissolution;
      if (eventParsed.warning && dateWarnings.length < 20) dateWarnings.push(`${companyName}:${eventParsed.raw ?? ''}`);
      const coordinates = parseCompanyRegistrationCoordinates(values[lngHeader], values[latHeader]);
      if (coordinates.warning && coordinateWarnings.length < 20) coordinateWarnings.push(`${companyName}:${coordinates.warning}:${values[lngHeader] ?? ''},${values[latHeader] ?? ''}`);
      const fallbackKey = `${file}|${normalizeCompanyName(companyName) ?? ''}|${address.companyAddressNormalized ?? ''}|${eventParsed.raw ?? ''}`;
      const key = `${eventType}|${unifiedBusinessNumber ?? ''}|${normalizeCompanyName(companyName) ?? ''}|${address.companyAddressNormalized ?? ''}|${eventParsed.raw ?? ''}`;
      names.push(companyName);
      if (unifiedBusinessNumber) numbers.push(unifiedBusinessNumber);
      if (address.companyAddressNormalized) addresses.push(address.companyAddressNormalized);
      fallbackKeys.push(fallbackKey);
      if (seen.has(key)) { if (duplicateKeys.length < 20) duplicateKeys.push(key); continue; }
      seen.add(key);
      records.push({
        id: createHash('sha1').update(key).digest('hex').slice(0, 12),
        module: 'company_registration_change_records',
        resourceName: file.replace(/\.csv$/i, ''),
        eventType,
        unifiedBusinessNumber,
        unifiedBusinessNumberNormalized: unifiedBusinessNumber,
        hasUnifiedBusinessNumber: Boolean(unifiedBusinessNumber),
        companyName,
        companyNameNormalized: normalizeCompanyName(companyName),
        ...address,
        approvalDateRaw: approval.raw,
        approvalDate: approval.date,
        modificationApprovalDateRaw: modification.raw,
        modificationApprovalDate: modification.date,
        dissolutionApprovalDateRaw: dissolution.raw,
        dissolutionApprovalDate: dissolution.date,
        eventDateRaw: eventParsed.raw,
        eventDate,
        eventYear: eventParsed.year,
        eventMonth: eventParsed.month,
        eventMonthKey: eventParsed.monthKey,
        eventQuarter: eventParsed.quarter,
        ...coordinates,
        hasCoordinates: coordinates.coordinateStatus === 'valid',
        source,
        sourceAgency,
      });
    }
    resourceReports.push({ resourceName: file.replace(/\.csv$/i, ''), eventType, inputRows: rows.length, outputRecords: records.length - before, encoding, fileSize: (await stat(inputPath)).size });
  }

  const summary = buildCompanyRegistrationChangeSummary(records);
  let report = {};
  try { report = JSON.parse(await readFile(reportPath, 'utf8')); } catch { /* first conversion */ }
  const companyRegistrationChangeRecords = {
    source, sourceAgency, officialSourceAgencyShort: '產業局商業處',
    sourcePage: 'https://data.taipei/dataset/detail?id=0a1f284d-e985-4c39-b0b5-53389fbfa6e9',
    category: '統計', serviceCategory: '公共資訊', datasetType: '原始資料', updateFrequency: '每1月',
    convertedAt: new Date().toISOString(), inputRows: resourceReports.reduce((sum, item) => sum + item.inputRows, 0), outputRecords: records.length,
    resources: resourceReports, duplicateKeys, duplicateCompanyNames: duplicateSamples(names), duplicateUnifiedBusinessNumbers: duplicateSamples(numbers), duplicateAddresses: duplicateSamples(addresses), duplicateFallbackKeys: duplicateSamples(fallbackKeys),
    addressWarningExamples: addressWarnings, dateWarningExamples: dateWarnings, coordinateWarningExamples: coordinateWarnings,
    notes: ['UTF-8-SIG decoded with Big5 fallback', 'All CSV values treated as strings before parsing', 'Source coordinates validated against Taipei bounds; no geocoding used', 'Records are company registration change events, not current operating status, credit, investment, compliance, legal-advice, or financial-advice data'],
    topDistrict: summary.byDistrict[0],
    latestEventMonth: summary.latestEventMonth,
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'company-registration-change-records.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'company-registration-change-summary.json'), JSON.stringify(summary)),
    writeFile(reportPath, JSON.stringify({ ...report, companyRegistrationChangeRecords }, null, 2)),
  ]);
  console.log(`Converted ${records.length} company registration change records from ${files.length} resources.`);
}

if (import.meta.url === `file://${process.argv[1]}`) await convertCompanyRegistrationChangeRecords();
