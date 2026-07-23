import type { FC } from 'react';
import type { FamilyRecord, GetHouseholdRecordsApiParams } from '@/entities/household';
import { Button, ErrorBlock } from 'antd-mobile';
import { useMemo } from 'react';
import { useInfiniteHouseholdRecordsQuery } from '@/entities/household';
import { RecordList } from '@/entities/record';
import { useTranslation } from '@/shared/i18n';
import {
  formatFamilyRecordDate,
  getFamilyRecordSubtitle,
  groupFamilyRecords,
} from '../model';
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
  const groups = useMemo(() => groupFamilyRecords(query.records), [query.records]);
  const recordsById = useMemo(
    () => new Map(query.records.map(record => [record.id, record])),
    [query.records],
  );

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
              <div className="bg-white">
                {groups.map(group => (
                  <RecordList
                    data={group}
                    dateLabel={formatFamilyRecordDate(group.date)}
                    getRecordSubtitle={record => (
                      recordsById.has(record.id)
                        ? getFamilyRecordSubtitle(recordsById.get(record.id)!)
                        : undefined
                    )}
                    includeRecordInTotals={record => recordsById.get(record.id)?.counted ?? false}
                    key={group.date}
                    onRecordClick={record => onSelect?.(recordsById.get(record.id)!)}
                  />
                ))}
              </div>
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
