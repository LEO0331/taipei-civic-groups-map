import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { buildRegisteredAnimalHospitalSummary, parseAnimalHospitalAddress, parseAnimalHospitalPhone } from '../src/lib/registeredAnimalHospitals';
import { normalizeColumnName, normalizeText } from '../src/lib/civicGroups';
import type { RegisteredAnimalHospital } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/registered-animal-hospitals');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市動物醫院一覽表';
const sourceAgency = '臺北市政府產業發展局動物保護處';

function decodeCsv(bytes: Uint8Array) {
  try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; }
  catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; }
}

export async function convertRegisteredAnimalHospitals(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No registered animal hospital CSV found. Run npm run data:fetch:animal-hospitals.');
  const inputPath = filePath ?? join(rawDir, csvFile!);
  const { text, encoding } = decodeCsv(await readFile(inputPath));
  const [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid animal hospital CSV: file is empty.');
  const headers = rawHeaders.map(normalizeColumnName);
  const required = ['縣市', '動物醫院名稱', '地址', '電話', '負責人'];
  const missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid animal hospital CSV: missing columns ${missing.join(', ')}.`);

  const addressWarnings: string[] = [], phoneWarnings: string[] = [], duplicateKeys: string[] = [];
  const seen = new Set<string>();
  const records = rows.flatMap((row): RegisteredAnimalHospital[] => {
    const values = Object.fromEntries(headers.map((header, column) => [header, normalizeText(row[column])]));
    const animalHospitalName = values['動物醫院名稱'];
    if (!animalHospitalName) return [];
    const address = parseAnimalHospitalAddress(values['地址']);
    const phone = parseAnimalHospitalPhone(values['電話']);
    if (address.warning && addressWarnings.length < 20) addressWarnings.push(values['地址'] ?? '');
    if (phone.warning && phoneWarnings.length < 20) phoneWarnings.push(values['電話'] ?? '');
    const key = `${animalHospitalName}|${address.addressNormalized ?? phone.phone ?? ''}`;
    if (seen.has(key)) { if (duplicateKeys.length < 20) duplicateKeys.push(key); return []; }
    seen.add(key);
    return [{
      id: createHash('sha1').update(key).digest('hex').slice(0, 12),
      module: 'registered_animal_hospitals',
      city: values['縣市'],
      animalHospitalName,
      address: address.address,
      addressNormalized: address.addressNormalized,
      postalCode: address.postalCode,
      district: address.district,
      roadName: address.roadName,
      phone: phone.phone,
      phoneDisplay: phone.phoneDisplay,
      phoneDialHref: phone.phoneDialHref,
      phoneType: phone.phoneType,
      hasPhone: Boolean(phone.phone),
      responsiblePersonName: values['負責人'],
      hasResponsiblePersonName: Boolean(values['負責人']),
      locationPrecision: 'address_only',
      source,
      sourceAgency,
    }];
  });

  const fileInfo = await stat(inputPath);
  let report = {};
  try { report = JSON.parse(await readFile(reportPath, 'utf8')); } catch { /* first conversion */ }
  const registeredAnimalHospitals = {
    source, sourceAgency, officialSourceAgencyShort: '產業局動保處',
    sourcePage: 'https://data.taipei/dataset/detail?id=01bcb5ee-7c18-41fa-86d4-4e75daee1f94',
    category: '農業', serviceCategory: '公共資訊', datasetType: '原始資料', description: '提供臺北市動物醫院資料。',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding,
    inputRows: rows.length, outputRecords: records.length, duplicateKeys,
    recordsWithoutDistrict: records.filter((record) => !record.district).length,
    addressWarningExamples: addressWarnings, phoneWarningExamples: phoneWarnings,
    notes: ['UTF-8-SIG decoded with Big5 fallback', 'Strings and column names trimmed', 'Phone values preserved as source text', 'No coordinates supplied; records use address_only precision', 'Responsible person names are preserved but intended for source details only'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'registered-animal-hospitals.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'registered-animal-hospital-summary.json'), JSON.stringify(buildRegisteredAnimalHospitalSummary(records))),
    writeFile(reportPath, JSON.stringify({ ...report, registeredAnimalHospitals }, null, 2)),
  ]);
  console.log(`Converted ${records.length} registered animal hospital records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await convertRegisteredAnimalHospitals(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
}
