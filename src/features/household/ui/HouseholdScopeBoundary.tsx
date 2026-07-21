import type { FC, ReactNode } from 'react';
import type { Household } from '@/entities/household';
import { ErrorBlock } from 'antd-mobile';
import { HouseholdStatus, useMyHouseholdQuery } from '@/entities/household';
import { useTranslation } from '@/shared/i18n';
import { HouseholdPageState } from './HouseholdPageState';

interface HouseholdScopeBoundaryProps {
  allowPending?: boolean;
  children: (household: Household) => ReactNode;
  householdId: string;
}

export const HouseholdScopeBoundary: FC<HouseholdScopeBoundaryProps> = ({
  allowPending = false,
  children,
  householdId,
}) => {
  const { t } = useTranslation('household');
  const query = useMyHouseholdQuery({
    queryOptions: { enabled: Boolean(householdId) },
  });

  if (!householdId) {
    return (
      <div className="flex min-h-[360px] items-center justify-center px-4">
        <ErrorBlock status="default" title={t('common.invalidContext')} />
      </div>
    );
  }

  return (
    <HouseholdPageState
      errorDescription={t('common.loadErrorDescription')}
      errorTitle={t('common.loadError')}
      isError={query.isError}
      isLoading={query.isLoading}
      loadingLabel={t('common.loading')}
      onRetry={() => void query.refetch()}
      retryLabel={t('common.retry')}
    >
      {!query.data || query.data.id !== householdId
        ? (
            <div className="flex min-h-[360px] items-center justify-center px-4">
              <ErrorBlock
                description={t('common.notCurrentHousehold')}
                status="default"
                title={t('common.invalidContext')}
              />
            </div>
          )
        : query.data.status === HouseholdStatus.DISSOLVED
          ? (
              <div className="flex min-h-[360px] items-center justify-center px-4">
                <ErrorBlock status="empty" title={t('common.dissolved')} />
              </div>
            )
          : query.data.status === HouseholdStatus.PENDING_PARTNER && !allowPending
            ? (
                <div className="flex min-h-[360px] items-center justify-center px-4">
                  <ErrorBlock
                    description={t('entry.pendingDescription')}
                    status="empty"
                    title={t('entry.pending')}
                  />
                </div>
              )
            : children(query.data)}
    </HouseholdPageState>
  );
};
