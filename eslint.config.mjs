import antfu from '@antfu/eslint-config';

export default antfu({
  stylistic: {
    semi: true,
  },
  react: true,
  // Plans/specs contain illustrative, intentionally incomplete code snippets.
  // Keep formatting support for project assets, but do not parse Markdown as source.
  markdown: false,
  formatters: {
    css: true,
    graphql: true,
    html: true,
    markdown: false,
  },
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
