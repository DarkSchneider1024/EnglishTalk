const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // 1. 設定 CORS 跨域許可（因為 GitHub Pages 網域會呼叫這個 Vercel 網域）
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 處理 OPTIONS 預檢請求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. 只有 POST 才能繼續
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { prompt, history, generationConfig } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ 
      error: "伺服器未設定 GEMINI_API_KEY"
    });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: history && history.length > 0 
        ? [...history, { role: "user", parts: [{ text: prompt }] }] 
        : [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: generationConfig || { temperature: 0.8, responseMimeType: "application/json" }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // 格式化回傳結果給前端
    const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    res.status(200).json({ text: resultText });

  } catch (error) {
    console.error("Vercel Proxy Error:", error);
    res.status(500).json({ error: error.message });
  }
};
