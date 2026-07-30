import type { FC, ReactNode } from 'react';
import type {
  RecordSearchFilters,
  RecordSearchValidation,
} from '../model/record-search-state';
import type { RecordOverviewListGroup } from '@/entities/record';
import { Button, ErrorBlock, SpinLoading } from 'antd-mobile';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { RecordOverviewList } from '@/entities/record';
import { cn } from '@/shared/lib';
import { RecordSearchHeader } from '@/shared/ui';

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
  capsule?: ReactNode;
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
      'min-w-[72px] rounded-full border-0 px-4 py-2 text-sm',
      active
        ? 'bg-primary font-medium text-font-black'
        : 'bg-bg-gray text-font-gray',
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
  <div className="flex items-start gap-3 py-2">
    <span className="w-12 shrink-0 pt-2 text-sm text-font-black">{label}</span>
    <div className="flex min-w-0 flex-grow flex-wrap gap-2">{children}</div>
  </div>
);

export const RecordSearchPresentation: FC<RecordSearchPresentationProps> = ({
  autoFocus,
  capsule,
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
    <div className="page-new relative overflow-hidden bg-white" data-record-search-page-shell>
      <RecordSearchHeader
        autoFocus={autoFocus}
        capsule={capsule}
        filterActive={isFilterActive}
        filterExpanded={isFilterVisible}
        filterLabel="筛选"
        onBack={onBack}
        onChange={onKeywordChange}
        onFilterClick={isFilterVisible ? handleCloseFilters : handleOpenFilters}
        placeholder={placeholder}
        title={title}
        value={value}
      />
      {summary && (
        <div className="shrink-0 border-0 border-b border-solid border-[#EBEBEB] bg-[#f8fcfd] px-4 py-3 text-sm text-font-black" data-record-search-summary>
          {summary}
        </div>
      )}
      <main className="flex min-h-0 flex-grow flex-col overflow-auto pb-4">
        {state === 'loading' && (
          <div className="flex flex-grow items-center justify-center" data-record-search-state="loading">
            <SpinLoading />
          </div>
        )}
        {state === 'idle' && (
          <div className="flex flex-grow items-center justify-center" data-record-search-state="idle">
            <ErrorBlock description="输入关键词或选择筛选条件" status="empty" />
          </div>
        )}
        {state === 'ready' && groups.length === 0 && (
          <div className="flex flex-grow items-center justify-center" data-record-search-state="empty">
            <ErrorBlock description="没有找到符合条件的记录" status="empty" />
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
            <RecordOverviewList groups={groups} variant="search" />
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
          className="absolute inset-x-0 bottom-0 top-[112px] z-30 bg-black/20"
          data-record-filter-mask
          onClick={handleCloseFilters}
          role="presentation"
        >
          <section
            aria-label="记录筛选"
            className="max-h-[calc(100vh-112px)] overflow-auto bg-white px-4 pb-4"
            data-record-filter-panel
            onClick={event => event.stopPropagation()}
          >
            <FilterRow label="类型">
              {([
                ['all', '不限'],
                ['category', '类别'],
                ['tag', '标签'],
                ['remark', '备注'],
                ['amount', '金额'],
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
            <FilterRow label="收支">
              {([
                ['all', '不限'],
                ['add', '收入'],
                ['sub', '支出'],
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
            <FilterRow label="时间">
              <FilterChip
                active={!draft.startDate && !draft.endDate}
                onClick={() => setDraft(current => ({ ...current, endDate: '', startDate: '' }))}
              >
                不限
              </FilterChip>
              <FilterChip
                active={Boolean(draft.startDate || draft.endDate)}
                onClick={() => setDraft(current => ({
                  ...current,
                  startDate: current.startDate || getShanghaiDateKey(),
                }))}
              >
                自定义
              </FilterChip>
            </FilterRow>
            {(draft.startDate || draft.endDate) && (
              <div className="ml-[60px] grid grid-cols-2 gap-2 pb-2">
                <input
                  aria-label="开始日期"
                  className="h-10 min-w-0 rounded border border-solid border-[#EBEBEB] px-2 text-sm"
                  onChange={event => setDraft(current => ({ ...current, startDate: event.target.value }))}
                  type="date"
                  value={draft.startDate}
                />
                <input
                  aria-label="结束日期"
                  className="h-10 min-w-0 rounded border border-solid border-[#EBEBEB] px-2 text-sm"
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
                  className="flex w-full items-center justify-center border-0 border-t border-solid border-[#EBEBEB] bg-white py-3 text-sm text-font-gray"
                  onClick={() => setIsMoreVisible(current => !current)}
                  type="button"
                >
                  更多筛选
                  <ChevronDown className={cn('ml-1 transition-transform', isMoreVisible && 'rotate-180')} size={15} />
                </button>
                {isMoreVisible && (
                  <div data-record-filter-more>
                    {filterCapabilities.member && (
                      <FilterRow label="成员">
                        <FilterChip active={!draft.memberUserId} onClick={() => setDraft(current => ({ ...current, memberUserId: '' }))}>不限</FilterChip>
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
                      <FilterRow label="分类">
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
                      <FilterRow label="标签">
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
                    <FilterRow label="金额">
                      <input
                        aria-label="最小金额"
                        className="h-10 min-w-0 flex-1 rounded border border-solid border-[#EBEBEB] px-3 text-sm"
                        inputMode="decimal"
                        onChange={event => setDraft(current => ({ ...current, minAmount: event.target.value }))}
                        placeholder="最低"
                        value={draft.minAmount}
                      />
                      <input
                        aria-label="最大金额"
                        className="h-10 min-w-0 flex-1 rounded border border-solid border-[#EBEBEB] px-3 text-sm"
                        inputMode="decimal"
                        onChange={event => setDraft(current => ({ ...current, maxAmount: event.target.value }))}
                        placeholder="最高"
                        value={draft.maxAmount}
                      />
                    </FilterRow>
                    <FilterRow label="统计">
                      {([
                        ['all', '全部'],
                        ['counted', '计入'],
                        ['uncounted', '不计入'],
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
            <div className="mt-3 grid grid-cols-2 gap-3 border-0 border-t border-solid border-[#EBEBEB] pt-4">
              <Button block onClick={() => setDraft(defaultFilters)}>重置</Button>
              <Button block color="primary" disabled={hasValidation} onClick={handleConfirm}>确定</Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
