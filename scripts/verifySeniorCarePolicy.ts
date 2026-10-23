import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { auditSeniorCarePolicySources } from './auditSeniorCarePolicySources';
import { buildPolicySnapshot, canonicalPolicyJson, canonicalRetainedCsvBytes, sha256 } from './buildSeniorCarePolicySnapshot';
import { DEFAULT_POLICY_CONFIG, runPolicyScenario, comparePolicyScenarios, policyBriefing, policyCsv } from '../src/lib/seniorCarePolicy';
import type { PolicyExtraction, PolicySnapshot, RetainedSite } from '../src/types/seniorCarePolicy';
console.log(auditSeniorCarePolicySources());
const raw = 'data/raw/senior-care-policy/';
const input = JSON.parse(await readFile(raw + 'extracted.json', 'utf8')) as PolicyExtraction;
const retained = JSON.parse(await readFile('public/data/community-care-service-sites/records.json', 'utf8')) as RetainedSite[];
const pointer = JSON.parse(await readFile('public/policy/senior-care-policy/current.json', 'utf8'));
const bytes = await readFile('public/policy/senior-care-policy/' + pointer.file);
assert.equal(sha256(bytes), pointer.sha256);
const snapshot = JSON.parse(bytes.toString()) as PolicySnapshot;
// The retained CSV edition is separately hashed, never substituted for the PDF.
const sourceE = snapshot.sources.find(s=>s.key==='E')!;
assert.equal(sourceE.sha256,sha256(canonicalRetainedCsvBytes(await readFile('data/raw/community-care-service-sites/source.csv'))));
assert.equal(sourceE.recordsSha256,sha256(await readFile('public/data/community-care-service-sites/records.json')));
input.sources.push(snapshot.sources.find(s => s.key === 'E')!);
const rebuilt = buildPolicySnapshot(input, retained, true);
rebuilt.extractionEvidence = JSON.parse(await readFile(raw + 'extraction-audit.json', 'utf8'));
assert.equal(canonicalPolicyJson(rebuilt), bytes.toString());
assert.equal(retained.length, 510);
const levelC = JSON.parse(await readFile('public/data/community-integrated-care-level-c-units/records.json', 'utf8'));
assert.equal(levelC.length, 292);
for (const row of snapshot.candidates) {
    assert.ok(row.page > 0);
    assert.equal(row.editionHash, snapshot.sources.find(s => s.key === row.source)?.sha256);
}
const results = [];
for (const mode of ['A', 'B'] as const)
    for (const capacity of [5, 10, 'all'] as const) {
        const a = runPolicyScenario(snapshot, { ...DEFAULT_POLICY_CONFIG, mode, capacity }), b = runPolicyScenario(snapshot, { ...DEFAULT_POLICY_CONFIG, mode, capacity, strategy: 'balanced' });
        results.push({ mode, capacity, population: a.eligibleCount, used: a.used, districts: a.districts, overlap: comparePolicyScenarios(a, b).shared.length, selectedIds: a.selected.map(r => r.id) });
        const briefing = policyBriefing(snapshot, pointer.snapshotId, pointer.sha256, a);
        assert.equal(briefing.scenario.used, a.used);
        assert.doesNotMatch(JSON.stringify(a.selected), /里內獨居老人數|elderlyAlone|"phone"|"address"/);
        assert.ok(policyCsv(snapshot, pointer.snapshotId, pointer.sha256, a).includes(pointer.sha256));
    }
console.log(JSON.stringify({ snapshotId: pointer.snapshotId, sha256: pointer.sha256, bytes: bytes.length, gzip: gzipSync(bytes).length, tiers: Object.fromEntries(['A', 'B', 'C'].map(t => [t, snapshot.candidates.filter(c => c.source === 'A' && c.tier === t).length])), reconciliation: snapshot.reconciliation.associationCounts, overlaps: snapshot.reconciliation.overlaps, results }, null, 2));
