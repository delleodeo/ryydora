import js from '@eslint/js';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';

export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['client/**/*.{js,vue}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2024 },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
    },
  },
  {
    files: ['server/**/*.js', '*.config.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.es2024 },
    },
  },
];

