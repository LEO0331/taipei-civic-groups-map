import assert from 'node:assert/strict';
import test from 'node:test';
import { convertTwd97Tm2ToWgs84, parseFactoryAddress, parseFactoryRegistrationId } from './registeredFactoryDistribution';

test('preserves factory IDs and parses factory addresses', () => {
  assert.equal(parseFactoryRegistrationId(' 063021895 ').factoryRegistrationIdNormalized, '063021895');
  const address = parseFactoryAddress('臺北市內湖區湖元里瑞湖街178巷15號2至4樓');
  assert.equal(address.districtNameFromAddress, '內湖區');
  assert.equal(address.roadName, '瑞湖街');
  assert.equal(address.addressLooksLikeMultiFloorOrUnit, true);
});

test('converts TWD97 TM2 source coordinates before mapping', () => {
  const point = convertTwd97Tm2ToWgs84(308619, 2773194);
  assert.equal(point.status, 'converted_from_twd97_tm2');
  assert.ok(point.longitude! > 121.57 && point.longitude! < 121.59);
  assert.ok(point.latitude! > 25.05 && point.latitude! < 25.08);
});
