import Constants from 'expo-constants';

/** Base URL for the Hono API (no trailing slash). */
export function getApiBaseUrl(): string {
  const fromExtra = Constants.expoConfig?.extra?.apiUrl;
  if (typeof fromExtra === 'string' && fromExtra.length > 0) {
    return fromExtra.replace(/\/$/, '');
  }
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (typeof fromEnv === 'string' && fromEnv.length > 0) {
    return fromEnv.replace(/\/$/, '');
  }
  return 'http://localhost:3000';
}
