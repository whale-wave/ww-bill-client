export const appReleaseKeys = {
  all: ['app-release'] as const,
  latestAndroid: () => [...appReleaseKeys.all, 'android', 'latest'] as const,
};
