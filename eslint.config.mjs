import antfu from '@antfu/eslint-config';

export default antfu({
  stylistic: {
    semi: true,
  },
  react: true,
  formatters: true,
  // TODO: md eslint
  ignores: ['tsconfig.app.json', '**/*.md'],
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
