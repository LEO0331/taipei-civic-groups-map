import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';

const root = process.cwd();
const inputPath = join(root, 'data/raw/contracted-senior-health-examination-providers/source.csv');
const outputDirectory = join(root, 'public/data/contracted-senior-health-examination-providers');

function decodeCsv(bytes: Uint8Array) {
  try {
    return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' };
  } catch {
    return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' };
  }
}

const { text, encoding } = decodeCsv(await readFile(inputPath));
const [headers, ...rows] = parseCsv(text);
const sourceFields = headers.map((header) => header.trim());
const records = rows.map((row, index) => ({
  id: String(index + 1),
  sourceValues: Object.fromEntries(sourceFields.map((header, column) => [header, row[column]?.trim() ?? ''])),
}));

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(join(outputDirectory, 'records.json'), JSON.stringify(records)),
  writeFile(join(outputDirectory, 'summary.json'), JSON.stringify({ totalRecords: records.length, headers: sourceFields }, null, 2)),
  writeFile(join(outputDirectory, 'conversion-report.json'), JSON.stringify({
    source: '臺北市老人健康檢查特約醫療院所',
    encoding,
    inputRows: rows.length,
    outputRecords: records.length,
    sourceFields,
    notes: ['UTF-8-SIG, Big5, and CP950-compatible decoding is supported.'],
  }, null, 2)),
]);

console.log(`Converted ${records.length} senior health-examination providers (${encoding}).`);
