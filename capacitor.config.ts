
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1bed39bb5f5d4720b4c45d7ecb4fd67e',
  appName: 'Student Organizer Connect',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    url: 'https://1bed39bb-5f5d-4720-b4c4-5d7ecb4fd67e.lovableproject.com?forceHideBadge=true'
  },
  android: {
    buildOptions: {
      keystorePath: null,
      keystorePassword: null,
      keystoreAlias: null,
      keystoreAliasPassword: null,
    }
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#FFFFFF",
      androidSplashResourceName: "splash",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
