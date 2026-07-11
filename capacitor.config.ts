import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ec.edu.espe.studymate',
  appName: 'StudyMate',
  webDir: 'dist',
  server: process.env.CAP_LIVE_RELOAD
    ? {
        url: 'http://localhost:5173',
        cleartext: true
      }
    : undefined
};

export default config;
