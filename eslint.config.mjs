import antfu from '@antfu/eslint-config';

export default antfu({
  stylistic: {
    semi: true,
  },
  react: true,
  formatters: true,
  ignores: ['tsconfig.app.json'],
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
