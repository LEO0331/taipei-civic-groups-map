import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { TAIPEI_DISTRICT_CENTROIDS } from '../src/lib/civicGroups';
import {
  buildPerformingArtsGroupSummary,
  classifyPerformingArtsApplicationCategory,
  cleanText,
  normalizePerformingArtsGroupName,
  parsePerformingArtsGroupAddress,
  parsePerformingArtsWebsite,
  parseRegistrationNumber,
  performingArtsMatchKey,
} from '../src/lib/performingArtsGroups';
import type { CivicGroup, PerformingArtsGroupRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/performing-arts-groups');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市演藝團體名冊';
const sourceAgency = '臺北市政府文化局';

function decodeCsv(bytes: Uint8Array) {
  try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; }
  catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; }
}

export async function convertPerformingArtsGroups(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No performing-arts group CSV found. Run npm run data:fetch:performing-arts.');
  const inputPath = filePath ?? join(rawDir, csvFile!);
  const { text, encoding } = decodeCsv(await readFile(inputPath));
  const [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid performing-arts group CSV: file is empty.');
  const headers = rawHeaders.map((header) => cleanText(header) ?? '');
  const required = ['演藝團體名稱', '申請類別', '立案字號', '主管機關', '主管機關代碼', '團址', '網址'];
  const missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid performing-arts group CSV: missing columns ${missing.join(', ')}.`);

  let civicKeys = new Set<string>();
  try {
    const civicGroups = JSON.parse(await readFile(join(outputDir, 'civic-groups.json'), 'utf8')) as CivicGroup[];
    civicKeys = new Set(civicGroups.map((group) => performingArtsMatchKey(group.name, group.address)));
  } catch { /* optional comparison */ }

  const duplicates: string[] = [], addressWarnings: string[] = [], websiteWarnings: string[] = [];
  const seen = new Set<string>();
  const records = rows.flatMap((row): PerformingArtsGroupRecord[] => {
    const values = Object.fromEntries(headers.map((header, column) => [header, cleanText(row[column])]));
    const groupName = values['演藝團體名稱'];
    if (!groupName) return [];
    const registrationNumber = parseRegistrationNumber(values['立案字號']);
    const address = parsePerformingArtsGroupAddress(values['團址']);
    const website = parsePerformingArtsWebsite(values['網址']);
    if (address.warning && addressWarnings.length < 20) addressWarnings.push(`${groupName}:${values['團址'] ?? ''}`);
    if (website.warning && websiteWarnings.length < 20) websiteWarnings.push(`${groupName}:${values['網址'] ?? ''}`);
    const key = registrationNumber ? `${normalizePerformingArtsGroupName(groupName)}|${registrationNumber}` : `${normalizePerformingArtsGroupName(groupName)}|${address.addressNormalized ?? ''}`;
    if (seen.has(key)) { if (duplicates.length < 20) duplicates.push(key); return []; }
    seen.add(key);
    const point = address.district ? TAIPEI_DISTRICT_CENTROIDS[address.district] : undefined;
    const matchKey = performingArtsMatchKey(groupName, address.addressNormalized, website.websiteUrlNormalized);
    return [{
      id: createHash('sha1').update(key).digest('hex').slice(0, 12),
      module: 'performing_arts_groups',
      groupName,
      groupNameNormalized: normalizePerformingArtsGroupName(groupName),
      applicationCategoryRaw: values['申請類別'],
      applicationCategory: classifyPerformingArtsApplicationCategory(values['申請類別']),
      registrationNumber,
      hasRegistrationNumber: Boolean(registrationNumber),
      competentAuthority: values['主管機關'],
      competentAuthorityCode: values['主管機關代碼'],
      registeredAddress: address.registeredAddress,
      addressNormalized: address.addressNormalized,
      district: address.district,
      roadName: address.roadName,
      websiteUrl: website.websiteUrl,
      websiteUrlNormalized: website.websiteUrlNormalized,
      websiteDisplay: website.websiteDisplay,
      websiteHostname: website.websiteHostname,
      hasWebsite: Boolean(website.websiteUrlNormalized),
      possibleCivicGroupMatchKey: civicKeys.has(matchKey) ? matchKey : undefined,
      locationPrecision: point ? 'district_centroid' : (address.registeredAddress ? 'address_only' : 'missing'),
      latitude: point?.latitude,
      longitude: point?.longitude,
      source,
      sourceAgency,
    }];
  });

  const fileInfo = await stat(inputPath);
  let report = {};
  try { report = JSON.parse(await readFile(reportPath, 'utf8')); } catch { /* first conversion */ }
  const summary = buildPerformingArtsGroupSummary(records);
  const performingArtsGroups = {
    source, sourceAgency, officialSourceAgencyShort: '文化局',
    sourcePage: 'https://data.taipei/dataset/detail?id=f56e77c6-cc69-480c-8ba4-057fc7e1d8d6',
    category: '文化', serviceCategory: '公共資訊', datasetType: '原始資料', updateFrequency: '每6月',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding,
    inputRows: rows.length, outputRecords: records.length, duplicateKeys: duplicates,
    addressWarningExamples: addressWarnings, websiteWarningExamples: websiteWarnings,
    notes: ['UTF-8-SIG decoded with Big5 fallback', 'Strings and column names trimmed', 'Registration numbers preserved as text', 'Website URLs normalized only for safe linking; websites are not fetched', 'No geocoding used; records use district centroids only when district is parsed', 'This is not event schedule, ticketing, quality, ranking, grant-status, legal-advice, or endorsement data'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'performing-arts-groups.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'performing-arts-group-summary.json'), JSON.stringify(summary)),
    writeFile(reportPath, JSON.stringify({ ...report, performingArtsGroups }, null, 2)),
  ]);
  console.log(`Converted ${records.length} performing-arts group records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await convertPerformingArtsGroups(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
}
