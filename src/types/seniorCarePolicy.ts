export type PolicySource = {
    key: string;
    title?: string;
    pageUrl?: string;
    attachmentUrl?: string;
    sha256: string;
    edition?: string;
    pageCount?: number;
    recordCount?: number;
    [key: string]: unknown;
};
export type PublishedSite = {
    serial: number;
    page: number;
    district: string;
    village: string;
    name: string;
    type: string;
    address: string;
};
export type PublishedVillage = {
    serial: number;
    page: number;
    district: string;
    village: string;
};
export type PolicyExtraction = {
    sites: PublishedSite[];
    villages: PublishedVillage[];
    sources: PolicySource[];
};
export type RetainedSite = {
    id: string;
    siteName: string;
    siteType: string;
    districtName: string;
    address: string;
};
export type Association = 'exact' | 'normalized' | 'ambiguous' | 'rejected' | 'pdf-only';
export type PolicyCandidate = {
    id: string;
    source: 'A' | 'B';
    editionHash: string;
    rowHash: string;
    serial: number;
    page: number;
    district: string;
    village: string;
    villageKey: string;
    name: string;
    rawType: string;
    category: 'care-point' | 'learning' | 'other' | 'unknown';
    sessionBand: string | null;
    tier: 'A' | 'B' | 'C';
    reasons: string[];
    eligible: boolean;
    exclusion: string | null;
    association: Association | null;
    retainedIds: string[];
};
export type PolicySnapshot = {
    policyId: 'policy-10';
    analysisDate: '2026-10-23';
    referencePeriod: '2026-08';
    baselineScenarios?: {
        config: PolicyConfig;
        eligibleCount: number;
        used: number;
        selectedIds: string[];
        districts: string[];
    }[];
    extractionEvidence?: unknown;
    schemaVersion: 1;
    methodVersion: 'senior-community-care-evidence-review-v1';
    sources: PolicySource[];
    candidates: PolicyCandidate[];
    reconciliation: {
        retainedCount: number;
        retainedOnlyIds: string[];
        overlaps: string[];
        associationCounts: Record<string, number>;
    };
    modeB: {
        available: boolean;
        reason: string;
    };
    modeC: {
        available: false;
        missing: string[];
    };
    limitations: string[];
    registry: {
        status: 'within-edition-only';
        reason: string;
    };
};
export type PolicyConfig = {
    mode: 'A' | 'B';
    capacity: 5 | 10 | 'all';
    strategy: 'evidence' | 'balanced';
    sourceScope: 'pdf' | 'associated' | 'broad';
    category: 'all' | 'care-point' | 'learning';
    issueScope: 'primary' | 'questions' | 'all';
    district: string;
};
export type PolicyScenario = {
    config: PolicyConfig;
    eligibleCount: number;
    excluded: {
        id: string;
        reason: string;
    }[];
    selected: PolicyCandidate[];
    used: number;
    districts: string[];
};
