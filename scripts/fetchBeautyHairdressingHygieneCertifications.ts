import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const url = 'https://data.taipei/api/frontstage/tpeod/dataset/resource.download?rid=5fc86f6b-07af-4339-a2d9-06b0764ae8cf';
const outputDirectory = join(process.cwd(), 'data/raw/beauty-hairdressing-hygiene-certifications');
const response = await fetch(url);
if (!response.ok) throw new Error(`Official CSV request failed: ${response.status}`);
await mkdir(outputDirectory, { recursive: true });
await writeFile(join(outputDirectory, 'source.csv'), Buffer.from(await response.arrayBuffer()));
console.log('Fetched beauty and hairdressing hygiene certification CSV.');
