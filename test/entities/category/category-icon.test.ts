import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { CategoryIcon } from '@/entities/category';

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

function render(iconKey: string, categoryName?: string, iconType?: 'BUILTIN' | 'IMAGE') {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(createElement(CategoryIcon, {
    categoryName,
    iconKey,
    iconType,
    size: 18,
  })));
  cleanup = () => act(() => root.unmount());
  return container;
}

describe('category icon', () => {
  it.each([
    ['catering', 'lucide-utensils'],
    ['shopping', 'lucide-shopping-bag'],
    ['daily', 'lucide-package'],
    ['traffic', 'lucide-bus'],
    ['vegetables', 'lucide-vegan'],
    ['fruits', 'lucide-apple'],
    ['snacks', 'lucide-cookie'],
    ['motion', 'lucide-dumbbell'],
    ['entertainment', 'lucide-gamepad-2'],
    ['communication', 'lucide-smartphone'],
    ['fress', 'lucide-shirt'],
    ['beauty', 'lucide-sparkles'],
    ['housing', 'lucide-house'],
    ['furniture', 'lucide-sofa'],
    ['children', 'lucide-baby'],
    ['elder', 'lucide-heart-pulse'],
    ['socializing', 'lucide-users'],
    ['travel', 'lucide-plane'],
    ['alcohol', 'lucide-wine'],
    ['digital', 'lucide-laptop'],
    ['cars', 'lucide-car'],
    ['medical', 'lucide-stethoscope'],
    ['book', 'lucide-book-open'],
    ['study', 'lucide-graduation-cap'],
    ['pet', 'lucide-paw-print'],
    ['cash-gift', 'lucide-hand-coins'],
    ['gift', 'lucide-gift'],
    ['office', 'lucide-briefcase-business'],
    ['repair', 'lucide-wrench'],
    ['donation', 'lucide-heart-handshake'],
    ['social-contact', 'lucide-contact-round'],
    ['express', 'lucide-package'],
    ['salary', 'lucide-wallet-cards'],
    ['part-time', 'lucide-briefcase'],
    ['red-envelope', 'lucide-gift'],
    ['cash-gift-income', 'lucide-hand-coins'],
    ['financial', 'lucide-trending-up'],
    ['other-money', 'lucide-circle-dollar-sign'],
  ])('maps %s to the unified Lucide glyph %s', (iconKey, expectedClass) => {
    expect(render(iconKey).querySelector('svg')?.classList).toContain(expectedClass);
  });

  it('uses the category name when a custom icon key has no mapping', () => {
    expect(render('custom-upload', '咖啡').querySelector('svg')?.classList).toContain('lucide-coffee');
  });

  it('uses an English category name when a custom icon key has no mapping', () => {
    expect(render('custom-upload', 'Transport').querySelector('svg')?.classList).toContain('lucide-bus');
  });

  it('falls back to a receipt glyph for an unknown category', () => {
    expect(render('unknown').querySelector('svg')?.classList).toContain('lucide-receipt-text');
  });

  it('loads trusted image icons anonymously and falls back without guessing by name', () => {
    const container = render('https://cdn.example.com/icon.webp', '咖啡', 'IMAGE');
    const image = container.querySelector('img');
    expect(image?.crossOrigin).toBe('anonymous');

    act(() => image?.dispatchEvent(new Event('error')));

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('svg')?.classList).toContain('lucide-receipt-text');
    expect(container.querySelector('svg')?.classList).not.toContain('lucide-coffee');
  });
});
