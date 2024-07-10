import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { defaultHost } from './src/config';

const srcPath = resolve(__dirname, 'src');

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
  },
  build: {
    target: 'es2020',
  },
  server: {
    proxy: {
      '/api': {
        target: defaultHost,
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
