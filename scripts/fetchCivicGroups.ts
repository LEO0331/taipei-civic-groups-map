import { access, copyFile, mkdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

const rawDir = join(process.cwd(), 'data/raw/civic-groups');
const destination = join(rawDir, '臺北市人民團體名冊.csv');
const metadataPath = join(rawDir, 'fetch-metadata.json');
const sourcePage = 'https://data.taipei/dataset/detail?id=72417af0-7dec-4fad-b762-5f2baafcf084';
const args = process.argv.slice(2);
const local = args.find((arg) => arg.startsWith('--local='))?.slice(8);
const url = args.find((arg) => arg.startsWith('--url='))?.slice(6);
const force = args.includes('--force');

async function writeMetadata(sourceUrl: string, notes: string[]) {
  const file = await stat(destination);
  await writeFile(metadataPath, JSON.stringify({
    sourceUrl, downloadedAt: new Date().toISOString(), fileSize: file.size, notes,
  }, null, 2));
}

await mkdir(rawDir, { recursive: true });
if (!force) {
  try {
    await access(destination);
    await writeMetadata(sourcePage, ['Existing local CSV reused; downloadedAt records this fetch-script run.']);
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
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(destination, bytes);
  await writeMetadata(url, ['Official resource URL supplied with --url']);
  console.log(`Downloaded ${bytes.length} bytes to ${destination}.`);
} else {
  throw new Error('No local CSV exists. Pass --local=/path/file.csv or --url=https://...csv.');
}
