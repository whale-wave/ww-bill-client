import { QueryClient } from '@tanstack/react-query';

export const CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 30;
export const CACHE_VERSION = 'v1';
export const QUERY_PERSIST_BUSTER = `ww-bill-query-cache-${CACHE_VERSION}`;

export const dehydrateOptions = {
  dehydrateMutations: false,
  shouldDehydrateQuery: (query: { state: { status: string }; meta?: { persist?: boolean } }) =>
    query.state.status === 'success' && query.meta?.persist !== false,
};

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        cacheTime: Number.POSITIVE_INFINITY,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnMount: query => query.state.isInvalidated,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });
}

/** @deprecated use createQueryClient and keep the instance session-scoped. */
export const queryClient = createQueryClient();
