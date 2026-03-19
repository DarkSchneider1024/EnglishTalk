# AdMob Free Plan Technical Design

## Goal

Add a `Free` plan monetized with Google AdMob while keeping paid plans ad-free.

## Scope

- Expo React Native app
- Google AdMob integration via `react-native-google-mobile-ads`
- Rewarded ads for extra free-talk credits
- Banner ad placement on subscription / free-plan surfaces
- Environment-based AdMob configuration

## Chosen Stack

- Ads SDK: `react-native-google-mobile-ads`
- Expo config plugin: `react-native-google-mobile-ads`
- Native build support: Expo development build / production build

## Why This Approach

- Expo Go does not support this native ad SDK.
- `react-native-google-mobile-ads` is the standard React Native AdMob integration path.
- Rewarded ads fit the product model better than interrupting active speaking drills.

## Plan Matrix

- `Free`
  - 3 free AI talk credits per day
  - limited lessons and topics
  - banner ads on pricing and promotional surfaces
  - rewarded ad to gain `+1` extra free-talk credit
- `Basic`
  - no ads
  - full starter content
- `Premium`
  - no ads
  - unlimited AI usage
- `Plus`
  - no ads
  - advanced feedback and support

## Ad Placement Rules

- Do show banner ads:
  - subscription / pricing page
  - non-blocking promotional surfaces for free users
- Do show rewarded ads:
  - when free credits are exhausted
  - when user explicitly taps `Watch Ad to Get +1 Credit`
- Do not show ads:
  - during a live speaking drill
  - in the middle of AI chat generation
  - for `Basic`, `Premium`, or `Plus`

## Credit Flow

1. Free user starts with daily credit allowance.
2. Each free-talk session consumes one credit.
3. When credits reach zero, app blocks new free-talk requests.
4. User can watch a rewarded ad.
5. On `EARNED_REWARD`, app increments free credits by one.

## Runtime Architecture

- `app.config.js`
  - injects AdMob app IDs into native config through the plugin
- `src/ads/admob.js`
  - wraps SDK initialization
  - exposes rewarded ad loading/showing
  - exposes banner rendering with test fallback
- `App.js`
  - shows Free plan credit UI
  - triggers rewarded ad flow
  - blocks free usage when credits are depleted

## Environment Variables

- `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID`
- `EXPO_PUBLIC_ADMOB_IOS_APP_ID`
- `EXPO_PUBLIC_ADMOB_BANNER_ID`
- `EXPO_PUBLIC_ADMOB_REWARDED_ID`
- `EXPO_PUBLIC_GEMINI_API_KEY`

## Test IDs

If no AdMob env vars are provided, the app falls back to Google's official AdMob test IDs.

## Build Requirements

- Web preview: no real ads, placeholder only
- Expo Go: not supported for this SDK
- Native test path:
  - `npx expo prebuild`
  - `npx expo run:android` or `npx expo run:ios`
  - or EAS development build

## Risks

- Rewarded ads depend on native build and correct AdMob app IDs
- iOS ATT / tracking consent may require additional product decisions
- Ad frequency and reward economy need analytics tuning later

## Next Implementation Steps

1. Persist daily free credits in storage and reset by date.
2. Add remote config for reward amount and ad placement control.
3. Add analytics for ad impressions, reward completion, and upgrade conversion.
4. Separate app-open / interstitial placement if monetization requires it later.
