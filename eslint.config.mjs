import antfu from '@antfu/eslint-config';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat();

export default antfu({
  formatters: {
    css: true,
    html: true,
    markdown: true,
  },
  stylistic: {
    indent: 2,
  },
  react: true,
  ignores: ['tsconfig.app.json'],
}, ...compat.config({
  plugins: ['@tanstack/query'],
  extends: ['plugin:@tanstack/eslint-plugin-query/recommended'],
}), {
  rules: {
    'style/semi': ['error', 'always'],
    'style/member-delimiter-style': ['error', {
      multiline: {
        delimiter: 'semi',
        requireLast: true,
      },
      singleline: {
        delimiter: 'semi',
        requireLast: false,
      },
      multilineDetection: 'brackets',
    }],
    'no-console': ['error', {
      allow: ['warn', 'info', 'error'],
    }],
    'react-refresh/only-export-components': 'off',
  },
});
