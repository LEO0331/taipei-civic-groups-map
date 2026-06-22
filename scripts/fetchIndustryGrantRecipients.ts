import { access, copyFile, mkdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

const rawDir = join(process.cwd(), 'data/raw/industry-grant-recipients');
const destination = join(rawDir, 'industry-grant-recipients.csv');
const metadataPath = join(rawDir, 'fetch-metadata.json');
const sourcePage = 'https://data.taipei/dataset/detail?id=3e78bffa-3fa3-46d5-a632-df99447de695';
const args = process.argv.slice(2);
const local = args.find((arg) => arg.startsWith('--local='))?.slice(8);
const url = args.find((arg) => arg.startsWith('--url='))?.slice(6);
const force = args.includes('--force');

async function writeMetadata(sourceUrl: string, notes: string[]) {
  const file = await stat(destination);
  await writeFile(metadataPath, JSON.stringify({
    sourceUrl, downloadedAt: new Date().toISOString(), fileSize: file.size,
    encoding: 'CP950 / Big5-compatible', notes,
  }, null, 2));
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
  console.log(`Downloaded industry grant CSV to ${destination}.`);
} else {
  throw new Error('No local CSV exists. Pass --local=/path/file.csv or --url=https://...csv.');
}
