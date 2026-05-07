import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export function createApiLintConfig() {
  return defineConfig([
    globalIgnores(['**/node_modules/**', 'dist/**', '**/dist/**']),
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
      files: ['**/*.{ts,mts,cts}'],
      languageOptions: {
        globals: { ...globals.node },
      },
    },
    eslintConfigPrettier,
  ]);
}
