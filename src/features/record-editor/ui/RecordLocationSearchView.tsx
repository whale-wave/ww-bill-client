import type { FormEvent } from 'react';
import type { CurrentLocationFix, RecordLocation, RecordLocationCandidate } from '@/entities/record';
import { ArrowLeft, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPoiRecordLocation, searchRecordLocationsApi } from '@/entities/record';
import { useTranslation } from '@/shared/i18n';

interface RecordLocationSearchViewProps {
  bias?: Pick<CurrentLocationFix, 'latitude' | 'longitude'>;
  onBack: () => void;
  onSelect: (location: RecordLocation) => void;
}

export function RecordLocationSearchView({ bias, onBack, onSelect }: RecordLocationSearchViewProps) {
  const { t } = useTranslation('record');
  const [keyword, setKeyword] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [results, setResults] = useState<RecordLocationCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const requestSequenceRef = useRef(0);

  useEffect(() => {
    const query = submittedKeyword;
    if (query.length < 2) {
      setResults([]);
      setHasError(false);
      setIsLoading(false);
      return;
    }
    const sequence = ++requestSequenceRef.current;
    const controller = new AbortController();
    setIsLoading(true);
    setHasError(false);
    void searchRecordLocationsApi({ keyword: query, ...(bias ? { bias } : {}) }, { signal: controller.signal })
      .then((nextResults) => {
        if (sequence === requestSequenceRef.current)
          setResults(nextResults);
      })
      .catch(() => {
        if (sequence === requestSequenceRef.current && !controller.signal.aborted) {
          setResults([]);
          setHasError(true);
        }
      })
      .finally(() => {
        if (sequence === requestSequenceRef.current)
          setIsLoading(false);
      });
    return () => {
      controller.abort();
      if (sequence === requestSequenceRef.current)
        requestSequenceRef.current += 1;
    };
  }, [bias, retryCount, submittedKeyword]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = keyword.trim();
    if (isLoading || query.length < 2 || (query === submittedKeyword && !hasError))
      return;
    setResults([]);
    setHasError(false);
    setSubmittedKeyword(query);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-2">
      <button className="mb-3 flex min-h-10 shrink-0 items-center gap-2 border-0 bg-transparent px-0 text-[13px] font-bold text-primary-deep" onClick={onBack} type="button">
        <ArrowLeft aria-hidden="true" size={17} />
        {t('location.backToNearby')}
      </button>
      <form className="flex shrink-0 gap-2" onSubmit={handleSearch}>
        <label className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-[15px] border border-border-primary bg-surface-subtle px-3 transition-colors focus-within:border-primary">
          <Search aria-hidden="true" className="text-ww-soft" size={17} />
          <input
            autoFocus
            className="ww-sheet-plain-input min-w-0 flex-1 border-0 bg-transparent text-[14px] font-semibold text-ww-ink outline-none"
            maxLength={96}
            onChange={event => setKeyword(event.target.value)}
            placeholder={bias ? t('location.searchPlaceholder') : t('location.searchPlaceholderWithoutLocation')}
            type="search"
            value={keyword}
          />
        </label>
        <button
          className="flex h-12 shrink-0 items-center gap-1.5 rounded-[15px] bg-primary px-4 text-[13px] font-extrabold text-white shadow-ww-xs transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45"
          disabled={isLoading || keyword.trim().length < 2}
          type="submit"
        >
          <Search aria-hidden="true" size={16} strokeWidth={2.2} />
          {t('location.search')}
        </button>
      </form>
      <div className="mt-5 shrink-0 text-[12px] font-bold text-ww-soft">{t('location.searchResults')}</div>
      {isLoading && <div className="mt-3 text-[12px] font-semibold text-ww-soft">{t('location.searching')}</div>}
      {!isLoading && hasError && (
        <div className="mt-3 flex items-center justify-between text-[12px] font-semibold text-ww-soft">
          <span>{t('location.searchFailed')}</span>
          <button className="font-extrabold text-primary-deep" onClick={() => setRetryCount(value => value + 1)} type="button">{t('location.retry')}</button>
        </div>
      )}
      {!isLoading && !hasError && submittedKeyword.length >= 2 && results.length === 0 && (
        <div className="mt-3 text-[12px] font-semibold text-ww-soft">{t('location.searchEmpty')}</div>
      )}
      <div className="mt-2 min-h-0 flex-1 overflow-y-auto divide-y divide-border-primary">
        {!isLoading && !hasError && results.map(result => (
          <button className="flex w-full items-start gap-3 py-3 text-left" key={`${result.provider}:${result.id}`} onClick={() => onSelect(createPoiRecordLocation(result))} type="button">
            <Search aria-hidden="true" className="mt-0.5 shrink-0 text-primary-deep" size={16} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-extrabold text-ww-ink">{result.name}</span>
              <span className="block truncate text-[11px] font-semibold text-ww-soft">{[result.city, result.district, result.address].filter(Boolean).join(' · ')}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
