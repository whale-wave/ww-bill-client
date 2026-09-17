import type { StorybookConfig } from '@storybook/react-vite';
import { resolve } from 'node:path';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs', '@storybook/addon-vitest'],
  framework: '@storybook/react-vite',
  staticDirs: ['../static'],
  async viteFinal(baseConfig) {
    const { mergeConfig } = await import('vite');
    const react = (await import('@vitejs/plugin-react')).default;

    return mergeConfig(baseConfig, {
      plugins: [react()],
      resolve: {
        alias: {
          '@': resolve(import.meta.dirname, '../src'),
          '~normalize.css': 'normalize.css',
          '~mixin': resolve(import.meta.dirname, '../src/assets/styles'),
          'classnames': 'classnames-es-ts',
        },
      },
      css: {
        preprocessorOptions: {
          scss: { additionalData: '@use "~mixin/mixins.scss" as *;' },
        },
      },
    });
  },
};

export default config;
