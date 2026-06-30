import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBusinessRegistrationChangeSummary,
  classifyBusinessRegistrationChangeEventType,
  deriveBusinessRegistrationEventDate,
  haversineDistanceMeters,
  parseBusinessRegistrationAddress,
  parseBusinessRegistrationCoordinates,
  parseBusinessRegistrationDate,
  parseUnifiedBusinessNumber,
} from './businessRegistrationChanges';
import type { BusinessRegistrationChangeRecord } from '../types';

test('parses business registration change source fields', () => {
  assert.equal(classifyBusinessRegistrationChangeEventType('臺北市核准商業設立、變更及歇業登記等異動資料清冊(設立)'), 'establishment');
  assert.equal(classifyBusinessRegistrationChangeEventType('商業變更11504'), 'modification');
  assert.equal(classifyBusinessRegistrationChangeEventType('商業歇業11504'), 'closure');
  assert.equal(parseUnifiedBusinessNumber('00632380'), '00632380');
  assert.deepEqual(parseBusinessRegistrationAddress('台北市南港區松河街480號9樓'), {
    businessAddress: '台北市南港區松河街480號9樓',
    businessAddressNormalized: '臺北市南港區松河街480號9樓',
    district: '南港區',
    roadName: '松河街',
    warning: undefined,
  });
  assert.equal(parseBusinessRegistrationAddress('臺北市中山區市民大道三段1號').roadName, '市民大道三段');
  assert.deepEqual(parseBusinessRegistrationDate('1150401'), { raw: '1150401', date: '2026-04-01', year: 2026, month: 4, monthKey: '2026-04', quarter: '2026-Q2', warning: undefined });
  assert.equal(deriveBusinessRegistrationEventDate({ eventType: 'closure', closureDate: '2026-04-01' }), '2026-04-01');
  assert.equal(parseBusinessRegistrationCoordinates('121.594548', '25.058906').coordinateStatus, 'valid');
  assert.equal(Math.round(haversineDistanceMeters({ latitude: 25.058906, longitude: 121.594548 }, { latitude: 25.058906, longitude: 121.594548 })), 0);
});

test('summarizes business registration change records', () => {
  const record: BusinessRegistrationChangeRecord = {
    id: 'a',
    module: 'business_registration_change_records',
    resourceName: '商業設立11504',
    eventType: 'establishment',
    unifiedBusinessNumber: '00632380',
    unifiedBusinessNumberNormalized: '00632380',
    hasUnifiedBusinessNumber: true,
    businessName: '儀式感手工食研室',
    businessNameNormalized: '儀式感手工食研室',
    businessAddress: '臺北市南港區松河街480號9樓',
    businessAddressNormalized: '臺北市南港區松河街480號9樓',
    district: '南港區',
    roadName: '松河街',
    establishmentDateRaw: '1150401',
    establishmentDate: '2026-04-01',
    eventDateRaw: '1150401',
    eventDate: '2026-04-01',
    eventYear: 2026,
    eventMonth: 4,
    eventMonthKey: '2026-04',
    eventQuarter: '2026-Q2',
    sourceLongitudeRaw: '121.594548',
    sourceLatitudeRaw: '25.058906',
    longitude: 121.594548,
    latitude: 25.058906,
    coordinateStatus: 'valid',
    coordinateSystem: 'wgs84',
    hasCoordinates: true,
    source: '臺北市核准商業設立、變更及歇業登記等異動資料清冊',
    sourceAgency: '臺北市政府產業發展局商業處',
  };
  const summary = buildBusinessRegistrationChangeSummary([record]);
  assert.equal(summary.totalRecords, 1);
  assert.equal(summary.recordsWithValidCoordinates, 1);
  assert.equal(summary.byEventType[0].eventType, 'establishment');
  assert.equal(summary.byMonth[0].establishmentCount, 1);
  assert.equal(summary.byDistrict[0].district, '南港區');
});
