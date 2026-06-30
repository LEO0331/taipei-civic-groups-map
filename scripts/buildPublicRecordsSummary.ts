import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { CivicGroupSummary, ContractedVaccinationMedicalProviderSummary, IndustryGrantSummary, LaborStandardActViolationSummary, MetroProcurementScheduleSummary, NangangSoftwareParkCompanySummary, PerformingArtsGroupSummary, QuasiPublicInfantCareCenterSummary, RegisteredAnimalHospitalSummary, RegisteredCramSchoolSummary, RegisteredHotelSummary, RegisteredLaborUnionSummary, TaipeiTravelAccommodationZhSummary, TelepsychologyCounselingInstitutionSummary } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const [civicGroups, performingArtsGroups, vaccinationProviders, telepsychology, laborUnions, infantCare, travelAccommodations, industryGrants, metroProcurement, registeredCramSchools, registeredHotels, laborViolations, nangangCompanies, animalHospitals] = await Promise.all([
  readFile(join(dataDir, 'civic-group-summary.json'), 'utf8').then((text) => JSON.parse(text) as CivicGroupSummary),
  readFile(join(dataDir, 'performing-arts-group-summary.json'), 'utf8').then((text) => JSON.parse(text) as PerformingArtsGroupSummary),
  readFile(join(dataDir, 'contracted-vaccination-medical-provider-summary.json'), 'utf8').then((text) => JSON.parse(text) as ContractedVaccinationMedicalProviderSummary),
  readFile(join(dataDir, 'telepsychology-counseling-institution-summary.json'), 'utf8').then((text) => JSON.parse(text) as TelepsychologyCounselingInstitutionSummary),
  readFile(join(dataDir, 'registered-labor-union-summary.json'), 'utf8').then((text) => JSON.parse(text) as RegisteredLaborUnionSummary),
  readFile(join(dataDir, 'quasi-public-infant-care-center-summary.json'), 'utf8').then((text) => JSON.parse(text) as QuasiPublicInfantCareCenterSummary),
  readFile(join(dataDir, 'taipei-travel-accommodation-zh-summary.json'), 'utf8').then((text) => JSON.parse(text) as TaipeiTravelAccommodationZhSummary),
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
    performingArtsGroups: { recordCount: performingArtsGroups.totalRecords, districtCount: performingArtsGroups.districtCount, recordsWithWebsite: performingArtsGroups.recordsWithWebsite },
    contractedVaccinationMedicalProviders: { recordCount: vaccinationProviders.totalRecords, districtCount: vaccinationProviders.districtCount, recordsWithPhone: vaccinationProviders.recordsWithPhone },
    telepsychologyCounselingInstitutions: { recordCount: telepsychology.totalRecords, districtCount: telepsychology.districtCount, recordsWithPhone: telepsychology.recordsWithPhone, recordsWithMobile: telepsychology.recordsWithMobile },
    registeredLaborUnions: { recordCount: laborUnions.totalRecords, districtCount: laborUnions.districtCount, taipeiAddressCount: laborUnions.taipeiAddressCount },
    quasiPublicInfantCareCenters: { recordCount: infantCare.totalRecords, districtCount: infantCare.districtCount, totalApprovedCapacity: infantCare.totalApprovedCapacity, totalActualEnrollment: infantCare.totalActualEnrollment },
    taipeiTravelAccommodationsZh: { recordCount: travelAccommodations.totalRecords, districtCount: travelAccommodations.districtCount, totalRoomCount: travelAccommodations.totalRoomCount },
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
