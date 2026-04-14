const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const { defineSecret } = require("firebase-functions/params");
const fetch = require("node-fetch");

// 定義金鑰（稍後會教你如何指令設定到 Cloud 雲端）
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

exports.askGemini = onCall({ secrets: [GEMINI_API_KEY], cors: true }, async (request) => {
  // 1. 安全檢查：確保使用者已經登入你的 App
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "您必須登入帳戶才能使用 AI 功能。");
  }

  const { prompt, history, generationConfig } = request.data;
  if (!prompt) {
    throw new HttpsError("invalid-argument", "缺少對話內容 (prompt)。");
  }

  const apiKey = GEMINI_API_KEY.value();
  if (!apiKey) {
    throw new HttpsError("failed-precondition", "伺服器金鑰未設定，請聯絡開發者。");
  }

  logger.info(`使用者 ${request.auth.token.email} 正在呼叫 Gemini...`);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    // 將請求轉發給 Google Gemini
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: history || [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: generationConfig || { temperature: 0.8, responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      logger.error("Gemini API 回報錯誤：", errorData);
      throw new HttpsError("internal", `Gemini API 錯誤 (HTTP ${response.status})`);
    }

    const data = await response.json();
    const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      throw new HttpsError("not-found", "Gemini 未能產生回應。");
    }

    return { text: resultText };

  } catch (error) {
    logger.error("Cloud Function 發生異常：", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "伺服器內部錯誤，請稍後再試。");
  }
});
