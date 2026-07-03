import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { buildRegisteredRecyclingBusinessOrganizationSummary, cleanText, createRecyclingOrganizationMapQuery, getLocationPrecision, parseBusinessRegistrationNumber, parseContactPersonName, parseMobilePhoneNumber, parsePhoneNumber, parseRecyclingItems, parseRecyclingOrganizationName, parseRecyclingStorageSiteAddress, parseResponsiblePersonName, parseSourceSequenceNumber } from '../src/lib/registeredRecyclingBusinessOrganizations';
import type { RegisteredRecyclingBusinessOrganizationRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/registered-recycling-business-organizations');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市回收業機構名冊';
const sourceAgency = '臺北市政府環境保護局';
const decode = (bytes: Uint8Array) => { try { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; } catch { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; } };
const duplicates = (values: Array<string | undefined>) => [...values.reduce((map, value) => value ? map.set(value, (map.get(value) ?? 0) + 1) : map, new Map<string, number>())].filter(([, count]) => count > 1).slice(0, 30).map(([value, count]) => ({ value, count }));

export async function convertRegisteredRecyclingBusinessOrganizations(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No recycling business organization CSV found. Run npm run data:fetch:recycling-organizations.');
  const inputPath = filePath ?? join(rawDir, csvFile!), { text, encoding } = decode(await readFile(inputPath)), [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid recycling business organization CSV: file is empty.');
  const headers = rawHeaders.map((header) => cleanText(header) ?? '');
  const col = (name: string) => headers.indexOf(name);
  const idx = { seq: col('序號'), name: col('機構名稱'), number: col('統一編號'), responsible: col('負責人'), phone: col('電話'), mobile: col('手機'), contact: col('聯絡人'), address: col('回收貯存場所地址'), regulated: col('應回收廢棄物回收項目'), general: col('一般廢棄物回收項目') };
  const missingColumns = Object.entries(idx).filter(([, index]) => index < 0).map(([key]) => key);
  if (missingColumns.length) throw new Error(`Invalid recycling business organization CSV: missing columns ${missingColumns.join(', ')}.`);

  const warnings = { sequence: [] as string[], registration: [] as string[], phone: [] as string[], mobile: [] as string[], address: [] as string[], regulatedItems: [] as string[], generalItems: [] as string[] };
  const records = rows.flatMap((row, index): RegisteredRecyclingBusinessOrganizationRecord[] => {
    const seq = parseSourceSequenceNumber(row[idx.seq]), org = parseRecyclingOrganizationName(row[idx.name]), number = parseBusinessRegistrationNumber(row[idx.number]), responsible = parseResponsiblePersonName(row[idx.responsible]), phone = parsePhoneNumber(row[idx.phone]), mobile = parseMobilePhoneNumber(row[idx.mobile]), contact = parseContactPersonName(row[idx.contact]), address = parseRecyclingStorageSiteAddress(row[idx.address]), regulated = parseRecyclingItems(row[idx.regulated]), general = parseRecyclingItems(row[idx.general]);
    if (seq.warning && warnings.sequence.length < 20) warnings.sequence.push(`${index + 2}:${seq.warning}`);
    if (number.warning && warnings.registration.length < 20) warnings.registration.push(`${org.organizationName ?? index + 2}:${number.warning}`);
    if (phone.warning && warnings.phone.length < 20) warnings.phone.push(`${org.organizationName ?? index + 2}:${phone.warning}`);
    if (mobile.warning && warnings.mobile.length < 20) warnings.mobile.push(`${org.organizationName ?? index + 2}:${mobile.warning}`);
    if (address.warning && warnings.address.length < 20) warnings.address.push(`${org.organizationName ?? index + 2}:${address.recyclingStorageSiteAddress ?? ''}`);
    if (regulated.warnings.length && warnings.regulatedItems.length < 20) warnings.regulatedItems.push(`${org.organizationName ?? index + 2}:${regulated.items.join('、')}`);
    if (general.warnings.length && warnings.generalItems.length < 20) warnings.generalItems.push(`${org.organizationName ?? index + 2}:${general.items.join('、')}`);
    if (!org.organizationName) return [];
    const fallback = [org.organizationNameNormalized, address.recyclingStorageSiteAddressNormalized, regulated.raw, general.raw].filter(Boolean).join('|');
    const key = seq.sourceSequenceNumberNormalized || number.businessRegistrationNumberNormalized || fallback;
    const sourceRecordHash = createHash('sha1').update(`${key}|${index}`).digest('hex');
    return [{
      id: sourceRecordHash.slice(0, 12), module: 'registered_recycling_business_organizations', ...seq,
      organizationName: org.organizationName, organizationNameNormalized: org.organizationNameNormalized,
      businessRegistrationNumber: number.businessRegistrationNumber, businessRegistrationNumberNormalized: number.businessRegistrationNumberNormalized, businessRegistrationNumberValidFormat: number.businessRegistrationNumberValidFormat,
      ...responsible, ...phone, ...mobile, ...contact,
      recyclingStorageSiteAddress: address.recyclingStorageSiteAddress ?? '', recyclingStorageSiteAddressNormalized: address.recyclingStorageSiteAddressNormalized, districtNameFromAddress: address.districtNameFromAddress, isTaipeiDistrict: address.isTaipeiDistrict, roadName: address.roadName, addressLooksLikeOpenLotOrNearby: address.addressLooksLikeOpenLotOrNearby,
      regulatedRecyclableItemsRaw: regulated.raw, regulatedRecyclableItems: regulated.items, regulatedRecyclableItemCategories: regulated.categories, hasRegulatedRecyclableItems: regulated.hasItems,
      generalWasteRecyclingItemsRaw: general.raw, generalWasteRecyclingItems: general.items, generalWasteRecyclingItemCategories: general.categories, hasGeneralWasteRecyclingItems: general.hasItems,
      hasPhoneNumber: Boolean(phone.phoneNumber), hasMobilePhoneNumber: Boolean(mobile.mobilePhoneNumber), hasAnyContactNumber: Boolean(phone.phoneNumber || mobile.mobilePhoneNumber),
      coordinateSource: 'none', geocodingStatus: 'not_geocoded_address_only', locationPrecision: getLocationPrecision(address.districtNameFromAddress, address.recyclingStorageSiteAddress),
      googleMapsQuery: createRecyclingOrganizationMapQuery({ recyclingStorageSiteAddress: address.recyclingStorageSiteAddress, organizationName: org.organizationName }),
      sourceRecordHash, source, sourceAgency,
    }];
  });
  const summary = buildRegisteredRecyclingBusinessOrganizationSummary(records), fileInfo = await stat(inputPath), report = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
  const registeredRecyclingBusinessOrganizations = {
    source, sourceAgency: '環保局', sourcePage: 'https://data.taipei/dataset/detail?id=49a8e600-313d-48ba-b35f-5ff093d4cff1',
    category: '環保', serviceCategory: '公共資訊', datasetType: '原始資料', resourceName: source, officialResourceUpdateTime: '2024-08-06 14:51:49', officialMetadataUpdateTime: '2024-08-06 14:52:03', updateFrequency: '不定期更新', collectionPeriodEnd: '2016-05-01',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding, inputRows: rows.length, outputRecords: records.length,
    duplicateSequenceNumbers: duplicates(records.map((r) => r.sourceSequenceNumberNormalized)),
    duplicateOrganizationNames: duplicates(records.map((r) => r.organizationNameNormalized)),
    duplicateBusinessRegistrationNumbers: duplicates(records.map((r) => r.businessRegistrationNumberNormalized)),
    duplicateAddresses: duplicates(records.map((r) => r.recyclingStorageSiteAddressNormalized)),
    duplicateFallbackKeys: duplicates(records.map((r) => [r.organizationNameNormalized, r.recyclingStorageSiteAddressNormalized, r.regulatedRecyclableItemsRaw, r.generalWasteRecyclingItemsRaw].filter(Boolean).join('|'))),
    openLotOrNearbyAddressExamples: records.filter((r) => r.addressLooksLikeOpenLotOrNearby).slice(0, 20).map((r) => r.recyclingStorageSiteAddress),
    warnings, dataQuality: summary.dataQuality,
    notes: ['Big5 / CP950 decoded with UTF-8-SIG fallback', 'Business registration numbers and mobile phones preserved as text', 'No automatic geocoding performed; no exact map markers created', 'External map lookup links are query strings only, not official coordinates', 'No business/company matching generated in v1', 'This is not real-time operating status, service availability, accepted-item guarantee, public drop-off permission, waste pickup booking, pollution risk, violation record, legal advice, investment advice, credit rating, or endorsement data'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'registered-recycling-business-organizations.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'registered-recycling-business-organization-summary.json'), JSON.stringify(summary)),
    writeFile(reportPath, JSON.stringify({ ...report, registeredRecyclingBusinessOrganizations }, null, 2)),
  ]);
  console.log(`Converted ${records.length} registered recycling business organization records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) await convertRegisteredRecyclingBusinessOrganizations(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
