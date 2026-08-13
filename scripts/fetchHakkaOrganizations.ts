import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const sourcePage = 'https://data.taipei/dataset/detail?id=0be09825-0507-4624-8c4b-3872b5117fae';
const sourceUrl = 'https://data.taipei/api/frontstage/tpeod/dataset/resource.download?rid=077f1389-9c6d-4af8-8909-527c73bb2176';
const output = join(process.cwd(), 'data/raw/hakka-organizations');
await mkdir(output, { recursive: true });
const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`Download failed: ${response.status}`);
const data = Buffer.from(await response.arrayBuffer());
await Promise.all([writeFile(join(output, 'source.csv'), data), writeFile(join(output, 'fetch-metadata.json'), JSON.stringify({ sourcePage, sourceUrl, downloadedAt: new Date().toISOString(), fileSize: data.length, sourceAgency: '臺北市政府客家事務委員會', sourceFileUpdatedAt: '2025-06-12T16:16:44+08:00', metadataUpdatedAt: '2025-12-18T13:45:28+08:00', updateFrequency: 'irregular' }, null, 2))]);
console.log(`Fetched ${data.length} bytes of Hakka organization records.`);
