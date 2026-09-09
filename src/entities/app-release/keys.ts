export const appReleaseKeys = {
  all: ['app-release'] as const,
  latest: () => [...appReleaseKeys.all, 'latest'] as const,
  latestAndroid: () => [...appReleaseKeys.all, 'android', 'latest'] as const,
};
