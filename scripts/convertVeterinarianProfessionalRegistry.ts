import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { buildVeterinarianProfessionalRegistrySummary, cleanText, createAnimalHospitalMatchKey, normalizeText, normalizeVeterinarianName, parseVeterinarianCityCode, parseVeterinarianCityCounty, parseVeterinarianPracticeLicenseNumber } from '../src/lib/veterinarianProfessionalRegistry';
import type { VeterinarianProfessionalRegistryRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/veterinarian-professional-registry');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市獸醫師資訊';
const sourceAgency = '臺北市政府產業發展局動物保護處';
const decode = (bytes: Uint8Array) => { try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; } catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; } };
const duplicates = (values: Array<string | undefined>) => [...values.reduce((map, value) => value ? map.set(value, (map.get(value) ?? 0) + 1) : map, new Map<string, number>())].filter(([, count]) => count > 1).slice(0, 30).map(([value, count]) => ({ value, count }));

export async function convertVeterinarianProfessionalRegistry(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No veterinarian registry CSV found. Run npm run data:fetch:veterinarians.');
  const inputPath = filePath ?? join(rawDir, csvFile!), { text, encoding } = decode(await readFile(inputPath)), [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid veterinarian registry CSV: file is empty.');
  const headers = rawHeaders.map((header) => cleanText(header) ?? ''), required = ['縣市代碼', '縣市', '姓名', '執業執照字號', '服務獸醫診療機構名稱'], missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid veterinarian registry CSV: missing columns ${missing.join(', ')}.`);

  const cityCodeWarnings: string[] = [], cityCountyWarnings: string[] = [], licenseNumberWarnings: string[] = [], duplicateKeys: string[] = [];
  const seenKeys = new Set<string>();
  const records = rows.flatMap((row, index): VeterinarianProfessionalRegistryRecord[] => {
    const values = Object.fromEntries(headers.map((header, column) => [header, cleanText(row[column])]));
    const veterinarianName = cleanText(values.姓名), serviceVeterinaryInstitutionName = cleanText(values.服務獸醫診療機構名稱), license = parseVeterinarianPracticeLicenseNumber(values.執業執照字號);
    if (!veterinarianName && !license.practiceLicenseNumber && !serviceVeterinaryInstitutionName) return [];
    const cityCode = parseVeterinarianCityCode(values.縣市代碼), city = parseVeterinarianCityCounty(values.縣市);
    if (cityCode.warning && cityCodeWarnings.length < 20) cityCodeWarnings.push(`${veterinarianName ?? index + 1}:${cityCode.cityCode ?? ''}`);
    if (city.warning && cityCountyWarnings.length < 20) cityCountyWarnings.push(`${veterinarianName ?? index + 1}:${city.cityCounty ?? ''}`);
    if (license.practiceLicenseNumberFormat === 'mixed' && licenseNumberWarnings.length < 20) licenseNumberWarnings.push(`${veterinarianName ?? index + 1}:${license.practiceLicenseNumber ?? ''}`);
    const veterinarianNameNormalized = normalizeVeterinarianName(veterinarianName), serviceVeterinaryInstitutionNameNormalized = normalizeText(serviceVeterinaryInstitutionName);
    const key = [license.practiceLicenseNumberNormalized, veterinarianNameNormalized, serviceVeterinaryInstitutionNameNormalized].filter(Boolean).join('|') || `${index}`;
    if (seenKeys.has(key) && duplicateKeys.length < 20) duplicateKeys.push(key); seenKeys.add(key);
    const sourceRecordHash = createHash('sha1').update(`${key}|${index}`).digest('hex');
    return [{ id: sourceRecordHash.slice(0, 12), module: 'veterinarian_professional_registry', ...cityCode, ...city, veterinarianName: veterinarianName ?? '', veterinarianNameNormalized, ...license, practiceLicenseNumber: license.practiceLicenseNumber ?? '', serviceVeterinaryInstitutionName: serviceVeterinaryInstitutionName ?? '', serviceVeterinaryInstitutionNameNormalized, possibleAnimalHospitalMatchKey: createAnimalHospitalMatchKey(serviceVeterinaryInstitutionName), sourceRecordHash, source, sourceAgency }];
  });
  const fileInfo = await stat(inputPath), report = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
  const veterinarianProfessionalRegistry = {
    source, sourceAgency: '產業局動保處', sourcePage: 'https://data.taipei/dataset/detail?id=4173b423-0c34-468e-a16d-5a7e7a06148e',
    category: '農業', serviceCategory: '求職及就業', datasetType: '原始資料', resourceName: '提供臺北市獸醫師資料', officialResourceUpdateTime: '2025-06-10 16:54:53', officialMetadataUpdateTime: '2025-12-29 13:35:58', updateFrequency: '不定期更新', coverageStart: '1996-01-01', coverageEnd: '2024-06-21',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding, inputRows: rows.length, outputRecords: records.length,
    duplicateVeterinarianNames: duplicates(records.map((record) => record.veterinarianNameNormalized)),
    duplicatePracticeLicenseNumbers: duplicates(records.map((record) => record.practiceLicenseNumberNormalized)),
    duplicateVeterinarianNameInstitutionPairs: duplicates(records.map((record) => [record.veterinarianNameNormalized, record.serviceVeterinaryInstitutionNameNormalized].filter(Boolean).join('|'))),
    duplicatePrimaryKeys: duplicateKeys, duplicateFallbackKeys: duplicateKeys, cityCodeWarnings, cityCountyWarnings, licenseNumberWarnings,
    notes: ['Veterinarian practice license numbers are preserved as text and not parsed as numeric identifiers', 'No addresses, phones, districts, or official coordinates are present, so no map points are generated', 'Animal-hospital matching is limited to a normalized institution-name key and is not treated as an official relationship', 'This is not clinic-hours, emergency-service, appointment, specialist-certification, service-quality, complaint, disciplinary, medical-advice, legal-advice, recommendation, or endorsement data'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'veterinarian-professional-registry.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'veterinarian-professional-registry-summary.json'), JSON.stringify(buildVeterinarianProfessionalRegistrySummary(records))),
    writeFile(reportPath, JSON.stringify({ ...report, veterinarianProfessionalRegistry }, null, 2)),
  ]);
  console.log(`Converted ${records.length} veterinarian professional registry records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) await convertVeterinarianProfessionalRegistry(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
