import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const datasetId = 'ea0184a9-8e4f-4b29-b86a-4ef74d6e1fb1';
const sourcePage = `https://data.taipei/dataset/detail?id=${datasetId}`;
const directory = join(process.cwd(), 'data/raw/ophthalmology-institutions');
await mkdir(directory, { recursive: true });
const page = (await (await fetch(sourcePage)).text()).replaceAll('\\u0026', '&');
const relativeUrl = page.match(new RegExp(`/api/dataset/${datasetId}/resource/[0-9a-f-]{36}/download[^"'<>]*`, 'i'))?.[0];
if (!relativeUrl) throw new Error('No downloadable CSV resource found for the ophthalmology dataset.');
const sourceUrl = new URL(relativeUrl, 'https://data.taipei').toString();
const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`Download failed: ${response.status}`);
const bytes = Buffer.from(await response.arrayBuffer());
await Promise.all([
  writeFile(join(directory, 'source.csv'), bytes),
  writeFile(join(directory, 'fetch-metadata.json'), JSON.stringify({ datasetId, sourcePage, sourceUrl, downloadedAt: new Date().toISOString(), fileSize: bytes.length }, null, 2)),
]);
console.log(`Fetched ${bytes.length} bytes of ophthalmology institution data.`);
