import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { Surface } from '@/shared/ui';

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

function renderSurface(props: React.ComponentProps<typeof Surface>) {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(createElement(Surface, props, 'Content')));
  cleanup = () => act(() => root.unmount());
  return container.firstElementChild as HTMLElement;
}

describe('surface', () => {
  it('renders presentation materials without interactive semantics', () => {
    const surface = renderSurface({
      'aria-label': 'Summary',
      'data-testid': 'summary-surface',
      'material': 'raised',
    });

    expect(surface.tagName).toBe('SECTION');
    expect(surface.classList).toContain('ww-surface');
    expect(surface.classList).toContain('ww-surface--raised');
    expect(surface.getAttribute('role')).toBeNull();
    expect(surface.getAttribute('tabindex')).toBeNull();
    expect(surface.getAttribute('aria-label')).toBe('Summary');
    expect(surface.dataset.testid).toBe('summary-surface');
  });

  it('allows composition classes but leaves material class ownership with Surface', () => {
    const surface = renderSurface({
      as: 'article',
      className: 'flex gap-3 px-4 py-3',
      material: 'content',
    });

    expect(surface.tagName).toBe('ARTICLE');
    expect(surface.className).toContain('flex gap-3 px-4 py-3');
    expect(surface.className).toContain('ww-surface--content');
  });
});
