import type { FC } from 'react';
import type { FamilyRecord } from '@/entities/household';
import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HouseholdStatus,
  useHouseholdRecordFilterOptionsQuery,
  useInfiniteHouseholdRecordsQuery,
  useMyHouseholdQuery,
} from '@/entities/household';
import { toHouseholdRecordOverviewGroups } from '@/features/household';
import {
  isRecordFilterActive,
  RecordSearchPresentation,
  toHouseholdRecordApiParams,
  useRecordSearchController,
  validateRecordSearchState,
} from '@/features/record-search';
import {
  useWorkspaceBack,
  WorkspaceCapsule,
} from '@/features/workspace-navigation';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';

const SearchContent: FC<{ householdId: string }> = ({ householdId }) => {
  const { i18n, t } = useTranslation('household');
  const navigate = useNavigate();
  const search = useRecordSearchController();
  const onBack = useWorkspaceBack({ householdId, type: 'household' });
  const scopeQuery = useMyHouseholdQuery({
    queryOptions: { enabled: Boolean(householdId) },
  });
  const isScopeReady = Boolean(
    householdId
    && scopeQuery.data?.id === householdId
    && scopeQuery.data.status !== HouseholdStatus.DISSOLVED
    && scopeQuery.data.status !== HouseholdStatus.PENDING_PARTNER,
  );
  const validation = validateRecordSearchState(search.debouncedState);
  const filterOptionsQuery = useHouseholdRecordFilterOptionsQuery({
    params: { householdId },
    queryOptions: { enabled: isScopeReady },
  });
  const query = useInfiniteHouseholdRecordsQuery({
    params: {
      filters: {
        ...toHouseholdRecordApiParams(search.debouncedState),
        limit: 50,
        offset: 0,
      },
      householdId,
    },
    queryOptions: {
      enabled: isScopeReady
        && search.isActive
        && Object.keys(validation).length === 0,
    },
  });

  const handleSelect = useCallback((record: FamilyRecord) => {
    navigate(ROUTES_PATH.HOUSEHOLD_RECORD_DETAIL.getPath(householdId, record.id));
  }, [householdId, navigate]);

  const groups = useMemo(() => toHouseholdRecordOverviewGroups(query.records, {
    countedLabel: t('records.counted'),
    dailyExpenseLabel: t('records.dailyExpense'),
    dailyIncomeLabel: t('records.dailyIncome'),
    dailyTotals: query.data?.daySummaries?.map(item => ({
      countedExpense: item.expense,
      countedIncome: item.income,
      date: item.date,
      recordCount: 0,
      visibleExpense: item.expense,
      visibleIncome: item.income,
    })),
    inheritedLabel: t('records.inherited'),
    locale: i18n.resolvedLanguage ?? i18n.language,
    memberLabel: name => t('records.memberAttribution', { name }),
    onSelect: handleSelect,
    privateLabel: t('records.private'),
    uncountedLabel: t('records.uncounted'),
  }), [
    handleSelect,
    i18n.language,
    i18n.resolvedLanguage,
    query.data?.daySummaries,
    query.records,
    t,
  ]);

  const summary = query.data?.total
    ? `${query.data.total}笔可见记录 · 计入家庭账单：${t('common.income')} ${query.data.summary.income} · ${t('common.expense')} ${query.data.summary.expense}`
    : undefined;

  return (
    <RecordSearchPresentation
      capsule={(
        <WorkspaceCapsule scope={{ householdId, type: 'household' }} />
      )}
      errorDescription={t('common.loadErrorDescription')}
      filterCapabilities={{
        category: filterOptionsQuery.data.capabilities.category,
        household: true,
        member: filterOptionsQuery.data.capabilities.member,
        tag: filterOptionsQuery.data.capabilities.tag,
      }}
      filterOptions={{
        categories: filterOptionsQuery.data.categories.map(item => ({
          id: item.id,
          label: item.name,
        })),
        members: filterOptionsQuery.data.members.map(member => ({
          id: member.user.id,
          label: member.nickname,
        })),
        tags: filterOptionsQuery.data.tags.map(item => ({
          id: item.id,
          label: item.status === 'ARCHIVED'
            ? `${item.name}（已归档）`
            : item.name,
        })),
      }}
      filters={search.filters}
      groups={groups}
      isFilterActive={isRecordFilterActive(search.filters)}
      isLoadingMore={query.isFetchingNextPage}
      loadMoreLabel={t('records.loadMore')}
      onBack={onBack}
      onFiltersConfirm={search.commitFilters}
      onKeywordChange={search.setValue}
      onLoadMore={query.hasNextPage
        ? () => void query.fetchNextPage()
        : undefined}
      onRetry={() => void (isScopeReady ? query.refetch() : scopeQuery.refetch())}
      placeholder={t('records.keywordPlaceholder')}
      retryLabel={t('common.retry')}
      state={scopeQuery.isLoading
        ? 'loading'
        : scopeQuery.isError || !isScopeReady
          ? 'error'
          : !search.isActive
              ? 'idle'
              : Object.keys(validation).length > 0
                ? 'idle'
                : search.isDebouncing || query.isLoading
                  ? 'loading'
                  : query.isError
                    ? 'error'
                    : 'ready'}
      summary={summary}
      title={t('records.searchTitle')}
      validateFilters={filters => validateRecordSearchState({
        filters,
        keyword: search.value,
      })}
      value={search.value}
    />
  );
};

const HouseholdRecordSearchPage: FC = () => {
  const { householdId = '' } = useParams<{ householdId: string }>();
  return <SearchContent householdId={householdId} />;
};

export default HouseholdRecordSearchPage;
