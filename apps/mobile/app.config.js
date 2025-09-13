export default {
  expo: {
    name: 'Ciuna',
    slug: 'ciuna-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.ciuna.mobile',
      infoPlist: {
        NSCameraUsageDescription: 'This app needs access to camera to take photos for listings and profile pictures.',
        NSPhotoLibraryUsageDescription: 'This app needs access to photo library to select images for listings.',
        NSLocationWhenInUseUsageDescription: 'This app needs access to location to show nearby listings and services.',
        NSLocationAlwaysAndWhenInUseUsageDescription: 'This app needs access to location to show nearby listings and services.',
        NSMicrophoneUsageDescription: 'This app needs access to microphone for video recordings.',
        NSContactsUsageDescription: 'This app needs access to contacts to invite friends.',
        NSFaceIDUsageDescription: 'This app uses Face ID for secure authentication.',
        NSUserTrackingUsageDescription: 'This app uses tracking to provide personalized content and ads.',
      },
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: 'com.ciuna.mobile',
      permissions: [
        'android.permission.CAMERA',
        'android.permission.RECORD_AUDIO',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_BACKGROUND_LOCATION',
        'android.permission.READ_CONTACTS',
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',
        'android.permission.VIBRATE',
        'android.permission.WAKE_LOCK',
        'android.permission.RECEIVE_BOOT_COMPLETED',
        'android.permission.USE_FINGERPRINT',
        'android.permission.USE_BIOMETRIC',
      ],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-camera',
      'expo-location',
      'expo-notifications',
      'expo-image-picker',
      'expo-media-library',
      'expo-device',
      'expo-constants',
      [
        'expo-build-properties',
        {
          ios: {
            deploymentTarget: '13.0',
          },
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: '34.0.0',
          },
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#ffffff',
          sounds: ['./assets/notification-sound.wav'],
        },
      ],
    ],
    extra: {
      eas: {
        projectId: process.env.EAS_PROJECT_ID,
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      yoomoneyApiKey: process.env.EXPO_PUBLIC_YOOMONEY_API_KEY,
      stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      twilioAccountSid: process.env.EXPO_PUBLIC_TWILIO_ACCOUNT_SID,
      twilioAuthToken: process.env.EXPO_PUBLIC_TWILIO_AUTH_TOKEN,
      sendGridApiKey: process.env.EXPO_PUBLIC_SENDGRID_API_KEY,
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    },
    notification: {
      icon: './assets/notification-icon.png',
      color: '#ffffff',
      androidMode: 'default',
      androidCollapsedTitle: 'Ciuna',
    },
    scheme: 'ciuna',
    updates: {
      fallbackToCacheTimeout: 0,
      url: 'https://u.expo.dev/your-project-id',
    },
    runtimeVersion: {
      policy: 'sdkVersion',
    },
  },
};
