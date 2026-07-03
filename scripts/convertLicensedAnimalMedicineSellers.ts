import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { animalMedicineSellerLocationPrecision, buildLicensedAnimalMedicineSellerSummary, cleanAnimalMedicineSellerText, createAnimalMedicineSellerMapQuery, parseAnimalMedicineSellerAddress, parseAnimalMedicineSellerBusinessRegistrationNumber, parseAnimalMedicineSellerCompanyName, parseAnimalMedicineSellerLicenseNumber, parseAnimalMedicineSellerPhone } from '../src/lib/licensedAnimalMedicineSellers';
import type { LicensedAnimalMedicineSellerRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/licensed-animal-medicine-sellers');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市動物用藥品販賣業者名冊';
const sourceAgency = '臺北市政府產業發展局動物保護處';
const decode = (bytes: Uint8Array) => { try { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; } catch { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; } };
const duplicates = (values: Array<string | undefined>) => [...values.reduce((map, value) => value ? map.set(value, (map.get(value) ?? 0) + 1) : map, new Map<string, number>())].filter(([, count]) => count > 1).slice(0, 30).map(([value, count]) => ({ value, count }));

export async function convertLicensedAnimalMedicineSellers(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No animal medicine seller CSV found. Run npm run data:fetch:animal-medicine-sellers.');
  const inputPath = filePath ?? join(rawDir, csvFile!), { text, encoding } = decode(await readFile(inputPath)), [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid animal medicine seller CSV: file is empty.');
  const headers = rawHeaders.map((header) => cleanAnimalMedicineSellerText(header) ?? '');
  const col = (name: string) => headers.indexOf(name);
  const idx = { license: col('販賣業許可證'), business: col('統一編號'), name: col('公司名稱'), address: col('公司地址'), phone: col('公司電話') };
  const missing = Object.entries(idx).filter(([, index]) => index < 0).map(([key]) => key);
  if (missing.length) throw new Error(`Invalid animal medicine seller CSV: missing columns ${missing.join(', ')}.`);
  const warnings = { license: [] as string[], business: [] as string[], address: [] as string[], phone: [] as string[] };
  const records = rows.flatMap((row, index): LicensedAnimalMedicineSellerRecord[] => {
    const license = parseAnimalMedicineSellerLicenseNumber(row[idx.license]), business = parseAnimalMedicineSellerBusinessRegistrationNumber(row[idx.business]), name = parseAnimalMedicineSellerCompanyName(row[idx.name]), address = parseAnimalMedicineSellerAddress(row[idx.address]), phone = parseAnimalMedicineSellerPhone(row[idx.phone]);
    if (license.warning && warnings.license.length < 20) warnings.license.push(`${index + 2}:${license.warning}`);
    if (business.warning && warnings.business.length < 20) warnings.business.push(`${license.sellerLicenseNumber ?? index + 2}:${business.businessRegistrationNumber}`);
    if (address.warning && warnings.address.length < 20) warnings.address.push(`${license.sellerLicenseNumber ?? index + 2}:${address.companyAddress ?? ''}`);
    if (phone.warning && warnings.phone.length < 20) warnings.phone.push(`${license.sellerLicenseNumber ?? index + 2}:${phone.companyPhone ?? ''}`);
    if (!license.sellerLicenseNumber || !name.companyName || !address.companyAddress) return [];
    const fallback = [name.companyNameNormalized, address.companyAddressNormalized, phone.companyPhoneNormalized].filter(Boolean).join('|');
    const sourceRecordHash = createHash('sha1').update(`${license.sellerLicenseNumberNormalized ?? business.businessRegistrationNumberNormalized ?? fallback}|${index}`).digest('hex');
    return [{
      id: sourceRecordHash.slice(0, 12), module: 'licensed_animal_medicine_sellers',
      sellerLicenseNumber: license.sellerLicenseNumber, sellerLicenseNumberNormalized: license.sellerLicenseNumberNormalized, sellerLicenseNumberSequence: license.sellerLicenseNumberSequence,
      businessRegistrationNumber: business.businessRegistrationNumber, businessRegistrationNumberNormalized: business.businessRegistrationNumberNormalized, businessRegistrationNumberValidFormat: business.validFormat,
      companyName: name.companyName, companyNameNormalized: name.companyNameNormalized,
      companyAddress: address.companyAddress, companyAddressNormalized: address.companyAddressNormalized, districtNameFromAddress: address.districtNameFromAddress, isTaipeiDistrict: address.isTaipeiDistrict, addressUsesOldTaipeiText: address.addressUsesOldTaipeiText, addressOutsideTaipeiHint: address.addressOutsideTaipeiHint, roadName: address.roadName, addressLooksLikeMultiFloorOrUnit: address.addressLooksLikeMultiFloorOrUnit,
      companyPhone: phone.companyPhone, companyPhoneNormalized: phone.companyPhoneNormalized, hasCompanyPhone: Boolean(phone.companyPhone),
      coordinateSource: 'none', geocodingStatus: 'not_geocoded_address_only', locationPrecision: animalMedicineSellerLocationPrecision(address),
      googleMapsQuery: createAnimalMedicineSellerMapQuery({ companyName: name.companyName, companyAddress: address.companyAddress }),
      sourceRecordHash, source, sourceAgency,
    }];
  });
  const fileInfo = await stat(inputPath), report = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
  const licensedAnimalMedicineSellers = {
    source, sourceAgency, officialSourceAgencyShort: '產業局動保處', sourcePage: 'https://data.taipei/dataset/detail?id=9100b52e-f939-492f-9a8f-ba0adbd304ce',
    category: '農業', serviceCategory: '公共資訊', datasetType: '原始資料', resourceName: '提供動物用藥品販賣業者名冊', officialResourceUpdateTime: '2025-06-11 16:31:11', officialMetadataUpdateTime: '2025-12-29 13:36:58', updateFrequency: '不定期更新',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding, inputRows: rows.length, outputRecords: records.length,
    duplicateSellerLicenseNumbers: duplicates(records.map((r) => r.sellerLicenseNumberNormalized)), duplicateBusinessRegistrationNumbers: duplicates(records.map((r) => r.businessRegistrationNumberNormalized)), duplicateCompanyNames: duplicates(records.map((r) => r.companyNameNormalized)), duplicateAddresses: duplicates(records.map((r) => r.companyAddressNormalized)), duplicatePhones: duplicates(records.map((r) => r.companyPhoneNormalized)),
    warnings, notes: ['CP950 / Big5 decoded first with UTF-8-SIG fallback.', 'Business registration numbers and phones preserved as text.', 'No official coordinates supplied; no geocoding performed.', 'External map links are address queries, not official coordinates.', 'No medical, medication, safety, compliance, real-time operating, credit, legal, or investment claims are inferred.'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'licensed-animal-medicine-sellers.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'licensed-animal-medicine-seller-summary.json'), JSON.stringify(buildLicensedAnimalMedicineSellerSummary(records))),
    writeFile(reportPath, JSON.stringify({ ...report, licensedAnimalMedicineSellers }, null, 2)),
  ]);
  console.log(`Converted ${records.length} licensed animal medicine seller records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) await convertLicensedAnimalMedicineSellers(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
