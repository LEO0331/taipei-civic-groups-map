import { access, copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

const datasetId = 'fe55795c-a220-4b88-bde1-5b994321f8af';
const sourcePage = `https://data.taipei/dataset/detail?id=${datasetId}`;
const officialResource = 'https://data.taipei/api/frontstage/tpeod/dataset/resource.download?rid=86d839db-85c7-48b0-991b-dc86922eb093';
const rawDir = join(process.cwd(), 'data/raw/senior-group-meal-service-sites');
const destination = join(rawDir, 'senior-group-meal-service-sites.csv');
const metadataPath = join(rawDir, 'fetch-metadata.json');
const args = process.argv.slice(2);
const local = args.find((arg) => arg.startsWith('--local='))?.slice(8);
const url = args.find((arg) => arg.startsWith('--url='))?.slice(6);
const force = args.includes('--force');

async function writeMetadata(sourceUrl: string, notes: string[], failure?: string) {
  const file = await stat(destination);
  const previous = await readFile(metadataPath, 'utf8').then(JSON.parse).catch(() => ({}));
  await writeFile(metadataPath, JSON.stringify({ sourcePage, sourceUrl, datasetId, downloadedAt: new Date().toISOString(), fileSize: file.size, notes, failure, previous }, null, 2));
}

await mkdir(rawDir, { recursive: true });
if (!force) {
  try { await access(destination); await writeMetadata(sourcePage, ['Existing local CSV reused.']); console.log(`Using existing ${destination}. Pass --force to replace it.`); process.exit(0); } catch { /* download or copy */ }
}
if (local) {
  await copyFile(local, destination);
  await writeMetadata('local-file', [`Copied from ${basename(local)}.`]);
} else {
  const sourceUrl = url ?? officialResource;
  try {
    const response = await fetch(sourceUrl);
    if (!response.ok) throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    await writeFile(destination, Buffer.from(await response.arrayBuffer()));
    await writeMetadata(sourceUrl, [url ? 'Source URL supplied with --url.' : 'Official resource URL used.']);
  } catch (error) {
    const failure = error instanceof Error ? error.message : String(error);
    try { await access(destination); await writeMetadata(sourcePage, ['Official download failed; existing local CSV reused.'], failure); } catch { throw new Error(`No local CSV exists and official download failed: ${failure}. Pass --local=/path/to/file.csv or --url=https://...csv.`); }
  }
}
console.log(`Prepared senior group meal service site CSV at ${destination}.`);
