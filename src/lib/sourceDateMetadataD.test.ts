import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const expected = {
  "beauty-hairdressing-hygiene-certifications": {
    source: "臺北市營業場所衛生優良自主管理分級認證業者名冊〖美容美髮業〗",
    sourcePage: "https://data.taipei/dataset/detail?id=374d85bb-fe2f-4768-abd9-7a32922ac756",
    sourceFileUpdatedAt: "2026-03-06T10:03:31+08:00"
  },
  "optometry-institutions": {
    source: "臺北市驗光所",
    sourcePage: "https://data.taipei/dataset/detail?id=7f24c747-2aeb-4f8a-bb09-344ebc675a7f",
    sourceFileUpdatedAt: "2025-06-11T08:13:52+08:00"
  },
  "public-influenza-antiviral-providers": {
    source: "臺北市公費流感抗病毒藥劑合約院所",
    sourcePage: "https://data.taipei/dataset/detail?id=c9ad5931-42e5-4698-96b8-1353cf4f5416",
    sourceFileUpdatedAt: "2024-12-05T14:40:55+08:00"
  },
  "gbs-screening-clinics": {
    source: "臺北市孕婦乙型鏈球菌篩檢補助特約院所名單",
    sourcePage: "https://data.taipei/dataset/detail?id=fc571e16-1109-41c8-a610-a95f8c658f03",
    sourceFileUpdatedAt: "2025-06-09T14:05:33+08:00"
  },
  "tb-contact-screening-partner-providers": {
    source: "臺北市結核病接觸者胸部X光檢查暨丙型干擾素血液測驗(IGRA)合作醫療院所名單",
    sourcePage: "https://data.taipei/dataset/detail?id=c4557036-8e61-448d-ad68-7f350b6dd30f",
    sourceFileUpdatedAt: "2026-06-16T10:57:45+08:00"
  }
};

test('Batch 35 source-date metadata D is mirrored into Data Trust and raw provenance metadata', async () => {
  const manifest = JSON.parse(await readFile('public/data/data-trust-manifest.json', 'utf8'));
  const releaseSummary = JSON.parse(await readFile('public/data/data-release-summary.json', 'utf8'));

  assert.equal(manifest.datasetDirectoryCount, 117);
  assert.equal(manifest.datedDatasetCount, 68);
  assert.equal(releaseSummary.datedDatasetCount, 68);
  assert.equal(releaseSummary.unknownDateDatasetCount, 49);
  assert.equal(releaseSummary.fetchFallbackDatasetCount, 0);

  const byId = new Map(manifest.entries.map((entry: { id: string }) => [entry.id, entry]));

  for (const [id, expectedMetadata] of Object.entries(expected)) {
    const publicMetadata = JSON.parse(await readFile(`public/data/${id}/metadata.json`, 'utf8'));
    const rawMetadata = JSON.parse(await readFile(`data/raw/${id}/fetch-metadata.json`, 'utf8'));
    const trustEntry = byId.get(id) as { sourceName?: string; sourceUpdatedAt?: string } | undefined;

    assert.equal(publicMetadata.source, expectedMetadata.source, id);
    assert.equal(publicMetadata.sourcePage, expectedMetadata.sourcePage, id);
    assert.equal(publicMetadata.sourceFileUpdatedAt, expectedMetadata.sourceFileUpdatedAt, id);
    assert.equal(rawMetadata.sourceFileUpdatedAt, expectedMetadata.sourceFileUpdatedAt, id);
    assert.equal(trustEntry?.sourceName, expectedMetadata.source, id);
    assert.equal(trustEntry?.sourceUpdatedAt, expectedMetadata.sourceFileUpdatedAt, id);
    assert.equal(releaseSummary.datasetsWithSourceDates.includes(id), true, id);
    assert.equal(releaseSummary.datasetsWithoutSourceDates.includes(id), false, id);
  }
});
