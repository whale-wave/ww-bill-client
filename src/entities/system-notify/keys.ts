export const systemKeys = {
  all: ['system'] as const,
  notify: () => [...systemKeys.all, 'notify'] as const,
};
