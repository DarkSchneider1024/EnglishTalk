# Firebase Setup

## 1. 建立 Firebase 專案

1. 到 Firebase Console 建立一個新專案。
2. 專案建立完成後，進入 `Project settings`。
3. 在 `Your apps` 區塊新增一個 `Web app`。
4. 先不用開啟 Hosting。
5. 建立後會看到一組 Firebase config。

## 2. 建立 Firestore Database

1. 在左側選單打開 `Firestore Database`。
2. 按 `Create database`。
3. 選擇一個離你較近的 region。
4. 開發階段可以先用 test mode，之後再收緊規則。

## 3. 把設定填進 `.env`

參考專案中的 `.env.example`，建立自己的 `.env`：

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

如果這些欄位沒填，App 仍可運作，但只會存在本機，不會同步到 Firebase。

## 4. Firestore 建議規則

MVP 開發期可先用較寬鬆規則：

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

這個規則只適合開發測試。正式上線前，應改成有登入驗證的規則。

## 5. 目前資料結構

App 會寫入：

- `learners/{learnerId}`
  - 學習者個人資料
- `learners/{learnerId}/memories/{memoryId}`
  - 每次練習或自由對話的記憶紀錄

每筆記憶會包含：

- `screen`
- `topic`
- `message`
- `reply`
- `summary`
- `profile`
- `updatedAt`

## 6. 重啟專案

填完 `.env` 後重新啟動 Expo / Android build，新的 Firebase 設定才會生效。
