import type { Root } from 'react-dom/client';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BrandAvatar } from '@/shared/ui';

describe('brand avatar', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('renders the Whale Wave logo inside a circular crop', () => {
    act(() => root.render(createElement(BrandAvatar, { className: 'h-12 w-12' })));

    const wrapper = container.querySelector<HTMLElement>('[data-brand-avatar]');
    const image = wrapper?.querySelector('img');
    expect(wrapper?.className).toContain('rounded-full');
    expect(image).not.toBeNull();
    expect(image?.getAttribute('src')).toBeTruthy();
    expect(image?.textContent).not.toContain('W');
  });
});
