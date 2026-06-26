import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildRegisteredHotelSummary, filterRegisteredHotels, parseHotelAddress, parseNumberField, roomCountBucket,
} from './registeredHotels';
import type { RegisteredHotel } from '../types';

test('parses registered hotel source fields', () => {
  assert.deepEqual(parseHotelAddress('104中山區南京東路一段1號'), {
    address: '104中山區南京東路一段1號',
    postalCode: '104',
    district: '中山區',
    addressWithoutPostalCode: '中山區南京東路一段1號',
  });
  assert.equal(parseNumberField('1,200'), 1200);
  assert.equal(roomCountBucket(24), '< 25');
  assert.equal(roomCountBucket(50), '50-99');
});

test('summarizes and filters registered hotel records', () => {
  const records: RegisteredHotel[] = [
    {
      id: 'a', module: 'registered_hotels', registrationId: 'A1', hotelName: '甲旅館', district: '中山區',
      phone: '02-1111-1111', listedMinRoomRateNtd: 1000, listedMaxRoomRateNtd: 3000, listedRoomRateSpreadNtd: 2000,
      roomCount: 20, roomCountBucket: '< 25', hasPhone: true, hasListedRoomRate: true, hasRoomCount: true,
      locationPrecision: 'address_only', source: '臺北市一般旅館名冊', sourceAgency: '觀傳局',
    },
    {
      id: 'b', module: 'registered_hotels', registrationId: 'B1', hotelName: '乙商旅', district: '萬華區',
      listedMinRoomRateNtd: 2500, listedMaxRoomRateNtd: 5000, listedRoomRateSpreadNtd: 2500,
      roomCount: 80, roomCountBucket: '50-99', hasPhone: false, hasListedRoomRate: true, hasRoomCount: true,
      locationPrecision: 'address_only', source: '臺北市一般旅館名冊', sourceAgency: '觀傳局',
    },
  ];
  const summary = buildRegisteredHotelSummary(records);
  assert.equal(summary.totalRecords, 2);
  assert.equal(summary.recordsWithPhone, 1);
  assert.equal(summary.totalRoomCount, 100);
  assert.equal(summary.byDistrict[0].district, '中山區');

  assert.deepEqual(filterRegisteredHotels(records, {
    search: '商旅', district: '', hasPhone: '', hasListedRoomRate: '', hasRoomCount: '',
    roomCountMin: '50', roomCountMax: '', listedRoomRateMin: '', listedRoomRateMax: '', roomCountBucket: '',
  }).map((record) => record.id), ['b']);
});
