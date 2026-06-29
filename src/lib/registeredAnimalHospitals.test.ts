import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildRegisteredAnimalHospitalSummary, filterRegisteredAnimalHospitals, parseAnimalHospitalAddress, parseAnimalHospitalPhone,
} from './registeredAnimalHospitals';
import type { RegisteredAnimalHospital } from '../types';

test('parses animal hospital address and phone fields', () => {
  assert.deepEqual(parseAnimalHospitalAddress('台北市大安區和平東路3段66之1號'), {
    address: '台北市大安區和平東路3段66之1號',
    addressNormalized: '臺北市大安區和平東路3段66之1號',
    postalCode: undefined,
    district: '大安區',
    roadName: '和平東路',
    warning: undefined,
  });
  assert.equal(parseAnimalHospitalAddress('100中正區羅斯福路2段138號1樓').postalCode, '100');
  assert.deepEqual(parseAnimalHospitalPhone('33938850'), {
    phone: '33938850', phoneDisplay: '33938850', phoneDialHref: 'tel:0233938850', phoneType: 'landline', warning: undefined,
  });
  assert.equal(parseAnimalHospitalPhone('0912345678').phoneType, 'mobile');
  assert.equal(parseAnimalHospitalPhone('33938850#300').phoneType, 'extension');
});

test('summarizes and filters animal hospital records without deduping shared addresses', () => {
  const base = {
    city: '臺北市', phoneType: 'landline' as const, hasPhone: true, hasResponsiblePersonName: true,
    locationPrecision: 'address_only' as const, source: '臺北市動物醫院一覽表', sourceAgency: '臺北市政府產業發展局動物保護處',
  };
  const records: RegisteredAnimalHospital[] = [
    { ...base, id: 'a', module: 'registered_animal_hospitals', animalHospitalName: '甲動物醫院', address: '中正區A路1號', addressNormalized: '中正區A路1號', district: '中正區', roadName: 'A路' },
    { ...base, id: 'b', module: 'registered_animal_hospitals', animalHospitalName: '乙動物醫院', address: '中正區A路1號', addressNormalized: '中正區A路1號', district: '中正區', roadName: 'A路' },
  ];
  const summary = buildRegisteredAnimalHospitalSummary(records);
  assert.equal(summary.totalRecords, 2);
  assert.equal(summary.uniqueAddressCount, 1);
  assert.equal(summary.duplicateAddressGroups[0].count, 2);
  assert.deepEqual(filterRegisteredAnimalHospitals(records, { search: '乙', district: '', roadName: '', phoneType: '', hasPhone: '', hasResponsiblePersonName: '' }).map((record) => record.id), ['b']);
});
