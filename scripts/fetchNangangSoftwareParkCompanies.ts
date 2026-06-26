import { access, copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

const datasetId = '6b7c48b4-03a6-4fcc-b172-9cee415c20b9';
const rawDir = join(process.cwd(), 'data/raw/nangang-software-park-companies');
const destination = join(rawDir, 'nangang-software-park-companies.csv');
const metadataPath = join(rawDir, 'fetch-metadata.json');
const sourcePage = `https://data.taipei/dataset/detail?id=${datasetId}`;
const args = process.argv.slice(2), local = args.find((arg) => arg.startsWith('--local='))?.slice(8), url = args.find((arg) => arg.startsWith('--url='))?.slice(6), force = args.includes('--force');

async function metadata(sourceUrl: string, notes: string[], failure?: string) {
  const file = await stat(destination), previous = await readFile(metadataPath, 'utf8').then(JSON.parse).catch(() => ({}));
  await writeFile(metadataPath, JSON.stringify({ sourceUrl, resourceName: '臺北市南港軟體工業園區廠商資料名錄', downloadedAt: new Date().toISOString(), fileSize: file.size, encoding: 'UTF-8-SIG', notes, failure, previous }, null, 2));
}
async function officialUrl() {
  const response = await fetch(sourcePage); if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const html = (await response.text()).replaceAll('\\u0026', '&');
  const resource = html.match(new RegExp(`/api/dataset/${datasetId}/resource/[0-9a-f-]{36}/download[^"'<>]*`, 'i'))?.[0];
  return resource && `https://data.taipei${resource}`;
}

await mkdir(rawDir, { recursive: true });
if (!force) try { await access(destination); await metadata(sourcePage, ['Existing local CSV reused.']); console.log(`Using existing ${destination}. Pass --force to replace it.`); process.exit(0); } catch { /* fetch */ }
if (local) { await copyFile(local, destination); await metadata('local-file', [`Copied from ${basename(local)}`]); }
else {
  try {
    const resolved = url ?? await officialUrl(); if (!resolved) throw new Error('No CSV resource found in dataset page.');
    const response = await fetch(resolved); if (!response.ok) throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    await writeFile(destination, Buffer.from(await response.arrayBuffer())); await metadata(resolved, [url ? 'Official resource URL supplied with --url.' : 'Official resource discovered from dataset page.']);
  } catch (error) {
    const failure = error instanceof Error ? error.message : String(error);
    try { await access(destination); await metadata(sourcePage, ['Official download failed; existing local CSV reused.'], failure); } catch { throw new Error(`No local CSV exists and official download failed: ${failure}. Pass --local=/path/to/file.csv or --url=https://...csv.`); }
  }
}
console.log(`Prepared Nangang Software Park company CSV at ${destination}.`);
