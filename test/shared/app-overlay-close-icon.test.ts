import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { AppDatePicker, AppSheet } from '@/shared/ui';

let cleanup: (() => void) | undefined;

function renderSheet(position: 'bottom' | 'top' = 'bottom') {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(createElement(AppSheet, {
    position,
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

describe('app overlay adapters', () => {
  it('renders the date-picker selection band behind a high-contrast active row', () => {
    const styles = readFileSync(resolve(process.cwd(), 'src/shared/ui/app-overlay/app-overlay.scss'), 'utf8');

    expect(styles).toContain('&::before {');
    expect(styles).toContain('.adm-picker-view-column-item-active');
    expect(styles).toMatch(/&::before\s*\{[^}]*right:\s*8px;[^}]*left:\s*8px;/);
    expect(styles).toMatch(/&::before\s*\{[^}]*border-radius:\s*8px;/);
    expect(styles).toMatch(/\.adm-picker-view-mask-middle\s*\{[^}]*background:\s*transparent;/);
  });

  it('keeps the default close icon', () => {
    renderSheet();
    expect(document.body.querySelector('.ww-app-sheet.ww-app-sheet--bottom')).not.toBeNull();
    expect(document.body.querySelector('.ww-app-overlay-mask')).not.toBeNull();
    expect(document.body.querySelector('.adm-popup-close-icon')).not.toBeNull();
  });

  it('uses the same sheet seam for top overlays', () => {
    renderSheet('top');
    expect(document.body.querySelector('.ww-app-sheet.ww-app-sheet--top')).not.toBeNull();
    expect(document.body.querySelector('.ww-app-overlay-mask')).not.toBeNull();
  });

  it('automatically applies the shared date picker class', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => root.render(createElement(AppDatePicker, { visible: true })));
    cleanup = () => {
      act(() => root.unmount());
      container.remove();
    };
    expect(document.body.querySelector('.ww-app-date-picker')).not.toBeNull();
  });
});
