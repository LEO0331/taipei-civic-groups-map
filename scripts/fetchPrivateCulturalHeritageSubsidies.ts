import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const datasetId = '24205a7e-278a-4e78-9033-47ec5cf74595';
const resourceId = 'ce3c3a79-5be3-42b5-9f56-4a5ce6936345';
const sourcePage = `https://data.taipei/dataset/detail?id=${datasetId}`;
const sourceUrl = `https://data.taipei/api/frontstage/tpeod/dataset/resource.download?rid=${resourceId}`;
const outputDir = join(process.cwd(), 'data/raw/private-cultural-heritage-subsidies');

await mkdir(outputDir, { recursive: true });
const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`Download failed: ${response.status}`);
const data = Buffer.from(await response.arrayBuffer());
await Promise.all([
  writeFile(join(outputDir, 'source.csv'), data),
  writeFile(join(outputDir, 'fetch-metadata.json'), JSON.stringify({ sourcePage, sourceUrl, downloadedAt: new Date().toISOString(), fileSize: data.length, coverageStart: '2007-01-01', coverageEnd: '2026-06-30', updateFrequency: 'irregular', sourceAgency: '臺北市政府文化局' }, null, 2)),
]);
console.log(`Fetched ${data.length} bytes of private cultural heritage subsidy records.`);
