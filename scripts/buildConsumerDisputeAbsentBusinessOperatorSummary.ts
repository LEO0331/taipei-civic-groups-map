import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildConsumerDisputeAbsentBusinessOperatorSummary } from '../src/lib/consumerDisputeAbsentBusinessOperators';
import type { ConsumerDisputeAbsentBusinessOperatorRecord } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(dataDir, 'consumer-dispute-absent-business-operators.json'), 'utf8')) as ConsumerDisputeAbsentBusinessOperatorRecord[];
const summary = buildConsumerDisputeAbsentBusinessOperatorSummary(records);
const latest = records.filter((record) => record.year === summary.maxYear).sort((a, b) => (b.negotiationDate ?? '').localeCompare(a.negotiationDate ?? ''));
await Promise.all([
  writeFile(join(dataDir, 'consumer-dispute-absent-business-operator-summary.json'), JSON.stringify(summary)),
  writeFile(join(dataDir, 'consumer-dispute-absent-business-operator-latest.json'), JSON.stringify(latest)),
]);
console.log(`Built consumer dispute absence summary for ${records.length} records.`);
