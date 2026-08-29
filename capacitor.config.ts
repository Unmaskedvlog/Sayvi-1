import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sayvi.app',
  appName: 'SAYVI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
