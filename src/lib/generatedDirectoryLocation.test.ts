import assert from 'node:assert/strict';
import test from 'node:test';
import { detectLocationDimension, formatLocationValue, locationValue } from './generatedDirectoryLocation';

test('district fields remain the preferred generated-directory location dimension', () => {
  const records = [{ districtName: '中山區', cityCode: '63000000' }];
  const dimension = detectLocationDimension(records);
  assert.equal(dimension?.id, 'district');
  assert.equal(locationValue(records[0], dimension!), '中山區');
});

test('city and county fields are used when no district field exists', () => {
  const records = [{ sourceCityOrCounty: '基隆市' }, { sourceCityOrCounty: '新北市' }];
  const dimension = detectLocationDimension(records);
  assert.equal(dimension?.id, 'cityCounty');
  assert.equal(locationValue(records[0], dimension!), '基隆市');
});

test('Taiwan city and county codes receive readable bilingual labels', () => {
  const dimension = detectLocationDimension([{ cityName: '63000000' }]);
  assert.equal(dimension?.id, 'cityCounty');
  assert.equal(formatLocationValue('63000000', dimension!, 'zh'), '臺北市');
  assert.equal(formatLocationValue('63000000', dimension!, 'en'), 'Taipei City');
});

test('datasets without a direct geography field do not invent a distribution dimension', () => {
  const records = [{ venueName: '市民廣場', externalMapQuery: '市民廣場' }];
  assert.equal(detectLocationDimension(records), null);
});
