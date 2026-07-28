import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';

const root = process.cwd();
const outputDirectory = join(root, 'public/data/community-public-childcare-homes');

function decodeCsv(bytes: Uint8Array) {
  try {
    return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' };
  } catch {
    return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' };
  }
}

const clean = (value?: string) => value?.replace(/\s+/g, ' ').trim() ?? '';
const { text, encoding } = decodeCsv(await readFile(join(root, 'data/raw/community-public-childcare-homes/source.csv')));
const [, ...rows] = parseCsv(text);
const seen = new Set<string>();
const duplicateRows: string[] = [];
const records = rows.flatMap((row) => {
  const [sourceSequenceNumber = '', institutionType = '', institutionName = '', address = '', phone = ''] = row.map(clean);
  const id = sourceSequenceNumber || `${institutionName}|${address}`;
  const key = `${institutionName}|${address}|${phone}|${institutionType}`;

  if (!institutionName) return [];
  if (seen.has(key)) {
    duplicateRows.push(id);
    return [];
  }
  seen.add(key);

  const districtName = address.match(/[\u4e00-\u9fff]{2}\u5340/)?.[0] ?? '';
  return [{
    id, sourceSequenceNumber, institutionType, institutionName, districtName, address, phone,
    hasAddress: Boolean(address), hasPhone: Boolean(phone),
    googleMapsQuery: [institutionName, address].filter(Boolean).join(' '),
  }];
});

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(join(outputDirectory, 'records.json'), JSON.stringify(records)),
  writeFile(join(outputDirectory, 'conversion-report.json'), JSON.stringify({
    source: '臺北市社區公共托育家園',
    encoding,
    inputRows: rows.length,
    recordCount: records.length,
    duplicateRows,
    notes: ['UTF-8-SIG, Big5, and CP950-compatible decoding is supported.', 'Addresses are used only for external map lookup; no exact map markers are created.'],
  }, null, 2)),
]);

console.log(`Converted ${records.length} community public childcare-home records (${encoding}).`);
