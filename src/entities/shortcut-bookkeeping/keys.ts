export const shortcutBookkeepingKeys = {
  all: ['shortcut-bookkeeping'] as const,
  tokens: () => [...shortcutBookkeepingKeys.all, 'tokens'] as const,
};
