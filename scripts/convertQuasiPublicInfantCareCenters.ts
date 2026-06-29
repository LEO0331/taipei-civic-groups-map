import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { normalizeColumnName, normalizeText, TAIPEI_DISTRICT_CENTROIDS } from '../src/lib/civicGroups';
import {
  buildQuasiPublicInfantCareCenterSummary, classifyInfantCareCenterOperationType, deriveCapacityMetrics,
  parseInfantCareCenterAddress, parseInfantCareCenterPhone, parseInfantCareEvaluationResult, parseIntegerValue,
} from '../src/lib/quasiPublicInfantCareCenters';
import type { QuasiPublicInfantCareCenter } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/quasi-public-infant-care-centers');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市準公共化托嬰中心';
const sourceAgency = '臺北市政府社會局';

function decodeCsv(bytes: Uint8Array) {
  try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; }
  catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; }
}

export async function convertQuasiPublicInfantCareCenters(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No quasi-public infant care center CSV found. Run npm run data:fetch:infant-care.');
  const inputPath = filePath ?? join(rawDir, csvFile!);
  const { text, encoding } = decodeCsv(await readFile(inputPath));
  const [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid infant care CSV: file is empty.');
  const headers = rawHeaders.map(normalizeColumnName);
  const required = ['序號', '機構名稱', '行政區', '地址', '電話', '核定收托人數', '實際收托人數', '評鑑結果'];
  const missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid infant care CSV: missing columns ${missing.join(', ')}.`);

  const invalidNumbers: string[] = [], addressWarnings: string[] = [], phoneWarnings: string[] = [], evaluationWarnings: string[] = [], capacityWarnings: string[] = [], duplicateKeys: string[] = [];
  const seen = new Set<string>();
  const records = rows.flatMap((row): QuasiPublicInfantCareCenter[] => {
    const values = Object.fromEntries(headers.map((header, column) => [header, normalizeText(row[column])]));
    const centerName = values['機構名稱'];
    if (!centerName) return [];
    const sourceSequenceNumber = parseIntegerValue(values['序號']);
    const approvedCapacity = parseIntegerValue(values['核定收托人數']);
    const actualEnrollment = parseIntegerValue(values['實際收托人數']);
    (['序號', '核定收托人數', '實際收托人數'] as const).forEach((key) => { if (values[key] && parseIntegerValue(values[key]) === undefined && invalidNumbers.length < 20) invalidNumbers.push(`${key}:${values[key]}`); });
    const address = parseInfantCareCenterAddress(values['地址'], values['行政區']);
    const phone = parseInfantCareCenterPhone(values['電話']);
    const evaluation = parseInfantCareEvaluationResult(values['評鑑結果']);
    const capacity = deriveCapacityMetrics(approvedCapacity, actualEnrollment);
    if (address.warning && addressWarnings.length < 20) addressWarnings.push(address.warning);
    if (phone.warning && phoneWarnings.length < 20) phoneWarnings.push(values['電話'] ?? '');
    if (evaluation.warning && evaluationWarnings.length < 20) evaluationWarnings.push(values['評鑑結果'] ?? '');
    if (capacity.warning && capacityWarnings.length < 20) capacityWarnings.push(`${centerName}:${capacity.warning}`);
    const key = `${sourceSequenceNumber ?? ''}|${centerName}` || `${centerName}|${address.addressNormalized ?? ''}`;
    if (seen.has(key)) { if (duplicateKeys.length < 20) duplicateKeys.push(key); return []; }
    seen.add(key);
    const point = address.district ? TAIPEI_DISTRICT_CENTROIDS[address.district] : undefined;
    return [{
      id: createHash('sha1').update(key).digest('hex').slice(0, 12),
      module: 'quasi_public_infant_care_centers',
      sourceSequenceNumber,
      centerName,
      centerOperationType: classifyInfantCareCenterOperationType(centerName),
      district: address.district ?? values['行政區'],
      address: address.address,
      addressNormalized: address.addressNormalized,
      roadName: address.roadName,
      phone: phone.phone,
      phoneDisplay: phone.phoneDisplay,
      phoneDialHref: phone.phoneDialHref,
      phoneType: phone.phoneType,
      hasPhone: Boolean(phone.phone),
      approvedCapacity,
      actualEnrollment,
      apparentRemainingCapacity: capacity.apparentRemainingCapacity,
      occupancyRatePercent: capacity.occupancyRatePercent,
      capacityStatus: capacity.capacityStatus,
      evaluationResultRaw: evaluation.evaluationResultRaw,
      evaluationRocYear: evaluation.evaluationRocYear,
      evaluationGregorianYear: evaluation.evaluationGregorianYear,
      evaluationGrade: evaluation.evaluationGrade,
      hasEvaluationResult: Boolean(evaluation.evaluationResultRaw),
      locationPrecision: point ? 'district_centroid' : 'missing',
      latitude: point?.latitude,
      longitude: point?.longitude,
      source,
      sourceAgency,
    }];
  });

  const fileInfo = await stat(inputPath);
  let report = {};
  try { report = JSON.parse(await readFile(reportPath, 'utf8')); } catch { /* first conversion */ }
  const summary = buildQuasiPublicInfantCareCenterSummary(records);
  const quasiPublicInfantCareCenters = {
    source, sourceAgency, officialSourceAgencyShort: '社會局',
    sourcePage: 'https://data.taipei/dataset/detail?id=aeaaa517-089c-42a7-ad5b-60fef89c3545',
    category: '社福', serviceCategory: '生育保健', datasetType: '網路服務', description: '提供準公共化托嬰中心名冊',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding,
    inputRows: rows.length, outputRecords: records.length, duplicateKeys,
    invalidNumberExamples: invalidNumbers, addressWarningExamples: addressWarnings, phoneWarningExamples: phoneWarnings, evaluationWarningExamples: evaluationWarnings, capacityWarningExamples: capacityWarnings,
    totalApprovedCapacity: summary.totalApprovedCapacity, totalActualEnrollment: summary.totalActualEnrollment, totalApparentRemainingCapacity: summary.totalApparentRemainingCapacity,
    notes: ['UTF-8-SIG decoded with Big5 fallback', 'Strings and column names trimmed', 'Phone values preserved as source text', 'No geocoding used; records use district centroids only', 'Listed capacity gap is derived from source fields and is not real-time vacancy'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'quasi-public-infant-care-centers.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'quasi-public-infant-care-center-summary.json'), JSON.stringify(summary)),
    writeFile(reportPath, JSON.stringify({ ...report, quasiPublicInfantCareCenters }, null, 2)),
  ]);
  console.log(`Converted ${records.length} quasi-public infant care center records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await convertQuasiPublicInfantCareCenters(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
}
