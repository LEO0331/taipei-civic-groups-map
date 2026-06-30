import { access, copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

const rawDir = join(process.cwd(), 'data/raw/business-registration-change-records');
const metadataPath = join(rawDir, 'fetch-metadata.json');
const sourcePage = 'https://data.taipei/dataset/detail?id=5fdefcca-e0a6-41bc-a520-7c8f067caad3';
const args = process.argv.slice(2);
const force = args.includes('--force');
const resources = [
  ['establishment', '商業設立11504.csv', args.find((arg) => arg.startsWith('--establishment='))?.slice(16)],
  ['modification', '商業變更11504.csv', args.find((arg) => arg.startsWith('--modification='))?.slice(15)],
  ['closure', '商業歇業11504.csv', args.find((arg) => arg.startsWith('--closure='))?.slice(10)],
] as const;

await mkdir(rawDir, { recursive: true });
const prepared = [];
for (const [eventType, filename, local] of resources) {
  const destination = join(rawDir, filename);
  if (!force) try { await access(destination); prepared.push({ eventType, filename, sourceUrl: 'existing-local', fileSize: (await stat(destination)).size }); continue; } catch { /* copy */ }
  if (!local) throw new Error(`Missing --${eventType === 'establishment' ? 'establishment' : eventType === 'modification' ? 'modification' : 'closure'}=/path/to/csv. Official multi-resource discovery is intentionally not guessed; use the three supplied CSVs.`);
  await copyFile(local, destination);
  prepared.push({ eventType, filename, sourceUrl: 'local-file', copiedFrom: basename(local), fileSize: (await stat(destination)).size });
}

const previous = await readFile(metadataPath, 'utf8').then(JSON.parse).catch(() => ({}));
await writeFile(metadataPath, JSON.stringify({
  sourcePage,
  source: '臺北市核准商業設立、變更及歇業登記等異動資料清冊',
  sourceAgency: '臺北市政府產業發展局商業處',
  downloadedAt: new Date().toISOString(),
  resources: prepared,
  encoding: 'UTF-8-SIG with Big5 fallback at conversion',
  previous,
}, null, 2));
console.log(`Prepared ${prepared.length} business registration change CSV resources at ${rawDir}.`);
