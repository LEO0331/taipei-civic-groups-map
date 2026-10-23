import { loadLocalJson, LocalDataLoadError } from './loadLocalJson';
import type { PolicySnapshot } from '../types/seniorCarePolicy';
export type PolicyPointer = {
    schemaVersion: 1;
    snapshotId: string;
    sha256: string;
    file: string;
};
export async function loadSeniorCarePolicy() {
    const directory = 'policy/senior-care-policy/';
    const pointer = await loadLocalJson<PolicyPointer>(directory + 'current.json');
    if (pointer.schemaVersion !== 1 || !/^[a-f0-9]{64}$/.test(pointer.sha256) || pointer.file !== `snapshot-${pointer.sha256}.json` || pointer.snapshotId !== `senior-care-${pointer.sha256}`)
        throw new LocalDataLoadError(directory, 'invalid snapshot pointer');
    const base = (import.meta as ImportMeta & {
        env?: {
            BASE_URL?: string;
        };
    }).env?.BASE_URL ?? '/';
    const response = await fetch(`${base}${directory}${pointer.file}`);
    if (!response.ok)
        throw new LocalDataLoadError(directory, `HTTP ${response.status}`);
    const bytes = await response.arrayBuffer();
    const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(v => v.toString(16).padStart(2, '0')).join('');
    if (hash !== pointer.sha256)
        throw new LocalDataLoadError(directory, 'snapshot integrity mismatch');
    const snapshot = JSON.parse(new TextDecoder().decode(bytes)) as PolicySnapshot;
    if (snapshot.schemaVersion !== 1 || !Array.isArray(snapshot.candidates) || !Array.isArray(snapshot.sources))
        throw new LocalDataLoadError(directory, 'unsupported snapshot');
    return { pointer, snapshot };
}
