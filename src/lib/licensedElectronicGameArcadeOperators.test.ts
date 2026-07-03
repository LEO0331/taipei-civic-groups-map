import assert from 'node:assert/strict';
import test from 'node:test';
import { buildLicensedElectronicGameArcadeOperatorSummary, filterLicensedElectronicGameArcadeOperators, parseBusinessPremisesAddress, parseBusinessRegistrationNumber, parseTaipeiDistrictName } from './licensedElectronicGameArcadeOperators';
import type { LicensedElectronicGameArcadeOperatorRecord } from '../types';

const base: LicensedElectronicGameArcadeOperatorRecord = {
  id: '1', module: 'licensed_electronic_game_arcade_operators', sourceSequenceNumber: 1, sourceSequenceNumberNormalized: '1',
  companyOrBusinessName: '福星電子遊戲場業', companyOrBusinessNameNormalized: '福星電子遊戲場業',
  businessRegistrationNumber: '01080023', businessRegistrationNumberNormalized: '01080023', validBusinessRegistrationNumberFormat: true,
  districtName: '萬華區', districtNameNormalized: '萬華區', isTaipeiDistrict: true,
  businessPremisesAddress: '西寧南路36號3樓之53、54、96、97、104', businessPremisesAddressNormalized: '西寧南路36號3樓之53、54、96、97、104',
  roadName: '西寧南路', addressLooksLikeComplexUnit: true, hasNote: false,
  coordinateSource: 'none', geocodingStatus: 'not_geocoded_address_only', locationPrecision: 'district_address',
  googleMapsQuery: '臺北市 萬華區 西寧南路36號3樓之53、54、96、97、104 福星電子遊戲場業',
  source: '臺北市合法電子遊戲場業者清冊', sourceAgency: '臺北市政府產業發展局商業處',
};

test('parses licensed arcade source fields without geocoding', () => {
  assert.equal(parseTaipeiDistrictName('萬華區 ').districtName, '萬華區');
  assert.equal(parseBusinessRegistrationNumber('01080023').businessRegistrationNumberNormalized, '01080023');
  assert.equal(parseBusinessRegistrationNumber('1080023').validBusinessRegistrationNumberFormat, false);
  const address = parseBusinessPremisesAddress('西寧南路36號3樓之53、54、96、97、104');
  assert.equal(address.roadName, '西寧南路');
  assert.equal(address.addressLooksLikeComplexUnit, true);
});

test('summarizes and filters licensed arcade operators', () => {
  const records = [base, { ...base, id: '2', sourceSequenceNumber: 2, sourceSequenceNumberNormalized: '2', companyOrBusinessName: '棒恰恰電子遊戲場業有限公司', companyOrBusinessNameNormalized: '棒恰恰電子遊戲場業有限公司', businessRegistrationNumber: '60764357', businessRegistrationNumberNormalized: '60764357', districtName: '大安區', districtNameNormalized: '大安區', businessPremisesAddress: '忠孝東路4段200號11樓', businessPremisesAddressNormalized: '忠孝東路4段200號11樓', roadName: '忠孝東路' }];
  const summary = buildLicensedElectronicGameArcadeOperatorSummary(records);
  assert.equal(summary.totalRecords, 2);
  assert.equal(summary.districtCount, 2);
  assert.equal(summary.recordsWithValidBusinessRegistrationNumberFormat, 2);
  assert.equal(filterLicensedElectronicGameArcadeOperators(records, { search: '60764357', districtName: '', roadName: '', hasNote: '', addressLooksLikeComplexUnit: '', geocodingStatus: '', locationPrecision: '', validBusinessRegistrationNumberFormat: '' }).length, 1);
  assert.equal(filterLicensedElectronicGameArcadeOperators(records, { search: '', districtName: '萬華區', roadName: '', hasNote: '', addressLooksLikeComplexUnit: 'yes', geocodingStatus: '', locationPrecision: '', validBusinessRegistrationNumberFormat: 'yes' }).length, 1);
});
