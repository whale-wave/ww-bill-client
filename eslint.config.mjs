import avanlan from '@avanlan/eslint-config';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat();

export default avanlan({
  react: true,
  ignores: ['tsconfig.app.json'],
}, ...compat.config({
  plugins: ['@tanstack/query'],
  extends: ['plugin:@tanstack/eslint-plugin-query/recommended'],
}), {
  rules: {
    'no-console': ['error', {
      allow: ['warn', 'info', 'error'],
    }],
  },
});
