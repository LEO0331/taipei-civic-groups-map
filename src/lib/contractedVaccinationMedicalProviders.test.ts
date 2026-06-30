import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildContractedVaccinationMedicalProviderSummary,
  deriveVaccinationServiceItems,
  normalizeTaipeiDistrict,
  parseHealthcareProviderPhone,
  parseVaccinationProviderAddress,
  parseVaccinationServiceFlag,
} from './contractedVaccinationMedicalProviders';
import type { ContractedVaccinationMedicalProviderRecord } from '../types';

test('parses contracted vaccination provider source fields', () => {
  assert.equal(normalizeTaipeiDistrict('63000010'), '松山區');
  assert.equal(parseVaccinationServiceFlag('1'), true);
  assert.equal(parseVaccinationServiceFlag('V'), true);
  assert.equal(parseVaccinationServiceFlag('0'), false);
  assert.deepEqual(parseVaccinationProviderAddress('台北市北投區石牌路2段315號', '北投區'), {
    address: '台北市北投區石牌路2段315號',
    addressNormalized: '臺北市北投區石牌路2段315號',
    district: '北投區',
    roadName: '石牌路2段',
    warning: undefined,
  });
  assert.equal(parseHealthcareProviderPhone('(02)27135211').phoneType, 'taipei_landline');
  assert.equal(parseHealthcareProviderPhone('(02)27135211、(02)27130000').phoneType, 'multiple');
});

test('derives and summarizes contracted vaccination service fields', () => {
  const items = deriveVaccinationServiceItems({
    hasBcgClinic: true,
    hasChildRoutineVaccination: true,
    hasChildFluUnder3: false,
    hasChildFluOver3: false,
    hasAdultFlu: true,
    hasCovid19: true,
    hasPneumococcal: false,
    hasRotavirus: false,
    hasMpoxClinic: false,
    hasEnterovirusClinic: false,
  });
  assert.deepEqual(items, ['bcg_clinic', 'child_routine', 'adult_flu', 'covid_19']);
  const record: ContractedVaccinationMedicalProviderRecord = {
    id: 'a',
    module: 'contracted_vaccination_medical_providers',
    providerName: '測試診所',
    providerNameNormalized: '測試診所',
    district: '松山區',
    address: '臺北市松山區八德路四段1號',
    addressNormalized: '臺北市松山區八德路四段1號',
    roadName: '八德路四段',
    phoneType: 'taipei_landline',
    hasPhone: true,
    hasVoiceReservation: false,
    bcgClinicRaw: '1',
    hasBcgClinic: true,
    childRoutineRaw: '1',
    hasChildRoutineVaccination: true,
    hasChildFluUnder3: false,
    hasChildFluOver3: false,
    adultFluRaw: '1',
    hasAdultFlu: true,
    covid19Raw: '1',
    hasCovid19: true,
    hasPneumococcal: false,
    hasRotavirus: false,
    hasMpoxClinic: false,
    hasEnterovirusClinic: false,
    serviceItems: items,
    serviceItemCount: items.length,
    hasAnyChildVaccinationService: true,
    hasAnyAdultVaccinationService: true,
    hasAnySpecialClinicService: true,
    hasAnyFluService: true,
    hasAnyCovidService: true,
    hasAnyReservationField: false,
    locationPrecision: 'district_centroid',
    source: '臺北市各項預防接種合約醫療院所',
    sourceAgency: '臺北市政府衛生局',
  };
  const summary = buildContractedVaccinationMedicalProviderSummary([record]);
  assert.equal(summary.totalRecords, 1);
  assert.equal(summary.byServiceItem[0].serviceItem, 'bcg_clinic');
  assert.equal(summary.providerCategorySummary.covidProviderCount, 1);
});
