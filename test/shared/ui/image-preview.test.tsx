import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ImagePreview } from '@/shared/ui';

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('image preview', () => {
  it('renders the mobile gesture viewer and an explicit close action', async () => {
    const onClose = vi.fn();
    const returnFocusButton = document.createElement('button');
    document.body.append(returnFocusButton);
    returnFocusButton.focus();
    const container = document.createElement('div');
    container.id = 'root';
    container.style.zIndex = '1';
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(createElement(ImagePreview, {
      image: 'blob:receipt',
      onClose,
      visible: true,
    })));
    cleanup = () => {
      act(() => root.unmount());
      container.remove();
      returnFocusButton.remove();
    };

    await vi.waitFor(() => expect(document.body.querySelector('.adm-image-viewer-control')).not.toBeNull());
    expect(container.querySelector('.adm-image-viewer-control')).toBeNull();
    expect(document.body.querySelector<HTMLImageElement>('.adm-image-viewer-control img')?.src).toBe('blob:receipt');

    const closeButton = document.body.querySelector<HTMLButtonElement>('[aria-label="关闭图片预览"]');
    const dialog = document.body.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');
    expect(dialog?.contains(closeButton ?? null)).toBe(true);
    expect(closeButton?.closest('[aria-hidden="true"]')).toBeNull();
    expect(container.hasAttribute('inert')).toBe(true);
    expect(document.activeElement).toBe(closeButton);
    act(() => closeButton?.click());
    expect(onClose).toHaveBeenCalledOnce();

    act(() => root.render(createElement(ImagePreview, { visible: false })));
    expect(container.hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(returnFocusButton);
  });

  it('announces a full-image loading failure outside the hidden visual mask', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(createElement(ImagePreview, {
      statusLabel: '凭证图片加载失败',
      visible: true,
    })));
    cleanup = () => {
      act(() => root.unmount());
      container.remove();
    };

    await vi.waitFor(() => expect(document.body.querySelector('[role="dialog"]')).not.toBeNull());
    const status = document.body.querySelector('[role="dialog"] [aria-live="polite"]');
    expect(status?.textContent).toBe('凭证图片加载失败');
    expect(status?.closest('[aria-hidden="true"]')).toBeNull();
  });
});
