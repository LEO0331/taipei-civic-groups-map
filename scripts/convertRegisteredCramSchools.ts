import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import {
  buildRegisteredCramSchoolSummary, parseCramSchoolAddress, parseNumberField, parseRegistrationDate,
} from '../src/lib/registeredCramSchools';
import { normalizeColumnName, normalizeText } from '../src/lib/civicGroups';
import type { RegisteredCramSchool } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/registered-cram-schools');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市立案補習班資訊';
const sourceAgency = '臺北市政府教育局';

function decodeCsv(bytes: Uint8Array) {
  try {
    return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' };
  } catch {
    return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' };
  }
}

export async function convertRegisteredCramSchools(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No registered cram-school CSV found. Run npm run data:fetch:registered-cram-schools.');
  const inputPath = filePath ?? join(rawDir, csvFile!);
  const { text, encoding } = decodeCsv(await readFile(inputPath));
  const [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid registered cram-school CSV: file is empty.');
  const headers = rawHeaders.map(normalizeColumnName);
  const required = ['序號', '主管機關文件代碼', '補習班中文名稱', '補習班中文住址', '電話', '立案日期', '立案文號', '教室數', '教室面積', '班舍總面積'];
  const missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid registered cram-school CSV: missing columns ${missing.join(', ')}.`);

  const districtWarnings: string[] = [];
  const dateWarnings: string[] = [];
  const numericWarnings: string[] = [];
  const duplicateExamples: string[] = [];
  const seen = new Map<string, RegisteredCramSchool>();
  const records = rows.flatMap((row, index): RegisteredCramSchool[] => {
    const values = Object.fromEntries(headers.map((header, column) => [header, normalizeText(row[column])]));
    const cramSchoolName = values['補習班中文名稱'];
    if (!cramSchoolName) return [];
    const address = parseCramSchoolAddress(values['補習班中文住址']);
    const registration = parseRegistrationDate(values['立案日期']);
    const numeric = {
      sourceSequenceNumber: parseNumberField(values['序號']),
      classroomCount: parseNumberField(values['教室數']),
      classroomAreaSqm: parseNumberField(values['教室面積']),
      premisesAreaSqm: parseNumberField(values['班舍總面積']),
    };
    if (address.warning && districtWarnings.length < 20) districtWarnings.push(values['補習班中文住址'] ?? '');
    if (registration.warning && dateWarnings.length < 20) dateWarnings.push(values['立案日期'] ?? '');
    (['序號', '教室數', '教室面積', '班舍總面積'] as const).forEach((field) => {
      if (values[field] && parseNumberField(values[field]) === undefined && numericWarnings.length < 20) numericWarnings.push(`${field}: ${values[field]}`);
    });
    const authorityDocumentCode = values['主管機關文件代碼'];
    const dedupeKey = normalizeText(authorityDocumentCode)?.toLocaleLowerCase()
      || [cramSchoolName, address.address, values['立案文號']].map((value) => normalizeText(value)?.toLocaleLowerCase() ?? '').join('|');
    const existing = seen.get(dedupeKey);
    if (existing && (existing.cramSchoolName !== cramSchoolName || existing.address !== address.address) && duplicateExamples.length < 20) {
      duplicateExamples.push(dedupeKey);
    }
    const record: RegisteredCramSchool = {
      id: createHash('sha1').update(`${dedupeKey}|${index}`).digest('hex').slice(0, 12),
      module: 'registered_cram_schools',
      sourceSequenceNumber: numeric.sourceSequenceNumber,
      authorityDocumentCode,
      cramSchoolName,
      address: address.address,
      addressWithoutPostalCode: address.addressWithoutPostalCode,
      postalCode: address.postalCode,
      district: address.district,
      phone: values['電話'],
      registrationDateRaw: registration.registrationDateRaw,
      registrationDate: registration.registrationDate,
      registrationYear: registration.registrationYear,
      registrationDecade: registration.registrationDecade,
      registrationDocumentNumber: values['立案文號'],
      classroomCount: numeric.classroomCount,
      classroomAreaSqm: numeric.classroomAreaSqm,
      premisesAreaSqm: numeric.premisesAreaSqm,
      locationPrecision: 'address_only',
      source,
      sourceAgency,
    };
    seen.set(dedupeKey, record);
    return [record];
  });

  const fileInfo = await stat(inputPath);
  let report = {};
  try { report = JSON.parse(await readFile(reportPath, 'utf8')); } catch { /* first conversion */ }
  const registeredCramSchools = {
    source, sourceAgency, sourcePage: 'https://data.taipei/dataset/detail?id=b124a967-fc88-4c45-bea8-41b4ef158a15',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding,
    inputRows: rows.length, outputRecords: records.length,
    recordsWithoutDistrict: records.filter((record) => !record.district).length,
    failedDistrictExamples: districtWarnings, failedDateExamples: dateWarnings, failedNumericExamples: numericWarnings,
    duplicateAuthorityDocumentExamples: duplicateExamples,
    notes: ['UTF-8-SIG decoded with Big5 fallback', 'Strings trimmed', 'Empty strings normalized', 'No coordinates supplied; records use address_only precision'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'registered-cram-schools.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'registered-cram-school-summary.json'), JSON.stringify(buildRegisteredCramSchoolSummary(records))),
    writeFile(reportPath, JSON.stringify({ ...report, registeredCramSchools }, null, 2)),
  ]);
  console.log(`Converted ${records.length} registered cram-school records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await convertRegisteredCramSchools(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
}
