# EnglishTalk 專案詳細技術規格書 (Technical Detail Specification)

這份文件詳述了 EnglishTalk 的每個檔案用途、核心函數邏輯以及所串接的第三方服務。

---

## 1. 專案目錄結構分析

| 路徑 | 用途描述 | 核心技術 |
| :--- | :--- | :--- |
| `App.js` | **中央控制器**。包含所有頁面路由、商業邏輯與狀態管理。 | React Native, Firebase Auth |
| `api/gemini.js` | **後端 Proxy**。負責安全轉發 Gemini API 請求，運行於 Vercel。 | Node.js, Vercel Serverless |
| `src/components.js` | **UI 元件庫**。所有按鈕、卡片、輸入框的統一實作。 | React Native Style |
| `src/memory.js` | **持久化層**。處理本地對話紀錄、單字卡、積分與 Firestore 同步。 | Firestore, LocalStorage |
| `src/firebase.js` | **基礎設施**。初始化 Firebase 應用程式與功能實體。 | Firebase SDK |
| `src/styles.js` | **樣式表**。定義全局顏色 (Colors) 與排版組態。 | StyleSheet |
| `src/i18n.js` | **語系管理**。處理繁體中文與英文的介面翻譯切換。 | Context API |

---

## 2. 核心程式碼詳細解構 (`App.js`)

### 2.1 狀態管理 (Main State)
*   `currentChat`: 儲存 `[{role: 'user', text: '...'}, {role: 'model', text: '...', zh: '...'}]` 結構，支撐對話 UI。
*   `plan`: 字串型態 (`free`, `plus`, `premium`)，直接決定 UI 是否隱藏廣告及問話額度。
*   `freeCredits`: 數值型態。免費用戶每次 `processGeminiAsk` 會遞減，歸零後觸發廣告。

### 2.2 核心商業函數
*   **`processGeminiAsk(userInput)`**：
    *   **輸入**：使用者輸入的英文。
    *   **邏輯**：
        1. 判斷 `plan` 與 `freeCredits` 決定是否彈出廣告。
        2. 將 `currentChat` 轉換為 API 要求的 `history` 格式。
        3. 注入 **System Prompt**（強制角色扮演 JSON 格式回傳）。
        4. 呼叫 Vercel API 並解析返回的 `reply` 與 `zh`。
        5. 呼叫 `Speech.speak()` 進行語音合成。
*   **`getFeedback()`**：
    *   **邏輯**：將整段對話丟給 Gemini，要求產生包含語法、詞彙、自然度三個維度的 JSON 報告。
    *   **特殊的 Ad-Gating 邏輯**：如果是免費用戶，會先將結果存入 `pendingFeedback`，顯示廣告倒數 10 秒後才解鎖展示。
*   **`handleGoogleLogin()` / `handleLinkGoogle()`**：
    *   使用 `signInWithPopup` (Web) 獲取憑證。
    *   若是登入：直接進入 App。
    *   若是綁定：呼叫 `linkWithPopup` 將 Google 身分關聯到當前 Email 帳號。

---

## 3. 外掛服務與 API 詳細規格

### 3.1 Google Gemini AI (`api/gemini.js`)
*   **服務商**：Google AI Studio (Gemini 2.5 Flash)。
*   **API 選項**：
    *   `temperature: 0.8`: 確保對話自然且有創意。
    *   `responseMimeType: application/json`: 強制 AI 回傳結構化數據，避免解析失敗。
*   **部署環境**：Vercel Serverless Function。利用環境變數 `GEMINI_API_KEY` 隱藏金鑰。

### 3.2 Firebase 生態系
*   **Authentication**：支援 Email/Password 與 Google OAuth 2.0。
    *   提供 `onAuthStateChanged` 監聽器，確保 App 開啟時自動恢復登入狀態。
*   **Cloud Firestore**：
    *   存儲用戶 Profile (包含 `plan`, `totalLessons`, `memories`)。
    *   安全規則：限定 `request.auth.uid == resource.id` 確保資料隱私。

### 3.3 Google AdMob (廣告)
*   **廣告觸發規則**：
    *   **中間不攔截**：使用者在對話過程中不會被強迫看廣告。
    *   **條件式結算廣告**：在 `getFeedback` 時，若免費用戶的對話長度 **超過 3 句**，則會強制進入 10 秒廣告倒數後才展示回饋內容。
    *   **互動點數**：基本的 BannerAd 在頁面底部展示。

### 3.4 Expo Speech (TTS)
*   **功能**：自動偵測對話回傳的 `reply`，根據用戶設定的 `accent` (en-US / en-GB) 進行發音。
*   **配置**：`rate` (語速) 受用戶 Settings 頁面滑桿控制。

---

## 4. 關鍵部署工作流 (CI/CD)

1.  **前端自動化**：`.github/workflows/deploy.yml`。
    *   每次 Push 代碼時，GitHub 會跑 `npm install` -> `expo export` -> 部署至 `gh-pages` 分支。
2.  **後端自動化**：Vercel GitHub Integration。
    *   Vercel 持續監測 Repo，一旦 `api/` 有變動，立即更新網際網路上的 Proxy 節點。

---

## 5. 安全性設計
*   **API 遮罩**：前端 0.0% 機會觸碰到 Gemini API Key。所有請求必須通過 HTTPS 連向 Vercel。
*   **CORS 限制**：Vercel proxy 只接受授權的網域呼叫。
*   **資料隔離**：利用 Firebase UID 做為 Firestore Document ID，物理隔絕用戶數據。
