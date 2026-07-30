import type { RecordSearchFilters } from './record-search-state';
import { useDebounce } from 'ahooks';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  createRecordSearchParams,
  isRecordSearchActive,
  readRecordSearchState,
  validateRecordSearchState,
} from './record-search-state';

interface RecordSearchControllerOptions {
  legacyKey?: string;
  wait?: number;
}

export function useRecordSearchController({
  legacyKey = 'keyword',
  wait = 250,
}: RecordSearchControllerOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get('q') ?? searchParams.get(legacyKey) ?? '';
  const debouncedValue = useDebounce(value, { wait });
  const state = useMemo(
    () => readRecordSearchState(searchParams),
    [searchParams],
  );
  const debouncedState = useMemo(
    () => ({ ...state, keyword: debouncedValue }),
    [debouncedValue, state],
  );

  const setValue = useCallback((nextValue: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete(legacyKey);
    if (nextValue.trim())
      next.set('q', nextValue);
    else
      next.delete('q');
    setSearchParams(next, { replace: true });
  }, [legacyKey, searchParams, setSearchParams]);

  const commitFilters = useCallback((filters: RecordSearchFilters) => {
    setSearchParams(createRecordSearchParams(searchParams, filters));
  }, [searchParams, setSearchParams]);

  return {
    commitFilters,
    debouncedState,
    debouncedValue,
    filters: state.filters,
    isActive: isRecordSearchActive(state),
    isDebouncing: value !== debouncedValue,
    searchParams,
    setSearchParams,
    setValue,
    state,
    validation: validateRecordSearchState(state),
    value,
  };
}
