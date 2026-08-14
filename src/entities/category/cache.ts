import type { Query, QueryClient } from '@tanstack/react-query';

export type CategoryCacheChange = 'metadata' | 'order' | 'status';

function shouldInvalidate(query: Query, change: CategoryCacheChange) {
  const [domain, section] = query.queryKey;
  if (domain === 'category')
    return true;

  if (change === 'order') {
    return domain === 'record'
      && query.queryKey.includes('filter-options');
  }

  if (change === 'status') {
    return domain === 'budget'
      || domain === 'ledger-data'
      || (domain === 'record' && query.queryKey.includes('filter-options'))
      || (domain === 'household' && section === 'record');
  }

  return domain === 'record'
    || domain === 'budget'
    || domain === 'chart'
    || (domain === 'household' && (section === 'record' || section === 'chart'));
}

export function invalidateCategoryConsumers(
  queryClient: QueryClient,
  change: CategoryCacheChange,
) {
  return queryClient.invalidateQueries({
    predicate: query => shouldInvalidate(query, change),
  });
}
