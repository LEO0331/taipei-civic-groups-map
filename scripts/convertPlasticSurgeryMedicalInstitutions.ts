import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';

const base = process.cwd();
const input = join(base, 'data/raw/plastic-surgery-medical-institutions/source.csv');
const outputDirectory = join(base, 'public/data/plastic-surgery-medical-institutions');
const reportPath = join(base, 'public/data/conversion-report.json');
const metadataPath = join(base, 'data/raw/plastic-surgery-medical-institutions/fetch-metadata.json');
const districts = ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'];
const tidy = (value: string | undefined) => value?.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim() || '';
const normalized = (value: string) => tidy(value).replace(/[\s　]/g, '').toLowerCase();
const valueOf = (values: Record<string, string>, aliases: string[]) => aliases.map((name) => values[name]).find(Boolean) ?? '';
const districtFor = (address: string, postalCode: string) => districts.find((district) => address.includes(district)) ?? (postalCode.startsWith('100') ? '中正區' : postalCode.startsWith('103') ? '大同區' : postalCode.startsWith('104') ? '中山區' : postalCode.startsWith('105') ? '松山區' : postalCode.startsWith('106') ? '大安區' : postalCode.startsWith('108') ? '萬華區' : postalCode.startsWith('110') ? '信義區' : postalCode.startsWith('111') ? '士林區' : postalCode.startsWith('112') ? '北投區' : postalCode.startsWith('114') ? '內湖區' : postalCode.startsWith('115') ? '南港區' : postalCode.startsWith('116') ? '文山區' : '');
const bytes = await readFile(input);
let text: string;
try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
catch { try { text = new TextDecoder('big5', { fatal: true }).decode(bytes); } catch { text = new TextDecoder('cp950').decode(bytes); } }
const [headerRow, ...rows] = parseCsv(text.replace(/^\uFEFF/, ''));
const headers = headerRow.map(tidy);
const duplicateRows: number[] = [], missingInstitutionName: number[] = [], missingAddress: number[] = [], missingPhone: number[] = [], malformedPhone: number[] = [], invalidPostalCode: number[] = [], unresolvedDistrict: number[] = [];
const exact = new Set<string>();
const sourceIds = new Set<string>();
const all = rows.map((row, index) => {
  const sourceValues = Object.fromEntries(headers.map((header, column) => [header, tidy(row[column])])) as Record<string, string>;
  const sourceSequenceNumber = valueOf(sourceValues, ['序號', '項次', '編號']);
  const institutionName = valueOf(sourceValues, ['機構名稱', '院所名稱', '醫事機構名稱']);
  const postalCode = valueOf(sourceValues, ['郵遞區號', '郵政區號']);
  const address = valueOf(sourceValues, ['地址', '機構地址', '醫事機構地址']);
  const phone = valueOf(sourceValues, ['電話', '聯絡電話', '機構電話', '醫事機構電話']);
  const rowNumber = index + 2;
  const fingerprint = createHash('sha256').update(JSON.stringify(sourceValues)).digest('hex');
  if (exact.has(fingerprint)) { duplicateRows.push(rowNumber); return null; }
  exact.add(fingerprint);
  if (!institutionName) missingInstitutionName.push(rowNumber);
  if (!address) missingAddress.push(rowNumber);
  if (!phone) missingPhone.push(rowNumber);
  if (phone && phone.replace(/\D/g, '').length < 7) malformedPhone.push(rowNumber);
  if (postalCode && !/^\d{3,6}$/.test(postalCode.replace(/[-\s]/g, ''))) invalidPostalCode.push(rowNumber);
  const districtName = districtFor(address, postalCode);
  if (!districtName) unresolvedDistrict.push(rowNumber);
  const fallback = `${normalized(institutionName)}|${normalized(address)}`;
  const preferredId = sourceSequenceNumber || `plastic-surgery-${createHash('sha1').update(fallback || fingerprint).digest('hex').slice(0, 16)}`;
  const id = sourceIds.has(preferredId) ? `${preferredId}-${fingerprint.slice(0, 8)}` : preferredId;
  sourceIds.add(id);
  return { id, sourceSequenceNumber, institutionName, postalCode, districtName, address, phone, hasAddress: Boolean(address), hasPhone: Boolean(phone), externalMapQuery: address ? tidy(`${address} ${institutionName}`) : '', sourceValues };
}).filter(Boolean);
const records = all as Array<Record<string, unknown>>;
const count = (field: string) => Object.entries(records.reduce<Record<string, number>>((result, record) => { const value = String(record[field] ?? ''); if (value) result[value] = (result[value] ?? 0) + 1; return result; }, {})).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'zh-Hant'));
const conflicts = (field: string, comparison: string) => Object.entries(records.reduce<Record<string, Set<string>>>((result, record) => { const key = normalized(String(record[field] ?? '')); const value = normalized(String(record[comparison] ?? '')); if (key && value) (result[key] ??= new Set()).add(value); return result; }, {})).filter(([, values]) => values.size > 1).map(([key]) => key);
const metadata = await readFile(metadataPath, 'utf8').then(JSON.parse).catch(() => ({}));
const summary = { totalRecords: records.length, uniqueInstitutionNames: new Set(records.map((record) => normalized(String(record.institutionName ?? ''))).filter(Boolean)).size, districtsCovered: count('districtName').length, postalCodesRepresented: count('postalCode').length, recordsWithAddresses: records.filter((record) => record.hasAddress).length, recordsWithPhones: records.filter((record) => record.hasPhone).length, districtWithMostInstitutions: count('districtName')[0]?.label ?? '', byDistrict: count('districtName'), byPostalCode: count('postalCode'), sourceFileUpdatedAt: metadata.sourceFileUpdatedAt ?? metadata.downloadedAt ?? '', metadataUpdatedAt: metadata.metadataUpdatedAt ?? metadata.downloadedAt ?? '', sourceUrl: metadata.sourceUrl ?? '' };
const previousReport = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(join(outputDirectory, 'records.json'), JSON.stringify(records)),
  writeFile(join(outputDirectory, 'summary.json'), JSON.stringify(summary, null, 2)),
  writeFile(reportPath, JSON.stringify({ ...previousReport, plasticSurgeryMedicalInstitutions: { convertedAt: new Date().toISOString(), headers, inputRows: rows.length, outputRecords: records.length, duplicateRows, missingInstitutionName, missingAddress, missingPhone, malformedPhone, invalidPostalCode, unresolvedDistrict, sameInstitutionNameMultipleAddresses: conflicts('institutionName', 'address'), sameAddressDifferentInstitutionNames: conflicts('address', 'institutionName'), notes: ['Source values are preserved as strings.', 'UTF-8-SIG is supported with Big5 and CP950 fallbacks.', 'No coordinates, automatic geocoding, or exact map markers are created.'] } }, null, 2)),
]);
console.log(`Converted ${records.length} plastic surgery medical institution records.`);
