import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RecordSearchPresentation,
  toRecordSearchGroups,
  useGetRecordQuery,
} from '@/entities/record';
import { useRecordSearchController } from '@/features/record-search';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';

function SearchRecord() {
  const { t } = useTranslation('record');
  const navigate = useNavigate();
  const search = useRecordSearchController();
  const query = useGetRecordQuery({
    params: { keyword: search.debouncedValue },
    options: { enabled: Boolean(search.debouncedValue) },
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
      groups={groups}
      onBack={() => navigate(-1)}
      onKeywordChange={search.setValue}
      onRetry={() => void query.refetch()}
      placeholder={t('search.placeholder')}
      retryLabel={t('common:button.retry')}
      state={!search.value
        ? 'idle'
        : search.isDebouncing || query.isLoading
          ? 'loading'
          : query.isError
            ? 'error'
            : 'ready'}
      value={search.value}
    />
  );
}

export default SearchRecord;
