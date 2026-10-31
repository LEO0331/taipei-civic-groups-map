import { getCatalogueItems } from './catalogueItems';
import { buildDatasetCatalogue, catalogueCategories, type CatalogueLanguage } from './datasetCatalogue';

/** Navigation metadata only: never imports dataset modules or public snapshots. */
export function buildCivicCatalogueAdapter(language: CatalogueLanguage, query = '') {
  const items = getCatalogueItems(language);
  const matchingIds = new Set((['zh', 'en'] as const).flatMap(searchLanguage =>
    buildDatasetCatalogue(getCatalogueItems(searchLanguage), searchLanguage, query)
      .flatMap(category => category.items.map(([id]) => id)),
  ));
  const groups = buildDatasetCatalogue(items, language);
  return catalogueCategories.map(category => {
    const entries = groups.find(group => group.id === category.id)?.items ?? [];
    return {
      id: category.id,
      title: category.label[language],
      total: entries.length,
      items: entries.filter(([id]) => matchingIds.has(id)),
    };
  });
}
