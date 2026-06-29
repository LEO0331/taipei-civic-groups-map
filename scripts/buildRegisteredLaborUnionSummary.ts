import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildRegisteredLaborUnionSummary } from '../src/lib/registeredLaborUnions';
import type { RegisteredLaborUnion } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(dataDir, 'registered-labor-unions.json'), 'utf8')) as RegisteredLaborUnion[];
await writeFile(join(dataDir, 'registered-labor-union-summary.json'), JSON.stringify(buildRegisteredLaborUnionSummary(records)));
console.log(`Built registered labor union summary for ${records.length} records.`);
