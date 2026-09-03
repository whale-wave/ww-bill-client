import type { FC, ReactNode } from 'react';
import type { Household } from '@/entities/household';
import { ErrorBlock } from 'antd-mobile';
import { CircleAlert, CircleCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HouseholdStatus, useMyHouseholdQuery } from '@/entities/household';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { IllustratedEmptyState, Surface } from '@/shared/ui';
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
  const navigate = useNavigate();
  const query = useMyHouseholdQuery({
    queryOptions: { enabled: Boolean(householdId) },
  });

  const handleBackToEntry = () => {
    navigate(ROUTES_PATH.HOUSEHOLD.getPath(), { replace: true });
  };

  if (!householdId) {
    return (
      <div className="flex min-h-[360px] items-center justify-center px-4">
        <ErrorBlock status="default" title={t('invalid.title')} />
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
            <div className="mx-auto w-full max-w-[520px] px-[18px] py-6">
              <Surface className="overflow-hidden" material="content">
                <IllustratedEmptyState
                  actionLabel={t('invalid.action')}
                  description={t('invalid.description')}
                  icon={<CircleAlert className="text-primary-deep" size={38} strokeWidth={1.8} />}
                  onAction={handleBackToEntry}
                  title={t('invalid.title')}
                />
              </Surface>
            </div>
          )
        : query.data.status === HouseholdStatus.DISSOLVED
          ? (
              <div className="mx-auto w-full max-w-[520px] px-[18px] py-6">
                <Surface className="overflow-hidden" material="content">
                  <IllustratedEmptyState
                    actionLabel={t('invalid.action')}
                    description={t('invalid.description')}
                    icon={<CircleCheck className="text-primary-deep" size={38} strokeWidth={1.8} />}
                    onAction={handleBackToEntry}
                    title={t('common.dissolved')}
                  />
                </Surface>
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
