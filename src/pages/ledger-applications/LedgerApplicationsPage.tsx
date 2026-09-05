import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LedgerJoinRequestStatus,
  useMyJoinRequestsQuery,
} from '@/entities/ledger';
import {
  CollaborationQueryState,
  CollaborationStatusBadge,
  LedgerSummaryBlock,
} from '@/features/ledger-collaboration';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { formatLocalizedDateTime } from '@/shared/lib';
import { PageHeader } from '@/shared/ui';

const LedgerApplicationsPage: FC = () => {
  const { i18n, t } = useTranslation('ledger');
  const locale = i18n?.resolvedLanguage ?? i18n?.language ?? 'zh-CN';
  const navigate = useNavigate();
  const query = useMyJoinRequestsQuery();

  return (
    <div className="page-new relative overflow-hidden" data-ledger-applications-page>
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={() => navigate(-1)}
        title={t('applications.title')}
      />
      <main className="relative z-10 min-h-0 flex-grow overflow-y-auto px-[var(--ww-page-gutter)] pb-[max(24px,env(safe-area-inset-bottom))] pt-1">
        {query.isLoading && (
          <CollaborationQueryState title={t('applications.loading')} type="loading" />
        )}
        {query.isError && (
          <div className="rounded-[var(--ww-card-radius)] border border-solid border-border-primary bg-ww-surface-raised shadow-ww-xs">
            <CollaborationQueryState
              description={t('applications.loadErrorDescription')}
              onRetry={() => query.refetch()}
              retryLabel={t('common.retry')}
              title={t('applications.loadError')}
              type="error"
            />
          </div>
        )}
        {!query.isLoading && !query.isError && !query.data.length && (
          <div className="rounded-[var(--ww-card-radius)] border border-solid border-border-primary bg-ww-surface-raised shadow-ww-xs">
            <CollaborationQueryState
              description={t('applications.emptyDescription')}
              title={t('applications.empty')}
              type="empty"
            />
          </div>
        )}
        {!query.isLoading && !query.isError && query.data.length > 0 && (
          <div className="space-y-3">
            {query.data.map(request => (
              <button
                className="block w-full overflow-hidden rounded-[var(--ww-card-radius)] border border-solid border-border-primary bg-ww-surface-raised p-0 text-left shadow-ww-xs transition active:bg-primary-light/25"
                disabled={request.status !== LedgerJoinRequestStatus.APPROVED}
                key={request.id}
                onClick={() => navigate(ROUTES_PATH.LEDGER_DETAIL.getPath(request.ledger.id))}
                type="button"
              >
                <LedgerSummaryBlock ledger={request.ledger} />
                <div className="flex items-center justify-between border-0 border-t border-solid border-border-primary px-4 py-3">
                  <div className="min-w-0 pr-3">
                    <p className="one-line text-sm text-font-black">{request.applicantRemark}</p>
                    <p className="mt-1 text-xs text-font-gray">
                      {formatLocalizedDateTime(request.createdAt, locale)}
                    </p>
                  </div>
                  <CollaborationStatusBadge
                    label={t(`joinRequestStatus.${request.status}`)}
                    status={request.status}
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default LedgerApplicationsPage;
