import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { buildSpecificPetBusinessEvaluationSummary, cleanPetBusinessText, createSpecificPetBusinessExternalMapQuery, parseCityName, parseEvaluationResourceYear, parseLicenseExpirationDate, parsePostalCode, parseSpecificPetBusinessAddress, parseSpecificPetBusinessCompanyName, parseSpecificPetBusinessEvaluationGrade, parseSpecificPetBusinessItems, parseSpecificPetBusinessLicenseNumber, parseSpecificPetBusinessPhone, parseTaipeiDistrictName, petBusinessLocationPrecision } from '../src/lib/specificPetBusinessEvaluationResults';
import type { SpecificPetBusinessEvaluationRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/specific-pet-business-evaluation-results');
const outputDir = join(process.cwd(), 'public/data/specific-pet-business-evaluation-results');
const reportPath = join(process.cwd(), 'public/data/conversion-report.json');
const source = '臺北市特定寵物業評鑑成果';
const sourceAgency = '臺北市政府產業發展局動物保護處';
const decode = (bytes: Uint8Array) => { try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; } catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; } };
const duplicateExamples = (values: string[]) => [...values.reduce((map, value) => value ? map.set(value, (map.get(value) ?? 0) + 1) : map, new Map<string, number>())].filter(([, count]) => count > 1).slice(0, 30).map(([value, count]) => ({ value, count }));

export async function convertSpecificPetBusinessEvaluationResults() {
  const csvFiles = (await readdir(rawDir)).filter((file) => file.toLowerCase().endsWith('.csv')).sort();
  if (!csvFiles.length) throw new Error('No specific pet business evaluation CSV found. Run npm run data:fetch:pet-business-evaluations.');
  const warnings = { resourceYear: [] as string[], city: [] as string[], district: [] as string[], postalCode: [] as string[], license: [] as string[], expiration: [] as string[], phone: [] as string[], address: [] as string[], businessItems: [] as string[], grade: [] as string[] };
  const resources = [];
  const records: SpecificPetBusinessEvaluationRecord[] = [];
  for (const file of csvFiles) {
    const inputPath = join(rawDir, file), resourceName = file.includes('年度') ? basename(file, '.csv') : `${file.match(/(\d{3})/)?.[1] ?? ''}年度臺北市特定寵物業評鑑成果`;
    const year = parseEvaluationResourceYear(resourceName);
    if (!year.sourceEvaluationYearRoc || !year.sourceEvaluationYearGregorian) { warnings.resourceYear.push(file); continue; }
    const { text, encoding } = decode(await readFile(inputPath));
    const [rawHeaders, ...rows] = parseCsv(text);
    if (!rawHeaders) continue;
    const headers = rawHeaders.map((header) => cleanPetBusinessText(header) ?? '');
    const col = (...names: string[]) => names.map((name) => headers.indexOf(name)).find((index) => index >= 0) ?? -1;
    const idx = { city: col('縣市'), district: col('行政區'), postal: col('郵遞區號'), license: col('特寵業字號', '特寵業字號及有效期限'), expiration: col('許可證有效期限', '特寵業字號及有效期限'), company: col('許可證登記公司名'), phone: col('電話'), address: col('地址'), items: col('營業項目'), grade: col('評鑑等級') };
    const missing = Object.entries(idx).filter(([, index]) => index < 0).map(([key]) => key);
    if (missing.length) throw new Error(`Invalid ${file}: missing columns ${missing.join(', ')}.`);
    const fileInfo = await stat(inputPath);
    resources.push({ resourceName, file, encoding, inputRows: rows.length, fileSize: fileInfo.size });
    rows.forEach((row, index) => {
      const city = parseCityName(row[idx.city]), district = parseTaipeiDistrictName(row[idx.district]), postal = parsePostalCode(row[idx.postal]), license = parseSpecificPetBusinessLicenseNumber(row[idx.license]), expiration = parseLicenseExpirationDate(row[idx.expiration]), company = parseSpecificPetBusinessCompanyName(row[idx.company]), phone = parseSpecificPetBusinessPhone(row[idx.phone]), address = parseSpecificPetBusinessAddress(row[idx.address]), items = parseSpecificPetBusinessItems(row[idx.items]), grade = parseSpecificPetBusinessEvaluationGrade(row[idx.grade]);
      if (city.warning && warnings.city.length < 20) warnings.city.push(`${file}:${index + 2}:${city.cityName}`);
      if (district.warning && warnings.district.length < 20) warnings.district.push(`${file}:${index + 2}:${district.districtName}`);
      if (postal.warning && warnings.postalCode.length < 20) warnings.postalCode.push(`${file}:${index + 2}:${postal.postalCode}`);
      if (license.warning && warnings.license.length < 20) warnings.license.push(`${file}:${index + 2}`);
      if (expiration.warning && warnings.expiration.length < 20) warnings.expiration.push(`${file}:${index + 2}:${expiration.licenseExpirationDateRaw}`);
      if (phone.warning && warnings.phone.length < 20) warnings.phone.push(`${file}:${index + 2}:${phone.phone}`);
      if (address.warning && warnings.address.length < 20) warnings.address.push(`${file}:${index + 2}`);
      if (items.warning && warnings.businessItems.length < 20) warnings.businessItems.push(`${file}:${index + 2}`);
      if (grade.warning && warnings.grade.length < 20) warnings.grade.push(`${file}:${index + 2}:${grade.evaluationGradeRaw}`);
      if (!license.specificPetBusinessLicenseNumber || !company.registeredCompanyName || !address.address) return;
      const key = `${year.sourceEvaluationYearRoc}|${license.specificPetBusinessLicenseNumberNormalized ?? [company.registeredCompanyNameNormalized, address.addressNormalized, phone.phoneNormalized].filter(Boolean).join('|')}`;
      const sourceRecordHash = createHash('sha1').update(`${key}|${index}`).digest('hex');
      const today = new Date().toISOString().slice(0, 10);
      records.push({
        id: sourceRecordHash.slice(0, 12), module: 'specific_pet_business_evaluation_results',
        sourceEvaluationYearRoc: year.sourceEvaluationYearRoc, sourceEvaluationYearGregorian: year.sourceEvaluationYearGregorian, sourceResourceName: resourceName, resourceType: year.resourceType,
        cityName: city.cityName ?? '', cityNameNormalized: city.cityNameNormalized,
        districtName: district.districtName ?? '', districtNameNormalized: district.districtNameNormalized, isTaipeiDistrict: district.isTaipeiDistrict,
        postalCode: postal.postalCode, postalCodeNormalized: postal.postalCodeNormalized, postalCodeValidFormat: postal.validFormat,
        specificPetBusinessLicenseNumber: license.specificPetBusinessLicenseNumber, specificPetBusinessLicenseNumberNormalized: license.specificPetBusinessLicenseNumberNormalized, licenseNumberSequence: license.licenseNumberSequence,
        licenseExpirationDateRaw: expiration.licenseExpirationDateRaw, licenseExpirationDateParsed: expiration.licenseExpirationDateParsed, licenseExpirationGregorianDate: expiration.licenseExpirationGregorianDate, licenseExpirationRocDate: expiration.licenseExpirationRocDate, licenseExpirationStatusRelativeToBuildDate: expiration.licenseExpirationGregorianDate ? (expiration.licenseExpirationGregorianDate >= today ? 'valid_on_build_date' : 'expired_on_build_date') : 'unknown',
        registeredCompanyName: company.registeredCompanyName, registeredCompanyNameNormalized: company.registeredCompanyNameNormalized,
        phone: phone.phone, phoneNormalized: phone.phoneNormalized, hasPhone: Boolean(phone.phone),
        address: address.address, addressNormalized: address.addressNormalized, roadName: address.roadName, addressLooksLikeMultiFloorOrUnit: address.addressLooksLikeMultiFloorOrUnit,
        businessItemsRaw: items.businessItemsRaw, businessItems: items.businessItems, businessItemCategories: items.businessItemCategories,
        evaluationGradeRaw: grade.evaluationGradeRaw, evaluationGrade: grade.evaluationGrade, evaluationGradeNormalized: grade.evaluationGradeNormalized, evaluationGradeCategory: grade.evaluationGradeCategory,
        coordinateSource: 'none', geocodingStatus: 'not_geocoded_address_only', locationPrecision: petBusinessLocationPrecision({ districtName: district.districtName, address: address.address }),
        googleMapsQuery: createSpecificPetBusinessExternalMapQuery({ registeredCompanyName: company.registeredCompanyName, address: address.address }),
        sourceRecordHash, source, sourceAgency,
      });
    });
  }
  const summary = buildSpecificPetBusinessEvaluationSummary(records);
  const latestYearRecords = records.filter((record) => record.sourceEvaluationYearRoc === summary.latestEvaluationYearRoc);
  const report = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
  const specificPetBusinessEvaluationResults = { source, sourceAgency, officialSourceAgencyShort: '產業局動保處', sourcePage: 'https://data.taipei/dataset/detail?id=c32bc515-c984-4929-881f-31528e24fb13', category: '農業', serviceCategory: '公共資訊', datasetType: '原始資料', resourceNames: resources.map((r) => r.resourceName), convertedAt: new Date().toISOString(), resources, outputRecords: records.length, latestYearRecords: latestYearRecords.length, duplicateLicenseNumbersWithinYear: duplicateExamples(records.map((r) => `${r.sourceEvaluationYearRoc}|${r.specificPetBusinessLicenseNumberNormalized ?? ''}`)), warnings, notes: ['No official coordinates supplied; no geocoding performed.', 'Records are preserved across years; latest-year records are generated separately.', 'No pet shop recommendation, pet quality, veterinary advice, medication advice, real-time operating, real-time license, complete compliance, legal, credit, or investment claims are inferred.'] };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'records.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'summary.json'), JSON.stringify(summary)),
    writeFile(join(outputDir, 'district-summary.json'), JSON.stringify(summary.byDistrict)),
    writeFile(join(outputDir, 'evaluation-grade-summary.json'), JSON.stringify(summary.byEvaluationGrade)),
    writeFile(join(outputDir, 'business-item-summary.json'), JSON.stringify(summary.byBusinessItemCategory)),
    writeFile(join(outputDir, 'latest-year-records.json'), JSON.stringify(latestYearRecords)),
    writeFile(join(outputDir, 'year-comparison.json'), JSON.stringify(summary.yearComparison)),
    writeFile(reportPath, JSON.stringify({ ...report, specificPetBusinessEvaluationResults }, null, 2)),
  ]);
  console.log(`Converted ${records.length} specific pet business evaluation records from ${csvFiles.length} CSV resource(s).`);
}

if (import.meta.url === `file://${process.argv[1]}`) await convertSpecificPetBusinessEvaluationResults();
