import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const datasetId = '051c349f-ed40-436f-8f9a-37b7f90af71b';
const sourcePage = `https://data.taipei/dataset/detail?id=${datasetId}`;
const outputDirectory = join(process.cwd(), 'data/raw/hospital-hemodialysis-resources');
const page = await fetch(sourcePage);
if (!page.ok) throw new Error(`${page.status} ${page.statusText}`);
const html = (await page.text()).replaceAll('\\u0026', '&');
const path = html.match(new RegExp(`/api/dataset/${datasetId}/resource/[0-9a-f-]{36}/download[^"'<>]*`, 'i'))?.[0];
if (!path) throw new Error('No CSV resource found on the official dataset page.');
const sourceUrl = `https://data.taipei${path}`;
const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`Download failed: ${response.status} ${response.statusText}`);
const bytes = Buffer.from(await response.arrayBuffer());
await mkdir(outputDirectory, { recursive: true });
await writeFile(join(outputDirectory, 'records.csv'), bytes);
await writeFile(join(outputDirectory, 'fetch-metadata.json'), JSON.stringify({ sourcePage, sourceUrl, downloadedAt: new Date().toISOString(), fileSize: bytes.length }, null, 2));
console.log(`Downloaded hospital hemodialysis resources CSV (${bytes.length} bytes).`);
