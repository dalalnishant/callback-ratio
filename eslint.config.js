import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default [
    js.configs.recommended,

    ...tseslint.configs.recommended,

    {
        files: ['**/*.ts'],
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.eslint.json'],
                sourceType: 'module',
            },
        },
        plugins: {
            import: importPlugin,
        },
        rules: {
            // ---------- Sanity ----------
            'no-console': 'off',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

            // ---------- Type safety ----------
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

            // ---------- Architecture ----------
            'import/no-cycle': 'error',
            'import/no-duplicates': 'error',

            '@typescript-eslint/no-misused-promises': 'error',
            '@typescript-eslint/switch-exhaustiveness-check': 'error',
            '@typescript-eslint/no-unnecessary-condition': 'error',
        },
    },

    {
        ignores: ['dist/', 'node_modules/', '*.config.*'],
    },
];
