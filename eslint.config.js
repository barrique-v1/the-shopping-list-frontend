// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');

module.exports = defineConfig([
    // Base Expo configuration
    expoConfig,

    // Prettier integration (formats code automatically)
    eslintPluginPrettierRecommended,

    {
        // Files/folders to ignore when linting
        ignores: [
            'dist/*',
            'node_modules/*',
            '.expo/*',
            'ios/*',
            'android/*'
        ],

        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                project: './tsconfig.json',
            },
        },
        plugins: {
            '@typescript-eslint': typescriptEslint,
        },

        rules: {
            // Prevent unused variables (catches typos and dead code)
            '@typescript-eslint/no-unused-vars': 'error',

            // Ensure React hooks follow the rules (prevents bugs)
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',

            // Require consistent return statements (prevents crashes)
            'consistent-return': 'error',

            // Prevent console.log in production code
            'no-console': 'warn',

            // Ensure proper prop types usage
            'react/prop-types': 'off', // We use TypeScript instead

            // Prevent missing keys in lists (React performance)
            'react/jsx-key': 'error'
        }
    }
]);
