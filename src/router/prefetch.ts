/**
 * Prefetch map for common navigation targets. Calling these `import()`
 * functions preloads the route chunk so navigation feels instant. The
 * bundler deduplicates — the same module spec used in route `lazy` resolves
 * to the same chunk, so prefetch warms the exact cache the router will use.
 *
 * Trigger on hover/touch (see tab-bar) — before the user actually clicks.
 */
export const routePrefetch: Record<string, () => Promise<unknown>> = {
  '/detail': () => import('@/pages/detail'),
  '/chart': () => import('@/pages/chart/ChartHome/ChartHome'),
  '/bookkeeping': () => import('@/pages/bookkeeping'),
  '/discovery': () => import('@/pages/discovery'),
  '/mine': () => import('@/pages/mine'),
};

/** Prefetch a route chunk by path. No-op for unknown paths. */
export function prefetchRoute(path: string): void {
  routePrefetch[path]?.().catch(() => {});
}
