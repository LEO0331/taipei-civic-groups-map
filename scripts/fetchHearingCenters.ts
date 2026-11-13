import { fetchUpstream } from './fetchUpstream.ts';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const sourceUrl = 'https://data.taipei/api/frontstage/tpeod/dataset/resource.download?rid=05d2c646-b36c-4fd0-9613-8a870147309f';
const response = await fetchUpstream(sourceUrl);
if (!response.ok) throw new Error(`Hearing-center source HTTP ${response.status}`);
const bytes = new Uint8Array(await response.arrayBuffer());
const output = join(process.cwd(), 'data/raw/hearing-centers');
await mkdir(output, { recursive: true });
await writeFile(join(output, 'source.csv'), bytes);
await writeFile(join(output, 'fetch-metadata.json'), JSON.stringify({ resourceName: '臺北市聽力所', sourceUrl, downloadedAt: new Date().toISOString(), sha256: createHash('sha256').update(bytes).digest('hex') }, null, 2) + '\n');
