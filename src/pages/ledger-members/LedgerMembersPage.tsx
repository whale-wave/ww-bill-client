import type { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LedgerCapability,
  LedgerMemberStatus,
  useLedgerMembersQuery,
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

const LedgerMembersPage: FC = () => {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const { ledgerId = '' } = useParams<{ ledgerId: string }>();
  const ledgerQuery = useLedgerQuery({
    params: { ledgerId },
    queryOptions: { enabled: Boolean(ledgerId) },
  });
  const canRead = ledgerQuery.data?.capabilities.includes(LedgerCapability.MEMBER_READ);
  const membersQuery = useLedgerMembersQuery({
    params: { ledgerId, status: LedgerMemberStatus.ACTIVE },
    queryOptions: { enabled: Boolean(ledgerId && canRead) },
  });
  const loading = ledgerQuery.isLoading || (canRead && membersQuery.isLoading);
  const error = ledgerQuery.isError || (canRead && membersQuery.isError);

  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} onBack={() => navigate(-1)}>
        {t('members.title', { count: membersQuery.data.length })}
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
          <CollaborationQueryState title={t('members.loading')} type="loading" />
        )}
        {ledgerId && error && (
          <CollaborationQueryState
            description={t('members.loadErrorDescription')}
            onRetry={() => {
              ledgerQuery.refetch();
              if (canRead)
                membersQuery.refetch();
            }}
            retryLabel={t('common.retry')}
            title={t('members.loadError')}
            type="error"
          />
        )}
        {ledgerQuery.data && !canRead && (
          <CollaborationQueryState
            description={t('common.noPermissionDescription')}
            title={t('common.noPermission')}
            type="permission"
          />
        )}
        {canRead && !loading && !error && !membersQuery.data.length && (
          <CollaborationQueryState
            description={t('members.emptyDescription')}
            title={t('members.empty')}
            type="empty"
          />
        )}
        {canRead && !loading && !error && membersQuery.data.length > 0 && (
          <section className="mt-3 bg-white">
            {membersQuery.data.map(member => (
              <LedgerUserRow
                fallback={t('common.unknownUser')}
                key={member.id}
                onClick={() => navigate(
                  ROUTES_PATH.LEDGER_MEMBER_DETAIL.getPath(ledgerId, member.id),
                )}
                secondary={`${member.nickname || t('members.noNickname')} · ${t(`role.${member.role}`)}`}
                testId={`member-${member.id}`}
                trailing={(
                  <CollaborationStatusBadge
                    label={t(`memberStatus.${member.status}`)}
                    status={member.status}
                  />
                )}
                user={member.user}
              />
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default LedgerMembersPage;
