export const userKeys = {
  all: ['user'] as const,
  info: () => [...userKeys.all, 'info'] as const,
  appConfig: () => [...userKeys.all, 'app-config'] as const,
};
