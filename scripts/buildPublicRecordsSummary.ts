import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { CivicGroupSummary, IndustryGrantSummary, LaborStandardActViolationSummary, MetroProcurementScheduleSummary, RegisteredCramSchoolSummary, RegisteredHotelSummary } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const [civicGroups, industryGrants, metroProcurement, registeredCramSchools, registeredHotels, laborViolations] = await Promise.all([
  readFile(join(dataDir, 'civic-group-summary.json'), 'utf8').then((text) => JSON.parse(text) as CivicGroupSummary),
  readFile(join(dataDir, 'industry-grant-summary.json'), 'utf8').then((text) => JSON.parse(text) as IndustryGrantSummary),
  readFile(join(dataDir, 'metro-procurement-summary.json'), 'utf8').then((text) => JSON.parse(text) as MetroProcurementScheduleSummary),
  readFile(join(dataDir, 'registered-cram-school-summary.json'), 'utf8').then((text) => JSON.parse(text) as RegisteredCramSchoolSummary),
  readFile(join(dataDir, 'registered-hotel-summary.json'), 'utf8').then((text) => JSON.parse(text) as RegisteredHotelSummary),
  readFile(join(dataDir, 'labor-standard-act-violation-summary.json'), 'utf8').then((text) => JSON.parse(text) as LaborStandardActViolationSummary),
]);
await writeFile(join(dataDir, 'public-records-summary.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  modules: {
    civicGroups: { recordCount: civicGroups.total },
    industryGrantRecipients: { recordCount: industryGrants.totalRecords, uniqueCompanyCount: industryGrants.uniqueCompanyCount },
    metroProcurementSchedule: { recordCount: metroProcurement.totalRecords, periodCount: metroProcurement.periodCount },
    registeredCramSchools: { recordCount: registeredCramSchools.totalRecords, districtCount: registeredCramSchools.districtCount },
    registeredHotels: { recordCount: registeredHotels.totalRecords, districtCount: registeredHotels.districtCount, totalRoomCount: registeredHotels.totalRoomCount },
    laborStandardActViolationRecords: { recordCount: laborViolations.totalRecords, uniqueBusinessOrEmployerNameCount: laborViolations.uniqueBusinessOrEmployerNameCount, totalPenaltyAmountNtd: laborViolations.totalPenaltyAmountNtd },
  },
}));
console.log('Built public records summary.');
