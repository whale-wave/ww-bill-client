import type { FC } from 'react';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LedgerCapability,
  LedgerJoinRequestStatus,
  useLedgerJoinRequestsQuery,
  useLedgerQuery,
} from '@/entities/ledger';
import {
  CollaborationQueryState,
  CollaborationStatusBadge,
  LedgerUserRow,
} from '@/features/ledger-collaboration';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { GradientPanel, PageHeader } from '@/shared/ui';

const LedgerJoinRequestsPage: FC = () => {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const { ledgerId = '' } = useParams<{ ledgerId: string }>();
  const ledgerQuery = useLedgerQuery({
    params: { ledgerId },
    queryOptions: { enabled: Boolean(ledgerId) },
  });
  const canReview = ledgerQuery.data?.capabilities.includes(
    LedgerCapability.MEMBER_REVIEW,
  );
  const requestsQuery = useLedgerJoinRequestsQuery({
    params: { ledgerId },
    queryOptions: { enabled: Boolean(ledgerId && canReview) },
  });
  const groups = useMemo(() => ({
    history: requestsQuery.data.filter(
      request => request.status !== LedgerJoinRequestStatus.PENDING,
    ),
    pending: requestsQuery.data.filter(
      request => request.status === LedgerJoinRequestStatus.PENDING,
    ),
  }), [requestsQuery.data]);
  const loading = ledgerQuery.isLoading || (canReview && requestsQuery.isLoading);
  const error = ledgerQuery.isError || (canReview && requestsQuery.isError);

  const renderGroup = (
    title: string,
    requests: typeof requestsQuery.data,
  ) => requests.length > 0 && (
    <GradientPanel className="overflow-hidden px-0 py-0" elevation="low" surface="glass">
      <h2 className="px-4 pb-2 pt-3 text-[11px] font-extrabold tracking-[0.4px] text-ww-mid">{title}</h2>
      {requests.map(request => (
        <LedgerUserRow
          fallback={t('common.unknownUser')}
          key={request.id}
          onClick={() => navigate(
            ROUTES_PATH.LEDGER_JOIN_REQUEST_DETAIL.getPath(ledgerId, request.id),
          )}
          secondary={request.applicantRemark}
          trailing={(
            <CollaborationStatusBadge
              label={t(`joinRequestStatus.${request.status}`)}
              status={request.status}
            />
          )}
          user={request.applicant}
        />
      ))}
    </GradientPanel>
  );

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-20 h-56 w-56 rounded-full bg-primary-light/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-16 h-52 w-52 rounded-full bg-ww-pink-light/25 blur-3xl" />
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={() => navigate(-1)}
        subtitle={t('requests.subtitle')}
        title={t('requests.title')}
      />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-6">
        <div className="mx-auto w-full max-w-[520px]">
          {!ledgerId && (
            <CollaborationQueryState
              description={t('common.invalidLedgerDescription')}
              title={t('common.invalidLedger')}
              type="invalid"
            />
          )}
          {ledgerId && loading && (
            <CollaborationQueryState title={t('requests.loading')} type="loading" />
          )}
          {ledgerId && error && (
            <CollaborationQueryState
              description={t('requests.loadErrorDescription')}
              onRetry={() => {
                ledgerQuery.refetch();
                if (canReview)
                  requestsQuery.refetch();
              }}
              retryLabel={t('common.retry')}
              title={t('requests.loadError')}
              type="error"
            />
          )}
          {ledgerQuery.data && !canReview && (
            <CollaborationQueryState
              description={t('common.noPermissionDescription')}
              title={t('common.noPermission')}
              type="permission"
            />
          )}
          {canReview && !loading && !error && !requestsQuery.data.length && (
            <CollaborationQueryState
              description={t('requests.emptyDescription')}
              title={t('requests.empty')}
              type="empty"
            />
          )}
          {canReview && !loading && !error && requestsQuery.data.length > 0 && (
            <div className="space-y-4 pt-2">
              {renderGroup(t('requests.pending'), groups.pending)}
              {renderGroup(t('requests.history'), groups.history)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LedgerJoinRequestsPage;
