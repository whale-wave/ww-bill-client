import type { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LedgerCapability,
  LedgerMemberStatus,
  useLedgerMembersQuery,
  useLedgerQuery,
} from '@/entities/ledger';
import { useGetUserUserInfoQuery } from '@/entities/user';
import {
  CollaborationQueryState,
} from '@/features/ledger-collaboration';
import {
  useWorkspaceBack,
  WorkspaceNavHeader,
} from '@/features/workspace-navigation';
import { MemberCardsPresentation } from '@/features/workspace-settings';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';

const LedgerMembersPage: FC = () => {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const { ledgerId = '' } = useParams<{ ledgerId: string }>();
  const ledgerQuery = useLedgerQuery({
    params: { ledgerId },
    queryOptions: { enabled: Boolean(ledgerId) },
  });
  const userQuery = useGetUserUserInfoQuery({
    options: { enabled: Boolean(ledgerId) },
  });
  const onBack = useWorkspaceBack({
    capabilities: ledgerQuery.data?.capabilities,
    ledgerId,
    type: 'custom',
  });
  const canRead = ledgerQuery.data?.capabilities.includes(LedgerCapability.MEMBER_READ);
  const membersQuery = useLedgerMembersQuery({
    params: { ledgerId, status: LedgerMemberStatus.ACTIVE },
    queryOptions: { enabled: Boolean(ledgerId && canRead) },
  });
  const loading = ledgerQuery.isLoading
    || userQuery.isLoading
    || (canRead && membersQuery.isLoading);
  const error = ledgerQuery.isError
    || userQuery.isError
    || (canRead && membersQuery.isError);
  const currentMember = membersQuery.data.find(
    member => member.user.id === userQuery.data?.id,
  );
  const otherMembers = currentMember
    ? membersQuery.data.filter(member => member.id !== currentMember.id)
    : [];
  const toCard = (member: typeof membersQuery.data[number]) => ({
    avatar: member.user.avatar,
    badge: t(`role.${member.role}`),
    description: member.nickname || t('members.noNickname'),
    id: member.id,
    name: member.user.name || member.user.username || t('common.unknownUser'),
    onClick: () => navigate(
      ROUTES_PATH.LEDGER_MEMBER_DETAIL.getPath(ledgerId, member.id),
    ),
    userId: member.user.id,
  });

  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <WorkspaceNavHeader
        backLabel={t('common:nav.back')}
        onBack={onBack}
        title={t('members.title', { count: membersQuery.data.length })}
      />
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
              userQuery.refetch();
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
        {canRead && !loading && !error && !currentMember && (
          <CollaborationQueryState
            description={t('members.emptyDescription')}
            title={t('members.empty')}
            type="empty"
          />
        )}
        {canRead && !loading && !error && currentMember && (
          <MemberCardsPresentation
            current={{
              ...toCard(currentMember),
              isCurrent: true,
            }}
            others={otherMembers.map(toCard)}
            othersLabel={t('members.title', { count: otherMembers.length })}
          />
        )}
      </main>
    </div>
  );
};

export default LedgerMembersPage;
