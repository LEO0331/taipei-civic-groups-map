import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { cleanText, normalizeDistrict, normalizePhone, normalizeText, roadNameFromAddress, buildSeniorGroupMealServiceSiteSummary } from '../src/lib/seniorGroupMealServiceSites';
import type { SeniorGroupMealServiceSiteRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/senior-group-meal-service-sites');
const outputDir = join(process.cwd(), 'public/data/senior-group-meal-service-sites');
const reportPath = join(process.cwd(), 'public/data/conversion-report.json');
const source = '臺北市銀髮族服務_臺北市老人共餐單位一覽表';
const sourceAgency = '臺北市政府社會局';
const sourcePage = 'https://data.taipei/dataset/detail?id=fe55795c-a220-4b88-bde1-5b994321f8af';

function decodeCsv(bytes: Uint8Array) {
  try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; }
  catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; }
}

export async function convertSeniorGroupMealServiceSites(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No senior group meal service site CSV found. Run npm run data:fetch:senior-group-meal-service-sites.');
  const inputPath = filePath ?? join(rawDir, csvFile!);
  const { text, encoding } = decodeCsv(await readFile(inputPath));
  const [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid senior group meal service site CSV: file is empty.');
  const headers = rawHeaders.map((header) => cleanText(header) ?? '');
  const required = ['序號', '據點名稱', '行政區', '行政區代碼', '據點地址', '聯絡電話'];
  const missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid senior group meal service site CSV: missing columns ${missing.join(', ')}.`);
  const seen = new Set<string>(); const duplicates: string[] = [];
  const records = rows.flatMap((row): SeniorGroupMealServiceSiteRecord[] => {
    const values = Object.fromEntries(headers.map((header, index) => [header, cleanText(row[index])]));
    const sourceSequenceNumber = values['序號'];
    const siteName = values['據點名稱'];
    const districtName = normalizeDistrict(values['行政區']);
    const districtCode = values['行政區代碼'];
    const address = values['據點地址'];
    const phone = values['聯絡電話'];
    if (!siteName && !address) return [];
    const key = sourceSequenceNumber ?? `${normalizeText(siteName) ?? ''}|${normalizeText(districtName) ?? ''}|${normalizeText(address) ?? ''}`;
    if (seen.has(key)) { if (duplicates.length < 20) duplicates.push(key); return []; }
    seen.add(key);
    const addressNormalized = normalizeText(address);
    const phoneNormalized = normalizePhone(phone);
    return [{
      id: createHash('sha1').update(key).digest('hex').slice(0, 12), module: 'senior_group_meal_service_sites', sourceSequenceNumber,
      siteName, siteNameNormalized: normalizeText(siteName), districtName, districtNameNormalized: normalizeText(districtName),
      districtCode, districtCodeNormalized: cleanText(districtCode), address, addressNormalized, roadName: roadNameFromAddress(address),
      phone, phoneNormalized, hasPhone: Boolean(phoneNormalized), googleMapsQuery: cleanText([address, siteName].filter(Boolean).join(' ')), source, sourceAgency,
    }];
  });
  const summary = buildSeniorGroupMealServiceSiteSummary(records);
  const fileInfo = await stat(inputPath);
  const report = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'records.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'summary.json'), JSON.stringify(summary)),
    writeFile(reportPath, JSON.stringify({ ...report, seniorGroupMealServiceSites: { source, sourceAgency, sourcePage, inputFile: basename(inputPath), fileSize: fileInfo.size, convertedAt: new Date().toISOString(), encoding, inputRows: rows.length, outputRecords: records.length, duplicateKeys: duplicates, notes: ['UTF-8-SIG, Big5, and CP950 supported.', 'Phone numbers and district codes are treated as strings.', 'No official coordinates supplied; no geocoding or exact markers created.'] } }, null, 2)),
  ]);
  console.log(`Converted ${records.length} senior group meal service site records from ${basename(inputPath)}.`);
}
if (process.argv[1]?.replace(/\\/g, '/').endsWith('/convertSeniorGroupMealServiceSites.ts')) await convertSeniorGroupMealServiceSites(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
