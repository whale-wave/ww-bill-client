import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ledgerFallbackIcon from '@/assets/icons/figma/ledger.svg';
import {
  DEFAULT_LEDGER_ICON_KEY,
  isLedgerIconKey,
  LEDGER_ICON_KEYS,
  LedgerIconGlyph,
  LedgerKind,
  LedgerVisualIcon,
} from '@/entities/ledger';

function render(element: ReturnType<typeof createElement>) {
  const container = document.createElement('div');
  container.innerHTML = renderToStaticMarkup(element);
  return container;
}

const LEDGER_GLYPHS = [
  ['wallet', 'lucide-wallet-cards'],
  ['briefcase', 'lucide-briefcase-business'],
  ['receipt', 'lucide-receipt-text'],
  ['building', 'lucide-building-2'],
  ['users', 'lucide-users-round'],
  ['store', 'lucide-store'],
] as const;

describe('ledger icon catalog', () => {
  it('publishes the canonical ledger icon keys and type guard', () => {
    expect(LEDGER_ICON_KEYS).toEqual(LEDGER_GLYPHS.map(([iconKey]) => iconKey));
    expect(DEFAULT_LEDGER_ICON_KEY).toBe('wallet');
    expect(LEDGER_GLYPHS.every(([iconKey]) => isLedgerIconKey(iconKey))).toBe(true);
    expect(isLedgerIconKey('unknown-ledger-icon')).toBe(false);
    expect(isLedgerIconKey(null)).toBe(false);
  });

  it.each(LEDGER_GLYPHS)('renders %s through the public ledger glyph', (iconKey, expectedClass) => {
    const container = render(createElement(LedgerIconGlyph, { iconKey }));

    expect(container.querySelector('svg')?.classList).toContain(expectedClass);
    expect(container.querySelector('img')).toBeNull();
  });

  it('fills and crops the system default logo independently of caller icon sizing', () => {
    const container = render(createElement(LedgerVisualIcon, {
      className: 'h-4 w-4',
      iconKey: 'briefcase',
      kind: LedgerKind.SYSTEM_DEFAULT,
    }));
    const image = container.querySelector('img');

    expect(image?.getAttribute('src')).toContain('whale-logo-surface.png');
    expect(image?.classList).toContain('h-full');
    expect(image?.classList).toContain('w-full');
    expect(image?.classList).toContain('object-cover');
    expect(image?.classList).not.toContain('h-4');
  });

  it('keeps the ledger SVG fallback for an unknown custom visual', () => {
    const container = render(createElement(LedgerVisualIcon, {
      className: 'h-4 w-4',
      iconKey: 'unknown-ledger-icon',
      kind: LedgerKind.CUSTOM,
    }));
    const image = container.querySelector('img');

    expect(image?.getAttribute('src')).toBe(ledgerFallbackIcon);
    expect(image?.classList).toContain('h-4');
    expect(container.querySelector('svg')).toBeNull();
  });
});
