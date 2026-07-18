import { beforeEach } from 'vitest';

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: jsdom.window.localStorage,
});

await import('@/shared/i18n');

Object.defineProperty(window, 'AudioContext', {
  configurable: true,
  value: class NoopAudioContext {},
});

beforeEach(() => {
  localStorage.clear();
});
