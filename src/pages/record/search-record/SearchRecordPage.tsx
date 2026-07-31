import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  toRecordSearchGroups,
  useGetRecordQuery,
  useRecordFilterOptionsQuery,
} from '@/entities/record';
import {
  isCommonRecordSearchActive,
  isRecordFilterActive,
  RecordSearchPresentation,
  toCommonRecordSearchFilters,
  toRecordApiParams,
  useRecordSearchController,
  validateRecordSearchState,
} from '@/features/record-search';
import { useWorkspaceBack } from '@/features/workspace-navigation';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';

function SearchRecord() {
  const { t } = useTranslation('record');
  const navigate = useNavigate();
  const search = useRecordSearchController();
  const onBack = useWorkspaceBack({ type: 'personal' });
  const optionsQuery = useRecordFilterOptionsQuery();
  const filters = toCommonRecordSearchFilters(search.filters);
  const state = { ...search.state, filters };
  const debouncedState = { ...search.debouncedState, filters };
  const isActive = isCommonRecordSearchActive(state);
  const validation = validateRecordSearchState(debouncedState);
  const query = useGetRecordQuery({
    params: toRecordApiParams(debouncedState),
    options: {
      enabled: isActive && Object.keys(validation).length === 0,
    },
  });
  const groups = useMemo(() => toRecordSearchGroups(query.data.data, {
    expenseLabel: t('common:amount.expend'),
    incomeLabel: t('common:amount.income'),
    onRecordClick: (record) => {
      playSound.turnPage();
      navigate(`/editing/${record.id}`, { state: record });
    },
  }), [navigate, query.data.data, t]);

  return (
    <RecordSearchPresentation
      errorDescription={t('common:api.error')}
      filterCapabilities={{
        category: optionsQuery.data.capabilities.category,
        tag: optionsQuery.data.capabilities.tag,
      }}
      filterOptions={{
        categories: optionsQuery.data.categories.map(item => ({
          id: item.id,
          label: item.name,
        })),
        tags: optionsQuery.data.tags.map(item => ({
          id: item.id,
          label: item.status === 'ARCHIVED' ? `${item.name}（已归档）` : item.name,
        })),
      }}
      filters={filters}
      groups={groups}
      isFilterActive={isRecordFilterActive(filters)}
      onBack={onBack}
      onFiltersConfirm={search.commitFilters}
      onKeywordChange={search.setValue}
      onRetry={() => void query.refetch()}
      placeholder={t('search.placeholder')}
      retryLabel={t('common:button.retry')}
      state={!isActive
        ? 'idle'
        : Object.keys(validation).length > 0
          ? 'idle'
          : search.isDebouncing || query.isLoading
            ? 'loading'
            : query.isError
              ? 'error'
              : 'ready'}
      summary={query.data.total > 0
        ? `${query.data.total}笔 · ${t('common:amount.income')} ${query.data.income} · ${t('common:amount.expend')} ${query.data.expend}`
        : undefined}
      title={t('search.title')}
      validateFilters={filters => validateRecordSearchState({
        filters,
        keyword: search.value,
      })}
      value={search.value}
    />
  );
}

export default SearchRecord;
