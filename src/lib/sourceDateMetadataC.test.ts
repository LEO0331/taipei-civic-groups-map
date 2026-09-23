import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const expected = {
  "adult-influenza-vaccine-providers": {
    "source": "臺北市流感疫苗合約醫療院所(成人)",
    "sourcePage": "https://data.taipei/dataset/detail?id=0db13d34-51e3-497a-a023-286d5ef692ea",
    "sourceFileUpdatedAt": "2026-03-17T08:53:58+08:00"
  },
  "fertility-subsidy-contracted-hospitals": {
    "source": "臺北市生育補助合約醫院",
    "sourcePage": "https://data.taipei/dataset/detail?id=9ee72240-f9b3-42a7-bcbe-e1bb1a28a2dc",
    "sourceFileUpdatedAt": "2026-01-13T12:20:51+08:00"
  },
  "five-cancer-screening-providers": {
    "source": "臺北市五癌篩檢醫療院所",
    "sourcePage": "https://data.taipei/dataset/detail?id=ae20d75c-dffb-4d4f-85e1-9c512189005c",
    "sourceFileUpdatedAt": "2026-06-24T14:24:52+08:00"
  },
  "home-disabled-family-physician-care-providers": {
    "source": "臺北市「居家失能個案家庭醫師照護服務」特約單位清冊",
    "sourcePage": "https://data.taipei/dataset/detail?id=988f76c5-2fdc-490a-9104-70071049bb31",
    "sourceFileUpdatedAt": "2025-06-12T16:41:59+08:00"
  },
  "home-nursing-institutions": {
    "source": "臺北市居家護理所",
    "sourcePage": "https://data.taipei/dataset/detail?id=a846fd02-a054-4206-b584-70dea8ad3a25",
    "sourceFileUpdatedAt": "2026-03-17T09:47:31+08:00"
  },
  "internet-addiction-services": {
    "source": "臺北市網癮治療服務機構",
    "sourcePage": "https://data.taipei/dataset/detail?id=76015003-6bad-4170-ab9d-548eaad90bba",
    "sourceFileUpdatedAt": "2026-06-12T12:52:25+08:00"
  },
  "medical-laboratories": {
    "source": "臺北市醫事檢驗所",
    "sourcePage": "https://data.taipei/dataset/detail?id=aefb0455-c010-48dc-8162-5b319bcf0a1a",
    "sourceFileUpdatedAt": "2025-06-06T16:30:18+08:00"
  },
  "methadone-cross-region-services": {
    "source": "美沙冬跨區給藥服務機構清單（11406）",
    "sourcePage": "https://data.taipei/dataset/detail?id=2e4dcb8a-af96-4170-a5dc-32b5dc7e9247",
    "sourceFileUpdatedAt": "2024-12-17T15:35:13+08:00"
  },
  "nationwide-addiction-treatment-services": {
    "source": "各縣市指定藥癮戒治機構及替代治療機構及非鴉片類藥癮治療補助機構",
    "sourcePage": "https://data.taipei/dataset/detail?id=0e28b90e-3372-4d18-b95e-7dfb4c870a69",
    "sourceFileUpdatedAt": "2025-06-20T11:19:54+08:00"
  },
  "psychiatric-rehabilitation-and-nursing-institutions": {
    "source": "臺北市精神復健暨精神護理機構",
    "sourcePage": "https://data.taipei/dataset/detail?id=eb02e174-63c7-46fb-b8e7-4f7e73e0a95e",
    "sourceFileUpdatedAt": "2026-09-14T09:23:58+08:00"
  }
};

test('Batch 31 source-date metadata is mirrored into Data Trust and raw provenance metadata', async () => {
  const manifest = JSON.parse(await readFile('public/data/data-trust-manifest.json', 'utf8'));
  const releaseSummary = JSON.parse(await readFile('public/data/data-release-summary.json', 'utf8'));

  assert.equal(manifest.datasetDirectoryCount, 117);
  assert.equal(
    manifest.datedDatasetCount,
    manifest.entries.filter((entry: { sourceUpdatedAt?: string }) => Boolean(entry.sourceUpdatedAt)).length,
  );
  assert.equal(releaseSummary.datedDatasetCount, manifest.datedDatasetCount);
  assert.equal(
    releaseSummary.unknownDateDatasetCount,
    manifest.datasetDirectoryCount - manifest.datedDatasetCount,
  );
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
