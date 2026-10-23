import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { buildPolicySnapshot, canonicalPolicyJson, canonicalRetainedCsvBytes, sha256 } from '../../scripts/buildSeniorCarePolicySnapshot';
import { classifyPolicyType, comparePolicyScenarios, DEFAULT_POLICY_CONFIG, normalizePolicyText, policyBriefing, policyCsv, runPolicyScenario, safePolicyCsvCell, villageIdentity } from './seniorCarePolicy';
import type { PolicyExtraction, PublishedSite, RetainedSite } from '../types/seniorCarePolicy';
const sources = ['A', 'B', 'C'].map((key, i) => ({ key, sha256: String(i + 1).repeat(64), edition: '2026-08' }));
const site = (serial: number, patch: Partial<PublishedSite> = {}): PublishedSite => ({ serial, page: 1, district: '中正區', village: '梅花里', name: `組織${serial}`, type: '社區照顧關懷據點 2-3時段', address: `臺北市中正區梅花里${serial}號`, ...patch });
const extraction = (sites: PublishedSite[], villages: PolicyExtraction['villages'] = []): PolicyExtraction => ({ sites, villages, sources });
const retained = (s: PublishedSite, id = 'e1'): RetainedSite => ({ id, siteName: s.name, siteType: s.type, districtName: s.district, address: s.address });
test('village keys bind district and reviewed formatting without inferring identity from organizations', () => {
    assert.notEqual(villageIdentity('中正區', '梅花里'), villageIdentity('信義區', '梅花里'));
    assert.equal(normalizePolicyText('台北 （Ａ）'), '臺北(A)');
    const result = buildPolicySnapshot(extraction([site(1, { name: '信義區三張里協會' })]), [], true);
    assert.equal(result.candidates[0].village, '梅花里');
    assert.equal(result.registry.status, 'within-edition-only');
});
test('classification preserves session bands without equating them with capacity', () => {
    assert.deepEqual(classifyPolicyType('社區照顧關懷據點 10個時段'), { category: 'care-point', sessionBand: '10個時段' });
    assert.equal(classifyPolicyType('社區照顧關懷據點樂齡學堂').category, 'learning');
    assert.equal(classifyPolicyType('其他').category, 'other');
    assert.equal(classifyPolicyType('社區照顧關懷據點功能型(老服中心)').category, 'care-point');
});
test('associations require one-to-one name/address/district evidence; shared venue sites remain distinct', () => {
    const a = site(1), b = site(2, { address: a.address });
    const result = buildPolicySnapshot(extraction([a, b]), [retained(a), retained(b, 'e2')], true);
    assert.equal(result.candidates.length, 2);
    assert.equal(result.reconciliation.associationCounts.exact, 2);
    const ambiguous = buildPolicySnapshot(extraction([a]), [retained(a), retained(a, 'e2')], true);
    assert.equal(ambiguous.candidates[0].association, 'ambiguous');
    assert.equal(ambiguous.candidates[0].tier, 'A');
    const rejected = buildPolicySnapshot(extraction([a]), [retained({ ...a, address: '不同地址' })], true);
    assert.equal(rejected.candidates[0].association, 'rejected');
    assert.equal(rejected.reconciliation.retainedOnlyIds.length, 1);
});
test('overlap is a category clarification, gates fail closed, duplicate identities are excluded', () => {
    const input = extraction([site(1)], [{ serial: 1, page: 1, district: '中正區', village: '梅花里' }]);
    const open = buildPolicySnapshot(input, [], true);
    assert.equal(open.candidates[0].tier, 'A');
    assert.equal(open.reconciliation.overlaps.length, 1);
    assert.equal(open.candidates[1].reasons[0], 'programme-overlap');
    const closed = buildPolicySnapshot(input, [], false);
    assert.equal(closed.modeB.available, false);
    assert.equal(runPolicyScenario(closed, { ...DEFAULT_POLICY_CONFIG, mode: 'B' }).used, 0);
    input.villages.push({ ...input.villages[0], serial: 2 });
    assert.equal(buildPolicySnapshot(input, [], true).candidates.filter(c => c.source === 'B' && c.eligible).length, 0);
});
test('deterministic tiers, ordinal identity, collisions and editions', () => {
    const a = site(1), b = site(2), c = site(3);
    const snapshot = buildPolicySnapshot(extraction([a, b, c]), [retained(c)], true);
    assert.deepEqual(snapshot.candidates.map(c => c.tier), ['B', 'B', 'C']);
    assert.equal(canonicalPolicyJson(snapshot), canonicalPolicyJson(buildPolicySnapshot(extraction([a, b, c]), [retained(c)], true)));
    assert.notEqual(snapshot.candidates[0].id, buildPolicySnapshot(extraction([site(1, { name: 'changed' })]), [], true).candidates[0].id);
    const dupe = buildPolicySnapshot(extraction([a, a]), [], true);
    assert.equal(dupe.candidates[0].tier, 'A');
    assert.notEqual(dupe.candidates[0].id, dupe.candidates[1].id);
});
test('capacity 5/10/all, district balancing, empty and small populations and sensitivity ID sets', () => {
    const sites = Array.from({ length: 16 }, (_, i) => site(i + 1, { district: i < 10 ? '中正區' : '信義區' }));
    const snapshot = buildPolicySnapshot(extraction(sites), [], true);
    for (const capacity of [5, 10, 'all'] as const)
        assert.equal(runPolicyScenario(snapshot, { ...DEFAULT_POLICY_CONFIG, capacity }).used, capacity === 'all' ? 16 : capacity);
    const a = runPolicyScenario(snapshot, DEFAULT_POLICY_CONFIG), b = runPolicyScenario(snapshot, { ...DEFAULT_POLICY_CONFIG, strategy: 'balanced' });
    assert.equal(a.districts.length, 1);
    assert.equal(b.districts.length, 2);
    assert.ok(comparePolicyScenarios(a, b).added.length);
    const empty = runPolicyScenario(snapshot, { ...DEFAULT_POLICY_CONFIG, issueScope: 'primary' });
    assert.equal(empty.used, 0);
    const small = buildPolicySnapshot(extraction([site(1)]), [], true);
    assert.equal(runPolicyScenario(small, { ...DEFAULT_POLICY_CONFIG, capacity: 10 }).used, 1);
    const one = runPolicyScenario(small, DEFAULT_POLICY_CONFIG), same = runPolicyScenario(small, { ...DEFAULT_POLICY_CONFIG, strategy: 'balanced' });
    assert.deepEqual(comparePolicyScenarios(one, same).added, []);
});
test('source mismatch and duplicate candidate IDs reject scenarios', () => {
    const snapshot = buildPolicySnapshot(extraction([site(1)]), [], true);
    snapshot.candidates.push(snapshot.candidates[0]);
    assert.throws(() => runPolicyScenario(snapshot, DEFAULT_POLICY_CONFIG), /Duplicate/);
    snapshot.candidates.pop();
    snapshot.candidates[0].editionHash = 'wrong';
    assert.throws(() => runPolicyScenario(snapshot, DEFAULT_POLICY_CONFIG), /edition mismatch/);
});
test('CSV formula injection, quotes, multiline and empty briefing provenance are safe', () => {
    for (const value of ['=1+1', ' +cmd', '\t@SUM(1)', '-2'])
        assert.ok(safePolicyCsvCell(value).startsWith('"\''));
    assert.equal(safePolicyCsvCell('a"b\nc'), '"a""b\nc"');
    const snapshot = buildPolicySnapshot(extraction([site(1)]), [], true), empty = runPolicyScenario(snapshot, { ...DEFAULT_POLICY_CONFIG, issueScope: 'primary' });
    const csv = policyCsv(snapshot, 'snapshot-id', 'abc', empty);
    assert.match(csv, /snapshot-id/);
    assert.match(csv, /limitations/);
    assert.equal(csv.split('\r\n').length, 2);
    assert.equal(policyBriefing(snapshot, 'snapshot-id', 'abc', empty).scenario.used, 0);
});
test('public snapshots omit contact addresses and population counts, retaining edition lineage', () => {
    const a = site(1), snapshot = buildPolicySnapshot(extraction([a]), [retained(a, 'private-address-id')], true);
    const bytes = canonicalPolicyJson(snapshot);
    assert.ok(!bytes.includes(a.address));
    assert.ok(!bytes.includes('private-address-id'));
    assert.doesNotMatch(bytes, /phone|elderlyAlone|獨居老人數/);
    assert.equal(sha256(bytes).length, 64);
});
test('existing care snapshots preserve their separate statistical populations', async () => {
    for (const [path, count] of [['community-care-service-sites', 510], ['community-integrated-care-level-c-units', 292]] as const) {
        const rows = JSON.parse(await readFile(new URL(`../../public/data/${path}/records.json`, import.meta.url), 'utf8'));
        assert.equal(rows.length, count);
    }
});
import { parseCsv } from '../../scripts/convertCivicGroups';
test('export metadata and empty CSV keep policy, dates, grain and column shape', () => {
    const snapshot = buildPolicySnapshot(extraction([site(1)]), [], true);
    for (const scenario of [runPolicyScenario(snapshot, DEFAULT_POLICY_CONFIG), runPolicyScenario(snapshot, { ...DEFAULT_POLICY_CONFIG, issueScope: 'primary' })]) {
        const briefing = policyBriefing(snapshot, 'id', 'hash', scenario);
        assert.equal(briefing.policyId, 'policy-10');
        assert.equal(briefing.analysisDate, '2026-10-23');
        assert.equal(briefing.candidateGrain, 'published-site-row');
        const [header, ...rows] = parseCsv(policyCsv(snapshot, 'id', 'hash', scenario).replace(/^\ufeff/, ''));
        for (const row of rows)
            assert.equal(row.length, header.length);
    }
});
test('PDF scope removes cross-edition questions while broad and associated scopes are explicit', () => {
    const a = site(1), snapshot = buildPolicySnapshot(extraction([a]), [], true);
    assert.equal(runPolicyScenario(snapshot, { ...DEFAULT_POLICY_CONFIG, sourceScope: 'pdf' }).selected[0].tier, 'C');
    assert.equal(runPolicyScenario(snapshot, { ...DEFAULT_POLICY_CONFIG, sourceScope: 'broad' }).selected[0].tier, 'B');
    assert.equal(runPolicyScenario(snapshot, { ...DEFAULT_POLICY_CONFIG, sourceScope: 'associated' }).used, 0);
    assert.equal(snapshot.baselineScenarios?.length, 12);
});
test('conflicting published villages at the same named venue are primary source questions', () => {
 const a = site(1), b = site(2, {name:a.name,address:a.address,village:'其他里'});
 const snapshot = buildPolicySnapshot(extraction([a,b]),[],true);
 assert.ok(snapshot.candidates.every(c=>c.tier==='A' && c.reasons.includes('village-identity-conflict')));
 assert.equal(runPolicyScenario(snapshot,{...DEFAULT_POLICY_CONFIG,sourceScope:'pdf'}).selected[0].tier,'A');
});

test('retained CSV provenance binds the same Git LF edition across Windows and Linux',()=>{
 const lf=Buffer.from('name,address\n"multi\nline",venue\n');
 const windows=Buffer.from(lf.toString().replace(/\n/g,'\r\n'));
 assert.deepEqual(canonicalRetainedCsvBytes(windows),lf);
 assert.deepEqual(canonicalRetainedCsvBytes(lf),lf);
 assert.equal(sha256(canonicalRetainedCsvBytes(windows)),sha256(lf));
});
