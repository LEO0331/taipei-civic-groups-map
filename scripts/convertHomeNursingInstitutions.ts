import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';

const rawDirectory = join(process.cwd(), 'data/raw/home-nursing-institutions');
const outputDirectory = join(process.cwd(), 'public/data/home-nursing-institutions');
const clean = (value?: string) => value?.replace(/\s+/g, ' ').trim() ?? '';
const decode = (bytes: Buffer) => {
  try {
    return { encoding: 'UTF-8-SIG / UTF-8', text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, '') };
  } catch {
    return { encoding: 'CP950 / Big5-compatible', text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, '') };
  }
};

const { encoding, text } = decode(await readFile(join(rawDirectory, 'source.csv')));
const [headers, ...rows] = parseCsv(text);
const duplicates: string[] = [];
const missingNames: string[] = [];
const missingAddresses: string[] = [];
const malformedPhones: string[] = [];
const unknownCityCodes: string[] = [];
const unresolvedDistricts: string[] = [];
const seen = new Set<string>();

const records = rows.flatMap((row) => {
  const [sourceSequenceNumber = '', cityCode = '', institutionName = '', address = '', phone = ''] = row.map(clean);
  const id = sourceSequenceNumber || `${institutionName}|${address}`;
  const duplicateKey = `${institutionName}|${address}|${phone}`;
  if (!institutionName && !sourceSequenceNumber) {
    missingNames.push(id || 'row-without-id');
    return [];
  }
  if (seen.has(duplicateKey)) {
    duplicates.push(id);
    return [];
  }
  seen.add(duplicateKey);
  if (!institutionName) missingNames.push(id);
  if (!address) missingAddresses.push(id);
  if (phone && !/^[+()\-\s\d#xXext.]+$/.test(phone)) malformedPhones.push(id);
  if (cityCode && cityCode !== '63000') unknownCityCodes.push(cityCode);
  const districtName = address.match(/[\u4e00-\u9fff]{2}\u5340/)?.[0] ?? '';
  if (address && !districtName) unresolvedDistricts.push(id);
  return [{
    id,
    sourceSequenceNumber,
    cityCode,
    institutionName,
    address,
    districtName,
    phone,
    hasPhone: Boolean(phone),
    googleMapsQuery: [institutionName, address].filter(Boolean).join(' '),
  }];
});

await mkdir(outputDirectory, { recursive: true });
await writeFile(join(outputDirectory, 'records.json'), JSON.stringify(records));
await writeFile(join(outputDirectory, 'conversion-report.json'), JSON.stringify({
  source: '臺北市居家護理所',
  encoding,
  sourceFields: headers.map(clean),
  inputRows: rows.length,
  recordCount: records.length,
  duplicates,
  missingNames,
  missingAddresses,
  malformedPhones,
  unknownCityCodes: [...new Set(unknownCityCodes)],
  unresolvedDistricts,
}, null, 2));
console.log(`Converted ${records.length} home nursing institution records (${encoding}).`);
