export type HakkaOrganizationRecord = {
  id: string;
  sourceSequenceNumber: string;
  organizationName: string;
  leaderRaw: string;
  leaderName: string;
  hasOrganizationName: boolean;
  hasLeaderName: boolean;
  sourceValues: Record<string, string>;
};

export const cleanHakkaOrganizationValue = (value?: string) => (value ?? '').replace(/\s+/g, ' ').trim();
export const normalizeHakkaOrganizationText = (value?: string) => cleanHakkaOrganizationValue(value).replace(/臺/g, '台').toLocaleLowerCase();

export function stableHakkaOrganizationId(sequence: string, organization: string, sourceValues: Record<string, string>) {
  return sequence || `${normalizeHakkaOrganizationText(organization)}|${Object.values(sourceValues).join('|')}`;
}
