import { beforeEach } from 'vitest';
import '@/shared/i18n';

Object.defineProperty(window, 'AudioContext', {
  configurable: true,
  value: class NoopAudioContext {},
});

beforeEach(() => {
  localStorage.clear();
});
