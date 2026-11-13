import { fetchUpstream } from './fetchUpstream.ts';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const sourceUrl = 'https://data.taipei/api/frontstage/tpeod/dataset/resource.download?rid=f432adf0-0e92-473f-a81e-5d5e8ef75965';
const response = await fetchUpstream(sourceUrl);
if (!response.ok) throw new Error(`Senior-service source HTTP ${response.status}`);
const bytes = new Uint8Array(await response.arrayBuffer());
const output = join(process.cwd(), 'data/raw/senior-services');
await mkdir(output, { recursive: true });
await writeFile(join(output, 'source.csv'), bytes);
await writeFile(join(output, 'fetch-metadata.json'), JSON.stringify({ resourceName: '銀髮服務機構', sourceUrl, downloadedAt: new Date().toISOString(), sha256: createHash('sha256').update(bytes).digest('hex') }, null, 2) + '\n');
