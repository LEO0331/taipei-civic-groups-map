import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const datasetId = '3edd2a9b-8b26-4ab1-8a5a-12321255f6dd';
const outputDirectory = join(process.cwd(), 'data/raw/child-youth-friendly-welfare-service-sites');
const detailUrl = `https://data.taipei/dataset/detail?id=${datasetId}`;

await mkdir(outputDirectory, { recursive: true });
const detailHtml = (await (await fetch(detailUrl)).text()).replaceAll('\\u0026', '&');
const resourcePath = detailHtml.match(new RegExp(`/api/dataset/${datasetId}/resource/[0-9a-f-]{36}/download[^"'<>]*`, 'i'))?.[0];
if (!resourcePath) throw new Error(`No downloadable resource found for dataset ${datasetId}.`);

const resourceUrl = new URL(resourcePath, 'https://data.taipei').toString();
const response = await fetch(resourceUrl);
if (!response.ok) throw new Error(`Download failed: ${response.status} ${response.statusText}`);
const source = Buffer.from(await response.arrayBuffer());

await Promise.all([
  writeFile(join(outputDirectory, 'source.csv'), source),
  writeFile(join(outputDirectory, 'fetch-metadata.json'), JSON.stringify({
    datasetId, detailUrl, resourceUrl, fetchedAt: new Date().toISOString(), bytes: source.length,
  }, null, 2)),
]);
console.log(`Fetched ${source.length.toLocaleString()} bytes for child and youth welfare service sites.`);
