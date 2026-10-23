import type { PolicyCandidate, PolicyConfig, PolicyScenario, PolicySnapshot } from '../types/seniorCarePolicy';
export const DEFAULT_POLICY_CONFIG: PolicyConfig = { mode: 'A', capacity: 5, strategy: 'evidence', sourceScope: 'broad', category: 'all', issueScope: 'all', district: '' };
export const normalizePolicyText = (value: string) => value.normalize('NFKC').replace(/台/g, '臺').replace(/㇐/g, '一').replace(/[\s\u3000]/g, '').replace(/[（]/g, '(').replace(/[）]/g, ')');
export const villageIdentity = (district: string, village: string) => district && village ? `${normalizePolicyText(district)}/${normalizePolicyText(village)}` : '';
export const POLICY_DISTRICTS = ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'];
export function classifyPolicyType(raw: string): {
    category: PolicyCandidate['category'];
    sessionBand: string | null;
} {
    const text = normalizePolicyText(raw);
    const category = text.includes('樂齡學堂') ? 'learning' : text.includes('社區照顧關懷據點') ? 'care-point' : text ? 'other' : 'unknown';
    return { category, sessionBand: text.match(/(?:2-3|4-5|6-7|8-9|10個?)時段/)?.[0] ?? null };
}
function excludedReason(row: PolicyCandidate, config: PolicyConfig, snapshot: PolicySnapshot): string | null {
    if (config.mode === 'B' && !snapshot.modeB.available)
        return 'mode-b-gate';
    if (!row.eligible)
        return row.exclusion ?? 'identity-unresolved';
    if (config.district && row.district !== config.district)
        return 'district-filter';
    if (config.mode === 'A' && config.sourceScope === 'associated' && !['exact', 'normalized'].includes(row.association ?? ''))
        return 'association-required';
    if (config.mode === 'A' && config.category !== 'all' && row.category !== config.category)
        return 'category-filter';
    if (config.issueScope === 'primary' && row.tier !== 'A')
        return 'primary-conflicts-only';
    if (config.issueScope === 'questions' && row.tier === 'C')
        return 'routine-excluded';
    return null;
}
export function effectivePolicyCandidate(row: PolicyCandidate, config: PolicyConfig): PolicyCandidate {
    if (config.mode !== 'A' || row.source !== 'A' || config.sourceScope !== 'pdf')
        return row;
    const crossEdition = ['ambiguous-association', 'unmatched-edition', 'address-or-edition-discrepancy', 'type-edition-discrepancy'];
    const reasons = row.reasons.filter(reason => !crossEdition.includes(reason) && reason !== 'routine-verification');
    const tier: PolicyCandidate['tier'] = reasons.some(r => ['duplicate-serial', 'programme-overlap', 'village-identity-conflict'].includes(r)) ? 'A' : reasons.length ? 'B' : 'C';
    return { ...row, tier, reasons: reasons.length ? reasons : ['routine-verification'] };
}
export function runPolicyScenario(snapshot: PolicySnapshot, config: PolicyConfig): PolicyScenario {
    if (config.capacity !== 'all' && config.capacity !== 5 && config.capacity !== 10)
        throw new Error('Unsupported capacity');
    const population = snapshot.candidates.filter(r => r.source === config.mode).map(row => effectivePolicyCandidate(row, config));
    const ids = new Set<string>();
    for (const row of population) {
        if (ids.has(row.id))
            throw new Error('Duplicate candidate ID');
        ids.add(row.id);
        if (!snapshot.sources.some(s => s.key === row.source && s.sha256 === row.editionHash))
            throw new Error('Source edition mismatch');
    }
    const excluded: PolicyScenario['excluded'] = [];
    const eligible = population.filter(row => { const reason = excludedReason(row, config, snapshot); if (reason)
        excluded.push({ id: row.id, reason }); return !reason; });
    const order = (a: PolicyCandidate, b: PolicyCandidate) => a.tier.localeCompare(b.tier) || a.id.localeCompare(b.id);
    eligible.sort(order);
    let ordered = eligible;
    if (config.strategy === 'balanced') {
        const districts = [...new Set(eligible.map(r => r.district))].sort();
        const groups = districts.map(d => eligible.filter(r => r.district === d));
        ordered = [];
        for (let i = 0; groups.some(g => i < g.length); i++)
            for (const group of groups)
                if (group[i])
                    ordered.push(group[i]);
    }
    const selected = ordered.slice(0, config.capacity === 'all' ? ordered.length : config.capacity);
    return { config, eligibleCount: eligible.length, excluded, selected, used: selected.length, districts: [...new Set(selected.map(r => r.district))].sort() };
}
export function comparePolicyScenarios(a: PolicyScenario, b: PolicyScenario) {
    const left = new Set(a.selected.map(r => r.id)), right = new Set(b.selected.map(r => r.id));
    return { shared: [...left].filter(id => right.has(id)), added: [...right].filter(id => !left.has(id)), removed: [...left].filter(id => !right.has(id)), populationChange: b.eligibleCount - a.eligibleCount };
}
export function policyBriefing(snapshot: PolicySnapshot, snapshotId: string, exactFileHash: string, scenario: PolicyScenario) {
    return { title: 'Administrative Investigation Briefing / 行政查核情境摘要', snapshotId, exactFileHash, policyId: snapshot.policyId, analysisDate: snapshot.analysisDate, referencePeriod: snapshot.referencePeriod, candidateGrain: scenario.config.mode === 'A' ? 'published-site-row' : 'published-village-row', methodVersion: snapshot.methodVersion, schemaVersion: snapshot.schemaVersion, sources: snapshot.sources,
        scenario, assumptions: ['District balancing is administrative representation, not care need.', 'Published session bands are not operating hours or capacity.'], limitations: snapshot.limitations };
}
export function safePolicyCsvCell(value: unknown): string {
    const text = String(value ?? '');
    return `"${(/^[\s\u0000-\u001f]*[=+@-]/.test(text) ? "'" + text : text).replace(/"/g, '""')}"`;
}
export function policyCsv(snapshot: PolicySnapshot, snapshotId: string, hash: string, scenario: PolicyScenario): string {
    const columns = ['snapshot_id', 'sha256', 'method', 'mode', 'strategy', 'capacity', 'eligible_count', 'used', 'candidate_id', 'source', 'edition_hash', 'source_row', 'page', 'district', 'village', 'type', 'tier', 'reasons', 'excluded_ids', 'limitations', 'schema_version', 'policy_id', 'analysis_date', 'reference_period', 'candidate_grain', 'configuration', 'source_manifest', 'assumptions'];
    const shared = [snapshotId, hash, snapshot.methodVersion, scenario.config.mode, scenario.config.strategy, scenario.config.capacity, scenario.eligibleCount, scenario.used];
    const rows = scenario.selected.map(r => [...shared, r.id, r.source, r.editionHash, r.serial, r.page, r.district, r.village, r.rawType, r.tier, r.reasons.join('|'), JSON.stringify(scenario.excluded), snapshot.limitations.join(' | ')]);
    if (!rows.length)
        rows.push([...shared, '', '', '', '', '', '', '', '', '', '', JSON.stringify(scenario.excluded), snapshot.limitations.join(' | ')]);
    return '\ufeff' + [columns, ...rows.map(row => [...row, snapshot.schemaVersion, snapshot.policyId, snapshot.analysisDate, snapshot.referencePeriod, scenario.config.mode === 'A' ? 'published-site-row' : 'published-village-row', JSON.stringify(scenario.config), JSON.stringify(snapshot.sources), 'Administrative representation, not care need; session bands are not capacity.'])].map(row => row.map(safePolicyCsvCell).join(',')).join('\r\n');
}
