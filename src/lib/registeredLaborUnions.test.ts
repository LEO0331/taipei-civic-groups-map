import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildRegisteredLaborUnionSummary, classifyRegisteredLaborUnionType, parseLaborUnionContactAddress,
  parseLaborUnionPhone, parsePostalCode,
} from './registeredLaborUnions';
import type { RegisteredLaborUnion } from '../types';

test('parses labor union source fields', () => {
  assert.equal(classifyRegisteredLaborUnionType('工會聯合組織'), 'union_federation');
  assert.equal(classifyRegisteredLaborUnionType('職業工會'), 'occupational_union');
  assert.equal(parsePostalCode(' 001 '), '001');
  assert.deepEqual(parseLaborUnionContactAddress('台北市中山區復興北路62號3樓之2', '104'), {
    contactAddress: '台北市中山區復興北路62號3樓之2',
    addressNormalized: '臺北市中山區復興北路62號3樓之2',
    city: '臺北市',
    district: '中山區',
    roadName: '復興北路',
    isTaipeiAddress: true,
    addressLocationCategory: 'taipei_address',
    warning: undefined,
  });
  assert.equal(parseLaborUnionContactAddress('新北市板橋區文化路1號').addressLocationCategory, 'new_taipei_address');
  assert.equal(parseLaborUnionContactAddress('臺北郵局第1號信箱').addressLocationCategory, 'postal_box_or_unparsed');
  assert.equal(parseLaborUnionPhone('(02)27888782').phoneType, 'taipei_landline');
  assert.equal(parseLaborUnionPhone('(03)4768077').phoneType, 'other_landline');
  assert.equal(parseLaborUnionPhone(undefined).phoneType, 'missing');
});

test('summarizes labor unions without deduping shared addresses', () => {
  const base = {
    module: 'registered_labor_unions' as const, unionAttributeRaw: '職業工會', unionType: 'occupational_union' as const,
    hasChairpersonName: true, postalCode: '100', contactAddress: '臺北市中正區A路1號', addressNormalized: '臺北市中正區A路1號',
    city: '臺北市', district: '中正區', roadName: 'A路', isTaipeiAddress: true, addressLocationCategory: 'taipei_address' as const,
    phoneType: 'taipei_landline' as const, hasPhone: true, locationPrecision: 'district_centroid' as const,
    source: '臺北市各工會名單及聯絡方式', sourceAgency: '臺北市政府勞動局',
  };
  const records: RegisteredLaborUnion[] = [
    { ...base, id: 'a', unionName: '甲工會', chairpersonName: '甲' },
    { ...base, id: 'b', unionName: '乙工會', chairpersonName: '乙' },
  ];
  const summary = buildRegisteredLaborUnionSummary(records);
  assert.equal(summary.totalRecords, 2);
  assert.equal(summary.uniqueAddressCount, 1);
  assert.equal(summary.duplicateAddressGroups[0].count, 2);
  assert.equal(summary.byDistrict[0].unionTypes[0].unionType, 'occupational_union');
});
