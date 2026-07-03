import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildRegisteredFactorySummary } from '../src/lib/registeredFactoryDistribution';
import type { RegisteredFactoryRecord } from '../src/types';

const outputDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(outputDir, 'registered-factory-distribution.json'), 'utf8')) as RegisteredFactoryRecord[];
await writeFile(join(outputDir, 'registered-factory-summary.json'), JSON.stringify(buildRegisteredFactorySummary(records)));
console.log('Built registered factory summary.');
