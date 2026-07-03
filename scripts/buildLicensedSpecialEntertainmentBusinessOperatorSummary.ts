import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildLicensedSpecialEntertainmentBusinessOperatorSummary } from '../src/lib/licensedSpecialEntertainmentBusinessOperators';
import type { LicensedSpecialEntertainmentBusinessOperatorRecord } from '../src/types';

const outputDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(outputDir, 'licensed-special-entertainment-business-operators.json'), 'utf8')) as LicensedSpecialEntertainmentBusinessOperatorRecord[];
await writeFile(join(outputDir, 'licensed-special-entertainment-business-operator-summary.json'), JSON.stringify(buildLicensedSpecialEntertainmentBusinessOperatorSummary(records)));
console.log('Built licensed special entertainment business operator summary.');
