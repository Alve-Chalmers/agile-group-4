import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Resolve `react-native` to `react-native-web` so components run in a DOM
 * environment (happy-dom) under Vitest. Use `@testing-library/react` for queries.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'react-native': 'react-native-web',
    },
    conditions: ['browser', 'module', 'import', 'default'],
  },
  define: {
    __DEV__: true,
    'process.env.NODE_ENV': JSON.stringify('test'),
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.expo/**'],
  },
});
