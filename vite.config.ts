import { resolve } from 'node:path';
import babel from '@rolldown/plugin-babel';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import config from './config';

const srcPath = resolve(__dirname, 'src');

// https://vitejs.dev/config/
export default defineConfig(() => {
  // const env = loadEnv(mode, process.cwd(), '');

  return {
    build: {
      cssCodeSplit: true,
      manifest: true,
    },
    server: {
      proxy: {
        '/api': {
          target: config.defaultHost,
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': srcPath,
        '~normalize.css': 'normalize.css',
        '~mixin': `${srcPath}/assets/styles`,
        'classnames': 'classnames-es-ts',
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "~mixin/mixins.scss" as *;`,
        },
      },
    },
    plugins: [
      react(),
      babel({
        plugins: [['@locator/babel-jsx/dist', { env: 'development' }]],
      }),
      createHtmlPlugin({
        inject: {
          data: {
            title: config.appName,
          },
        },
      }),
    ],
    publicDir: 'static',
  };
});
