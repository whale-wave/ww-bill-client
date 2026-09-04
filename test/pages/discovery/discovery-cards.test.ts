import { describe, expect, it } from 'vitest';
import {
  normalizeDiscoveryCardOrder,
  normalizeVisibleDiscoveryCards,
} from '@/pages/discovery/model/discovery-cards';

describe('discovery card preferences', () => {
  it('keeps an existing order while appending newly available cards', () => {
    expect(normalizeDiscoveryCardOrder(['asset', 'bill']))
      .toEqual(['asset', 'bill', 'budget']);
  });

  it('uses the order to normalize visible cards and keeps one fallback card', () => {
    const order = ['asset', 'bill', 'budget'] as const;

    expect(normalizeVisibleDiscoveryCards(['budget', 'asset'], order))
      .toEqual(['asset', 'budget']);
    expect(normalizeVisibleDiscoveryCards([], order)).toEqual(['asset']);
  });
});
