import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';

const sourcePath = join(process.cwd(), 'data/raw/beauty-hairdressing-hygiene-certifications/source.csv');
const outputDirectory = join(process.cwd(), 'public/data/beauty-hairdressing-hygiene-certifications');
const buildDate = new Date().toISOString().slice(0, 10);
const districts = ['松山區', '信義區', '大安區', '中山區', '中正區', '大同區', '萬華區', '文山區', '南港區', '內湖區', '士林區', '北投區'];
const clean = (value?: string) => value?.replace(/[\r\n\t ]+/g, ' ').trim() ?? '';
function decodeCsv(bytes: Uint8Array) { try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; } catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; } }
function parseDate(value: string) {
  const compact = value.replace(/\D/g, '');
  if (!/^\d{8}$/.test(compact)) return null;
  let year = Number(compact.slice(0, 4)); if (year < 1911) year += 1911;
  const month = Number(compact.slice(4, 6)), day = Number(compact.slice(6));
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date.toISOString().slice(0, 10) : null;
}
const { text, encoding } = decodeCsv(await readFile(sourcePath));
const [rawHeaders, ...rows] = parseCsv(text); const headers = rawHeaders.map(clean);
const required = ['報名類別', '業者名稱', '營業場所地址', '評核結果', '有效日期']; const missing = required.filter((field) => !headers.includes(field)); if (missing.length) throw new Error(`Missing official source columns: ${missing.join(', ')}`);
const duplicateRows: string[] = [], missingBusinessNames: string[] = [], missingAddresses: string[] = [], unresolvedDistricts: string[] = [], invalidValidityDates: string[] = [], seen = new Set<string>();
const records = rows.flatMap((row, index) => {
  const sourceValues = Object.fromEntries(headers.map((header, column) => [header, clean(row[column])])) as Record<string, string>;
  const registrationCategoryRaw = sourceValues['報名類別'], businessName = sourceValues['業者名稱'], businessAddress = sourceValues['營業場所地址'], evaluationResultRaw = sourceValues['評核結果'], validityDateRaw = sourceValues['有效日期'];
  const rowKey = headers.map((header) => sourceValues[header]).join('\u001F'); const label = `row ${index + 2}`;
  if (seen.has(rowKey)) { duplicateRows.push(label); return []; } seen.add(rowKey);
  if (!businessName) missingBusinessNames.push(label); if (!businessAddress) missingAddresses.push(label);
  const districtName = districts.find((district) => businessAddress.includes(district)) ?? ''; if (businessAddress && !districtName) unresolvedDistricts.push(label);
  const validityDate = parseDate(validityDateRaw); if (validityDateRaw && !validityDate) invalidValidityDates.push(label);
  const days = validityDate ? (Date.parse(validityDate) - Date.parse(buildDate)) / 86400000 : null;
  const derivedValidityStatus = days === null ? 'unknown' : days < 0 ? 'expired_on_build_date' : days <= 90 ? 'expiring_soon' : 'valid_on_build_date';
  const id = createHash('sha256').update(`${businessName}|${businessAddress}|${registrationCategoryRaw}|${validityDateRaw}|${rowKey}`).digest('hex').slice(0, 16);
  return [{ id, registrationCategoryRaw, registrationCategory: registrationCategoryRaw || 'blank', businessName, businessAddress, districtName, evaluationResultRaw, evaluationResultCategory: evaluationResultRaw || 'blank', validityDateRaw, validityDate, validityYear: validityDate ? Number(validityDate.slice(0, 4)) : null, derivedValidityStatus, googleMapsQuery: [businessName, businessAddress].filter(Boolean).join(' '), sourceValues }];
});
const countBy = (value: (record: typeof records[number]) => string) => Object.entries(records.reduce((counts, record) => { const label = value(record); if (label) counts[label] = (counts[label] ?? 0) + 1; return counts; }, {} as Record<string, number>)).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
const sameBusinessAddress = new Map<string, typeof records>(); for (const record of records) { const key = `${record.businessName}|${record.businessAddress}`; sameBusinessAddress.set(key, [...(sameBusinessAddress.get(key) ?? []), record]); }
const conflicts = [...sameBusinessAddress.values()].filter((items) => new Set(items.map((item) => item.evaluationResultRaw).filter(Boolean)).size > 1).map((items) => ({ businessName: items[0].businessName, businessAddress: items[0].businessAddress, values: [...new Set(items.map((item) => item.evaluationResultRaw))] }));
const multipleValidityDates = [...sameBusinessAddress.values()].filter((items) => new Set(items.map((item) => item.validityDateRaw).filter(Boolean)).size > 1).map((items) => ({ businessName: items[0].businessName, businessAddress: items[0].businessAddress, values: [...new Set(items.map((item) => item.validityDateRaw))] }));
const summary = { buildDate, totalRecords: records.length, uniqueBusinesses: new Set(records.map((record) => record.businessName).filter(Boolean)).size, districtsCovered: new Set(records.map((record) => record.districtName).filter(Boolean)).size, registrationCategories: countBy((record) => record.registrationCategory), evaluationResults: countBy((record) => record.evaluationResultCategory), recordsWithValidDates: records.filter((record) => record.validityDate).length, validityStatus: countBy((record) => record.derivedValidityStatus), byDistrict: countBy((record) => record.districtName), latestSourceValidityDate: [...records.map((record) => record.validityDate).filter(Boolean)].sort().at(-1) ?? null };
await mkdir(outputDirectory, { recursive: true }); await Promise.all([writeFile(join(outputDirectory, 'records.json'), JSON.stringify(records)), writeFile(join(outputDirectory, 'summary.json'), JSON.stringify(summary)), writeFile(join(outputDirectory, 'conversion-report.json'), JSON.stringify({ source: '臺北市營業場所衛生優良自主管理分級認證業者名冊〖美容美髮業〗', sourcePage: 'https://data.taipei/dataset/detail?id=374d85bb-fe2f-4768-abd9-7a32922ac756', encoding, buildDate, sourceFields: headers, inputRows: rows.length, outputRecords: records.length, missingBusinessNames, missingAddresses, unresolvedDistricts, unknownRegistrationCategories: [], unknownEvaluationResults: [], invalidValidityDates, duplicateRows, conflictingEvaluationResults: conflicts, multipleValidityDates, notes: ['UTF-8-SIG, Big5, and CP950 supported.', 'All source fields are preserved as strings.', 'Derived validity status is relative only to the local build date.', 'No official coordinates are supplied; no geocoding or exact markers are created.'] }, null, 2))]);
console.log(`Converted ${records.length} beauty and hairdressing hygiene certification records (${encoding}).`);
