import { access, copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

const rawDir = join(process.cwd(), 'data/raw/company-registration-change-records');
const metadataPath = join(rawDir, 'fetch-metadata.json');
const sourcePage = 'https://data.taipei/dataset/detail?id=0a1f284d-e985-4c39-b0b5-53389fbfa6e9';
const args = process.argv.slice(2);
const force = args.includes('--force');
const resources = [
  ['establishment', '公司設立11504.csv', args.find((arg) => arg.startsWith('--establishment='))?.slice(16)],
  ['modification', '公司變更11504.csv', args.find((arg) => arg.startsWith('--modification='))?.slice(15)],
  ['dissolution', '公司解散11504.csv', args.find((arg) => arg.startsWith('--dissolution='))?.slice(14)],
] as const;

await mkdir(rawDir, { recursive: true });
const prepared = [];
for (const [eventType, filename, local] of resources) {
  const destination = join(rawDir, filename);
  if (!force) try { await access(destination); prepared.push({ eventType, filename, sourceUrl: 'existing-local', fileSize: (await stat(destination)).size }); continue; } catch { /* copy */ }
  if (!local) throw new Error(`Missing --${eventType}=/path/to/csv. Use the three supplied CSVs.`);
  await copyFile(local, destination);
  prepared.push({ eventType, filename, sourceUrl: 'local-file', copiedFrom: basename(local), fileSize: (await stat(destination)).size });
}

const previous = await readFile(metadataPath, 'utf8').then(JSON.parse).catch(() => ({}));
await writeFile(metadataPath, JSON.stringify({
  sourcePage,
  source: '臺北市核准公司設立變更解散清冊',
  sourceAgency: '臺北市政府產業發展局商業處',
  downloadedAt: new Date().toISOString(),
  resources: prepared,
  encoding: 'UTF-8-SIG with Big5 fallback at conversion',
  previous,
}, null, 2));
console.log(`Prepared ${prepared.length} company registration change CSV resources at ${rawDir}.`);
