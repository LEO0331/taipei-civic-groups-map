import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCivicCatalogueAdapter } from './civicCatalogueAdapter';
import { getCatalogueItems } from './catalogueItems';
import { catalogueCategories, datasetCategoryById } from './datasetCatalogue';

test('all seven hubs account for every actual catalogue ID exactly once', () => {
  for (const language of ['zh', 'en'] as const) {
    const groups = buildCivicCatalogueAdapter(language);
    assert.deepEqual(groups.map(group => group.id), catalogueCategories.map(category => category.id));
    const ids = groups.flatMap(group => {
      assert.equal(group.total, group.items.length);
      assert.ok(group.total > 0);
      group.items.forEach(([id]) => assert.equal(datasetCategoryById[id], group.id));
      return group.items.map(([id]) => id);
    });
    assert.equal(new Set(ids).size, ids.length);
    assert.deepEqual(ids.sort(), getCatalogueItems(language).map(([id]) => id).sort());
    assert.deepEqual(Object.keys(datasetCategoryById).sort(), ids.sort());
  }
});

test('search matches either language and shared aliases while preserving localized labels and totals', () => {
  for (const language of ['zh', 'en'] as const) {
    for (const query of ['物理治療', 'Physical Therapy', 'daycare', '預防針', '  HEALTH  ', '台北']) {
      const groups = buildCivicCatalogueAdapter(language, query);
      assert.ok(groups.some(group => group.items.length), `${language}: ${query}`);
      assert.deepEqual(groups.map(group => group.total), buildCivicCatalogueAdapter(language).map(group => group.total));
      for (const group of groups) for (const item of group.items) {
        assert.deepEqual(item, getCatalogueItems(language).find(([id]) => id === item[0]));
      }
    }
    const vaccines = buildCivicCatalogueAdapter(language, '預防針').flatMap(group => group.items.map(([id]) => id));
    assert.ok(vaccines.includes('hpvProviders'));
    assert.ok(!vaccines.includes('familyMedicineInstitutions'));
    assert.equal(buildCivicCatalogueAdapter(language, 'no-such-dataset-xyz').flatMap(group => group.items).length, 0);
  }
});
