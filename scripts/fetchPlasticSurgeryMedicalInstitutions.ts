import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const datasetId = 'eab0da4e-0a6e-432e-80da-dcddeed0fef3';
const sourcePage = `https://data.taipei/dataset/detail?id=${datasetId}`;
const rawDirectory = join(process.cwd(), 'data/raw/plastic-surgery-medical-institutions');
await mkdir(rawDirectory, { recursive: true });

const page = (await (await fetch(sourcePage)).text()).replaceAll('\\u0026', '&');
const sourceFileUpdatedAt = page.match(/data-th="更新時間"[^>]*>\s*<span[^>]*>\s*([^<\s][^<]*?)\s*<\/span>/)?.[1] ?? '';
const metadataUpdatedAt = page.match(/詮釋資料更新時間[\s\S]{0,240}?<td[^>]*>\s*([^<\s][^<]*?)\s*<\/td>/)?.[1] ?? '';
const path = page.match(new RegExp(`/api/dataset/${datasetId}/resource/[0-9a-f-]{36}/download[^"'<>]*`, 'i'))?.[0];
if (!path) throw new Error('The official dataset page did not expose a downloadable resource.');
const sourceUrl = `https://data.taipei${path}`;
const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`Official CSV download failed: ${response.status} ${response.statusText}`);
const bytes = Buffer.from(await response.arrayBuffer());
await Promise.all([
  writeFile(join(rawDirectory, 'source.csv'), bytes),
  writeFile(join(rawDirectory, 'fetch-metadata.json'), JSON.stringify({ datasetId, sourcePage, sourceUrl, sourceFileUpdatedAt, metadataUpdatedAt, downloadedAt: new Date().toISOString(), fileSize: bytes.length }, null, 2)),
]);
console.log('Fetched plastic surgery medical institutions CSV.');
