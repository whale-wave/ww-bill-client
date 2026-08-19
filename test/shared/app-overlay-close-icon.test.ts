import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { AppBottomSheet } from '@/shared/ui';

let cleanup: (() => void) | undefined;

function renderSheet(props: { closeIconAlign?: 'default' | 'heading' }) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(createElement(AppBottomSheet, {
    position: 'bottom',
    visible: true,
    ...props,
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

describe('appBottomSheet close icon alignment', () => {
  it('keeps the default close icon position without a modifier', () => {
    renderSheet({});
    expect(document.body.querySelector('.ww-app-bottom-sheet')).not.toBeNull();
    expect(document.body.querySelector('.ww-app-bottom-sheet--close-heading')).toBeNull();
  });

  it('appends the heading-aligned modifier when closeIconAlign is heading', () => {
    renderSheet({ closeIconAlign: 'heading' });
    expect(document.body.querySelector('.ww-app-bottom-sheet--close-heading')).not.toBeNull();
  });
});
