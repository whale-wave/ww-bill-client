import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@tarojs/components': fileURLToPath(new URL('./test/miniapp/mocks/components.ts', import.meta.url)),
      '@tarojs/taro': fileURLToPath(new URL('./test/miniapp/mocks/taro.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    environmentOptions: { jsdom: { url: 'http://localhost/' } },
    include: ['test/miniapp/basic-data-pages.spec.tsx', 'test/miniapp/appearance-session.spec.tsx', 'test/miniapp/presentation-fonts.spec.ts'],
    setupFiles: ['./test/setup.ts'],
  },
});
