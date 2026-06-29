import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildTaipeiTravelAccommodationZhSummary } from '../src/lib/taipeiTravelAccommodationsZh';
import type { TaipeiTravelAccommodationZhRecord } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(dataDir, 'taipei-travel-accommodations-zh.json'), 'utf8')) as TaipeiTravelAccommodationZhRecord[];
await writeFile(join(dataDir, 'taipei-travel-accommodation-zh-summary.json'), JSON.stringify(buildTaipeiTravelAccommodationZhSummary(records)));
console.log(`Built Taipei Travel accommodation summary for ${records.length} records.`);
