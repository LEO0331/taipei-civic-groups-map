import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';

const datasetId = '8aeb2d36-b806-4461-9763-5c35017049b0';
const datasetTitle = '臺北市兒科醫療機構';
const datasetUrl = `https://data.taipei/dataset/detail?id=${datasetId}`;
const inputPath = join(process.cwd(), 'data/raw/pediatric-medical-institutions/source.csv');
const metadataPath = join(process.cwd(), 'data/raw/pediatric-medical-institutions/fetch-metadata.json');
const outputDirectory = join(process.cwd(), 'public/data/pediatric-medical-institutions');
const reportPath = join(process.cwd(), 'public/data/conversion-report.json');
const requiredHeaders = ['序號', '機構名稱', '郵遞區號', '地址', '電話'];
const districtByPostalPrefix: Record<string, string> = {
  100: '中正區', 103: '大同區', 104: '中山區', 105: '松山區',
  106: '大安區', 108: '萬華區', 110: '信義區', 111: '士林區',
  112: '北投區', 114: '內湖區', 115: '南港區', 116: '文山區',
};
const taipeiDistricts = Object.values(districtByPostalPrefix);

const clean = (value?: string) => (value ?? '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
const normalized = (value?: string) => clean(value).replace(/[臺台]/g, '台').replace(/\s+/g, '').toLocaleLowerCase();
const sourceHeadersAreValid = (headers: string[]) => requiredHeaders.every((header) => headers.includes(header));

function decodeCsv(bytes: Buffer) {
  const encodings = ['utf-8', 'big5', 'cp950'] as const;
  for (const encoding of encodings) {
    try {
      const text = new TextDecoder(encoding as string, { fatal: true }).decode(bytes).replace(/^\uFEFF/, '');
      const [header] = parseCsv(text);
      if (sourceHeadersAreValid(header.map(clean))) return { text, encoding };
    } catch {
      // Try the next supported source encoding.
    }
  }
  throw new Error('Unable to decode a CSV with the official pediatric-institution headers using UTF-8-SIG, Big5, or CP950.');
}

const bytes = await readFile(inputPath);
const { text, encoding } = decodeCsv(bytes);
const [headerRow, ...rows] = parseCsv(text);
const headers = headerRow.map(clean);
if (!sourceHeadersAreValid(headers)) throw new Error(`Missing required columns: ${requiredHeaders.filter((header) => !headers.includes(header)).join(', ')}`);

const metadata = await readFile(metadataPath, 'utf8').then(JSON.parse).catch(() => ({}));
const exactRows = new Set<string>();
const usedIds = new Set<string>();
const sequenceCounts = new Map<string, number>();
const pendingRows: Array<{ rowNumber: number; sourceValues: Record<string, string>; rowHash: string }> = [];
const report = {
  convertedAt: new Date().toISOString(), encoding, headers, inputRows: rows.length, outputRecords: 0,
  missingInstitutionName: [] as number[], missingAddress: [] as number[], missingTelephoneNumber: [] as number[],
  invalidPostalCode: [] as number[], malformedTelephoneNumber: [] as number[], unresolvedDistrict: [] as number[],
  postalAddressConflicts: [] as number[], duplicateSourceSequenceNumbers: [] as number[], duplicateSourceSequenceValues: [] as string[],
  exactDuplicateRows: [] as number[], sameInstitutionNameMultipleAddresses: [] as string[],
  sameAddressMultipleInstitutionNames: [] as string[], sameInstitutionAndAddressConflictingPhones: [] as string[],
  notes: [
    'All source values are read as strings before normalization.',
    'Exact duplicate source rows are collapsed; institutions are not merged solely by similar names.',
    'No official coordinates are supplied; no geocoding or exact map markers are created.',
    'UTF-8-SIG is attempted first, followed by Big5 and CP950.',
  ],
};

for (const [index, row] of rows.entries()) {
  const rowNumber = index + 2;
  const sourceValues = Object.fromEntries(headers.map((header, column) => [header, clean(row[column])])) as Record<string, string>;
  const signature = JSON.stringify(sourceValues);
  if (exactRows.has(signature)) { report.exactDuplicateRows.push(rowNumber); continue; }
  exactRows.add(signature);
  const sourceSequenceNumber = sourceValues['序號'];
  if (sourceSequenceNumber) sequenceCounts.set(sourceSequenceNumber, (sequenceCounts.get(sourceSequenceNumber) ?? 0) + 1);
  pendingRows.push({ rowNumber, sourceValues, rowHash: createHash('sha1').update(signature).digest('hex').slice(0, 16) });
}

report.duplicateSourceSequenceValues = [...sequenceCounts].filter(([, count]) => count > 1).map(([sequence]) => sequence);
const records = pendingRows.map(({ rowNumber, sourceValues, rowHash }) => {
  const sourceSequenceNumber = sourceValues['序號'];
  const institutionName = sourceValues['機構名稱'];
  const postalCode = sourceValues['郵遞區號'];
  const address = sourceValues['地址'];
  const phoneRaw = sourceValues['電話'];
  const districtFromAddress = taipeiDistricts.find((district) => address.includes(district)) ?? '';
  const districtFromPostalCode = districtByPostalPrefix[postalCode.replace(/\D/g, '').slice(0, 3)] ?? '';
  const districtName = districtFromAddress || districtFromPostalCode;
  const phoneNumbers = phoneRaw.split(/\s*[;；、/,]\s*/).map(clean).filter(Boolean);
  const nameAddressKey = `${normalized(institutionName)}|${normalized(address)}`;
  const hasUniqueSequence = Boolean(sourceSequenceNumber) && sequenceCounts.get(sourceSequenceNumber) === 1;
  const candidateId = hasUniqueSequence ? sourceSequenceNumber : nameAddressKey !== '|' ? `pediatric-${createHash('sha1').update(nameAddressKey).digest('hex').slice(0, 16)}` : `pediatric-${rowHash}`;
  const id = usedIds.has(candidateId) ? `${candidateId}-${rowHash.slice(0, 6)}` : candidateId;
  usedIds.add(id);

  if (!institutionName) report.missingInstitutionName.push(rowNumber);
  if (!address) report.missingAddress.push(rowNumber);
  if (!phoneRaw) report.missingTelephoneNumber.push(rowNumber);
  if (postalCode && !/^\d{3,6}$/.test(postalCode.replace(/[\s-]/g, ''))) report.invalidPostalCode.push(rowNumber);
  if (phoneRaw && phoneRaw.replace(/\D/g, '').length < 7) report.malformedTelephoneNumber.push(rowNumber);
  if (!districtName) report.unresolvedDistrict.push(rowNumber);
  if (districtFromAddress && districtFromPostalCode && districtFromAddress !== districtFromPostalCode) report.postalAddressConflicts.push(rowNumber);
  if (sourceSequenceNumber && sequenceCounts.get(sourceSequenceNumber)! > 1) report.duplicateSourceSequenceNumbers.push(rowNumber);

  return {
    id, module: 'pediatric_medical_institutions', sourceSequenceNumber, institutionName, postalCode,
    districtName, address, phoneRaw, phoneNumbers, hasAddress: Boolean(address), hasPhone: Boolean(phoneRaw),
    hasResolvedDistrict: Boolean(districtName), externalMapQuery: clean(address ? `${address} ${institutionName}` : institutionName), sourceValues,
  };
});

const collectConflicts = (left: keyof typeof records[number], right: keyof typeof records[number]) => Object.entries(records.reduce<Record<string, Set<string>>>((all, record) => {
  const key = normalized(String(record[left] ?? ''));
  const value = normalized(String(record[right] ?? ''));
  if (key && value) (all[key] ??= new Set()).add(value);
  return all;
}, {})).filter(([, values]) => values.size > 1).map(([key]) => key);
report.sameInstitutionNameMultipleAddresses = collectConflicts('institutionName', 'address');
report.sameAddressMultipleInstitutionNames = collectConflicts('address', 'institutionName');
report.sameInstitutionAndAddressConflictingPhones = collectConflicts('externalMapQuery', 'phoneRaw');
report.outputRecords = records.length;

const countBy = (values: string[]) => Object.entries(values.reduce<Record<string, number>>((all, value) => {
  if (value) all[value] = (all[value] ?? 0) + 1;
  return all;
}, {})).map(([label, value]) => ({ label, value })).sort((left, right) => right.value - left.value || left.label.localeCompare(right.label, 'zh-Hant'));

const summary = {
  datasetId, datasetTitle, datasetUrl, totalRecords: records.length,
  uniqueInstitutionNames: new Set(records.map((record) => normalized(record.institutionName)).filter(Boolean)).size,
  districtsCovered: countBy(records.map((record) => record.districtName)).length,
  postalCodesRepresented: countBy(records.map((record) => record.postalCode)).length,
  recordsWithCompleteAddresses: records.filter((record) => record.hasAddress).length,
  recordsWithPhones: records.filter((record) => record.hasPhone).length,
  recordsWithResolvedDistricts: records.filter((record) => record.hasResolvedDistrict).length,
  suspectedDuplicateRecords: report.exactDuplicateRows.length + report.duplicateSourceSequenceNumbers.length + report.sameInstitutionNameMultipleAddresses.length + report.sameAddressMultipleInstitutionNames.length + report.sameInstitutionAndAddressConflictingPhones.length,
  districtWithMostInstitutions: countBy(records.map((record) => record.districtName))[0]?.label ?? '',
  byDistrict: countBy(records.map((record) => record.districtName)), byPostalCode: countBy(records.map((record) => record.postalCode)),
  sourceFileUpdatedAt: metadata.sourceFileUpdatedAt ?? '', metadataUpdatedAt: metadata.metadataUpdatedAt ?? '',
  sourceUrl: metadata.sourceUrl ?? '', ingestedAt: metadata.downloadedAt ?? new Date().toISOString(),
};

const priorReport = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(join(outputDirectory, 'records.json'), JSON.stringify(records, null, 2)),
  writeFile(join(outputDirectory, 'summary.json'), JSON.stringify(summary, null, 2)),
  writeFile(reportPath, JSON.stringify({ ...priorReport, pediatricMedicalInstitutions: report }, null, 2)),
]);
console.log(`Converted ${records.length} pediatric medical institution records (${encoding}).`);
