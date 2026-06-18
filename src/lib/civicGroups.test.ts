import assert from 'node:assert/strict';
import test from 'node:test';
import {
  extractDistrictFromAddress, inferCivicGroupCategory, parseFoundedDate,
} from './civicGroups';

test('normalizes civic group source fields', () => {
  assert.equal(extractDistrictFromAddress('台北市大安區信義路'), '大安區');
  assert.deepEqual(parseFoundedDate('1130102'), {
    foundedDate: '2024-01-02', foundedYear: 2024, foundedDecade: '2020s',
  });
  assert.deepEqual(parseFoundedDate('1987/6/4'), {
    foundedDate: '1987-06-04', foundedYear: 1987, foundedDecade: '1980s',
  });
  assert.equal(inferCivicGroupCategory('臺北市社區發展協會'), 'community_development');
  assert.equal(inferCivicGroupCategory('台北攝影學會'), 'culture_arts');
});
