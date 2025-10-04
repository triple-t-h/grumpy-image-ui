import tseslint from '@electron-toolkit/eslint-config-ts'
import eslintConfigPrettier from '@electron-toolkit/eslint-config-prettier'

export default tseslint.config(
  { ignores: ['**/node_modules', '**/dist', '**/out'] },
  tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    extends: ['airbnb', 'airbnb/hooks'],
    rules: {
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.test.js',
            '**/*.test.ts',
            '**/*.test.tsx',
            '**/*.spec.js',
            '**/*.spec.ts',
            '**/*.spec.tsx',
            '**/test/**/*.js',
            '**/test/**/*.ts',
            '**/test/**/*.tsx',
          ],
        },
      ],
    },
  },
  {
    extends: [
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
  {
    extends: ['plugin:node/recommended', 'plugin:node/recommended-module'],
    rules: {
      'node/no-unsupported-features/es-syntax': [
        'error',
        { ignores: ['modules'] },
      ],
      'node/no-missing-import': [
        'error',
        {
          tryExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      ],
    },
  },
)
