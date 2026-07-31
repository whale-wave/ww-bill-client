import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LedgerCapability } from '@/entities/ledger';
import {
  createLedgerRecordDetailState,
  toRecordSearchGroups,
  useLedgerRecordsQuery,
  useRecordFilterOptionsQuery,
} from '@/entities/record';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
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
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';

export default function LedgerRecordSearchPage() {
  const { t } = useTranslation('ledger');
  const search = useRecordSearchController();
  return (
    <LedgerScopeBoundary capability={LedgerCapability.RECORD_READ}>
      {({ ledger, ledgerId }) => (
        <ScopedLedgerSearch
          capabilities={ledger.capabilities}
          ledgerId={ledgerId}
          placeholder={t('records.search')}
          search={search}
        />
      )}
    </LedgerScopeBoundary>
  );
}

interface ScopedLedgerSearchProps {
  capabilities: readonly LedgerCapability[];
  ledgerId: string;
  placeholder: string;
  search: ReturnType<typeof useRecordSearchController>;
}

function ScopedLedgerSearch({
  capabilities,
  ledgerId,
  placeholder,
  search,
}: ScopedLedgerSearchProps) {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const onBack = useWorkspaceBack({ capabilities, ledgerId, type: 'custom' });
  const optionsQuery = useRecordFilterOptionsQuery({
    params: { ledgerId },
    queryOptions: { enabled: Boolean(ledgerId) },
  });
  const filters = toCommonRecordSearchFilters(search.filters);
  const state = { ...search.state, filters };
  const debouncedState = { ...search.debouncedState, filters };
  const isActive = isCommonRecordSearchActive(state);
  const validation = validateRecordSearchState(debouncedState);
  const query = useLedgerRecordsQuery({
    params: {
      filters: toRecordApiParams(debouncedState),
      ledgerId,
    },
    queryOptions: {
      enabled: isActive && Object.keys(validation).length === 0,
    },
  });
  const groups = useMemo(() => toRecordSearchGroups(query.data.data, {
    expenseLabel: t('home.expense'),
    incomeLabel: t('home.income'),
    onRecordClick: record =>
      navigate(
        ROUTES_PATH.LEDGER_RECORD_DETAIL.getPath(ledgerId, record.id),
        { state: createLedgerRecordDetailState(record, ledgerId) },
      ),
    showCategoryAsSecondary: true,
  }), [ledgerId, navigate, query.data.data, t]);

  return (
    <RecordSearchPresentation
      errorDescription={t('common.loadErrorDescription')}
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
      placeholder={placeholder}
      retryLabel={t('common.retry')}
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
        ? `${query.data.total}笔 · ${t('home.income')} ${query.data.income} · ${t('home.expense')} ${query.data.expend}`
        : undefined}
      title={t('records.search')}
      validateFilters={filters => validateRecordSearchState({
        filters,
        keyword: search.value,
      })}
      value={search.value}
    />
  );
}
