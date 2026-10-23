import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { auditSeniorCarePolicySources } from './auditSeniorCarePolicySources';
import { DEFAULT_POLICY_CONFIG, runPolicyScenario, classifyPolicyType, normalizePolicyText as norm, POLICY_DISTRICTS, villageIdentity } from '../src/lib/seniorCarePolicy';
import type { PolicyCandidate, PolicyExtraction, PolicySnapshot, RetainedSite } from '../src/types/seniorCarePolicy';
export const sha256 = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex');
// Existing explorer CSVs are Git text files; bind the checked-in LF edition, not host checkout newlines.
export const canonicalRetainedCsvBytes = (bytes: Uint8Array) => Buffer.from(bytes.filter((value,index)=>value!==13 || bytes[index+1]!==10));
export const canonicalPolicyJson = (value: unknown) => JSON.stringify(value, null, 2) + '\n';
export function buildPolicySnapshot(input: PolicyExtraction, retained: RetainedSite[], modeBVerified: boolean): PolicySnapshot {
    for (const key of ['A', 'B', 'C'])
        if (!input.sources.some(s => s.key === key && /^[a-f0-9]{64}$/.test(s.sha256)))
            throw new Error(`Missing admitted source ${key}`);
    if (!input.sites.length)
        throw new Error('Source A extraction is empty');
    const hashes = Object.fromEntries(input.sources.map(s => [s.key, s.sha256]));
    const serials = new Map<number, number>();
    input.sites.forEach(r => serials.set(r.serial, (serials.get(r.serial) ?? 0) + 1));
    const villageCounts = new Map<string, number>();
    input.villages.forEach(r => { const key = villageIdentity(r.district, r.village); villageCounts.set(key, (villageCounts.get(key) ?? 0) + 1); });
    const aKeys = new Set(input.sites.map(r => villageIdentity(r.district, r.village)).filter(Boolean));
    const bKeys = new Set(input.villages.map(r => villageIdentity(r.district, r.village)).filter(Boolean));
    const overlaps = [...aKeys].filter(k => bKeys.has(k)).sort();
    const occurrence = new Map<string, number>();
    const matchedRetained = new Set<string>();
    const candidates: PolicyCandidate[] = input.sites.map(row => {
        const key = villageIdentity(row.district, row.village);
        const { category, sessionBand } = classifyPolicyType(row.type);
        const exact = retained.filter(e => e.siteName === row.name && e.address === row.address && e.districtName === row.district);
        const normalized = retained.filter(e => norm(e.siteName) === norm(row.name) && norm(e.address) === norm(row.address) && norm(e.districtName) === norm(row.district));
        const weak = retained.filter(e => norm(e.siteName) === norm(row.name) || (!!row.address && norm(e.address) === norm(row.address)));
        // Every accepted association must be one-to-one in both editions.
        const reverseMatches = input.sites.filter(a => norm(a.name) === norm(row.name) && norm(a.address) === norm(row.address) && norm(a.district) === norm(row.district));
        const pool = normalized.length ? normalized : weak;
        const association = normalized.length > 1 || (normalized.length && reverseMatches.length > 1) ? 'ambiguous' : exact.length === 1 ? 'exact' : normalized.length === 1 ? 'normalized' : weak.length > 1 ? 'ambiguous' : weak.length === 1 ? 'rejected' : 'pdf-only';
        if (association === 'exact' || association === 'normalized')
            pool.forEach(e => matchedRetained.add(e.id));
        const reasons: string[] = [];
        if (input.sites.some(other => other !== row && norm(other.name) === norm(row.name) && norm(other.address) === norm(row.address) && norm(other.district) === norm(row.district) && villageIdentity(other.district,other.village) !== key)) reasons.push('village-identity-conflict');
        if ((serials.get(row.serial) ?? 0) > 1)
            reasons.push('duplicate-serial');
        if (overlaps.includes(key))
            reasons.push('programme-overlap');
        if (association === 'ambiguous')
            reasons.push('ambiguous-association');
        if (!POLICY_DISTRICTS.includes(row.district) || !row.village)
            reasons.push('missing-administrative-identity');
        if (!row.type)
            reasons.push('missing-type');
        if (category === 'other' || category === 'unknown')
            reasons.push('classification-question');
        if (category === 'care-point' && !sessionBand)
            reasons.push('session-band-unknown');
        if (['exact', 'normalized'].includes(association) && pool.some(e => norm(e.siteType) !== norm(row.type)))
            reasons.push('type-edition-discrepancy');
        if (association === 'rejected')
            reasons.push('address-or-edition-discrepancy');
        if (association === 'pdf-only')
            reasons.push('unmatched-edition');
        const tier = reasons.some(r => ['duplicate-serial', 'programme-overlap', 'ambiguous-association', 'village-identity-conflict'].includes(r)) ? 'A' : reasons.length ? 'B' : 'C';
        const rowHash = sha256(JSON.stringify([row.serial, row.district, row.village, row.name, row.type, row.address]));
        const identity = `A:${hashes.A}:${String(row.serial).padStart(4, '0')}:${rowHash}`;
        const suffix = (occurrence.get(identity) ?? 0) + 1;
        occurrence.set(identity, suffix);
        return { id: `${identity}:${suffix}`, source: 'A', editionHash: hashes.A, rowHash, serial: row.serial, page: row.page, district: row.district, village: row.village, villageKey: key, name: row.name, rawType: row.type, category, sessionBand, tier, reasons: reasons.length ? reasons : ['routine-verification'], eligible: true, exclusion: null, association, retainedIds: pool.map(e => sha256(e.id)) };
    });
    input.villages.forEach(row => {
        const key = villageIdentity(row.district, row.village), reasons: string[] = [];
        const exclusion = !modeBVerified ? 'pdf-verification-incomplete' : !POLICY_DISTRICTS.includes(row.district) ? 'district-unverified' : !row.village ? 'village-missing' : villageCounts.get(key) !== 1 ? 'village-key-collision' : null;
        if (overlaps.includes(key))
            reasons.push('programme-overlap');
        if (exclusion)
            reasons.push(exclusion);
        const rowHash = sha256(JSON.stringify([row.serial, row.district, row.village]));
        const identity = `B:${hashes.B}:${String(row.serial).padStart(4, '0')}:${rowHash}`;
        const suffix = (occurrence.get(identity) ?? 0) + 1;
        occurrence.set(identity, suffix);
        candidates.push({ id: `${identity}:${suffix}`, source: 'B', editionHash: hashes.B, rowHash, serial: row.serial, page: row.page, district: row.district, village: row.village, villageKey: key, name: row.village, rawType: '', category: 'unknown', sessionBand: null, tier: reasons.length ? 'A' : 'C', reasons: reasons.length ? reasons : ['source-order-baseline'], eligible: !exclusion, exclusion, association: null, retainedIds: [] });
    });
    const snapshot: PolicySnapshot = { policyId: 'policy-10', analysisDate: '2026-10-23', referencePeriod: '2026-08', schemaVersion: 1, methodVersion: 'senior-community-care-evidence-review-v1', sources: input.sources, candidates, reconciliation: { retainedCount: retained.length, retainedOnlyIds: retained.filter(r => !matchedRetained.has(r.id)).map(r => sha256(r.id)), overlaps, associationCounts: Object.fromEntries(['exact', 'normalized', 'ambiguous', 'rejected', 'pdf-only'].map(k => [k, candidates.filter(r => r.source === 'A' && r.association === k).length])) }, modeB: { available: modeBVerified && candidates.some(r => r.source === 'B' && r.eligible), reason: modeBVerified ? 'Validated within-edition district/village documentary identities only.' : 'Independent PDF controls have not passed.' }, modeC: { available: false, missing: ['current-operation', 'capacity-and-staffing', 'utilization-and-waitlists', 'travel-accessibility', 'compatible-population-denominators', 'welfare-outcomes'] }, registry: { status: 'within-edition-only', reason: 'No compatible all-village registry admitted; no codes, cross-edition geographic identity or citywide coverage denominator.' }, limitations: ['Administrative documentation priorities, not vulnerability or care quality scores.', 'Officially unbuilt villages do not establish absence of other or nearby care services.', 'Published session bands do not measure operating hours, capacity or residents served.', 'A/B overlap is a documentary question; programme exceptions require administrative confirmation.', 'No complete village denominator: no citywide served percentage.', 'Elderly-alone counts are excluded from snapshots, selection and exports.', 'No new-site, subsidy, eligibility or service availability recommendation.'] };
    snapshot.baselineScenarios = [];
    for (const mode of ['A', 'B'] as const)
        for (const capacity of [5, 10, 'all'] as const)
            for (const strategy of ['evidence', 'balanced'] as const) {
                const config = { ...DEFAULT_POLICY_CONFIG, mode, capacity, strategy };
                const scenario = runPolicyScenario(snapshot, config);
                snapshot.baselineScenarios.push({ config, eligibleCount: scenario.eligibleCount, used: scenario.used, selectedIds: scenario.selected.map(r => r.id), districts: scenario.districts });
            }
    return snapshot;
}
export async function publishPolicySnapshot(root = process.cwd()) {
    auditSeniorCarePolicySources();
    const raw = join(root, 'data/raw/senior-care-policy');
    const input = JSON.parse(await readFile(join(raw, 'extracted.json'), 'utf8')) as PolicyExtraction;
    const audit = JSON.parse(await readFile(join(raw, 'extraction-audit.json'), 'utf8')) as {
        verified?: boolean;
    };
    const retained = JSON.parse(await readFile(join(root, 'public/data/community-care-service-sites/records.json'), 'utf8')) as RetainedSite[];
    const retainedCsv = canonicalRetainedCsvBytes(await readFile(join(root,'data/raw/community-care-service-sites/source.csv')));
    input.sources.push({key:'E',title:'Retained community-care CSV',sha256:sha256(retainedCsv),recordsSha256:sha256(await readFile(join(root,'public/data/community-care-service-sites/records.json'))),edition:'retained-project-edition',recordCount:retained.length,admissionStatus:'context-only; distinct edition',retainedPath:'data/raw/community-care-service-sites/source.csv',sourceUpdateDate:null,format:'csv',byteConvention:'Retained repository CSV normalized to LF (Git text edition), not an original HTTP payload',byteSize:retainedCsv.length,warnings:['Retained project edition is not synchronized to the August 2026 PDFs.']});
    const snapshot = buildPolicySnapshot(input, retained, audit.verified === true);
    snapshot.extractionEvidence = audit;
    const bytes = canonicalPolicyJson(snapshot), hash = sha256(bytes), file = `snapshot-${hash}.json`;
    const out = join(root, 'public/policy/senior-care-policy');
    await mkdir(out, { recursive: true });
    await writeFile(join(out, file), bytes);
    const pointer = { schemaVersion: 1, snapshotId: `senior-care-${hash}`, sha256: hash, file };
    await writeFile(join(out, 'current.json.tmp'), canonicalPolicyJson(pointer));
    await rename(join(out, 'current.json.tmp'), join(out, 'current.json'));
    console.log(JSON.stringify({ ...pointer, sites: input.sites.length, villages: input.villages.length, reconciliation: snapshot.reconciliation.associationCounts, overlaps: snapshot.reconciliation.overlaps, modeB: snapshot.modeB }));
    return snapshot;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
    await publishPolicySnapshot();
