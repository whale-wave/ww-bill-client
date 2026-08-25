import type { FC, ReactNode } from 'react';
import type {
  RecordSearchFilters,
  RecordSearchValidation,
} from '../model/record-search-state';
import type { RecordOverviewListGroup } from '@/entities/record';
import { Button, ErrorBlock, SpinLoading } from 'antd-mobile';
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { RecordOverviewList } from '@/entities/record';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { IllustratedEmptyState, RecordSearchHeader } from '@/shared/ui';

export type RecordSearchPageState = 'error' | 'idle' | 'loading' | 'ready';

export interface RecordFilterOption {
  id: number | string;
  label: string;
  secondary?: string;
}

export interface RecordSearchFilterOptions {
  categories?: RecordFilterOption[];
  members?: RecordFilterOption[];
  tags?: RecordFilterOption[];
}

export interface RecordSearchFilterCapabilities {
  category?: boolean;
  household?: boolean;
  member?: boolean;
  tag?: boolean;
}

interface RecordSearchPresentationProps {
  autoFocus?: boolean;
  errorDescription?: ReactNode;
  filterCapabilities?: RecordSearchFilterCapabilities;
  filterOptions?: RecordSearchFilterOptions;
  filters: RecordSearchFilters;
  groups: RecordOverviewListGroup[];
  isFilterActive: boolean;
  isLoadingMore?: boolean;
  loadMoreLabel?: ReactNode;
  onBack: () => void;
  onFiltersConfirm: (filters: RecordSearchFilters) => void;
  onKeywordChange: (value: string) => void;
  onLoadMore?: () => void;
  onRetry?: () => void;
  placeholder: string;
  retryLabel?: ReactNode;
  state: RecordSearchPageState;
  summary?: ReactNode;
  title: ReactNode;
  validateFilters: (filters: RecordSearchFilters) => RecordSearchValidation;
  value: string;
}

const defaultFilters: RecordSearchFilters = {
  categoryIds: [],
  endDate: '',
  familyCounting: 'all',
  match: 'all',
  maxAmount: '',
  memberUserId: '',
  minAmount: '',
  startDate: '',
  tagIds: [],
  type: 'all',
};

function getShanghaiDateKey() {
  const parts = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
  }).formatToParts(new Date());
  const value = Object.fromEntries(
    parts.map(part => [part.type, part.value]),
  );
  return `${value.year}-${value.month}-${value.day}`;
}

interface ChipProps {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}

const FilterChip: FC<ChipProps> = ({ active, children, onClick }) => (
  <button
    aria-pressed={active}
    className={cn(
      'min-h-9 min-w-[68px] rounded-xl border border-solid px-3.5 py-2 text-[13px] font-semibold transition active:scale-[0.97]',
      active
        ? 'border-primary/50 bg-primary text-white shadow-ww-xs'
        : 'border-primary/10 bg-primary-light/35 text-ww-mid',
    )}
    onClick={onClick}
    type="button"
  >
    {children}
  </button>
);

interface FilterRowProps {
  children: ReactNode;
  label: ReactNode;
}

const FilterRow: FC<FilterRowProps> = ({ children, label }) => (
  <div className="flex items-start gap-3 py-2.5">
    <span className="w-12 shrink-0 pt-2 text-[13px] font-bold text-ww-ink">{label}</span>
    <div className="flex min-w-0 flex-grow flex-wrap gap-2">{children}</div>
  </div>
);

export const RecordSearchPresentation: FC<RecordSearchPresentationProps> = ({
  autoFocus,
  errorDescription,
  filterCapabilities = {},
  filterOptions = {},
  filters,
  groups,
  isFilterActive,
  isLoadingMore = false,
  loadMoreLabel,
  onBack,
  onFiltersConfirm,
  onKeywordChange,
  onLoadMore,
  onRetry,
  placeholder,
  retryLabel,
  state,
  summary,
  title,
  validateFilters,
  value,
}) => {
  const { t } = useTranslation('record');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isMoreVisible, setIsMoreVisible] = useState(false);
  const [draft, setDraft] = useState(filters);
  const validation = useMemo(
    () => validateFilters(draft),
    [draft, validateFilters],
  );
  const hasValidation = Object.keys(validation).length > 0;

  const handleOpenFilters = () => {
    setDraft(filters);
    setIsFilterVisible(true);
  };
  const handleCloseFilters = () => {
    setIsFilterVisible(false);
    setIsMoreVisible(false);
  };
  const handleConfirm = () => {
    if (hasValidation)
      return;
    onFiltersConfirm(draft);
    handleCloseFilters();
  };

  return (
    <div className="page-new fixed inset-0 h-[100dvh] min-h-0 overflow-hidden" data-record-search-page-shell>
      <RecordSearchHeader
        autoFocus={autoFocus}
        filterActive={isFilterActive}
        filterExpanded={isFilterVisible}
        backLabel={t('common:nav.back')}
        filterLabel={t('search.filter')}
        onBack={onBack}
        onChange={onKeywordChange}
        onFilterClick={isFilterVisible ? handleCloseFilters : handleOpenFilters}
        placeholder={placeholder}
        title={title}
        value={value}
      />
      {summary && (
        <div className="mx-[18px] mb-2 shrink-0 rounded-2xl border border-solid border-white/70 bg-white/65 px-4 py-3 text-[13px] font-semibold text-ww-mid shadow-ww-xs backdrop-blur-md" data-record-search-summary>
          {summary}
        </div>
      )}
      <main className="h-0 min-h-0 flex flex-1 touch-pan-y flex-col overflow-y-auto overscroll-y-contain px-[18px] pb-[max(18px,env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch]">
        {state === 'loading' && (
          <div className="flex flex-grow items-center justify-center" data-record-search-state="loading">
            <SpinLoading />
          </div>
        )}
        {state === 'idle' && (
          <div className="flex flex-grow items-center justify-center" data-record-search-state="idle">
            <IllustratedEmptyState
              accentIcon={<SlidersHorizontal className="text-primary-dark" size={18} />}
              description={t('search.idleDescription')}
              icon={<Search className="text-primary-dark" size={36} strokeWidth={1.8} />}
              title={t('search.idleTitle')}
            />
          </div>
        )}
        {state === 'ready' && groups.length === 0 && (
          <div className="flex flex-grow items-center justify-center" data-record-search-state="empty">
            <IllustratedEmptyState
              description={t('search.emptyDescription')}
              icon={<Search className="text-primary-dark" size={36} strokeWidth={1.8} />}
              title={t('search.emptyTitle')}
            />
          </div>
        )}
        {state === 'error' && (
          <div className="flex flex-grow flex-col items-center justify-center" data-record-search-state="error">
            <ErrorBlock description={errorDescription} />
            {onRetry && <Button className="mt-3" onClick={onRetry} size="small">{retryLabel}</Button>}
          </div>
        )}
        {state === 'ready' && groups.length > 0 && (
          <>
            <div className="shrink-0 overflow-hidden rounded-[22px] border border-solid border-white/75 bg-white/68 shadow-ww backdrop-blur-md">
              <RecordOverviewList groups={groups} variant="search" />
            </div>
            {onLoadMore && (
              <Button className="mx-3 mt-3" loading={isLoadingMore} onClick={onLoadMore}>
                {loadMoreLabel}
              </Button>
            )}
          </>
        )}
      </main>
      {isFilterVisible && (
        <div
          className="absolute inset-x-0 bottom-0 top-[116px] z-30 bg-ww-ink/20 backdrop-blur-[2px]"
          data-record-filter-mask
          onClick={handleCloseFilters}
          role="presentation"
        >
          <section
            aria-label={t('search.filterPanelTitle')}
            className="max-h-[calc(100dvh-116px)] overflow-auto rounded-b-[28px] border-x-0 border-b border-t-0 border-solid border-white/70 bg-white/95 px-[18px] pb-[max(18px,env(safe-area-inset-bottom))] pt-3 shadow-ww-lg"
            data-record-filter-panel
            onClick={event => event.stopPropagation()}
          >
            <div className="mb-1 flex items-center gap-2 text-[15px] font-extrabold text-ww-ink">
              <SlidersHorizontal className="text-primary-dark" size={18} />
              {t('search.filterPanelTitle')}
            </div>
            <FilterRow label={t('search.matchType')}>
              {([
                ['all', t('search.unlimited')],
                ['category', t('search.category')],
                ['tag', t('search.tag')],
                ['remark', t('search.remark')],
                ['amount', t('search.amount')],
              ] as const)
                .filter(([key]) => key !== 'tag' || filterCapabilities.tag !== false)
                .map(([key, label]) => (
                  <FilterChip
                    active={draft.match === key}
                    key={key}
                    onClick={() => setDraft(current => ({ ...current, match: key }))}
                  >
                    {label}
                  </FilterChip>
                ))}
            </FilterRow>
            <FilterRow label={t('search.flow')}>
              {([
                ['all', t('search.unlimited')],
                ['add', t('search.income')],
                ['sub', t('search.expense')],
              ] as const).map(([key, label]) => (
                <FilterChip
                  active={draft.type === key}
                  key={key}
                  onClick={() => setDraft(current => ({ ...current, type: key }))}
                >
                  {label}
                </FilterChip>
              ))}
            </FilterRow>
            <FilterRow label={t('search.time')}>
              <FilterChip
                active={!draft.startDate && !draft.endDate}
                onClick={() => setDraft(current => ({ ...current, endDate: '', startDate: '' }))}
              >
                {t('search.unlimited')}
              </FilterChip>
              <FilterChip
                active={Boolean(draft.startDate || draft.endDate)}
                onClick={() => setDraft(current => ({
                  ...current,
                  startDate: current.startDate || getShanghaiDateKey(),
                }))}
              >
                {t('search.custom')}
              </FilterChip>
            </FilterRow>
            {(draft.startDate || draft.endDate) && (
              <div className="ml-[60px] grid grid-cols-2 gap-2 pb-2">
                <input
                  aria-label={t('search.startDate')}
                  className="h-11 min-w-0 rounded-xl border border-solid border-primary/15 bg-primary-light/20 px-2 text-[13px] text-ww-ink outline-none focus:border-primary"
                  onChange={event => setDraft(current => ({ ...current, startDate: event.target.value }))}
                  type="date"
                  value={draft.startDate}
                />
                <input
                  aria-label={t('search.endDate')}
                  className="h-11 min-w-0 rounded-xl border border-solid border-primary/15 bg-primary-light/20 px-2 text-[13px] text-ww-ink outline-none focus:border-primary"
                  onChange={event => setDraft(current => ({ ...current, endDate: event.target.value }))}
                  type="date"
                  value={draft.endDate}
                />
              </div>
            )}
            {filterCapabilities.household && (
              <>
                <button
                  aria-expanded={isMoreVisible}
                  className="mt-2 flex w-full items-center justify-center rounded-xl border-0 bg-primary-light/35 py-3 text-[13px] font-bold text-primary-dark"
                  onClick={() => setIsMoreVisible(current => !current)}
                  type="button"
                >
                  {t('search.more')}
                  <ChevronDown className={cn('ml-1 transition-transform', isMoreVisible && 'rotate-180')} size={15} />
                </button>
                {isMoreVisible && (
                  <div data-record-filter-more>
                    {filterCapabilities.member && (
                      <FilterRow label={t('search.member')}>
                        <FilterChip active={!draft.memberUserId} onClick={() => setDraft(current => ({ ...current, memberUserId: '' }))}>{t('search.unlimited')}</FilterChip>
                        {filterOptions.members?.map(option => (
                          <FilterChip
                            active={draft.memberUserId === String(option.id)}
                            key={option.id}
                            onClick={() => setDraft(current => ({ ...current, memberUserId: String(option.id) }))}
                          >
                            {option.label}
                          </FilterChip>
                        ))}
                      </FilterRow>
                    )}
                    {filterCapabilities.category && Boolean(filterOptions.categories?.length) && (
                      <FilterRow label={t('search.category')}>
                        {filterOptions.categories?.map(option => (
                          <FilterChip
                            active={draft.categoryIds.includes(Number(option.id))}
                            key={option.id}
                            onClick={() => setDraft(current => ({
                              ...current,
                              categoryIds: current.categoryIds.includes(Number(option.id))
                                ? current.categoryIds.filter(id => id !== Number(option.id))
                                : [...current.categoryIds, Number(option.id)],
                            }))}
                          >
                            {option.label}
                          </FilterChip>
                        ))}
                      </FilterRow>
                    )}
                    {filterCapabilities.tag && Boolean(filterOptions.tags?.length) && (
                      <FilterRow label={t('search.tag')}>
                        {filterOptions.tags?.map(option => (
                          <FilterChip
                            active={draft.tagIds.includes(String(option.id))}
                            key={option.id}
                            onClick={() => setDraft(current => ({
                              ...current,
                              tagIds: current.tagIds.includes(String(option.id))
                                ? current.tagIds.filter(id => id !== String(option.id))
                                : [...current.tagIds, String(option.id)],
                            }))}
                          >
                            {option.label}
                          </FilterChip>
                        ))}
                      </FilterRow>
                    )}
                    <FilterRow label={t('search.amount')}>
                      <input
                        aria-label={t('search.minAmount')}
                        className="h-11 min-w-0 flex-1 rounded-xl border border-solid border-primary/15 bg-primary-light/20 px-3 text-[13px] outline-none focus:border-primary"
                        inputMode="decimal"
                        onChange={event => setDraft(current => ({ ...current, minAmount: event.target.value }))}
                        placeholder={t('search.minimum')}
                        value={draft.minAmount}
                      />
                      <input
                        aria-label={t('search.maxAmount')}
                        className="h-11 min-w-0 flex-1 rounded-xl border border-solid border-primary/15 bg-primary-light/20 px-3 text-[13px] outline-none focus:border-primary"
                        inputMode="decimal"
                        onChange={event => setDraft(current => ({ ...current, maxAmount: event.target.value }))}
                        placeholder={t('search.maximum')}
                        value={draft.maxAmount}
                      />
                    </FilterRow>
                    <FilterRow label={t('search.counting')}>
                      {([
                        ['all', t('search.all')],
                        ['counted', t('search.counted')],
                        ['uncounted', t('search.uncounted')],
                      ] as const).map(([key, label]) => (
                        <FilterChip
                          active={draft.familyCounting === key}
                          key={key}
                          onClick={() => setDraft(current => ({ ...current, familyCounting: key }))}
                        >
                          {label}
                        </FilterChip>
                      ))}
                    </FilterRow>
                  </div>
                )}
              </>
            )}
            {Object.values(validation).map(message => (
              <p className="mt-2 text-sm text-red-500" key={message} role="alert">{message}</p>
            ))}
            <div className="mt-4 grid grid-cols-2 gap-3 border-0 border-t border-solid border-primary/10 pt-4">
              <Button block className="!h-12 !rounded-2xl !border-0 !bg-bg-gray !font-bold !text-ww-mid" onClick={() => setDraft(defaultFilters)}>{t('search.reset')}</Button>
              <Button block className="!h-12 !rounded-2xl !border-0 !bg-primary !font-bold !text-white !shadow-ww-xs" disabled={hasValidation} onClick={handleConfirm}>{t('search.confirm')}</Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
