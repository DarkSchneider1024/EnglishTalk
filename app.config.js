export default {
  expo: {
    name: "EnglishTalk",
    slug: "englishtalk",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    splash: {
      resizeMode: "contain",
      backgroundColor: "#f7efe4",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      bundleIdentifier: "com.darkschneider.englishtalk",
    },
    android: {
      package: "com.darkschneider.englishtalk",
    },
    plugins: [
      [
        "react-native-google-mobile-ads",
        {
          androidAppId:
            process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID ||
            "ca-app-pub-3940256099942544~3347511713",
          iosAppId:
            process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID ||
            "ca-app-pub-3940256099942544~1458002511",
          userTrackingUsageDescription:
            "This identifier will be used to deliver personalized ads to you.",
        },
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.667382669757-v3f7s9v3f7s9v3f7s9v3f7s9v3f7s9v3"
        }
      ],
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 36,
            targetSdkVersion: 36,
          },
          ios: {
            useFrameworks: "static",
          },
        },
      ],
    ],
    experiments: {
      baseUrl: "/EnglishTalk",
    },
  },
};
