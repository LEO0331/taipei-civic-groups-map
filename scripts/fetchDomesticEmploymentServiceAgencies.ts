import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const sourceUrl = 'https://data.taipei/api/frontstage/tpeod/dataset/resource.download?rid=37dc2485-6c21-47ea-9b91-2d85f14d998b';
const directory = join(process.cwd(), 'data/raw/domestic-employment-service-agencies');
const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`Download failed: ${response.status} ${response.statusText}`);
const bytes = Buffer.from(await response.arrayBuffer());
await mkdir(directory, { recursive: true });
await writeFile(join(directory, 'records.csv'), bytes);
await writeFile(join(directory, 'fetch-metadata.json'), JSON.stringify({ sourceUrl, downloadedAt: new Date().toISOString(), fileSize: bytes.length }, null, 2));
console.log(`Downloaded domestic employment service agencies CSV (${bytes.length} bytes).`);
