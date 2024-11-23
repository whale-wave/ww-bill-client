import { resolve } from 'node:path';
import process from 'node:process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { defaultHost } from './src/config';

dotenv.config();

const srcPath = resolve(__dirname, 'src');

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    target: 'esnext',
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.DEV_HOST || defaultHost,
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
  plugins: [react()],
  publicDir: 'static',
});
