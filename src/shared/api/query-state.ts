export interface QueryViewState {
  hasData: boolean;
  isInitialLoading: boolean;
  isRefreshing: boolean;
  isBlockingError: boolean;
  isRefreshError: boolean;
}

export function getQueryViewState({
  hasData,
  isError,
  isFetching,
  isLoading,
}: {
  hasData: boolean;
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
}): QueryViewState {
  return {
    hasData,
    isInitialLoading: isLoading && !hasData,
    isRefreshing: isFetching && hasData,
    isBlockingError: isError && !hasData,
    isRefreshError: isError && hasData,
  };
}
