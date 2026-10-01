import type { IncomingMessage, ServerResponse } from 'node:http';
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

function fontAssetCorsPlugin(): Plugin {
  function headers(req: IncomingMessage, res: ServerResponse, next: () => void) {
    if (req.url?.startsWith('/fonts/'))
      res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  }
  return {
    name: 'public-font-cors',
    configureServer: (server) => { server.middlewares.use(headers); },
    configurePreviewServer: (server) => { server.middlewares.use(headers); },
  };
}

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
      // The web app still supports iOS 16.2 Safari; Vite 8 defaults to Safari 16.4+.
      target: ['chrome111', 'edge111', 'firefox114', 'safari16'],
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
        '/socket.io': {
          target: config.defaultHost,
          changeOrigin: true,
          ws: true,
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
      fontAssetCorsPlugin(),
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
