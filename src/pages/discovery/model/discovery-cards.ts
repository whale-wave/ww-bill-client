import type { DiscoveryCardId } from '@/entities/user-app-config';

export const DEFAULT_DISCOVERY_CARD_ORDER: DiscoveryCardId[] = ['bill', 'budget', 'asset'];

export function normalizeDiscoveryCardOrder(order?: readonly DiscoveryCardId[]) {
  const knownCards = new Set(DEFAULT_DISCOVERY_CARD_ORDER);
  const uniqueKnownCards = (order ?? []).filter((cardId, index, cards) =>
    knownCards.has(cardId) && cards.indexOf(cardId) === index,
  );

  return [
    ...uniqueKnownCards,
    ...DEFAULT_DISCOVERY_CARD_ORDER.filter(cardId => !uniqueKnownCards.includes(cardId)),
  ];
}

export function normalizeVisibleDiscoveryCards(
  visibleCards: readonly DiscoveryCardId[] | undefined,
  order: readonly DiscoveryCardId[],
) {
  const visibleCardSet = new Set(visibleCards);
  const normalizedVisibleCards = order.filter(cardId => visibleCardSet.has(cardId));

  return normalizedVisibleCards.length > 0
    ? normalizedVisibleCards
    : [order[0] ?? DEFAULT_DISCOVERY_CARD_ORDER[0]];
}

export function canHideDiscoveryCard(visibleCards: readonly DiscoveryCardId[]) {
  return visibleCards.length > 1;
}
