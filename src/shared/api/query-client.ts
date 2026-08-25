import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24 * 30,
      staleTime: Number.POSITIVE_INFINITY,
      refetchOnMount: query => query.state.isInvalidated,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});
