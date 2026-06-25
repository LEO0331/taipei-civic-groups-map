import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { CivicGroupSummary, IndustryGrantSummary, MetroProcurementScheduleSummary, RegisteredCramSchoolSummary } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const [civicGroups, industryGrants, metroProcurement, registeredCramSchools] = await Promise.all([
  readFile(join(dataDir, 'civic-group-summary.json'), 'utf8').then((text) => JSON.parse(text) as CivicGroupSummary),
  readFile(join(dataDir, 'industry-grant-summary.json'), 'utf8').then((text) => JSON.parse(text) as IndustryGrantSummary),
  readFile(join(dataDir, 'metro-procurement-summary.json'), 'utf8').then((text) => JSON.parse(text) as MetroProcurementScheduleSummary),
  readFile(join(dataDir, 'registered-cram-school-summary.json'), 'utf8').then((text) => JSON.parse(text) as RegisteredCramSchoolSummary),
]);
await writeFile(join(dataDir, 'public-records-summary.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  modules: {
    civicGroups: { recordCount: civicGroups.total },
    industryGrantRecipients: { recordCount: industryGrants.totalRecords, uniqueCompanyCount: industryGrants.uniqueCompanyCount },
    metroProcurementSchedule: { recordCount: metroProcurement.totalRecords, periodCount: metroProcurement.periodCount },
    registeredCramSchools: { recordCount: registeredCramSchools.totalRecords, districtCount: registeredCramSchools.districtCount },
  },
}));
console.log('Built public records summary.');
