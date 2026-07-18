import { resolve } from 'node:path';
import { inspectorServer } from '@react-dev-inspector/vite-plugin';
import babel from '@rolldown/plugin-babel';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import config from './config';

const srcPath = resolve(__dirname, 'src');

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
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
      ...(command === 'serve' ? [inspectorServer()] : []),
      react(),
      ...(command === 'serve'
        ? [
            babel({
              plugins: ['@react-dev-inspector/babel-plugin'],
            }),
          ]
        : []),
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
