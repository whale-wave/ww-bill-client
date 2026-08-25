import type { ComponentType } from 'react';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { ContentStack, SectionStack } from '@/shared/ui';

let cleanup: (() => void) | undefined;
function render(node: ComponentType<any>, props?: Record<string, unknown>) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(createElement(node, props, 'inner')));
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

describe('contentStack', () => {
  it('applies gap-3 by default', () => {
    const container = render(ContentStack);
    expect(container.querySelector('.gap-3')).not.toBeNull();
    expect(container.textContent).toBe('inner');
  });
  it('applies gap-4 for 16px sections', () => {
    const container = render(ContentStack, { gap: 16 });
    expect(container.querySelector('.gap-4')).not.toBeNull();
  });
  it('sectionStack is a 16px alias', () => {
    const container = render(SectionStack);
    expect(container.querySelector('.gap-4')).not.toBeNull();
  });
});
