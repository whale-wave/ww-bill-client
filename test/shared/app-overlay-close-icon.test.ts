import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { AppBottomSheet } from '@/shared/ui';

let cleanup: (() => void) | undefined;

function renderSheet() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(createElement(AppBottomSheet, {
    position: 'bottom',
    showCloseButton: true,
    visible: true,
  }, 'sheet-content')));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return container;
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('appBottomSheet close icon', () => {
  it('keeps the default close icon', () => {
    renderSheet();
    expect(document.body.querySelector('.ww-app-bottom-sheet')).not.toBeNull();
    expect(document.body.querySelector('.adm-popup-close-icon')).not.toBeNull();
  });
});
