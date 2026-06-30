import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTelepsychologyCounselingInstitutionSummary,
  classifyTelepsychologyInstitutionType,
  deriveTelepsychologyContactMethods,
  parseTelepsychologyAddress,
  parseTelepsychologyExtension,
  parseTelepsychologyMobile,
  parseTelepsychologyPhone,
} from './telepsychologyCounselingInstitutions';
import type { TelepsychologyCounselingInstitutionRecord } from '../types';

test('classifies source institution types without dropping raw wording', () => {
  assert.equal(classifyTelepsychologyInstitutionType('諮商所'), 'counseling_clinic');
  assert.equal(classifyTelepsychologyInstitutionType('治療所'), 'psychological_treatment_clinic');
  assert.equal(classifyTelepsychologyInstitutionType('基金會'), 'foundation');
  assert.equal(classifyTelepsychologyInstitutionType('學校'), 'school');
  assert.equal(classifyTelepsychologyInstitutionType(''), 'unknown');
});

test('parses address, phone, extension, mobile, and contact summary', () => {
  assert.deepEqual(parseTelepsychologyAddress('台北市大安區和平東路二段24號8樓'), {
    address: '台北市大安區和平東路二段24號8樓',
    addressNormalized: '臺北市大安區和平東路二段24號8樓',
    district: '大安區',
    roadName: '和平東路二段',
    warning: undefined,
  });
  assert.equal(parseTelepsychologyPhone('(02)23632107').phoneType, 'taipei_landline');
  assert.equal(parseTelepsychologyPhone('(02)23632107').phoneDialHref, 'tel:0223632107');
  assert.equal(parseTelepsychologyPhone('(02)23632107、(02)27011116').phoneType, 'multiple');
  assert.equal(parseTelepsychologyPhone('(02)23632107、(02)27011116').phoneDialHref, undefined);
  assert.deepEqual(parseTelepsychologyExtension(123), { extension: '123', extensionDisplay: '123', warning: undefined });
  assert.equal(parseTelepsychologyMobile(908316621).mobile, '0908316621');
  assert.equal(parseTelepsychologyMobile(908316621).mobileDialHref, 'tel:0908316621');
  assert.deepEqual(deriveTelepsychologyContactMethods({ hasPhone: true, hasExtension: false, hasMobile: true }), ['phone', 'mobile']);
});

test('summarizes districts, types, roads, and contact availability', () => {
  const record: TelepsychologyCounselingInstitutionRecord = {
    id: 'a',
    module: 'telepsychology_counseling_institutions',
    sourceSequenceNumber: 1,
    institutionTypeRaw: '諮商所',
    institutionType: 'counseling_clinic',
    districtCodeRaw: '6300300',
    districtCode: '6300300',
    institutionName: '安心心理諮商所',
    institutionNameNormalized: '安心心理諮商所',
    district: '大安區',
    districtNormalized: '大安區',
    address: '臺北市大安區和平東路二段24號8樓',
    addressNormalized: '臺北市大安區和平東路二段24號8樓',
    roadName: '和平東路二段',
    phone: '(02)23632107',
    phoneDisplay: '(02)23632107',
    phoneDialHref: 'tel:0223632107',
    phoneType: 'taipei_landline',
    hasPhone: true,
    hasExtension: false,
    mobile: '0908316621',
    mobileDisplay: '0908316621',
    mobileDialHref: 'tel:0908316621',
    hasMobile: true,
    contactMethods: ['phone', 'mobile'],
    contactMethodCount: 2,
    hasAnyContact: true,
    locationPrecision: 'district_centroid',
    latitude: 25.0268,
    longitude: 121.543,
    source: '臺北市可執行通訊心理諮商之心理機構',
    sourceAgency: '臺北市政府衛生局',
  };
  const summary = buildTelepsychologyCounselingInstitutionSummary([record]);
  assert.equal(summary.totalRecords, 1);
  assert.equal(summary.recordsWithPhone, 1);
  assert.equal(summary.recordsWithMobile, 1);
  assert.equal(summary.contactAvailability.phoneAndMobileCount, 1);
  assert.deepEqual(summary.byDistrict[0], { district: '大安區', institutionCount: 1, typeBreakdown: [{ institutionType: 'counseling_clinic', count: 1 }] });
  assert.deepEqual(summary.byInstitutionType[0], { institutionType: 'counseling_clinic', institutionTypeRaw: '諮商所', count: 1 });
});
