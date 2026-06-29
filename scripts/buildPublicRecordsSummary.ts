import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { CivicGroupSummary, IndustryGrantSummary, LaborStandardActViolationSummary, MetroProcurementScheduleSummary, NangangSoftwareParkCompanySummary, RegisteredAnimalHospitalSummary, RegisteredCramSchoolSummary, RegisteredHotelSummary, RegisteredLaborUnionSummary } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const [civicGroups, laborUnions, industryGrants, metroProcurement, registeredCramSchools, registeredHotels, laborViolations, nangangCompanies, animalHospitals] = await Promise.all([
  readFile(join(dataDir, 'civic-group-summary.json'), 'utf8').then((text) => JSON.parse(text) as CivicGroupSummary),
  readFile(join(dataDir, 'registered-labor-union-summary.json'), 'utf8').then((text) => JSON.parse(text) as RegisteredLaborUnionSummary),
  readFile(join(dataDir, 'industry-grant-summary.json'), 'utf8').then((text) => JSON.parse(text) as IndustryGrantSummary),
  readFile(join(dataDir, 'metro-procurement-summary.json'), 'utf8').then((text) => JSON.parse(text) as MetroProcurementScheduleSummary),
  readFile(join(dataDir, 'registered-cram-school-summary.json'), 'utf8').then((text) => JSON.parse(text) as RegisteredCramSchoolSummary),
  readFile(join(dataDir, 'registered-hotel-summary.json'), 'utf8').then((text) => JSON.parse(text) as RegisteredHotelSummary),
  readFile(join(dataDir, 'labor-standard-act-violation-summary.json'), 'utf8').then((text) => JSON.parse(text) as LaborStandardActViolationSummary),
  readFile(join(dataDir, 'nangang-software-park-company-summary.json'), 'utf8').then((text) => JSON.parse(text) as NangangSoftwareParkCompanySummary),
  readFile(join(dataDir, 'registered-animal-hospital-summary.json'), 'utf8').then((text) => JSON.parse(text) as RegisteredAnimalHospitalSummary),
]);
await writeFile(join(dataDir, 'public-records-summary.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  modules: {
    civicGroups: { recordCount: civicGroups.total },
    registeredLaborUnions: { recordCount: laborUnions.totalRecords, districtCount: laborUnions.districtCount, taipeiAddressCount: laborUnions.taipeiAddressCount },
    industryGrantRecipients: { recordCount: industryGrants.totalRecords, uniqueCompanyCount: industryGrants.uniqueCompanyCount },
    metroProcurementSchedule: { recordCount: metroProcurement.totalRecords, periodCount: metroProcurement.periodCount },
    registeredCramSchools: { recordCount: registeredCramSchools.totalRecords, districtCount: registeredCramSchools.districtCount },
    registeredHotels: { recordCount: registeredHotels.totalRecords, districtCount: registeredHotels.districtCount, totalRoomCount: registeredHotels.totalRoomCount },
    laborStandardActViolationRecords: { recordCount: laborViolations.totalRecords, uniqueBusinessOrEmployerNameCount: laborViolations.uniqueBusinessOrEmployerNameCount, totalPenaltyAmountNtd: laborViolations.totalPenaltyAmountNtd },
    nangangSoftwareParkCompanies: { recordCount: nangangCompanies.totalRecords, uniqueBusinessIdCount: nangangCompanies.uniqueBusinessIdCount, recordsWithValidCoordinates: nangangCompanies.recordsWithValidCoordinates },
    registeredAnimalHospitals: { recordCount: animalHospitals.totalRecords, districtCount: animalHospitals.districtCount, uniqueAddressCount: animalHospitals.uniqueAddressCount },
  },
}));
console.log('Built public records summary.');
