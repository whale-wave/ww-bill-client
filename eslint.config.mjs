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
  ignores: [
    'tsconfig.app.json',
    '**/*.md',
    'android/**',
    'ios/**',
    'dist/**',
    'coverage/**',
  ],
}, {
  files: ['test/setup.ts'],
  rules: {
    'antfu/no-top-level-await': 'off',
  },
}, {
  files: ['src/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': ['error', {
      paths: [
        { message: 'Use shared/ui instead.', name: 'antd-mobile' },
        { message: 'Use lucide-react or shared/ui/icon instead.', name: 'antd-mobile-icons' },
      ],
      patterns: [{
        group: ['antd-mobile/*', 'antd-mobile-icons/*'],
        message: 'Do not add Ant Design Mobile dependencies back to the client.',
      }],
    }],
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
