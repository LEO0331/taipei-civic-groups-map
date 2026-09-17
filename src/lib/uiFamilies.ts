/** Stable visual-family identifiers for dataset modules. */
export const UI_FAMILIES = {
  healthcareStandard: 'healthcare-standard',
  healthcareRichDirectory: 'healthcare-rich-directory',
  locationDirectory: 'location-directory',
  registryDirectory: 'registry-directory',
  recordsAnalysis: 'records-analysis',
  statisticsAnalysis: 'statistics-analysis',
} as const;

export type UiFamily = typeof UI_FAMILIES[keyof typeof UI_FAMILIES];
