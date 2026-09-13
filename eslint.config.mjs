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
      paths: [{
        importNames: ['Toast'],
        message: 'Use showAppError/showAppNotice from shared/ui/app-feedback instead.',
        name: 'antd-mobile',
      }],
      patterns: [{
        group: ['antd-mobile/es/components/toast*'],
        message: 'Use the shared app feedback API instead of importing Toast directly.',
      }],
    }],
  },
}, {
  files: ['src/shared/ui/app-feedback/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': 'off',
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
