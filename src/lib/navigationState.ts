import type { Language } from '../types';

export const DEFAULT_DATASET = 'civic';

export type NavigationState = {
  dataset: string;
  language: Language;
};

export function parseLanguage(value: string | null): Language | null {
  return value === 'zh' || value === 'en' ? value : null;
}

export function readNavigationState(href: string, fallbackLanguage: Language): NavigationState {
  const url = new URL(href);
  return {
    dataset: url.searchParams.get('dataset') || DEFAULT_DATASET,
    language: parseLanguage(url.searchParams.get('lang')) ?? fallbackLanguage,
  };
}

export function buildNavigationUrl(href: string, state: NavigationState): URL {
  const url = new URL(href);
  if (state.dataset === DEFAULT_DATASET) url.searchParams.delete('dataset');
  else url.searchParams.set('dataset', state.dataset);
  url.searchParams.set('lang', state.language);
  return url;
}

export function buildHistoryState(current: unknown, state: NavigationState) {
  const base = current && typeof current === 'object' ? current as Record<string, unknown> : {};
  return { ...base, dataset: state.dataset, language: state.language };
}
