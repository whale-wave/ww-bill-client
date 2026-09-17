export const achievementKeys = {
  all: ['achievement'] as const,
  badges: () => [...achievementKeys.all, 'badges'] as const,
  summary: () => [...achievementKeys.all, 'summary'] as const,
};
