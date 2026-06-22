import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCivicGroupSummary, extractDistrictFromAddress, filterCivicGroups,
  inferCivicGroupCategory, parseFoundedDate,
} from './civicGroups';
import { parseCsv } from '../../scripts/convertCivicGroups';

test('normalizes civic group source fields', () => {
  assert.equal(extractDistrictFromAddress('台北市大安區信義路'), '大安區');
  assert.deepEqual(parseFoundedDate('1130102'), {
    foundedDate: '2024-01-02', foundedYear: 2024, foundedDecade: '2020s',
  });
  assert.deepEqual(parseFoundedDate('1987/6/4'), {
    foundedDate: '1987-06-04', foundedYear: 1987, foundedDecade: '1980s',
  });
  assert.deepEqual(parseFoundedDate('1900'), {
    foundedDate: '1900', foundedYear: 1900, foundedDecade: '1900s',
  });
  assert.deepEqual(parseFoundedDate('113年2月30日'), {});
  assert.deepEqual(parseFoundedDate('0'), {});
  assert.equal(inferCivicGroupCategory('臺北市社區發展協會'), 'community_development');
  assert.equal(inferCivicGroupCategory('台北攝影學會'), 'culture_arts');
});

test('builds summary counts without changing records', () => {
  const groups = [
    { id: '1', name: '甲協會', district: '大安區', phone: '1', foundedYear: 2020, foundedDecade: '2020s', inferredCategory: 'association', inferredCategorySource: 'name_keyword', source: 'test' },
    { id: '2', name: '乙協會', district: '大安區', foundedYear: 2021, foundedDecade: '2020s', inferredCategory: 'association', inferredCategorySource: 'name_keyword', source: 'test' },
  ] as const;
  const summary = buildCivicGroupSummary([...groups]);
  assert.equal(summary.total, 2);
  assert.deepEqual(summary.byDistrict[0], { district: '大安區', count: 2 });
  assert.deepEqual(summary.byInferredCategory[0], { category: 'association', count: 2 });
  const filtered = filterCivicGroups([...groups], {
    search: '', district: '大安區', category: '', decade: '', yearFrom: '2021', yearTo: '', phone: '',
  }, 'zh');
  assert.equal(filtered.length, 1);
  assert.equal(buildCivicGroupSummary(filtered).total, 1);
});

test('rejects malformed quoted CSV', () => {
  assert.throws(() => parseCsv('名稱,地址\n"未關閉,臺北市'), /unclosed quoted field/);
});
