# EnglishTalk 前端技術架構文件

## 1. 核心技術棧 (Tech Stack)
*   **框架**：React Native (經由 Expo SDK)
*   **平台支援**：iOS, Android, Web (目前主要部署於 Web)
*   **狀態管理**：React Hooks (`useState`, `useEffect`, `useMemo`)
*   **持久化儲存**：瀏覽器 `localStorage` (Web) / `AsyncStorage` (Native 預留)
*   **語音處理**：`expo-speech` (TTS 語音合成)
*   **廣告系統**：`react-native-google-mobile-ads` (整合 AdMob)

---

## 2. 核心 App 狀態 (State Management)
在 `App.js` 中管理的主要狀態包括：

*   **用戶資訊**：`user` (Auth 物件), `profile` (Firestore 資料), `plan` (會員等級)。
*   **對話內容**：`currentChat` (包含 Role, Text, ZH 翻譯的陣列)。
*   **UI 切換**：`screen` (當前頁面), `loading` (載入中), `error` (錯誤提示)。
*   **對話點數**：`freeCredits` (免費用戶每天的對話額度)。
*   **語音設定**：`accent` (英/美), `speechRate` (語速)。

---

## 3. 關鍵功能實作邏輯

### 3.1 AI 對話與回饋 (Gemini Integration)
不再直接連向 Google，而是經由 Vercel Proxy 進行。
*   **`processGeminiAsk(userInput)`**：
    *   構建對話歷史 (History)。
    *   發送請求至 Vercel `api/gemini`。
    *   解析 JSON 回傳並觸發 `expo-speech` 播放語音。
*   **`getFeedback()`**：
    *   在對話結束後生成 AI 導師報告。
    *   對免費用戶實作「強制廣告看 10 秒」的機制後才展示回饋。

### 3.2 身份驗證與帳號綁定 (Auth System)
*   **`handleGoogleLogin`**：支援跨平台 Google 登入（Web 使用 `signInWithPopup`）。
*   **`handleLinkGoogle`**：允許原 Email 用戶將帳號與 Google 帳號關聯，實現雙向登入。

### 3.3 廣告與點數機制 (AdMob Logic)
*   **BannerAd**：在頁面底部常駐展示。
*   **RewardedAd**：當 `freeCredits` 歸零時，使用者可透過觀看廣告獲取額外問話次數。

---

## 4. 目錄與檔案結構
*   `App.js`：主要的商業邏輯與路由控制。
*   `src/components.js`：封裝好的 UI 元件（如 `Card`, `Button`, `Section`）。
*   `src/memory.js`：處理本地存儲與 Firestore 讀寫邏輯。
*   `src/firebase.js`：Firebase SDK 初始化設定。
*   `src/styles.js`：全域樣式定義。
*   `api/`：Vercel Serverless Functions (後端)。

---

## 5. 擴充建議
*   **內容模組化**：未來可將 `topic` 情境獨立成 `json` 檔案管理。
*   **翻譯快取**：目前的翻譯是跟著 AI 回傳一起過來的，未來可考慮實作本地翻譯快取以提升速度。
*   **Native 轉換**：目前的 UI 雖然支援三端，但針對手勢操作（如側滑退出）在 Native App 上仍有優化空間。
