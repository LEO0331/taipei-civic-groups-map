import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const url = 'https://data.taipei/api/frontstage/tpeod/dataset/resource.download?rid=7002517c-e199-4ae4-a655-fc0b42e6eea3';
const response = await fetch(url); if (!response.ok) throw new Error(`Official CSV request failed: ${response.status}`);
const directory = join(process.cwd(), 'data/raw/public-influenza-antiviral-providers'); await mkdir(directory, { recursive: true }); await writeFile(join(directory, 'source.csv'), Buffer.from(await response.arrayBuffer()));
console.log('Fetched public influenza antiviral provider CSV.');
