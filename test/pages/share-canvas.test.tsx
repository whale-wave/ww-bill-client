import { act, createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ShareCanvas from '@/pages/share/ShareCanvas';

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('share canvas', () => {
  it('uses the Whale Wave logo instead of a text brand mark', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(ShareCanvas, {
      canvasRef: createRef<HTMLDivElement>(),
      data: {
        amount: '90',
        categoryName: '服饰',
        dateText: '2026年08月24日',
        type: 'sub',
      },
    })));
    cleanup = () => act(() => root.unmount());

    const logo = container.querySelector<HTMLImageElement>('[data-share-brand-logo] img');
    expect(logo?.src).toContain('whale-logo-transparent');
    expect(container.querySelector('[data-share-brand-logo]')?.textContent).toBe('');
  });
});
