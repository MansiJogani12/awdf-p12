const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      // Express error handlers need all 4 params even when `next` is unused
      'no-unused-vars': ['error', { args: 'none' }],
    },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: { globals: { ...globals.jest } },
  },
];
