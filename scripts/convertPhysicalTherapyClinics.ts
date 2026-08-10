import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const input = join(process.cwd(), 'public/data/physical-therapy-clinics-source.csv');
const output = join(process.cwd(), 'public/data/physical-therapy-clinics');
const districts = ['松山區', '信義區', '大安區', '中山區', '中正區', '大同區', '萬華區', '文山區', '南港區', '內湖區', '士林區', '北投區'];

function clean(value: string | undefined) {
  return (value ?? '').replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') { cell += '"'; i += 1; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (char === ',' && !quoted) { row.push(cell); cell = ''; continue; }
    if (char === '\n' && !quoted) { row.push(cell); rows.push(row); row = []; cell = ''; continue; }
    cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((item) => item.some((value) => value !== ''));
}

function splitPhones(raw: string) {
  if (!raw) return [];
  return raw.split(/\s*(?:、|；|;|\/|\\|,|，)\s*/).filter(Boolean);
}

const sourceBytes = await readFile(input);
let sourceText: string;
try {
  sourceText = new TextDecoder('utf-8', { fatal: true }).decode(sourceBytes);
} catch {
  sourceText = new TextDecoder('big5').decode(sourceBytes);
}
const [headers, ...rows] = parseCsv(sourceText).map((row) => row.map(clean));
const records = rows.map((row, index) => {
  const sourceValues = Object.fromEntries(headers.map((header, column) => [header, row[column] ?? '']));
  const sourceSequenceNumber = String(sourceValues['序號'] ?? '');
  const institutionName = String(sourceValues['機構名稱'] ?? '');
  const postalCode = String(sourceValues['郵遞區號'] ?? '');
  const address = String(sourceValues['地址'] ?? '');
  const phoneRaw = String(sourceValues['電話'] ?? '');
  const districtName = districts.find((district) => address.includes(district)) ?? '';
  const key = sourceSequenceNumber || `${institutionName}|${address}` || JSON.stringify(sourceValues);
  const id = sourceSequenceNumber || createHash('sha1').update(key).digest('hex').slice(0, 12);
  return {
    id,
    module: 'physical_therapy_clinics',
    sourceSequenceNumber,
    institutionName,
    postalCode,
    districtName,
    address,
    phoneRaw,
    phoneNumbers: splitPhones(phoneRaw),
    hasAddress: Boolean(address),
    hasPhone: /\d{6,}/.test(phoneRaw),
    hasResolvedDistrict: Boolean(districtName),
    externalMapQuery: address ? `${address} ${institutionName}` : institutionName,
    sourceValues,
    source: '臺北市物理治療所',
    sourceAgency: '臺北市政府衛生局',
    sourceRowNumber: String(index + 2),
  };
});

const metadata = {
  module: 'physical_therapy_clinics',
  source: '臺北市物理治療所',
  sourceUrl: 'https://data.taipei/dataset/detail?id=3a6fc259-9158-4c24-babb-aa271cfc7f36',
  csvResourceUrl: 'https://data.taipei/api/frontstage/tpeod/dataset/resource.download?rid=62851454-6827-45fd-a337-b5c571011fe4',
  sourceAgency: '臺北市政府衛生局',
  sourceFields: headers,
  csvUpdateDate: '2025-06-06',
  metadataUpdateDate: '2026-07-15',
  ingestedAt: new Date().toISOString(),
  recordCount: records.length,
  notes: ['All source values are retained in sourceValues.', 'Districts are derived only from explicit Taipei district text in the official address.', 'No coordinates or exact map markers are created.'],
};

await mkdir(output, { recursive: true });
await writeFile(join(output, 'records.json'), `${JSON.stringify(records, null, 2)}\n`);
await writeFile(join(output, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`);
console.log(`Converted ${records.length} physical therapy clinic records.`);
