import assert from 'node:assert/strict'; import test from 'node:test'; import { cleanFuneralValue, normalizeFuneralText } from './funeralServiceBusinesses';
test('preserves source-recorded funeral contact strings', () => { assert.equal(cleanFuneralValue(' 02-2881 5406 '), '02-2881 5406'); assert.equal(normalizeFuneralText('臺北禮儀社'), '台北禮儀社'); });
