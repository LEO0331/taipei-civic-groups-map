import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseCsv } from './convertCivicGroups';
import { decodeHealthcareCsv, districtByCode } from './healthcareDirectoryConversion';

export function convertSeniorServices(bytes: Uint8Array) {
  const { text, encoding } = decodeHealthcareCsv(bytes);
  const [header, ...rows] = parseCsv(text);
  const headers = header.map(value => value.trim());
  const required = ['序號', '機構類型', '機構名稱', '地址', '行政區代碼', '電話', '立案日期'];
  if (required.some(key => !headers.includes(key))) throw new Error('Unexpected senior-service source headers');
  const records = rows.map(row => {
    const sourceValues = Object.fromEntries(headers.map((key, index) => [key, row[index] ?? '']));
    const name = sourceValues['機構名稱'].trim(), address = sourceValues['地址'].trim();
    const establishedDateRaw = sourceValues['立案日期'];
    const date = /^(\d{2,3})(\d{2})(\d{2})$/.exec(establishedDateRaw.replace(/\.0$/, ''));
    return {
      id: createHash('sha1').update(JSON.stringify(sourceValues)).digest('hex').slice(0, 16),
      name, categoryRaw: sourceValues['機構類型'], address, districtCode: sourceValues['行政區代碼'], district: districtByCode[sourceValues['行政區代碼']] ?? '',
      phone: sourceValues['電話'], locationCity: address.includes('臺北市') || address.includes('台北市') ? '臺北市' : '臺北市外',
      establishedDateRaw, establishedDate: date ? `${Number(date[1]) + 1911}-${date[2]}-${date[3]}` : null,
      externalMapQuery: `${address} ${name}`.trim(), sourceValues,
    };
  });
  if (!records.length || records.some(record => !record.name || record.name.includes('\ufffd'))) throw new Error('Empty or unreadable senior-service source');
  return { records, report: { source: '銀髮服務機構', encoding, sourceFields: headers, inputRows: rows.length, outputRecords: records.length, sourceSha256: createHash('sha256').update(bytes).digest('hex') } };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = convertSeniorServices(await readFile(join(process.cwd(), 'data/raw/senior-services/source.csv')));
  const output = join(process.cwd(), 'public/data/senior-services');
  await mkdir(output, { recursive: true });
  await writeFile(join(output, 'records.json'), JSON.stringify(result.records, null, 2) + '\n');
  await writeFile(join(output, 'conversion-report.json'), JSON.stringify(result.report, null, 2) + '\n');
  await writeFile(join(output, 'metadata.json'), JSON.stringify({ source: result.report.source, sourceUrl: 'https://data.taipei/api/frontstage/tpeod/dataset/resource.download?rid=f432adf0-0e92-473f-a81e-5d5e8ef75965', encoding: result.report.encoding, recordCount: result.records.length }, null, 2) + '\n');
  console.log(`Converted ${result.records.length} senior services (${result.report.encoding}).`);
}
