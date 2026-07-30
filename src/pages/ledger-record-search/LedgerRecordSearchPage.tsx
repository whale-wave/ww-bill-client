import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LedgerCapability } from '@/entities/ledger';
import {
  createLedgerRecordDetailState,
  RecordSearchPresentation,
  toRecordSearchGroups,
  useLedgerRecordsQuery,
} from '@/entities/record';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { useRecordSearchController } from '@/features/record-search';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';

export default function LedgerRecordSearchPage() {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const search = useRecordSearchController();
  return (
    <LedgerScopeBoundary capability={LedgerCapability.RECORD_READ}>
      {({ ledgerId }) => (
        <ScopedLedgerSearch
          debouncedKeyword={search.debouncedValue}
          isDebouncing={search.isDebouncing}
          keyword={search.value}
          ledgerId={ledgerId}
          onBack={() => navigate(-1)}
          onChange={search.setValue}
          placeholder={t('records.search')}
        />
      )}
    </LedgerScopeBoundary>
  );
}

interface ScopedLedgerSearchProps {
  debouncedKeyword: string;
  isDebouncing: boolean;
  keyword: string;
  ledgerId: string;
  onBack: () => void;
  onChange: (value: string) => void;
  placeholder: string;
}

function ScopedLedgerSearch({
  debouncedKeyword,
  isDebouncing,
  keyword,
  ledgerId,
  onBack,
  onChange,
  placeholder,
}: ScopedLedgerSearchProps) {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const query = useLedgerRecordsQuery({
    params: {
      filters: debouncedKeyword ? { keyword: debouncedKeyword } : undefined,
      ledgerId,
    },
    queryOptions: { enabled: Boolean(debouncedKeyword) },
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
      groups={groups}
      onBack={onBack}
      onKeywordChange={onChange}
      onRetry={() => void query.refetch()}
      placeholder={placeholder}
      retryLabel={t('common.retry')}
      state={!keyword
        ? 'idle'
        : isDebouncing || query.isLoading
          ? 'loading'
          : query.isError
            ? 'error'
            : 'ready'}
      value={keyword}
    />
  );
}
