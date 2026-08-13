import assert from 'node:assert/strict'; import test from 'node:test'; import { cleanWithdrawnHotelValue } from './withdrawnIllegalHotelEnforcement';
test('preserves withdrawn-enforcement source text while cleaning line breaks', () => assert.equal(cleanWithdrawnHotelValue(' 撤銷\n裁罰 '), '撤銷 裁罰'));
