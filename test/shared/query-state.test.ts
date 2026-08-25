import { describe, expect, it } from 'vitest';
import { getQueryViewState } from '@/shared/api/query-state';

describe('getQueryViewState', () => {
  it('keeps cached content available while refreshing', () => {
    expect(getQueryViewState({ hasData: true, isError: false, isFetching: true, isLoading: false })).toEqual({
      hasData: true,
      isInitialLoading: false,
      isRefreshing: true,
      isBlockingError: false,
      isRefreshError: false,
    });
  });

  it('only blocks when there is no data', () => {
    expect(getQueryViewState({ hasData: false, isError: true, isFetching: false, isLoading: false }).isBlockingError).toBe(true);
    expect(getQueryViewState({ hasData: true, isError: true, isFetching: false, isLoading: false }).isRefreshError).toBe(true);
  });
});
