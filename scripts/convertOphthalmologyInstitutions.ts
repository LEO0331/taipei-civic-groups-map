import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';

const root = process.cwd();
const input = join(root, 'data/raw/ophthalmology-institutions/source.csv');
const output = join(root, 'public/data/ophthalmology-institutions');
const clean = (value?: string) => (value ?? '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
const normalize = (value?: string) => clean(value).replace(/[臺台]/g, '台').toLocaleLowerCase();
const districtNames = ['松山區', '信義區', '大安區', '中山區', '中正區', '大同區', '萬華區', '文山區', '南港區', '內湖區', '士林區', '北投區'];
const findValue = (source: Record<string, string>, names: string[]) => names.map((name) => source[name]).find((value) => value !== undefined) ?? '';
const validPhone = (value: string) => !value || /[0-9０-９][0-9０-９()（）\-#分機ext.、,／/\s]{4,}/i.test(value);
const candidateDecodings = (bytes: Buffer) => ['utf-8', 'big5', 'cp950'].flatMap((encoding) => {
  try { const text = new TextDecoder(encoding, { fatal: encoding === 'utf-8' }).decode(bytes).replace(/^\uFEFF/, ''); return text.includes(',') ? [{ text, damage: (text.match(/�/g) ?? []).length }] : []; } catch { return []; }
});
const bytes = await readFile(input);
const sourceText = candidateDecodings(bytes).sort((a, b) => a.damage - b.damage)[0]?.text;
if (!sourceText) throw new Error('Unable to decode source CSV as UTF-8-SIG, Big5, or CP950.');
const [rawHeaders, ...rows] = parseCsv(sourceText);
const headers = rawHeaders.map(clean);
const malformedPhones: string[] = [], invalidPostcodes: string[] = [], unresolvedDistricts: string[] = [];
const records = rows.map((row, rowIndex) => {
  const sourceValues = Object.fromEntries(headers.map((header, index) => [header, clean(row[index])])) as Record<string, string>;
  const sourceSequenceNumber = findValue(sourceValues, ['序號', '項次', '編號']);
  const institutionName = findValue(sourceValues, ['機構名稱', '院所名稱', '醫事機構名稱']);
  const postalCode = findValue(sourceValues, ['郵遞區號', '郵遞區號(前3碼)', '郵遞區號（前3碼）']);
  const address = findValue(sourceValues, ['地址', '機構地址', '醫事機構地址']);
  const phone = findValue(sourceValues, ['電話', '聯絡電話', '機構電話', '醫事機構電話']);
  const districtName = districtNames.find((district) => address.includes(district)) ?? '';
  const postalCodeValid = !postalCode || /^\d{3}(?:\d{2})?$/.test(postalCode);
  if (!postalCodeValid) invalidPostcodes.push(String(rowIndex + 2));
  if (address && !districtName) unresolvedDistricts.push(String(rowIndex + 2));
  if (!validPhone(phone)) malformedPhones.push(String(rowIndex + 2));
  const fallback = `${normalize(institutionName)}|${normalize(address)}`;
  const id = sourceSequenceNumber || createHash('sha256').update(fallback || JSON.stringify(sourceValues)).digest('hex').slice(0, 16);
  return { id, sourceSequenceNumber, institutionName, postalCode, districtName, address, phone, hasAddress: Boolean(address), hasPhone: Boolean(phone), externalMapQuery: clean(`${address} ${institutionName}`), sourceValues };
});
const exact = new Set<string>(), duplicateRows: string[] = [];
const unique = records.filter((record, index) => { const signature = JSON.stringify(record.sourceValues); if (exact.has(signature)) { duplicateRows.push(String(index + 2)); return false; } exact.add(signature); return true; });
const count = (values: string[]) => Object.entries(values.filter(Boolean).reduce<Record<string, number>>((all, value) => ({ ...all, [value]: (all[value] ?? 0) + 1 }), {})).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
const groups = (field: keyof typeof unique[number]) => Object.entries(unique.reduce<Record<string, Set<string>>>((all, record) => { const key = String(record[field] ?? ''); if (key) (all[key] ??= new Set()).add(field === 'institutionName' ? record.address : record.institutionName); return all; }, {})).filter(([, values]) => values.size > 1).map(([key, values]) => ({ key, values: [...values] }));
const updatedAt = new Date().toISOString();
const summary = { updatedAt, totalRecords: unique.length, uniqueInstitutionNames: new Set(unique.map((record) => normalize(record.institutionName)).filter(Boolean)).size, districtsCovered: count(unique.map((record) => record.districtName)).length, postalCodesRepresented: count(unique.map((record) => record.postalCode)).length, recordsWithCompleteAddresses: unique.filter((record) => record.hasAddress).length, recordsWithPhone: unique.filter((record) => record.hasPhone).length, recordsWithResolvedDistrict: unique.filter((record) => Boolean(record.districtName)).length, byDistrict: count(unique.map((record) => record.districtName)), byPostalCode: count(unique.map((record) => record.postalCode)) };
const report = { ophthalmologyInstitutions: { updatedAt, headers, inputRows: rows.length, outputRecords: unique.length, missingInstitutionName: unique.filter((record) => !record.institutionName).length, missingAddress: unique.filter((record) => !record.address).length, missingPhone: unique.filter((record) => !record.phone).length, invalidPostalCodeRows: invalidPostcodes, malformedPhoneRows: malformedPhones, unresolvedDistrictRows: unresolvedDistricts, exactDuplicateRowsRemoved: duplicateRows, duplicateSequenceNumbers: groups('sourceSequenceNumber'), namesWithMultipleAddresses: groups('institutionName'), addressesWithMultipleNames: groups('address'), postalAddressConflicts: [], notes: ['All source values are retained in sourceValues.', 'Districts are derived only from an explicit Taipei district in the source address.', 'No official coordinates were supplied; addresses are not geocoded and no exact map markers are created.'] } };
await mkdir(output, { recursive: true });
await Promise.all([writeFile(join(output, 'records.json'), JSON.stringify(unique, null, 2)), writeFile(join(output, 'summary.json'), JSON.stringify(summary, null, 2)), writeFile(join(output, 'conversion-report.json'), JSON.stringify(report, null, 2)), writeFile(join(root, 'public/data/conversion-report.json'), JSON.stringify(report, null, 2))]);
console.log(`Converted ${unique.length} ophthalmology institution records.`);
