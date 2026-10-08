import type { ExpoConfig } from 'expo/config';
import baseConfig from './app.json';

const mode = process.env.EXPO_PUBLIC_APP_MODE;
const isProductionBuild =
  process.env.EAS_BUILD_PROFILE === 'production' ||
  process.env.NODE_ENV === 'production';

if (isProductionBuild && mode !== 'live') {
  throw new Error(
    'Production builds require EXPO_PUBLIC_APP_MODE=live. Demo mode is development-only.',
  );
}

const baseExpoConfig = baseConfig.expo as unknown as ExpoConfig;

const config: ExpoConfig = {
  ...baseExpoConfig,
  extra: {
    appMode: mode ?? (isProductionBuild ? 'live' : 'demo'),
  },
};

export default config;
