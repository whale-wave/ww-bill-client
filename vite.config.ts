import { resolve } from 'node:path';
import { createHtmlPlugin } from 'vite-plugin-html';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import config from './config';

const srcPath = resolve(__dirname, 'src');

// https://vitejs.dev/config/
export default defineConfig((
  // { mode }
) => {
  // const env = loadEnv(mode, process.cwd(), '');

  return {
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext',
      },
    },
    build: {
      target: 'esnext',
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
          additionalData: `@import "~mixin/mixins.scss";`,
        },
      },
    },
    plugins: [
      react(),
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
