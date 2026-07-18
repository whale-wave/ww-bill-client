import antfu from '@antfu/eslint-config';

export default antfu({
  stylistic: {
    semi: true,
  },
  react: true,
  formatters: true,
  ignores: ['tsconfig.app.json'],
}, {
  files: ['test/setup.ts'],
  rules: {
    'antfu/no-top-level-await': 'off',
  },
// }, ({
//   plugins: ['@tanstack/query'],
//   extends: ['plugin:@tanstack/eslint-plugin-query/recommended'],
// }), {
//   rules: {
//     'no-console': ['error', {
//       allow: ['warn', 'info', 'error'],
//     }],
//   },
});
