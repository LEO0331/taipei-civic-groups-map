# 臺北公共資料探索儀表板

[English](README.md) · [繁體中文](README.zh-TW.md)

這是一個以 Vite + React 製作的雙語儀表板，用於瀏覽精選的臺北市公共紀錄資料集。它協助使用者尋找來源紀錄、查看資料範圍與新鮮度，並比較描述性摘要；不將公共資料暗示為排名、推薦或即時服務資訊。

## 提供的功能

- 以主題分類與搜尋方式瀏覽超過 100 個資料目錄。
- 支援繁體中文與英文介面。
- 依資料集提供篩選、來源欄位明細、CSV 匯出，以及來源允許時的外部地址查詢。
- 在建置時產生資料可信度資訊：可讀取的來源日期、明確標示的未知日期，以及本機資料與隱私提醒。
- 可部署至 GitHub Pages 的靜態網站。

## 資料目錄

資料目錄依公共服務主題分類：健康與醫療、社福／家庭／照顧、就業／產業／商業、教育／文化／旅遊、城市服務／環境／生活、動物與寵物，以及探索／比較／說明。

目錄中繼資料位於 [`src/lib/datasetCatalogue.ts`](src/lib/datasetCatalogue.ts)。新增資料集時，請審慎指定一個主要分類並提供實用搜尋詞；未分類的資料集會被拒絕，而不會悄悄從目錄中消失。

## 快速開始

需求：Node.js 22 與 npm。

```bash
npm ci
npm run dev
```

請開啟 Vite 輸出的本機網址。

## 常用指令

```bash
# 型別檢查、測試與正式建置
npm run typecheck
npm test
npm run build

# 僅執行介面無障礙契約測試
npm run test:accessibility

# 重新擷取全部遠端來源並轉換
npm run data:fetch
npm run data:convert
```

`npm run data:fetch` 會大量更新遠端來源，可能一次變更許多公共資料檔案，因此不應作為日常驗證。處理單一目錄時，請優先使用 `data:fetch:<dataset>` 及對應的 `data:convert:<dataset>` 指令。

建置會執行 `scripts/buildDataTrustManifest.ts`，產生 `public/data/data-trust-manifest.json` 與 `public/data/data-release-summary.json`。

## 新增資料集

1. 新增聚焦的擷取／轉換腳本與來源中繼資料。
2. 依既有的「保留來源值」模式建立目錄模組。
3. 在應用程式中註冊可見標籤與模組。
4. 在 `datasetCatalogue.ts` 指定唯一主要分類；若官方名稱不易搜尋，請加入使用者會使用的搜尋詞。
5. 新增或更新轉換與介面測試。
6. 執行下列完整驗證。

除非公共來源直接證實，請勿推論目前服務可用性、資格、品質、安全、法規遵循、價格或推薦。

## 驗證

建立 pull request 或部署前，請執行：

```bash
npm run typecheck
npm test
npm run build
git diff --check
```

GitHub Pages 工作流程也會重複執行轉換、型別檢查、測試與建置，並保留可信度清單、版本摘要與轉換報告作為部署證據。

## 專案結構

```text
src/                 React 模組、目錄中繼資料與共用工具
scripts/             來源擷取、轉換與建置期報告
public/data/         產生的本機靜態資料集
.github/workflows/   GitHub Pages 部署工作流程
doc/                 產品與設計決策文件
```

## 部署

推送至 `main` 後，會透過 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) 部署。正式網站位於 <https://leo0331.github.io/taipei-civic-groups-map/>。

## 重要限制

本網站是公共紀錄的探索工具，不是即時且具權威性的服務名錄。來源日期可能缺漏或已過期，未知日期會刻意揭露。若有地址資料，僅用於可選擇的外部地圖查詢；搜尋與篩選都留在瀏覽器內，但開啟外部地圖時，選取的地址會提供給該地圖服務商。

產品建議與持續風險請參閱[《臺北公共資料儀表板－設計決策與演進方向》](doc/臺北公共資料儀表板－設計決策與演進方向.md)。
