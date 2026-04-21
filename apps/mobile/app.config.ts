import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig =>
  ({
    ...config,
    extra: {
      ...config.extra,
      apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
    },
  }) as ExpoConfig;
