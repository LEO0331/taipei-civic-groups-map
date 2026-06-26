import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { classifyCompanyNameKeywordTags, coordinateDetails, normalizeBusinessId, parseNangangSoftwareParkAddress, buildNangangSoftwareParkCompanySummary } from '../src/lib/nangangSoftwareParkCompanies';
import { normalizeColumnName, normalizeText } from '../src/lib/civicGroups';
import type { NangangSoftwareParkCompany } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/nangang-software-park-companies'), outputDir = join(process.cwd(), 'public/data'), reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市南港軟體工業園區廠商資料名錄', sourceAgency = '臺北市政府產業發展局';
const decode = (bytes: Uint8Array) => { try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; } catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; } };

export async function convertNangangSoftwareParkCompanies(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No Nangang Software Park company CSV found. Run npm run data:fetch:nangang-software-park.');
  const inputPath = filePath ?? join(rawDir, csvFile!), { text, encoding } = decode(await readFile(inputPath)), [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid Nangang Software Park company CSV: file is empty.');
  const headers = rawHeaders.map(normalizeColumnName), required = ['統編', '公司名稱', '公司地址', '經度', '緯度'], missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid Nangang Software Park company CSV: missing columns ${missing.join(', ')}.`);
  const badIds: string[] = [], addressWarnings: string[] = [], coordinateWarnings: string[] = [], duplicateBusinessIds: string[] = [], seen = new Map<string, string>();
  const records = rows.flatMap((row, index): NangangSoftwareParkCompany[] => {
    const values = Object.fromEntries(headers.map((header, column) => [header, normalizeText(row[column])])), businessId = normalizeBusinessId(values['統編']), companyName = values['公司名稱'];
    if (!businessId || !companyName) return [];
    if (!/^\d{8}$/.test(businessId) && badIds.length < 20) badIds.push(businessId);
    const address = parseNangangSoftwareParkAddress(values['公司地址']), coordinates = coordinateDetails(values['經度'], values['緯度']);
    if (!address.district && addressWarnings.length < 20) addressWarnings.push(values['公司地址'] ?? '');
    if (coordinates.coordinateStatus !== 'valid' && coordinateWarnings.length < 20) coordinateWarnings.push(`${values['經度'] ?? ''},${values['緯度'] ?? ''}`);
    const signature = `${companyName}|${address.address ?? ''}`; if (seen.has(businessId) && seen.get(businessId) !== signature && duplicateBusinessIds.length < 20) duplicateBusinessIds.push(businessId); seen.set(businessId, signature);
    return [{ id: createHash('sha1').update(`${businessId}|${signature}|${index}`).digest('hex').slice(0, 12), module: 'nangang_software_park_companies', businessId, companyName, ...address, xTwd97Raw: values['經度'], yTwd97Raw: values['緯度'], ...coordinates, companyNameKeywordTags: classifyCompanyNameKeywordTags(companyName), source, sourceAgency }];
  });
  const fileInfo = await stat(inputPath); const report = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
  const nangangSoftwareParkCompanies = { source, sourceAgency: '產業局', sourcePage: 'https://data.taipei/dataset/detail?id=6b7c48b4-03a6-4fcc-b172-9cee415c20b9', theme: '經濟', serviceCategory: '開創事業', updateFrequency: '每3月', inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding, inputRows: rows.length, outputRecords: records.length, invalidBusinessIdExamples: badIds, addressNormalizationWarnings: addressWarnings, coordinateWarnings, duplicateBusinessIds, notes: ['UTF-8-SIG decoded with Big5 fallback', 'Business IDs preserved as strings', 'Coordinate source is detected; EPSG:3826 is converted to WGS84', 'Company-name keyword tags are heuristic and not official industry categories'] };
  await mkdir(outputDir, { recursive: true }); await Promise.all([writeFile(join(outputDir, 'nangang-software-park-companies.json'), JSON.stringify(records)), writeFile(join(outputDir, 'nangang-software-park-company-summary.json'), JSON.stringify(buildNangangSoftwareParkCompanySummary(records))), writeFile(reportPath, JSON.stringify({ ...report, nangangSoftwareParkCompanies }, null, 2))]);
  console.log(`Converted ${records.length} Nangang Software Park company records from ${basename(inputPath)}.`);
}
if (import.meta.url === `file://${process.argv[1]}`) await convertNangangSoftwareParkCompanies(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
