import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const datasetId = '8aeb2d36-b806-4461-9763-5c35017049b0';
const datasetTitle = '臺北市兒科醫療機構';
const sourcePage = `https://data.taipei/dataset/detail?id=${datasetId}`;
const rawDirectory = join(process.cwd(), 'data/raw/pediatric-medical-institutions');

await mkdir(rawDirectory, { recursive: true });

const page = (await (await fetch(sourcePage)).text()).replaceAll('\\u0026', '&');
const sourceFileUpdatedAt = page.match(/data-th="更新時間"[^>]*>\s*<span[^>]*>\s*([^<\s][^<]*?)\s*<\/span>/)?.[1] ?? '';
const metadataUpdatedAt = page.match(/詮釋資料更新時間[\s\S]{0,240}?<td[^>]*>\s*([^<\s][^<]*?)\s*<\/td>/)?.[1] ?? '';
const resourcePath = page.match(new RegExp(`/api/dataset/${datasetId}/resource/[0-9a-f-]{36}/download[^"'<>]*`, 'i'))?.[0];

if (!resourcePath) throw new Error('The official dataset page did not expose a downloadable CSV resource.');

const sourceUrl = `https://data.taipei${resourcePath}`;
const response = await fetch(sourceUrl);

if (!response.ok) throw new Error(`Official CSV download failed: ${response.status} ${response.statusText}`);

const bytes = Buffer.from(await response.arrayBuffer());

await Promise.all([
  writeFile(join(rawDirectory, 'source.csv'), bytes),
  writeFile(join(rawDirectory, 'fetch-metadata.json'), JSON.stringify({
    datasetId,
    datasetTitle,
    sourcePage,
    sourceUrl,
    sourceFileUpdatedAt,
    metadataUpdatedAt,
    downloadedAt: new Date().toISOString(),
    fileSize: bytes.length,
    notes: [
      'Official CSV downloaded from Taipei Open Data.',
      'Conversion should try UTF-8-SIG first, then Big5 / CP950-compatible decoding.',
    ],
  }, null, 2)),
]);

console.log('Fetched pediatric medical institutions CSV.');
