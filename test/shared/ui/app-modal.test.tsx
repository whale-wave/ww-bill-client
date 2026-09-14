import { act, createElement, Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppModal } from '@/shared/ui';

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('appModal', () => {
  it('traps focus, closes on Escape, and restores the trigger', async () => {
    const onClose = vi.fn();
    const container = document.createElement('div');
    container.id = 'root';
    document.body.append(container);
    const root = createRoot(container);
    const render = (visible: boolean) => act(() => root.render(createElement(Fragment, null, createElement('button', { 'data-trigger': true, 'type': 'button' }, 'Open'), createElement(AppModal, {
      'aria-label': 'Edit budget',
      'actions': [{ key: 'save', text: 'Save' }],
      'content': createElement('input', { 'aria-label': 'Amount' }),
      onClose,
      visible,
    }))));
    render(false);
    const trigger = container.querySelector<HTMLButtonElement>('[data-trigger]');
    trigger?.focus();
    render(true);
    cleanup = () => {
      act(() => root.unmount());
      container.remove();
    };

    const dialog = await vi.waitFor(() => document.body.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]'));
    expect(dialog?.getAttribute('aria-label')).toBe('Edit budget');
    expect(container.hasAttribute('inert')).toBe(true);
    expect(dialog?.contains(document.activeElement)).toBe(true);
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' })));
    expect(onClose).toHaveBeenCalledOnce();

    render(false);
    expect(container.hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });
});
