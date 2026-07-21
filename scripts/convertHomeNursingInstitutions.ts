import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';

const raw = join(process.cwd(), 'data/raw/home-nursing-institutions');
const out = join(process.cwd(), 'public/data/home-nursing-institutions');
const clean = (value?: string) => value?.replace(/\s+/g, ' ').trim() ?? '';
const text = new TextDecoder('big5').decode(await readFile(join(raw, 'source.csv'))).replace(/^\uFEFF/, '');
const [, ...rows] = parseCsv(text);
const seen = new Set<string>();
const records = rows.flatMap((row) => {
  const [sourceSequenceNumber = '', cityCode = '', institutionName = '', address = '', phone = ''] = row.map(clean);
  const id = sourceSequenceNumber || `${institutionName}|${address}`;
  const key = `${institutionName}|${address}|${phone}`;
  if ((!institutionName && !sourceSequenceNumber) || seen.has(key)) return [];
  seen.add(key);
  return [{ id, sourceSequenceNumber, cityCode, institutionName, address, districtName: address.match(/[\u4e00-\u9fff]{2}區/)?.[0] ?? '', phone, hasPhone: Boolean(phone), googleMapsQuery: [institutionName, address].filter(Boolean).join(' ') }];
});
await mkdir(out, { recursive: true });
await writeFile(join(out, 'records.json'), JSON.stringify(records));
console.log(`Converted ${records.length} home nursing institution records.`);
