import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildMetroProcurementSummary } from '../src/lib/metroProcurement';
import type { MetroProcurementScheduleRecord } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(dataDir, 'metro-procurement-schedules.json'), 'utf8')) as MetroProcurementScheduleRecord[];
await writeFile(join(dataDir, 'metro-procurement-summary.json'), JSON.stringify(buildMetroProcurementSummary(records)));
console.log(`Built metro procurement summary for ${records.length} records.`);
