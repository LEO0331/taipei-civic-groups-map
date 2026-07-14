import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';

const inputPath = join(process.cwd(), 'data/raw/domestic-employment-service-agencies/records.csv');
const outputDirectory = join(process.cwd(), 'public/data/domestic-employment-service-agencies');
const reportPath = join(process.cwd(), 'public/data/conversion-report.json');
const districts = ['松山區', '信義區', '大安區', '中山區', '中正區', '大同區', '萬華區', '文山區', '南港區', '內湖區', '士林區', '北投區'];
const clean = (value?: string) => value?.replace(/\s+/g, ' ').trim() || undefined;
const normalize = (value?: string) => clean(value)?.replace(/[臺台]/g, '台').toLocaleLowerCase();
const phone = (value?: string) => clean(value)?.replace(/[\s（）()－–—-]/g, '');
function decode(bytes: Uint8Array) { try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; } catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; } }
function parseDate(raw?: string) { const value = clean(raw)?.replace(/[^0-9]/g, ''); if (!value) return undefined; const year = value.length === 7 ? Number(value.slice(0, 3)) + 1911 : value.length === 8 ? Number(value.slice(0, 4)) : NaN; const month = value.length === 7 ? Number(value.slice(3, 5)) : Number(value.slice(4, 6)); const day = value.length === 7 ? Number(value.slice(5)) : Number(value.slice(6)); const date = new Date(Date.UTC(year, month - 1, day)); return Number.isFinite(year) && date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date.toISOString().slice(0, 10) : undefined; }
function parseCapital(raw?: string) { const value = clean(raw)?.replace(/[,$，\s元]/g, ''); return value && /^\d+(?:\.\d+)?$/.test(value) ? Number(value) : undefined; }
function personnel(raw?: string) { const value = clean(raw); return value ? value.split(/[；;、\n]+/).map(clean).filter(Boolean) : []; }
const { text, encoding } = decode(await readFile(inputPath));
const [rawHeaders, ...rows] = parseCsv(text);
const headers = rawHeaders.map((header) => clean(header) ?? '');
const required = ['編號', '許可證字號', '機構名稱', '機構地址', '機構電話', '負責人姓名', '許可證有效期限', '資本額', '專業人員姓名及證照字號'];
const missingColumns = required.filter((header) => !headers.includes(header));
if (missingColumns.length) throw new Error(`Missing source columns: ${missingColumns.join(', ')}`);
const duplicateKeys: string[] = [], invalidDates: string[] = [], invalidCapitalValues: string[] = [], missingFields: string[] = [];
const seen = new Set<string>(), buildDate = new Date().toISOString().slice(0, 10);
const records = rows.flatMap((row, index) => {
  const values = Object.fromEntries(headers.map((header, columnIndex) => [header, clean(row[columnIndex])])) as Record<string, string | undefined>;
  const licenseNumber = values['許可證字號'], agencyName = values['機構名稱'], address = values['機構地址'];
  if (!agencyName || !address) { missingFields.push(`row ${index + 2}`); return []; }
  const key = normalize(licenseNumber) || `${normalize(agencyName)}|${normalize(address)}`;
  if (seen.has(key)) { duplicateKeys.push(key); return []; } seen.add(key);
  const licenseExpiryRaw = values['許可證有效期限'], licenseExpiryDate = parseDate(licenseExpiryRaw), capitalAmountRaw = values['資本額'], capitalAmount = parseCapital(capitalAmountRaw);
  if (licenseExpiryRaw && !licenseExpiryDate) invalidDates.push(`row ${index + 2}: ${licenseExpiryRaw}`);
  if (capitalAmountRaw && capitalAmount == null) invalidCapitalValues.push(`row ${index + 2}: ${capitalAmountRaw}`);
  const professionalPersonnelRaw = values['專業人員姓名及證照字號'], professionalPersonnel = personnel(professionalPersonnelRaw);
  const districtNameFromAddress = districts.find((district) => address.replace(/臺/g, '台').includes(district));
  return [{ id: licenseNumber || createHash('sha1').update(key).digest('hex').slice(0, 12), module: 'domestic_employment_service_agencies', sourceSequenceNumber: values['編號'], licenseNumber, licenseNumberNormalized: normalize(licenseNumber), agencyName, agencyNameNormalized: normalize(agencyName), address, addressNormalized: normalize(address), districtNameFromAddress, phone: values['機構電話'], phoneNormalized: phone(values['機構電話']), responsiblePerson: values['負責人姓名'], licenseExpiryRaw, licenseExpiryDate, licenseExpiryYear: licenseExpiryDate ? Number(licenseExpiryDate.slice(0, 4)) : undefined, licenseStatusRelativeToBuildDate: !licenseExpiryDate ? 'unknown' : licenseExpiryDate < buildDate ? 'expired_on_build_date' : 'active_on_build_date', capitalAmountRaw, capitalAmount, professionalPersonnelRaw, professionalPersonnel, professionalPersonnelCount: professionalPersonnel.length, hasPhone: Boolean(values['機構電話']), googleMapsQuery: clean(`${address} ${agencyName}`), source: '臺北市政府許可仲介本國人在國內工作之私立就業服務機構暨分支機構名冊', sourceAgency: '臺北市政府勞動局' }];
});
const group = (key: string) => Object.entries(records.reduce((map: Record<string, number>, record: any) => { const value = record[key]; if (value != null && value !== '') map[String(value)] = (map[String(value)] ?? 0) + 1; return map; }, {})).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
const capitalValues = records.map((record: any) => record.capitalAmount).filter((value): value is number => typeof value === 'number').sort((a, b) => a - b);
const summary = { totalRecords: records.length, districtCount: new Set(records.map((record: any) => record.districtNameFromAddress).filter(Boolean)).size, uniqueLicenseNumberCount: new Set(records.map((record: any) => record.licenseNumberNormalized).filter(Boolean)).size, recordsWithPhone: records.filter((record: any) => record.hasPhone).length, recordsWithValidExpiryDate: records.filter((record: any) => record.licenseExpiryDate).length, totalProfessionalPersonnel: records.reduce((total: number, record: any) => total + record.professionalPersonnelCount, 0), medianCapitalAmount: capitalValues.length ? capitalValues[Math.floor(capitalValues.length / 2)] : undefined, byDistrict: group('districtNameFromAddress'), byLicenseExpiryYear: group('licenseExpiryYear'), byLicenseStatus: group('licenseStatusRelativeToBuildDate'), byCapitalAmount: group('capitalAmount'), byProfessionalPersonnelCount: group('professionalPersonnelCount') };
await mkdir(outputDirectory, { recursive: true });
await writeFile(join(outputDirectory, 'records.json'), JSON.stringify(records)); await writeFile(join(outputDirectory, 'summary.json'), JSON.stringify(summary));
const previousReport = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
await writeFile(reportPath, JSON.stringify({ ...previousReport, domesticEmploymentServiceAgencies: { convertedAt: new Date().toISOString(), encoding, headers, buildDate, outputRecords: records.length, duplicateKeys, invalidDates, invalidCapitalValues, missingFields, notes: ['No official coordinates supplied; no automatic geocoding or exact markers created.', 'Licence status is calculated only relative to this data build date.'] } }, null, 2));
console.log(`Converted ${records.length} domestic employment service agencies.`);
