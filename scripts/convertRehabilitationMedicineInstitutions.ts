import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';

const root = process.cwd();
const sourcePath = join(root, 'data/raw/rehabilitation-medicine-institutions/source.csv');
const outputDirectory = join(root, 'public/data/rehabilitation-medicine-institutions');
const districtByCode: Record<string, string> = {
  '63000010': '松山區', '63000020': '信義區', '63000030': '大安區', '63000040': '中山區',
  '63000050': '中正區', '63000060': '大同區', '63000070': '萬華區', '63000080': '文山區',
  '63000090': '南港區', '63000100': '內湖區', '63000110': '士林區', '63000120': '北投區',
};
const clean = (value?: string) => (value ?? '').replace(/[\r\n\t ]+/g, ' ').trim();
const taipeiDistricts = ['松山區', '信義區', '大安區', '中山區', '中正區', '大同區', '萬華區', '文山區', '南港區', '內湖區', '士林區', '北投區'];

function decodeSource(bytes: Uint8Array) {
  try {
    return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' };
  } catch {
    return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' };
  }
}

const { text, encoding } = decodeSource(await readFile(sourcePath));
const [rawHeaders, ...rows] = parseCsv(text);
const headers = rawHeaders.map(clean);
const requiredHeaders = ['序號', '機構名稱', '縣市別代碼', '行政區域代碼', '地址'];
const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
if (missingHeaders.length) throw new Error(`Missing official source columns: ${missingHeaders.join(', ')}`);

const duplicateRows: string[] = [];
const missingNames: string[] = [];
const missingAddresses: string[] = [];
const unknownDistrictCodes: string[] = [];
const seen = new Set<string>();
const records = rows.flatMap((row, index) => {
  const sourceValues = Object.fromEntries(headers.map((header, column) => [header, clean(row[column])])) as Record<string, string>;
  const sourceSequenceNumber = sourceValues['序號'];
  const institutionName = sourceValues['機構名稱'];
  const cityCode = sourceValues['縣市別代碼'];
  const districtCode = sourceValues['行政區域代碼'];
  const address = sourceValues['地址'];
  const signature = JSON.stringify(sourceValues);
  if (seen.has(signature)) { duplicateRows.push(sourceSequenceNumber || `row ${index + 2}`); return []; }
  seen.add(signature);
  if (!institutionName) missingNames.push(sourceSequenceNumber || `row ${index + 2}`);
  if (!address) missingAddresses.push(sourceSequenceNumber || `row ${index + 2}`);
  const districtNameFromCode = districtByCode[districtCode] ?? '';
  const districtName = districtNameFromCode || taipeiDistricts.find((value) => address.includes(value)) || '';
  if (districtCode && !districtNameFromCode) unknownDistrictCodes.push(districtCode);
  return [{
    id: createHash('sha1').update(sourceSequenceNumber || signature).digest('hex').slice(0, 16),
    sourceSequenceNumber, institutionName, cityCode, districtCode, districtName, address,
    hasAddress: Boolean(address), hasValidDistrictCode: Boolean(districtName),
    externalMapQuery: clean(`${address} ${institutionName}`), sourceValues,
  }];
});

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(join(outputDirectory, 'records.json'), JSON.stringify(records, null, 2)),
  writeFile(join(outputDirectory, 'metadata.json'), JSON.stringify({
    source: '臺北市復健科醫療機構',
    sourcePage: 'https://data.taipei/dataset/detail?id=190b1d08-4541-4f19-9990-2ef92f915c9f',
    sourceUrl: 'https://data.taipei/api/frontstage/tpeod/dataset/resource.download?rid=9ad373d9-4d52-49d9-9854-f568d80c775a',
    sourceAgency: '臺北市政府衛生局',
    sourceFileUpdatedAt: '2025-06-09T16:39:07+08:00',
    updateFrequency: 'annual',
    encoding,
    recordCount: records.length,
  }, null, 2)),
  writeFile(join(outputDirectory, 'conversion-report.json'), JSON.stringify({
    source: '臺北市復健科醫療機構', encoding, sourceFields: headers,
    inputRows: rows.length, outputRecords: records.length, duplicateRows,
    missingNames, missingAddresses, unknownDistrictCodes: [...new Set(unknownDistrictCodes)],
    notes: ['All official source fields are preserved as strings.', 'District names use official administrative-area codes first, with an explicit Taipei district in the source address as a conservative fallback.', 'No official coordinates are supplied; no exact map markers or automatic geocoding are created.'],
  }, null, 2)),
]);
console.log(`Converted ${records.length} rehabilitation medicine institution records (${encoding}).`);
