import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { clean, district, norm, road, summary } from '../src/lib/generalDentalMedicalInstitutions';
import type { GeneralDentalMedicalInstitutionRecord } from '../src/types';

const raw = join(process.cwd(), 'data/raw/general-dental-medical-institutions/general-dental-medical-institutions.csv');
const outputDirectory = join(process.cwd(), 'public/data/general-dental-medical-institutions');
const reportPath = join(process.cwd(), 'public/data/conversion-report.json');
const bytes = await readFile(raw);
let text: string;
try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''); }
catch { text = new TextDecoder('big5').decode(bytes).replace(/^\uFEFF/, ''); }

const [rawHeaders, ...rows] = parseCsv(text);
const headers = rawHeaders.map((header) => clean(header) ?? '');
const seen = new Set<string>();
const duplicates: string[] = [];
const missingFields: string[] = [];
const unknownDistricts: string[] = [];
const records: GeneralDentalMedicalInstitutionRecord[] = rows.flatMap((row, index): GeneralDentalMedicalInstitutionRecord[] => {
  const values = Object.fromEntries(headers.map((header, columnIndex) => [header, clean(row[columnIndex])])) as Record<string, string | undefined>;
  const sourceSequenceNumber = values['序號'];
  const institutionName = values['機構名稱'];
  const postalCode = values['郵遞區號'];
  const address = values['地址'];
  const phone = values['電話'];
  if (!institutionName || !address) { missingFields.push(String(index + 2)); return []; }
  const duplicateKey = `${norm(institutionName)}|${norm(address)}|${norm(phone)}`;
  if (seen.has(duplicateKey)) { duplicates.push(duplicateKey); return []; }
  seen.add(duplicateKey);
  const districtNameFromAddress = district(address);
  if (!districtNameFromAddress) unknownDistricts.push(String(index + 2));
  return [{
    id: createHash('sha1').update(duplicateKey).digest('hex').slice(0, 12), module: 'general_dental_medical_institutions',
    sourceSequenceNumber, institutionName, institutionNameNormalized: norm(institutionName), postalCode, postalCodeNormalized: clean(postalCode),
    districtNameFromAddress, address, addressNormalized: norm(address), roadName: road(address), phone,
    phoneNormalized: phone?.replace(/[\s（）()－–—-]/g, ''), hasPhone: Boolean(phone), googleMapsQuery: clean(`${address} ${institutionName}`),
    source: '臺北市牙醫一般科醫療機構', sourceAgency: '臺北市政府衛生局',
  }];
});
const report = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(join(outputDirectory, 'records.json'), JSON.stringify(records)),
  writeFile(join(outputDirectory, 'summary.json'), JSON.stringify(summary(records))),
  writeFile(reportPath, JSON.stringify({ ...report, generalDentalMedicalInstitutions: {
    convertedAt: new Date().toISOString(), headers, outputRecords: records.length, duplicates, missingFields, unknownDistricts,
    notes: ['UTF-8-SIG decoded with Big5 / CP950 fallback.', 'No official coordinates supplied; no exact markers or geocoding created.'],
  } }, null, 2)),
]);
console.log(`Converted ${records.length} general dental institutions.`);
