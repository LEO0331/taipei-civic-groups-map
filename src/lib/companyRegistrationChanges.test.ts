import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCompanyRegistrationChangeSummary,
  classifyCompanyRegistrationChangeEventType,
  deriveCompanyRegistrationEventDate,
  parseCompanyRegistrationAddress,
  parseCompanyRegistrationCoordinates,
  parseCompanyRegistrationDate,
  parseUnifiedBusinessNumber,
} from './companyRegistrationChanges';
import type { CompanyRegistrationChangeRecord } from '../types';

test('parses company registration change source fields', () => {
  assert.equal(classifyCompanyRegistrationChangeEventType('臺北市核准公司設立變更解散清冊(設立)'), 'establishment');
  assert.equal(classifyCompanyRegistrationChangeEventType('公司變更11504'), 'modification');
  assert.equal(classifyCompanyRegistrationChangeEventType('公司解散11504'), 'dissolution');
  assert.equal(parseUnifiedBusinessNumber('00000602'), '00000602');
  assert.equal(parseCompanyRegistrationAddress('臺北市中正區市民大道三段1號').roadName, '市民大道三段');
  assert.deepEqual(parseCompanyRegistrationDate('115/04/01'), { raw: '115/04/01', date: '2026-04-01', year: 2026, month: 4, monthKey: '2026-04', quarter: '2026-Q2', warning: undefined });
  assert.equal(deriveCompanyRegistrationEventDate({ eventType: 'dissolution', dissolutionApprovalDate: '2026-04-01' }), '2026-04-01');
  assert.equal(parseCompanyRegistrationCoordinates('121.513988', '25.04314').coordinateStatus, 'valid');
});

test('summarizes company registration change records', () => {
  const record: CompanyRegistrationChangeRecord = {
    id: 'a',
    module: 'company_registration_change_records',
    resourceName: '公司設立11504',
    eventType: 'establishment',
    unifiedBusinessNumber: '62247210',
    unifiedBusinessNumberNormalized: '62247210',
    hasUnifiedBusinessNumber: true,
    companyName: '峰收頂奢品牌股份有限公司',
    companyNameNormalized: '峰收頂奢品牌股份有限公司',
    companyAddress: '臺北市中正區懷寧街76號1樓',
    companyAddressNormalized: '臺北市中正區懷寧街76號1樓',
    district: '中正區',
    roadName: '懷寧街',
    approvalDateRaw: '115/04/01',
    approvalDate: '2026-04-01',
    eventDateRaw: '115/04/01',
    eventDate: '2026-04-01',
    eventYear: 2026,
    eventMonth: 4,
    eventMonthKey: '2026-04',
    eventQuarter: '2026-Q2',
    sourceLongitudeRaw: '121.513988',
    sourceLatitudeRaw: '25.04314',
    longitude: 121.513988,
    latitude: 25.04314,
    coordinateStatus: 'valid',
    coordinateSystem: 'wgs84',
    hasCoordinates: true,
    source: '臺北市核准公司設立變更解散清冊',
    sourceAgency: '臺北市政府產業發展局商業處',
  };
  const summary = buildCompanyRegistrationChangeSummary([record]);
  assert.equal(summary.totalRecords, 1);
  assert.equal(summary.byEventType[0].eventType, 'establishment');
  assert.equal(summary.byMonth[0].establishmentCount, 1);
});
