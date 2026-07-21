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
} from '@/pages/ledger-collaboration/ui';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';

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
    <section className="mt-3 bg-white">
      <h2 className="px-4 pb-2 pt-3 text-sm font-medium text-font-black">{title}</h2>
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
    </section>
  );

  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} onBack={() => navigate(-1)}>
        {t('requests.title')}
      </NavBar>
      <main className="min-h-0 flex-grow overflow-auto pb-6">
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
          <>
            {renderGroup(t('requests.pending'), groups.pending)}
            {renderGroup(t('requests.history'), groups.history)}
          </>
        )}
      </main>
    </div>
  );
};

export default LedgerJoinRequestsPage;
