import { create } from 'zustand';

export type AppMode = 'demo' | 'live' | 'misconfigured';

type RuntimeState = {
  appMode: AppMode;
};

function resolveAppMode(): AppMode {
  const configuredMode = process.env.EXPO_PUBLIC_APP_MODE;

  if (configuredMode === 'live') return 'live';
  if (configuredMode === 'demo' && __DEV__) return 'demo';
  if (configuredMode == null && __DEV__) return 'demo';
  return 'misconfigured';
}

export const useRuntimeStore = create<RuntimeState>(() => ({
  appMode: resolveAppMode(),
}));
