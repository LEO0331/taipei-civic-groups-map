import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';

const inputPath = join(process.cwd(), 'data/raw/hospital-hemodialysis-resources/records.csv');
const outputDirectory = join(process.cwd(), 'public/data/hospital-hemodialysis-resources');
const reportPath = join(process.cwd(), 'public/data/conversion-report.json');
const districtByCode: Record<string, string> = { '63000010': '松山區', '63000020': '信義區', '63000030': '大安區', '63000040': '中山區', '63000050': '中正區', '63000060': '大同區', '63000070': '萬華區', '63000080': '文山區', '63000090': '南港區', '63000100': '內湖區', '63000110': '士林區', '63000120': '北投區' };
const clean = (value?: string) => value?.replace(/\s+/g, ' ').trim() || undefined;
const normalize = (value?: string) => clean(value)?.replace(/[臺台]/g, '台').toLocaleLowerCase();
const districtFromAddress = (value?: string) => normalize(value)?.match(/(松山|信義|大安|中山|中正|大同|萬華|文山|南港|內湖|士林|北投)區/)?.[0];
const roadName = (value?: string) => clean(value)?.match(/(?:[^\s區]+?[路街大道巷弄])/u)?.[0];
const normalizePhone = (value?: string) => clean(value)?.replace(/[\s（）()－–—-]/g, '');
function decode(bytes: Uint8Array) { try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; } catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; } }
const { text, encoding } = decode(await readFile(inputPath));
const [rawHeaders, ...rows] = parseCsv(text); const headers = rawHeaders.map((header) => clean(header) ?? '');
const required = ['項次', '機構名稱', '行政區域代碼', '地址', '電話']; const missingColumns = required.filter((header) => !headers.includes(header)); if (missingColumns.length) throw new Error(`Missing source columns: ${missingColumns.join(', ')}`);
const duplicates: string[] = [], missingFields: string[] = [], unknownDistrictCodes: string[] = [], seen = new Set<string>();
const records = rows.flatMap((row, index) => { const values = Object.fromEntries(headers.map((header, columnIndex) => [header, clean(row[columnIndex])])) as Record<string, string | undefined>; const sourceSequenceNumber = values['項次'], institutionName = values['機構名稱'], districtCode = values['行政區域代碼'], address = values['地址'], phone = values['電話']; if (!institutionName || !address) { missingFields.push(`row ${index + 2}`); return []; } const key = `${normalize(institutionName)}|${normalize(address)}|${normalizePhone(phone)}`; if (seen.has(key)) { duplicates.push(key); return []; } seen.add(key); const districtName = (districtCode && districtByCode[districtCode]) || districtFromAddress(address); if (districtCode && !districtByCode[districtCode]) unknownDistrictCodes.push(districtCode); return [{ id: sourceSequenceNumber || createHash('sha1').update(key).digest('hex').slice(0, 12), module: 'hospital_hemodialysis_resources', sourceSequenceNumber, institutionName, institutionNameNormalized: normalize(institutionName), districtCode, districtCodeNormalized: clean(districtCode), districtName, address, addressNormalized: normalize(address), roadName: roadName(address), phone, phoneNormalized: normalizePhone(phone), hasPhone: Boolean(phone), googleMapsQuery: clean(`${address} ${institutionName}`), source: '臺北市公私立醫院血液透析資源', sourceAgency: '臺北市政府衛生局' }]; });
const byDistrict = new Map<string, number>(); records.forEach((record: any) => { if (record.districtName) byDistrict.set(record.districtName, (byDistrict.get(record.districtName) ?? 0) + 1); });
const summary = { totalRecords: records.length, districtCount: byDistrict.size, uniqueInstitutionNameCount: new Set(records.map((record: any) => record.institutionNameNormalized).filter(Boolean)).size, recordsWithPhone: records.filter((record: any) => record.hasPhone).length, recordsWithoutPhone: records.filter((record: any) => !record.hasPhone).length, byDistrict: [...byDistrict].map(([district, count]) => ({ district, count })).sort((a, b) => b.count - a.count) };
await mkdir(outputDirectory, { recursive: true }); await writeFile(join(outputDirectory, 'records.json'), JSON.stringify(records)); await writeFile(join(outputDirectory, 'summary.json'), JSON.stringify(summary));
const priorReport = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({})); await writeFile(reportPath, JSON.stringify({ ...priorReport, hospitalHemodialysisResources: { convertedAt: new Date().toISOString(), encoding, headers, outputRecords: records.length, duplicates, missingFields, unknownDistrictCodes: [...new Set(unknownDistrictCodes)], notes: ['No official coordinates supplied; no automatic geocoding or exact markers created.'] } }, null, 2));
console.log(`Converted ${records.length} hospital hemodialysis resource records.`);
