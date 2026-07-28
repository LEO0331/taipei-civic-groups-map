import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const rawDirectory = join(root, 'data/raw/taipei-government-application-services');
const endpoint = 'https://service.taipei/TGC_TPOB_API/api/Search/Search';
const response = await fetch(endpoint, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ condition: {} }),
});

if (!response.ok) throw new Error(`Official Taipei Services export failed: ${response.status} ${response.statusText}`);

const payload = await response.json() as { data?: { grid?: unknown[] }; code?: string; message?: string };
if (!Array.isArray(payload.data?.grid)) throw new Error('Official Taipei Services export did not contain data.grid.');
if (JSON.stringify(payload).includes('\uFFFD')) throw new Error('Official Taipei Services export contains replacement characters.');

await mkdir(rawDirectory, { recursive: true });
await Promise.all([
  writeFile(join(rawDirectory, 'source.json'), JSON.stringify(payload.data.grid, null, 2)),
  writeFile(join(rawDirectory, 'fetch-metadata.json'), JSON.stringify({
    source: '臺北市政府－台北服務通',
    sourceUrl: 'https://service.taipei/',
    endpoint,
    downloadedAt: new Date().toISOString(),
    recordCount: payload.data.grid.length,
    encoding: 'UTF-8 JSON',
    notes: ['The endpoint is the public service-search API used by the official Taipei Services website.', 'Only public, source-supplied fields are retained.'],
  }, null, 2)),
]);

console.log(`Fetched ${payload.data.grid.length} Taipei Government application-service records.`);
