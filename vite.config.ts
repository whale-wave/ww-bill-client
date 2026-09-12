import type { Plugin } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import babel from '@rolldown/plugin-babel';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import config from './config';

const srcPath = resolve(__dirname, 'src');
const packageInfo = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf8')) as { version: string };

function buildInfoPlugin(): Plugin {
  const version = process.env.APP_VERSION ?? packageInfo.version;
  const buildId = process.env.APP_BUILD_ID ?? 'local';

  return {
    name: 'ww-bill-build-info',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'build-info.json',
        source: `${JSON.stringify({ buildId, version })}\n`,
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(() => {
  // const env = loadEnv(mode, process.cwd(), '');

  return {
    build: {
      cssCodeSplit: true,
      manifest: true,
      ...(process.env.SENTRY_UPLOAD_ENABLED === 'true' ? { sourcemap: 'hidden' as const } : {}),
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
      buildInfoPlugin(),
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
      ...(process.env.SENTRY_UPLOAD_ENABLED === 'true'
        ? [sentryVitePlugin({
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT || 'ww-bill-client',
            authToken: process.env.SENTRY_AUTH_TOKEN,
            release: {
              name: `ww-bill-client@${process.env.APP_VERSION ?? packageInfo.version}+${(process.env.APP_BUILD_ID ?? 'local').slice(0, 12)}`,
              dist: process.env.APP_BUILD_ID ?? 'local',
            },
            sourcemaps: {
              assets: 'dist/**',
              filesToDeleteAfterUpload: 'dist/**/*.map',
            },
          })]
        : []),
    ],
    publicDir: 'static',
  };
});
