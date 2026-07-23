export type RoutePrefetchLoader = () => Promise<unknown>;

const routePrefetchLoaders = new Map<string, RoutePrefetchLoader>();

export function registerRoutePrefetchers(
  loaders: Readonly<Record<string, RoutePrefetchLoader>>,
) {
  Object.entries(loaders).forEach(([key, loader]) => {
    routePrefetchLoaders.set(key, loader);
  });
}

export function prefetchRoute(key: string): void {
  const loader = routePrefetchLoaders.get(key);
  if (!loader)
    return;
  void loader().catch(() => {});
}
