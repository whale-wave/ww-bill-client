import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { CategoryIcon, hasCategoryGlyph } from '@/entities/category';

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

function renderGlyphGeometry(iconKey: string) {
  const container = document.createElement('div');
  container.innerHTML = renderToStaticMarkup(createElement(CategoryIcon, { iconKey }));
  return container.querySelector('svg')?.innerHTML;
}

const BUILTIN_GLYPHS = [
  ['catering', 'lucide-utensils'],
  ['meal', 'lucide-soup'],
  ['food', 'lucide-cooking-pot'],
  ['vegetables', 'lucide-vegan'],
  ['fruits', 'lucide-apple'],
  ['snacks', 'lucide-cookie'],
  ['alcohol', 'lucide-wine'],
  ['coffee', 'lucide-coffee'],
  ['tea', 'lucide-cup-soda'],
  ['breakfast', 'lucide-egg-fried'],
  ['fast-food', 'lucide-hamburger'],
  ['dessert', 'lucide-ice-cream-bowl'],
  ['dairy', 'lucide-milk'],
  ['seafood', 'lucide-fish'],
  ['shopping', 'lucide-shopping-bag'],
  ['daily', 'lucide-shopping-basket'],
  ['traffic', 'lucide-bus'],
  ['travel', 'lucide-plane'],
  ['housing', 'lucide-house'],
  ['furniture', 'lucide-sofa'],
  ['communication', 'lucide-smartphone'],
  ['fress', 'lucide-shirt'],
  ['beauty', 'lucide-sparkles'],
  ['digital', 'lucide-laptop'],
  ['cars', 'lucide-car'],
  ['medical', 'lucide-stethoscope'],
  ['repair', 'lucide-wrench'],
  ['express', 'lucide-package'],
  ['motion', 'lucide-dumbbell'],
  ['entertainment', 'lucide-gamepad-2'],
  ['book', 'lucide-book-open'],
  ['study', 'lucide-graduation-cap'],
  ['office', 'lucide-briefcase-business'],
  ['subway', 'lucide-train-front'],
  ['cycling', 'lucide-bike'],
  ['fuel', 'lucide-fuel'],
  ['parking', 'lucide-circle-parking'],
  ['hotel', 'lucide-hotel'],
  ['utilities', 'lucide-lightbulb'],
  ['movie', 'lucide-clapperboard'],
  ['music', 'lucide-headphones'],
  ['ticket', 'lucide-ticket'],
  ['outdoor', 'lucide-tent-tree'],
  ['photography', 'lucide-camera'],
  ['ball-sports', 'lucide-volleyball'],
  ['art', 'lucide-palette'],
  ['children', 'lucide-baby'],
  ['elder', 'lucide-heart-pulse'],
  ['pet', 'lucide-paw-print'],
  ['family', 'lucide-users-round'],
  ['couple', 'lucide-heart'],
  ['cat', 'lucide-cat'],
  ['dog', 'lucide-dog'],
  ['garden', 'lucide-flower-2'],
  ['socializing', 'lucide-users'],
  ['social-contact', 'lucide-contact-round'],
  ['cash-gift', 'lucide-hand-coins'],
  ['gift', 'lucide-gift'],
  ['donation', 'lucide-heart-handshake'],
  ['party', 'lucide-party-popper'],
  ['dating', 'lucide-message-circle-heart'],
  ['business-social', 'lucide-handshake'],
  ['charity', 'lucide-hand-heart'],
  ['salary', 'lucide-wallet-cards'],
  ['part-time', 'lucide-briefcase'],
  ['red-envelope', 'lucide-wallet-minimal'],
  ['cash-gift-income', 'lucide-badge-dollar-sign'],
  ['financial', 'lucide-chart-no-axes-combined'],
  ['investment', 'lucide-piggy-bank'],
  ['other-money', 'lucide-circle-dollar-sign'],
  ['bonus', 'lucide-trophy'],
  ['refund', 'lucide-rotate-ccw'],
  ['dividend', 'lucide-coins'],
  ['rent-income', 'lucide-building-2'],
  ['receipt', 'lucide-receipt-text'],
  ['banking', 'lucide-landmark'],
  ['cash', 'lucide-banknote'],
  ['card', 'lucide-credit-card'],
  ['subscription', 'lucide-repeat-2'],
  ['taxes', 'lucide-file-text'],
] as const;

describe('category icon', () => {
  it('keeps the server fallback icon available to the catalog intersection', () => {
    expect(hasCategoryGlyph('receipt')).toBe(true);
  });

  it('offers at least 80 distinct built-in glyphs', () => {
    const geometry = BUILTIN_GLYPHS.map(([key]) => renderGlyphGeometry(key));
    expect(BUILTIN_GLYPHS.length).toBeGreaterThanOrEqual(80);
    expect(new Set(BUILTIN_GLYPHS.map(([, glyph]) => glyph)).size).toBe(BUILTIN_GLYPHS.length);
    expect(BUILTIN_GLYPHS.every(([key]) => hasCategoryGlyph(key))).toBe(true);
    expect(geometry.every(Boolean)).toBe(true);
    expect(new Set(geometry).size).toBe(BUILTIN_GLYPHS.length);
  });

  it.each(BUILTIN_GLYPHS)('maps %s to the unified Lucide glyph %s', (iconKey, expectedClass) => {
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
