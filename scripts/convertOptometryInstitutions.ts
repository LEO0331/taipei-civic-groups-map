import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';

const rawDirectory = join(process.cwd(), 'data/raw/optometry-institutions');
const outputDirectory = join(process.cwd(), 'public/data/optometry-institutions');
const clean = (value?: string) => value?.replace(/\s+/g, ' ').trim() ?? '';
const postalDistricts: Record<string, string> = {
  '100': '中正區', '103': '大同區', '104': '中山區', '105': '松山區', '106': '大安區', '108': '萬華區',
  '110': '信義區', '111': '士林區', '112': '北投區', '114': '內湖區', '115': '南港區', '116': '文山區',
};
const decode = (bytes: Buffer) => {
  try { return { encoding: 'UTF-8-SIG / UTF-8', text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, '') }; }
  catch { return { encoding: 'CP950 / Big5-compatible', text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, '') }; }
};

const { encoding, text } = decode(await readFile(join(rawDirectory, 'source.csv')));
const [headers, ...rows] = parseCsv(text);
const duplicates: string[] = [];
const missingNames: string[] = [];
const missingAddresses: string[] = [];
const malformedPhones: string[] = [];
const unknownPostalCodes: string[] = [];
const unresolvedDistricts: string[] = [];
const seen = new Set<string>();

const records = rows.flatMap((row) => {
  const [sourceSequenceNumber = '', institutionName = '', postalCode = '', address = '', phone = ''] = row.map(clean);
  const id = sourceSequenceNumber || `${institutionName}|${address}`;
  const duplicateKey = `${institutionName}|${address}|${phone}`;
  if (!institutionName && !sourceSequenceNumber) { missingNames.push(id || 'row-without-id'); return []; }
  if (seen.has(duplicateKey)) { duplicates.push(id); return []; }
  seen.add(duplicateKey);
  if (!institutionName) missingNames.push(id);
  if (!address) missingAddresses.push(id);
  if (phone && !/^[+()\-\s\d#xXext.、,;/]+$/.test(phone)) malformedPhones.push(id);
  const addressDistrict = address.match(/[\u4e00-\u9fff]{2}\u5340/)?.[0] ?? '';
  const postalDistrict = postalDistricts[postalCode] ?? '';
  if (postalCode && !postalDistrict) unknownPostalCodes.push(postalCode);
  const districtName = addressDistrict || postalDistrict;
  if (address && !districtName) unresolvedDistricts.push(id);
  return [{ id, sourceSequenceNumber, institutionName, postalCode, districtName, address, phone, hasPhone: Boolean(phone), hasAddress: Boolean(address), googleMapsQuery: [institutionName, address].filter(Boolean).join(' ') }];
});

await mkdir(outputDirectory, { recursive: true });
await writeFile(join(outputDirectory, 'records.json'), JSON.stringify(records));
await writeFile(join(outputDirectory, 'conversion-report.json'), JSON.stringify({
  source: '臺北市驗光所', encoding, sourceFields: headers.map(clean), inputRows: rows.length, recordCount: records.length,
  duplicates, missingNames, missingAddresses, malformedPhones, unknownPostalCodes: [...new Set(unknownPostalCodes)], unresolvedDistricts,
}, null, 2));
console.log(`Converted ${records.length} optometry institution records (${encoding}).`);
