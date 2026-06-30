import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import {
  buildBusinessRegistrationChangeSummary,
  cleanText,
  classifyBusinessRegistrationChangeEventType,
  deriveBusinessRegistrationEventDate,
  normalizeBusinessName,
  parseBusinessRegistrationAddress,
  parseBusinessRegistrationCoordinates,
  parseBusinessRegistrationDate,
  parseUnifiedBusinessNumber,
} from '../src/lib/businessRegistrationChanges';
import type { BusinessRegistrationChangeRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/business-registration-change-records');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市核准商業設立、變更及歇業登記等異動資料清冊';
const sourceAgency = '臺北市政府產業發展局商業處';

function decodeCsv(bytes: Uint8Array) {
  try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; }
  catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; }
}
const duplicateSamples = (values: string[]) => [...values.reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map<string, number>())].filter(([, count]) => count > 1).slice(0, 20).map(([value, count]) => ({ value, count }));

export async function convertBusinessRegistrationChangeRecords() {
  const files = (await readdir(rawDir)).filter((file) => file.toLowerCase().endsWith('.csv')).sort();
  if (!files.length) throw new Error('No business registration change CSVs found. Run npm run data:fetch:business-changes.');
  const seen = new Set<string>(), duplicateKeys: string[] = [], addressWarnings: string[] = [], dateWarnings: string[] = [], coordinateWarnings: string[] = [];
  const names: string[] = [], numbers: string[] = [], addresses: string[] = [], fallbackKeys: string[] = [], resourceReports = [];
  const records: BusinessRegistrationChangeRecord[] = [];

  for (const file of files) {
    const inputPath = join(rawDir, file), { text, encoding } = decodeCsv(await readFile(inputPath));
    const [rawHeaders, ...rows] = parseCsv(text);
    if (!rawHeaders) throw new Error(`Invalid business registration change CSV ${file}: file is empty.`);
    const headers = rawHeaders.map((header) => cleanText(header) ?? '');
    const lngHeader = headers.includes('經度') ? '經度' : 'Longitude';
    const latHeader = headers.includes('緯度') ? '緯度' : 'Latitude';
    const eventType = classifyBusinessRegistrationChangeEventType(file);
    const dateHeader = eventType === 'establishment' ? '設立日期' : eventType === 'modification' ? '變更日期' : eventType === 'closure' ? '歇業日期' : '';
    const required = ['統一編號', '商業名稱', '商業地址', dateHeader, lngHeader, latHeader].filter(Boolean);
    const missing = required.filter((header) => !headers.includes(header));
    if (missing.length) throw new Error(`Invalid business registration change CSV ${file}: missing columns ${missing.join(', ')}.`);

    const before = records.length;
    for (const row of rows) {
      const values = Object.fromEntries(headers.map((header, column) => [header, cleanText(row[column])]));
      const businessName = values['商業名稱'];
      if (!businessName) continue;
      const unifiedBusinessNumber = parseUnifiedBusinessNumber(values['統一編號']);
      const address = parseBusinessRegistrationAddress(values['商業地址']);
      if (address.warning && addressWarnings.length < 20) addressWarnings.push(`${businessName}:${address.warning}`);
      const establishment = parseBusinessRegistrationDate(values['設立日期']);
      const modification = parseBusinessRegistrationDate(values['變更日期']);
      const closure = parseBusinessRegistrationDate(values['歇業日期']);
      const eventDate = deriveBusinessRegistrationEventDate({ eventType, establishmentDate: establishment.date, modificationDate: modification.date, closureDate: closure.date });
      const eventParsed = eventType === 'establishment' ? establishment : eventType === 'modification' ? modification : closure;
      if (eventParsed.warning && dateWarnings.length < 20) dateWarnings.push(`${businessName}:${eventParsed.raw ?? ''}`);
      const coordinates = parseBusinessRegistrationCoordinates(values[lngHeader], values[latHeader]);
      if (coordinates.warning && coordinateWarnings.length < 20) coordinateWarnings.push(`${businessName}:${coordinates.warning}:${values[lngHeader] ?? ''},${values[latHeader] ?? ''}`);
      const fallbackKey = `${eventType}|${normalizeBusinessName(businessName) ?? ''}|${address.businessAddressNormalized ?? ''}|${eventParsed.raw ?? ''}`;
      const key = `${eventType}|${unifiedBusinessNumber ?? ''}|${fallbackKey}`;
      names.push(businessName);
      if (unifiedBusinessNumber) numbers.push(unifiedBusinessNumber);
      if (address.businessAddressNormalized) addresses.push(address.businessAddressNormalized);
      fallbackKeys.push(fallbackKey);
      if (seen.has(key)) { if (duplicateKeys.length < 20) duplicateKeys.push(key); continue; }
      seen.add(key);
      records.push({
        id: createHash('sha1').update(key).digest('hex').slice(0, 12),
        module: 'business_registration_change_records',
        resourceName: file.replace(/\.csv$/i, ''),
        eventType,
        unifiedBusinessNumber,
        unifiedBusinessNumberNormalized: unifiedBusinessNumber,
        hasUnifiedBusinessNumber: Boolean(unifiedBusinessNumber),
        businessName,
        businessNameNormalized: normalizeBusinessName(businessName),
        ...address,
        establishmentDateRaw: establishment.raw,
        establishmentDate: establishment.date,
        modificationDateRaw: modification.raw,
        modificationDate: modification.date,
        closureDateRaw: closure.raw,
        closureDate: closure.date,
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

  const summary = buildBusinessRegistrationChangeSummary(records);
  let report = {};
  try { report = JSON.parse(await readFile(reportPath, 'utf8')); } catch { /* first conversion */ }
  const businessRegistrationChangeRecords = {
    source, sourceAgency, officialSourceAgencyShort: '產業局商業處',
    sourcePage: 'https://data.taipei/dataset/detail?id=5fdefcca-e0a6-41bc-a520-7c8f067caad3',
    category: '投資理財', serviceCategory: '公共資訊', datasetType: '原始資料', updateFrequency: '每1月',
    convertedAt: new Date().toISOString(), inputRows: resourceReports.reduce((sum, item) => sum + item.inputRows, 0), outputRecords: records.length,
    resources: resourceReports, duplicateKeys, duplicateBusinessNames: duplicateSamples(names), duplicateUnifiedBusinessNumbers: duplicateSamples(numbers), duplicateAddresses: duplicateSamples(addresses), duplicateFallbackKeys: duplicateSamples(fallbackKeys),
    addressWarningExamples: addressWarnings, dateWarningExamples: dateWarnings, coordinateWarningExamples: coordinateWarnings,
    notes: ['UTF-8-SIG decoded with Big5 fallback', 'All CSV values treated as strings before parsing', 'Source coordinates validated against Taipei bounds; no geocoding used', 'Records are registration change events, not current operating status, credit, investment, compliance, legal-advice, or financial-advice data'],
    topDistrict: summary.byDistrict[0],
    latestEventMonth: summary.latestEventMonth,
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'business-registration-change-records.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'business-registration-change-summary.json'), JSON.stringify(summary)),
    writeFile(reportPath, JSON.stringify({ ...report, businessRegistrationChangeRecords }, null, 2)),
  ]);
  console.log(`Converted ${records.length} business registration change records from ${files.length} resources.`);
}

if (import.meta.url === `file://${process.argv[1]}`) await convertBusinessRegistrationChangeRecords();
