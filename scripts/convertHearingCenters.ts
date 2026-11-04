import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseCsv } from './convertCivicGroups';
import { decodeHealthcareCsv, districtByCode } from './healthcareDirectoryConversion';

export function convertHearingCenters(bytes: Uint8Array) {
  const { text, encoding } = decodeHealthcareCsv(bytes);
  const [header, ...rows] = parseCsv(text);
  const headers = header.map(value => value.trim());
  const required = ['序號', '機構名稱', '行政區域代碼', '郵遞區號', '地址'];
  if (required.some(key => !headers.includes(key))) throw new Error('Unexpected hearing-center source headers');
  const records = rows.map(row => {
    const sourceValues = Object.fromEntries(headers.map((key, index) => [key, row[index] ?? '']));
    const name = sourceValues['機構名稱'].trim(), address = sourceValues['地址'].trim();
    return {
      id: createHash('sha1').update(sourceValues['序號'] || JSON.stringify(sourceValues)).digest('hex').slice(0, 16),
      name, districtCode: sourceValues['行政區域代碼'], district: districtByCode[sourceValues['行政區域代碼']] ?? '',
      postalCode: sourceValues['郵遞區號'], address, externalMapQuery: `${address} ${name}`.trim(), sourceValues,
    };
  });
  if (!records.length || records.some(record => !record.name || record.name.includes('\ufffd'))) throw new Error('Empty or unreadable hearing-center source');
  return { records, report: { source: '臺北市聽力所', encoding, sourceFields: headers, inputRows: rows.length, outputRecords: records.length, sourceSha256: createHash('sha256').update(bytes).digest('hex') } };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = convertHearingCenters(await readFile(join(process.cwd(), 'data/raw/hearing-centers/source.csv')));
  const output = join(process.cwd(), 'public/data/hearing-centers');
  await mkdir(output, { recursive: true });
  await writeFile(join(output, 'records.json'), JSON.stringify(result.records, null, 2) + '\n');
  await writeFile(join(output, 'conversion-report.json'), JSON.stringify(result.report, null, 2) + '\n');
  await writeFile(join(output, 'metadata.json'), JSON.stringify({ source: result.report.source, sourceUrl: 'https://data.taipei/api/frontstage/tpeod/dataset/resource.download?rid=05d2c646-b36c-4fd0-9613-8a870147309f', encoding: result.report.encoding, recordCount: result.records.length }, null, 2) + '\n');
  console.log(`Converted ${result.records.length} hearing centers (${result.report.encoding}).`);
}
