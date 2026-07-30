import { useDebounce } from 'ahooks';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

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

  const setValue = useCallback((nextValue: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete(legacyKey);
    if (nextValue)
      next.set('q', nextValue);
    else
      next.delete('q');
    setSearchParams(next, { replace: true });
  }, [legacyKey, searchParams, setSearchParams]);

  return {
    debouncedValue,
    isDebouncing: value !== debouncedValue,
    searchParams,
    setSearchParams,
    setValue,
    value,
  };
}
