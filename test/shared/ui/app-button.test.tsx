import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppButton } from '@/shared/ui';

let cleanup: (() => void) | undefined;

function renderButton(props: React.ComponentProps<typeof AppButton>) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<AppButton {...props} />));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return container.querySelector('button')!;
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('appButton', () => {
  it('preserves submit semantics and forwards a click', () => {
    const onClick = vi.fn();
    const button = renderButton({ children: '保存', onClick, type: 'submit' });

    expect(button.type).toBe('submit');
    act(() => button.click());
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('makes loading buttons unavailable and exposes busy state', () => {
    const onClick = vi.fn();
    const button = renderButton({ children: '保存', loading: true, loadingLabel: '保存中', onClick });

    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.textContent).toContain('保存中');
    act(() => button.click());
    expect(onClick).not.toHaveBeenCalled();
  });

  it('supports explicit disabled state and visible focus styling', () => {
    const button = renderButton({ children: '保存', disabled: true, variant: 'secondary' });

    expect(button.disabled).toBe(true);
    expect(button.className).toContain('focus-visible:ring-2');
    expect(button.className).toContain('border-border-primary');
  });
});
