import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildLicensedElectronicGameArcadeOperatorSummary } from '../src/lib/licensedElectronicGameArcadeOperators';
import type { LicensedElectronicGameArcadeOperatorRecord } from '../src/types';

const outputDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(outputDir, 'licensed-electronic-game-arcade-operators.json'), 'utf8')) as LicensedElectronicGameArcadeOperatorRecord[];
await writeFile(join(outputDir, 'licensed-electronic-game-arcade-operator-summary.json'), JSON.stringify(buildLicensedElectronicGameArcadeOperatorSummary(records)));
console.log(`Built licensed electronic game arcade operator summary for ${records.length} records.`);
