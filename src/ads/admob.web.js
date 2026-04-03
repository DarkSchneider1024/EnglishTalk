import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";

const ADSENSE_PUB_ID = "pub-4011130961445948";

// 動態注入 AdSense 全域 <script> 標籤 (只注入一次)
let adsenseScriptLoaded = false;
function ensureAdsenseScript() {
  if (typeof window === "undefined" || adsenseScriptLoaded) return;
  if (document.querySelector(`script[src*="adsbygoogle"]`)) {
    adsenseScriptLoaded = true;
    return;
  }
  const script = document.createElement("script");
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${ADSENSE_PUB_ID}`;
  script.async = true;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
  adsenseScriptLoaded = true;
}

export function getAdMobDebugInfo() {
  return `platform=web | module=adsense | pub=${ADSENSE_PUB_ID}`;
}

export async function initializeMobileAds() {
  ensureAdsenseScript();
}

export async function showRewardedCreditAd() {
  // AdSense 網頁版不支援「看完廣告換獎勵」的機制
  // 這是 AdMob 原生功能，僅在 iOS/Android App 裡可用
  throw new Error("獎勵廣告僅支援原生 App（iOS / Android），網頁版目前不適用。");
}

/**
 * AdSense 橫幅廣告元件
 * 在方案頁面底部或任何需要的地方都可以掛載
 * slot 屬性目前留空，等你在 AdSense 後台建立好廣告單元後填入
 */
export function AdMobBannerCard({ slot = "" }) {
  const adRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    ensureAdsenseScript();

    // 等 adsbygoogle 全域物件出現後再觸發
    const timer = setTimeout(() => {
      try {
        if (adRef.current && !pushed.current && typeof window !== "undefined") {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          pushed.current = true;
        }
      } catch (e) {
        console.warn("AdSense push error:", e);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // 如果還沒設定 slot，顯示提示教學
  if (!slot) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.title}>📢 廣告版位就緒 (AdSense Ready)</Text>
        <Text style={styles.text}>
          AdSense 已串接完成 (Publisher: {ADSENSE_PUB_ID})。{"\n"}
          請到 AdSense 後台建立一個「Display 廣告單元」，取得 Slot ID 後掛載即可開始投放。
        </Text>
      </View>
    );
  }

  // 實際 AdSense 廣告元件 — 使用 dangerouslySetInnerHTML 注入 <ins> 標籤
  return (
    <View style={styles.adContainer}>
      <div
        ref={adRef}
        dangerouslySetInnerHTML={{
          __html: `<ins class="adsbygoogle"
            style="display:block"
            data-ad-client="ca-${ADSENSE_PUB_ID}"
            data-ad-slot="${slot}"
            data-ad-format="auto"
            data-full-width-responsive="true"></ins>`,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: "#fffaf2",
    borderColor: "#d9c9b6",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  adContainer: {
    borderRadius: 18,
    overflow: "hidden",
    minHeight: 100,
    marginVertical: 8,
  },
  title: {
    color: "#1f1d1a",
    fontSize: 14,
    fontWeight: "800",
  },
  text: {
    color: "#6f665a",
    fontSize: 13,
    lineHeight: 20,
  },
});
