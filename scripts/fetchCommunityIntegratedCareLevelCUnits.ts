import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const response = await fetch('https://data.taipei/api/frontstage/tpeod/dataset/resource.download?rid=ffab5e5f-4a0f-4759-8531-5302379509cd'); if (!response.ok) throw new Error(`Official CSV request failed: ${response.status}`);
const directory = join(process.cwd(), 'data/raw/community-integrated-care-level-c-units'); await mkdir(directory, { recursive: true }); await writeFile(join(directory, 'source.csv'), Buffer.from(await response.arrayBuffer())); console.log('Fetched community integrated care Level C unit CSV.');
