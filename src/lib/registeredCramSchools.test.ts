import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildRegisteredCramSchoolSummary,
  filterRegisteredCramSchools,
  parseCramSchoolAddress,
  parseNumberField,
  parseRegistrationDate,
} from './registeredCramSchools';
import type { RegisteredCramSchool } from '../types';

test('parses registered cram-school source fields', () => {
  assert.deepEqual(parseCramSchoolAddress('106大安區復興南路2段84號4樓之1'), {
    address: '106大安區復興南路2段84號4樓之1',
    postalCode: '106',
    district: '大安區',
    addressWithoutPostalCode: '大安區復興南路2段84號4樓之1',
  });
  assert.deepEqual(parseRegistrationDate('2025/2/7'), {
    registrationDateRaw: '2025/2/7',
    registrationDate: '2025-02-07',
    registrationYear: 2025,
    registrationDecade: '2020s',
  });
  assert.equal(parseNumberField('1,234.5'), 1234.5);
  assert.equal(parseNumberField(''), undefined);
});

test('summarizes and filters registered cram-school records', () => {
  const records: RegisteredCramSchool[] = [
    {
      id: 'a', module: 'registered_cram_schools', cramSchoolName: '甲補習班', district: '大安區',
      phone: '02-1111-1111', registrationDate: '2025-02-07', registrationYear: 2025, registrationDecade: '2020s',
      classroomCount: 2, classroomAreaSqm: 30.5, premisesAreaSqm: 50, locationPrecision: 'address_only',
      source: '臺北市立案補習班資訊', sourceAgency: '臺北市政府教育局',
    },
    {
      id: 'b', module: 'registered_cram_schools', cramSchoolName: '乙文理短期補習班', district: '中正區',
      registrationDate: '1956-05-01', registrationYear: 1956, registrationDecade: '1950s',
      classroomCount: 3, classroomAreaSqm: 40, premisesAreaSqm: 80, locationPrecision: 'address_only',
      source: '臺北市立案補習班資訊', sourceAgency: '臺北市政府教育局',
    },
  ];
  const summary = buildRegisteredCramSchoolSummary(records);
  assert.equal(summary.totalRecords, 2);
  assert.equal(summary.recordsWithPhone, 1);
  assert.equal(summary.totalClassroomCount, 5);
  assert.equal(summary.totalClassroomAreaSqm, 70.5);
  assert.equal(summary.byDistrict[0].district, '大安區');

  assert.deepEqual(filterRegisteredCramSchools(records, {
    search: '文理', district: '', registrationYear: '', registrationDecade: '', hasPhone: '',
    hasClassroomCount: '', classroomCountMin: '', classroomCountMax: '',
    classroomAreaMin: '', classroomAreaMax: '', premisesAreaMin: '', premisesAreaMax: '',
  }).map((record) => record.id), ['b']);
});
