import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RecordSearchHeader } from '@/shared/ui';

let cleanup: (() => void) | undefined;

function renderPage(element: React.ReactNode) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  act(() => root.render(element));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return container;
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  document.body.innerHTML = '';
});

describe('personal record auxiliary navigation', () => {
  it('focuses the shared search input and exposes a real back action', () => {
    const onBack = vi.fn();
    const container = renderPage(createElement(RecordSearchHeader, {
      filterLabel: '筛选',
      onBack,
      onChange: vi.fn(),
      onFilterClick: vi.fn(),
      placeholder: '搜索记录',
      title: '搜索',
      value: 'dinner',
    }));
    const input = container.querySelector('input');

    expect(document.activeElement).toBe(input);
    expect(input?.value).toBe('dinner');
    act(() => container.querySelector<HTMLButtonElement>('[aria-label="返回"]')?.click());
    expect(onBack).toHaveBeenCalledOnce();
  });
});
