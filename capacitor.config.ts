import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Native shells for App Store / Play Store. Paths avoid the existing Kotlin `android/` tree (Cmdly).
 *
 * Workflow: `npm run mobile:sync` (build + cap sync), then:
 * - iOS: `cd regrade-ios/App && pod install`, open `App.xcworkspace` in Xcode (CocoaPods + Xcode required).
 * - Android: open `regrade-android` in Android Studio (JDK 17). `npx cap open android` opens the project.
 *
 * Production: set `VITE_API_BASE_URL` before build; allow your API CORS for `capacitor://localhost` and `ionic://localhost`.
 */
const config: CapacitorConfig = {
  appId: 'app.regrade.assistant',
  appName: 'Regrade',
  webDir: 'dist',
  ios: {
    path: 'regrade-ios',
  },
  android: {
    path: 'regrade-android',
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
