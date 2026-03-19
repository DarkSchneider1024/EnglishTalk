import { Platform, StyleSheet, Text, View } from "react-native";

let MobileAdsModule;

if (Platform.OS !== "web") {
  try {
    MobileAdsModule = require("react-native-google-mobile-ads");
  } catch {
    MobileAdsModule = null;
  }
}

const ENV = {
  bannerUnitId: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID,
  rewardedUnitId: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID,
};

export function getAdMobDebugInfo() {
  return [
    `platform=${Platform.OS}`,
    `module=${MobileAdsModule ? "loaded" : "missing"}`,
    `banner=${ENV.bannerUnitId ? "env" : "test"}`,
    `rewarded=${ENV.rewardedUnitId ? "env" : "test"}`,
  ].join(" | ");
}

export async function initializeMobileAds() {
  if (!MobileAdsModule) return;

  const { default: mobileAds } = MobileAdsModule;
  await mobileAds().setRequestConfiguration({
    maxAdContentRating: "PG",
    tagForChildDirectedTreatment: false,
    tagForUnderAgeOfConsent: false,
    testDeviceIdentifiers: ["EMULATOR"],
  });
  await mobileAds().initialize();
}

export async function showRewardedCreditAd() {
  if (!MobileAdsModule) {
    throw new Error("AdMob rewarded ads require a native development build. Web and Expo Go are not supported.");
  }

  const { RewardedAd, RewardedAdEventType, TestIds } = MobileAdsModule;
  const adUnitId = ENV.rewardedUnitId || TestIds.REWARDED;
  const rewarded = RewardedAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });

  return new Promise((resolve, reject) => {
    let earnedReward = null;

    const unsubEarn = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
      earnedReward = reward;
    });
    const unsubLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      rewarded.show().catch(reject);
    });
    const unsubClosed = rewarded.addAdEventListener(RewardedAdEventType.CLOSED, () => {
      cleanup();
      if (earnedReward) resolve(earnedReward);
      else reject(new Error("Rewarded ad closed before a reward was earned."));
    });
    const unsubError = rewarded.addAdEventListener(RewardedAdEventType.ERROR, (error) => {
      cleanup();
      reject(new Error(error?.message || "Rewarded ad failed to load."));
    });

    function cleanup() {
      unsubEarn();
      unsubLoaded();
      unsubClosed();
      unsubError();
    }

    rewarded.load();
  });
}

export function AdMobBannerCard() {
  if (!MobileAdsModule || Platform.OS === "web") {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.title}>Banner Ad Placeholder</Text>
        <Text style={styles.text}>Banner ads render only in a native build with AdMob configured.</Text>
      </View>
    );
  }

  const { BannerAd, BannerAdSize, TestIds } = MobileAdsModule;
  const unitId = ENV.bannerUnitId || TestIds.BANNER;

  return (
    <View style={styles.bannerWrap}>
      <Text style={styles.caption}>Banner preview</Text>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
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
  bannerWrap: {
    alignItems: "center",
    backgroundColor: "#fffaf2",
    borderColor: "#d9c9b6",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  caption: {
    color: "#6f665a",
    fontSize: 12,
    fontWeight: "700",
  },
});
