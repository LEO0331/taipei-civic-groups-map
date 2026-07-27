import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const id = '3c0cd5aa-ad4b-4695-b197-f9eb3405e556';
const output = join(process.cwd(), 'data/raw/disability-institution-capacity-and-vacancies');
const detailUrl = `https://data.taipei/dataset/detail?id=${id}`;
await mkdir(output, { recursive: true });
const html = (await (await fetch(detailUrl)).text()).replaceAll('\\u0026', '&');
const resource = html.match(new RegExp(`/api/dataset/${id}/resource/[0-9a-f-]{36}/download[^"'<>]*`, 'i'))?.[0];
if (!resource) throw new Error('No downloadable dataset resource found.');
const resourceUrl = new URL(resource, 'https://data.taipei').toString();
const response = await fetch(resourceUrl);
if (!response.ok) throw new Error(`Download failed: ${response.status}`);
const bytes = Buffer.from(await response.arrayBuffer());
await Promise.all([writeFile(join(output, 'source.csv'), bytes), writeFile(join(output, 'fetch-metadata.json'), JSON.stringify({ id, detailUrl, resourceUrl, fetchedAt: new Date().toISOString(), bytes: bytes.length }, null, 2))]);
console.log(`Fetched ${bytes.length.toLocaleString()} bytes.`);
