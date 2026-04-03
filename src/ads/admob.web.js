import { StyleSheet, Text, View } from "react-native";

export function getAdMobDebugInfo() {
  return "platform=web | module=mock | banner=mock | rewarded=mock";
}

export async function initializeMobileAds() {
  // Mock initialization for web, do nothing
}

export async function showRewardedCreditAd() {
  throw new Error("AdMob rewarded ads require a native development build. Web and Expo Go are not supported.");
}

export function AdMobBannerCard() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.title}>Banner Ad Placeholder (Web)</Text>
      <Text style={styles.text}>Banner ads render only in a native build with AdMob configured.</Text>
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
});
