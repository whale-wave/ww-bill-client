import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SheetHeader } from '@/shared/ui';

let cleanup: (() => void) | undefined;

function renderHeader(onClose = vi.fn()) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(
    <SheetHeader
      closeLabel="Close settings"
      description="Edit the ledger appearance"
      icon={<span data-testid="sheet-header-icon">icon</span>}
      onClose={onClose}
      title="Basic settings"
    />,
  ));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return { container, onClose };
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('sheetHeader', () => {
  it('renders its heading content and labelled close button', () => {
    const { container } = renderHeader();

    expect(container.querySelector('h2')?.textContent).toBe('Basic settings');
    expect(container.textContent).toContain('Edit the ledger appearance');
    expect(container.querySelector('[data-testid="sheet-header-icon"]')).not.toBeNull();
    expect(container.querySelector('button')?.getAttribute('aria-label')).toBe('Close settings');
  });

  it('closes from the header action', () => {
    const { container, onClose } = renderHeader();

    act(() => container.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true })));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
