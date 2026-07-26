import type { FC } from 'react';
import type { FamilyRecord, GetHouseholdRecordsApiParams } from '@/entities/household';
import { Button, ErrorBlock } from 'antd-mobile';
import { useInfiniteHouseholdRecordsQuery } from '@/entities/household';
import { useTranslation } from '@/shared/i18n';
import { FamilyRecordList } from './FamilyRecordList';
import { HouseholdPageState } from './HouseholdPageState';
import { HouseholdSummaryCard } from './HouseholdSummaryCard';

interface HouseholdRecordsPanelProps {
  emptyDescription?: string;
  filters?: GetHouseholdRecordsApiParams;
  householdId: string;
  onSelect?: (record: FamilyRecord) => void;
  showSummary?: boolean;
}

const PAGE_SIZE = 50;

export const HouseholdRecordsPanel: FC<HouseholdRecordsPanelProps> = ({
  emptyDescription,
  filters,
  householdId,
  onSelect,
  showSummary = true,
}) => {
  const { t } = useTranslation('household');
  const pageSize = Math.min(filters?.limit ?? PAGE_SIZE, 100);
  const query = useInfiniteHouseholdRecordsQuery({
    params: {
      filters: { ...filters, limit: pageSize, offset: 0 },
      householdId,
    },
    queryOptions: { enabled: Boolean(householdId) },
  });
  const total = query.data?.total ?? 0;

  return (
    <HouseholdPageState
      errorDescription={t('common.loadErrorDescription')}
      errorTitle={t('common.loadError')}
      isError={query.isError && query.records.length === 0}
      isLoading={query.isLoading && query.records.length === 0}
      loadingLabel={t('common.loading')}
      onRetry={() => void query.refetch()}
      retryLabel={t('common.retry')}
    >
      <div className="space-y-3">
        {showSummary && (
          <HouseholdSummaryCard
            expenseLabel={t('common.expense')}
            incomeLabel={t('common.income')}
            netLabel={t('common.net')}
            summary={query.data?.summary}
          />
        )}
        <p className="text-center text-xs text-font-gray">
          {t('records.total', { count: total })}
        </p>
        {query.records.length === 0 && emptyDescription
          ? (
              <ErrorBlock
                description={emptyDescription}
                status="empty"
                title={t('home.empty')}
              />
            )
          : (
              <FamilyRecordList
                countedLabel={t('records.counted')}
                emptyLabel={t('records.empty')}
                inheritedLabel={t('records.inherited')}
                memberLabel={name => t('records.memberAttribution', { name })}
                onSelect={onSelect}
                privateLabel={t('records.private')}
                records={query.records}
                uncountedLabel={t('records.uncounted')}
              />
            )}
        {query.hasNextPage && (
          <Button
            block
            data-testid="household-records-load-more"
            loading={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
          >
            {t('records.loadMore')}
          </Button>
        )}
      </div>
    </HouseholdPageState>
  );
};
