import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const datasetId = 'e6f6ced6-4d66-4be4-93af-57b71b17b2b0';
const sourcePage = `https://data.taipei/dataset/detail?id=${datasetId}`;
const outputDirectory = join(process.cwd(), 'data/raw/diabetes-shared-care-medical-institutions');

const pageResponse = await fetch(sourcePage);
if (!pageResponse.ok) throw new Error(`Could not load dataset page (${pageResponse.status}).`);
const page = (await pageResponse.text()).replaceAll('\\u0026', '&').replaceAll('&amp;', '&');

const currentResource = page.match(/\/api\/frontstage\/tpeod\/dataset\/resource\.download\?rid=[0-9a-f-]{36}/i)?.[0];
const legacyResource = page.match(new RegExp(`/api/dataset/${datasetId}/resource/[0-9a-f-]{36}/download[^"'<>]*`, 'i'))?.[0];
const resourcePath = currentResource ?? legacyResource;
if (!resourcePath) throw new Error('No downloadable CSV resource was found on the official dataset page.');

const sourceUrl = new URL(resourcePath, 'https://data.taipei').toString();
const resourceResponse = await fetch(sourceUrl);
if (!resourceResponse.ok) throw new Error(`Could not download dataset resource (${resourceResponse.status}).`);
const bytes = Buffer.from(await resourceResponse.arrayBuffer());
if (!bytes.length) throw new Error('Downloaded dataset resource is empty.');

await mkdir(outputDirectory, { recursive: true });
await writeFile(join(outputDirectory, 'records.csv'), bytes);
await writeFile(join(outputDirectory, 'fetch-metadata.json'), JSON.stringify({
  sourcePage,
  sourceUrl,
  downloadedAt: new Date().toISOString(),
  fileSize: bytes.length,
}, null, 2));
