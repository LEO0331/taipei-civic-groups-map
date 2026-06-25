import { access, copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

const datasetId = 'b124a967-fc88-4c45-bea8-41b4ef158a15';
const rawDir = join(process.cwd(), 'data/raw/registered-cram-schools');
const destination = join(rawDir, 'registered-cram-schools.csv');
const metadataPath = join(rawDir, 'fetch-metadata.json');
const sourcePage = `https://data.taipei/dataset/detail?id=${datasetId}`;
const args = process.argv.slice(2);
const local = args.find((arg) => arg.startsWith('--local='))?.slice(8);
const url = args.find((arg) => arg.startsWith('--url='))?.slice(6);
const force = args.includes('--force');

async function writeMetadata(sourceUrl: string, notes: string[], failure?: string) {
  const file = await stat(destination);
  const previous = await readFile(metadataPath, 'utf8').then((text) => JSON.parse(text)).catch(() => ({}));
  await writeFile(metadataPath, JSON.stringify({
    sourceUrl, resourceName: '臺北市立案補習班資訊', downloadedAt: new Date().toISOString(),
    fileSize: file.size, encoding: 'UTF-8-SIG', notes, failure, previous,
  }, null, 2));
}

async function discoverOfficialCsvUrl() {
  const response = await fetch(sourcePage);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const html = (await response.text()).replaceAll('\\u0026', '&');
  const resource = html.match(new RegExp(`/api/dataset/${datasetId}/resource/[0-9a-f-]{36}/download[^"'<>]*`, 'i'))?.[0];
  return resource ? `https://data.taipei${resource}` : undefined;
}

await mkdir(rawDir, { recursive: true });
if (!force) {
  try {
    await access(destination);
    await writeMetadata(sourcePage, ['Existing local CSV reused.']);
    console.log(`Using existing ${destination}. Pass --force to replace it.`);
    process.exit(0);
  } catch { /* continue */ }
}

if (local) {
  await copyFile(local, destination);
  await writeMetadata('local-file', [`Copied from ${basename(local)}`]);
  console.log(`Copied ${basename(local)} to ${destination}.`);
} else if (url) {
  const parsedUrl = new URL(url);
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('Download URL must use HTTP or HTTPS.');
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
  await writeMetadata(url, ['Official resource URL supplied with --url.']);
  console.log(`Downloaded registered cram-school CSV to ${destination}.`);
} else {
  try {
    const officialUrl = await discoverOfficialCsvUrl();
    if (!officialUrl) throw new Error('No CSV resource found in dataset page.');
    const response = await fetch(officialUrl);
    if (!response.ok) throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    await writeFile(destination, Buffer.from(await response.arrayBuffer()));
    await writeMetadata(officialUrl, ['Official resource discovered from dataset page.']);
    console.log(`Downloaded registered cram-school CSV to ${destination}.`);
  } catch (error) {
    const failure = error instanceof Error ? error.message : String(error);
    try {
      await access(destination);
      await writeMetadata(sourcePage, ['Official download failed; existing local CSV reused.'], failure);
      console.log(`Using existing ${destination}; official download failed: ${failure}`);
    } catch {
      throw new Error(`No local CSV exists and official download failed: ${failure}. Pass --local=/path/file.csv or --url=https://...csv.`);
    }
  }
}
