async function testProxy() {
  const proxyUrl = "https://english-talk-three.vercel.app/api/gemini";
  console.log("正在測試 Vercel Proxy:", proxyUrl);
  
  try {
    const res = await fetch(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Hello",
        history: [{ role: "user", parts: [{ text: "Hello" }] }]
      })
    });
    
    const data = await res.json();
    if (res.ok) {
      console.log("✅ 成功連線！AI 回應:", data.text);
    } else {
      console.error("❌ 伺服器報錯:", data.error);
      if (data.debug) console.log("🔍 除錯資訊:", data.debug);
    }
  } catch (e) {
    console.error("🔥 連線攔截失敗:", e.message);
  }
}

testProxy();
