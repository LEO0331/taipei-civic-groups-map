import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const sourcePage = 'https://data.taipei/dataset/detail?id=49ebc8c7-c015-406f-a8f4-051d580cfc8c';
const sourceUrl = 'https://data.taipei/api/frontstage/tpeod/dataset/resource.download?rid=111b39ad-b6c3-4e61-8ac4-e75b5e6648bd';
const output = join(process.cwd(), 'data/raw/travel-medicine-clinics');
await mkdir(output, { recursive: true });
const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`Download failed: ${response.status}`);
const data = Buffer.from(await response.arrayBuffer());
await Promise.all([
  writeFile(join(output, 'source.csv'), data),
  writeFile(join(output, 'fetch-metadata.json'), JSON.stringify({ sourcePage, sourceUrl, downloadedAt: new Date().toISOString(), fileSize: data.length, sourceAgency: '臺北市政府衛生局', sourceUpdatedAt: '2026-06-16T17:53:15+08:00', metadataUpdatedAt: '2026-07-16T09:50:18+08:00', updateFrequency: 'irregular' }, null, 2)),
]);
console.log(`Fetched ${data.length} bytes of travel medicine clinic records.`);
