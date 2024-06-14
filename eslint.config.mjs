import antfu from '@antfu/eslint-config';

export default antfu({
  react: true,
  // ignores: ['vite.config.ts', 'tsconfig.json'],
}, {
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
      allow: ['warn', 'error'],
    }],
  },
});
