import { beforeEach } from 'vitest';

declare const jsdom: {
  window: {
    localStorage: Storage;
  };
};

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: jsdom.window.localStorage,
});

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const getComputedStyle = window.getComputedStyle.bind(window);
window.getComputedStyle = ((element, pseudoElement) => {
  const styles = getComputedStyle(element, pseudoElement);
  if (!element.classList.contains('adm-px-tester'))
    return styles;

  return new Proxy(styles, {
    get(target, property, receiver) {
      return property === 'position' ? 'fixed' : Reflect.get(target, property, receiver);
    },
  });
}) as typeof window.getComputedStyle;

await import('antd-mobile/es/global');

await import('@/shared/i18n');

Object.defineProperty(window, 'AudioContext', {
  configurable: true,
  value: class NoopAudioContext {},
});

beforeEach(() => {
  localStorage.clear();
});
