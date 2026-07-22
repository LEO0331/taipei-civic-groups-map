import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';

const rawPath = join(process.cwd(), 'data/raw/tb-contact-screening-partner-providers/source.csv');
const outputDirectory = join(process.cwd(), 'public/data/tb-contact-screening-partner-providers');
const clean = (value?: string) => value?.replace(/[ \t]+/g, ' ').trim() ?? '';

function decodeCsv(bytes: Uint8Array) {
  try {
    return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' };
  } catch {
    return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' };
  }
}

const { text, encoding } = decodeCsv(await readFile(rawPath));
const [rawHeaders, ...rows] = parseCsv(text);
const headers = rawHeaders.map(clean);
const requiredHeaders = ['編號', '縣市', '醫療機構名稱', '醫師姓名', '專科別', '門診時間'];
const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
if (missingHeaders.length) throw new Error(`Missing official source columns: ${missingHeaders.join(', ')}`);

const duplicates: string[] = [];
const missingInstitutions: string[] = [];
const missingPhysicians: string[] = [];
const seen = new Set<string>();
const records = rows.flatMap((row, index) => {
  const source = Object.fromEntries(headers.map((header, column) => [header, clean(row[column])])) as Record<string, string>;
  const sourceSequenceNumber = source['編號'];
  const cityName = source['縣市'];
  const institutionName = source['醫療機構名稱'];
  const physicianName = source['醫師姓名'];
  const specialtyRaw = source['專科別'];
  const clinicHoursRaw = source['門診時間'];
  const id = sourceSequenceNumber || `${institutionName}|${physicianName}|${specialtyRaw}|${index + 2}`;
  const key = `${institutionName}|${physicianName}|${specialtyRaw}|${clinicHoursRaw}`;
  if (!institutionName) missingInstitutions.push(id);
  if (!physicianName) missingPhysicians.push(id);
  if (!institutionName && !physicianName) return [];
  if (seen.has(key)) { duplicates.push(id); return []; }
  seen.add(key);
  return [{ id, sourceSequenceNumber, cityName, institutionName, physicianName, specialtyRaw, specialtyNormalized: specialtyRaw, clinicHoursRaw, hasPhysicianName: Boolean(physicianName), hasClinicHours: Boolean(clinicHoursRaw) }];
});
const countBy = (field: 'cityName' | 'specialtyRaw') => Object.entries(records.reduce((counts, record) => {
  if (record[field]) counts[record[field]] = (counts[record[field]] ?? 0) + 1;
  return counts;
}, {} as Record<string, number>)).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
const summary = {
  totalRecords: records.length,
  uniqueInstitutionCount: new Set(records.map((record) => record.institutionName).filter(Boolean)).size,
  uniquePhysicianCount: new Set(records.map((record) => record.physicianName).filter(Boolean)).size,
  cityCount: new Set(records.map((record) => record.cityName).filter(Boolean)).size,
  specialtyCount: new Set(records.map((record) => record.specialtyRaw).filter(Boolean)).size,
  recordsWithClinicHours: records.filter((record) => record.hasClinicHours).length,
  byCity: countBy('cityName'),
  bySpecialty: countBy('specialtyRaw'),
};

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(join(outputDirectory, 'records.json'), JSON.stringify(records)),
  writeFile(join(outputDirectory, 'summary.json'), JSON.stringify(summary)),
  writeFile(join(outputDirectory, 'conversion-report.json'), JSON.stringify({
    source: '台北市結核病接觸者胸部X光檢查暨丙型干擾素血液測驗(IGRA)合作醫療院所名單',
    sourcePage: 'https://data.taipei/dataset/detail?id=c4557036-8e61-448d-ad68-7f350b6dd30f',
    encoding,
    sourceFields: headers,
    inputRows: rows.length,
    outputRecords: records.length,
    duplicates,
    missingInstitutions,
    missingPhysicians,
    notes: ['UTF-8-SIG, Big5, and CP950 supported.', 'All source fields are read as strings.', 'No address or coordinates are supplied; no geocoding or map markers are created.', 'Clinic hours are preserved as source-recorded descriptive text only.'],
  }, null, 2)),
]);
console.log(`Converted ${records.length} TB contact screening partner-provider records (${encoding}).`);
