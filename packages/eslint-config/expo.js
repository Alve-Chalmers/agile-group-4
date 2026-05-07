import expoFlat from 'eslint-config-expo/flat.js';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import globals from 'globals';

export function createExpoLintConfig() {
  return defineConfig([
    globalIgnores(['**/node_modules/**', '.expo/**', 'dist/**', 'web-build/**', 'coverage/**']),
    ...expoFlat,
    {
      files: ['babel.config.js'],
      languageOptions: {
        globals: { ...globals.node },
      },
    },
    eslintConfigPrettier,
  ]);
}
