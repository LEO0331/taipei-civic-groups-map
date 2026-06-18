import { access, copyFile, mkdir, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

const rawDir = join(process.cwd(), 'data/raw/civic-groups');
const destination = join(rawDir, '臺北市人民團體名冊.csv');
const args = process.argv.slice(2);
const local = args.find((arg) => arg.startsWith('--local='))?.slice(8);
const url = args.find((arg) => arg.startsWith('--url='))?.slice(6);
const force = args.includes('--force');

await mkdir(rawDir, { recursive: true });
if (!force) {
  try {
    await access(destination);
    console.log(`Using existing ${destination}. Pass --force to replace it.`);
    process.exit(0);
  } catch { /* continue */ }
}

if (local) {
  await copyFile(local, destination);
  console.log(`Copied ${basename(local)} to ${destination}.`);
} else if (url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(destination, bytes);
  await writeFile(join(rawDir, 'fetch-metadata.json'), JSON.stringify({
    sourceUrl: url, downloadedAt: new Date().toISOString(), fileSize: bytes.length,
    notes: ['Official resource URL supplied with --url'],
  }, null, 2));
  console.log(`Downloaded ${bytes.length} bytes to ${destination}.`);
} else {
  throw new Error('No local CSV exists. Pass --local=/path/file.csv or --url=https://...csv.');
}
