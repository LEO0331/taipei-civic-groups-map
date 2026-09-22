# 臺北公共資料探索儀表板

[English](README.md) · [開啟儀表板](https://leo0331.github.io/taipei-civic-groups-map/)

[![Frontend CI](https://github.com/LEO0331/taipei-civic-groups-map/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/LEO0331/taipei-civic-groups-map/actions/workflows/frontend-ci.yml)
[![GitHub Pages](https://github.com/LEO0331/taipei-civic-groups-map/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/LEO0331/taipei-civic-groups-map/actions/workflows/deploy.yml)

這是一個雙語的臺北公共紀錄探索工具。你可以瀏覽來源記錄的名冊、行政紀錄與描述性摘要；它不會把公共資料暗示為排名、推薦或即時服務資訊。

## 有脈絡地探索公共資料

- 依健康、照顧、就業、文化、城市服務、動物與比較等主題，搜尋 156 個資料路由／檢視。
- 使用來源欄位篩選資料、查看來源明細、匯出篩選後 CSV；來源有提供地址時，可開啟外部地址查詢。
- 用 URL 分享資料集與語言；桌面與手機都支援語言切換、Back/Forward 與鍵盤 tabs。
- 每個資料集都以一致的 Data Trust 面板說明本機快照、可讀取的來源日期與 refresh fallback。

介面使用六種有目的的呈現 family：healthcare standard、rich healthcare directory、location directory、registry directory、records analysis 與 statistics analysis；相似的公共資料任務因而保持熟悉，同時保留各資料集的脈絡。

## 資料能說明與不能說明的事

本儀表板呈現的是由公開資料產生的本機快照。名冊中的機構、地址、電話或歷史行政紀錄，**不**代表目前可用、符合資格、可預約、具有容量、價格、品質、安全、法律狀態、法規遵循、適合性或推薦。

目前 Data Trust 追蹤 117 個靜態資料目錄：53 個有可讀取來源日期、64 個日期未知，且目前 release 沒有沿用舊快照 fallback。未知日期會保持未知，不會推估。開啟外部地圖查詢時，選取的地址會傳送給該地圖服務商。

## 目前 demo baseline

已驗證的 application-maintenance baseline 是 commit [`99f47579`](https://github.com/LEO0331/taipei-civic-groups-map/commit/99f47579c5523d688900a7bb72b5c165238e168a)。它通過 Frontend CI：154 個 unit tests、153 個桌面／手機 Playwright passes 與 1 個預期 skip、12 張 Linux Chromium visual baseline，以及 450 kB raw / 130 kB gzip entry budget。

目前 demo 的最終文件／freeze commit 是 [`bcbf7e8`](https://github.com/LEO0331/taipei-civic-groups-map/commit/bcbf7e81629f5011026260f2ebc80e3201bf51d4)，GitHub Pages run [`35681488171`](https://github.com/LEO0331/taipei-civic-groups-map/actions/runs/35681488171) 已成功部署。簡短 demo smoke check 與說明限制請先閱讀 [Demo briefing](docs/demo-briefing-2026-09-22.md)。

## 給貢獻者

需求：Node.js 22 與 npm。

```bash
npm ci
npm run dev
```

開 PR 前請執行：

```bash
npm run typecheck
npm test
npm run build
npm run performance:budget
npm run test:e2e
git diff --check
```

不要把 `npm run data:fetch` 當成例行驗證：它會更新許多公開來源快照。處理特定資料集時，請使用對應的 `data:fetch:<dataset>` 與 `data:convert:<dataset>` 指令，保留來源值；沒有權威證據時，來源日期應維持未知。

新增資料集時，請設定一個目錄分類、保守的搜尋詞與明確的 UI family，並補上聚焦的來源／介面測試。新增相依套件或抽象層前，請先重用既有的 source-preserving patterns。

## 延伸閱讀

- [Demo briefing — 2026-09-22](docs/demo-briefing-2026-09-22.md)
- [Post-demo Cycle 2 verification](docs/post-demo-cycle-2-verification-2026-09-22.md)
- [UI family classification](docs/ui-family-classification.md)
- [Data freshness audit](docs/data-freshness-audit-2026-09-22.md)
- [產品與設計方向](doc/臺北公共資料儀表板－設計決策與演進方向.md)
