import type { FC } from 'react';
import { ChevronRight, ClipboardList, UserPlus } from 'lucide-react';
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
} from '@/features/workspace-navigation';
import { MemberCardsPresentation } from '@/features/workspace-settings';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { GradientPanel, PageHeader } from '@/shared/ui';

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
  const canInvite = ledgerQuery.data?.capabilities.includes(LedgerCapability.MEMBER_INVITE);
  const canReview = ledgerQuery.data?.capabilities.includes(LedgerCapability.MEMBER_REVIEW);
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
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-20 h-56 w-56 rounded-full bg-primary-light/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-16 h-52 w-52 rounded-full bg-ww-pink-light/25 blur-3xl" />
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={onBack}
        subtitle={t('members.subtitle')}
        title={t('members.title', { count: membersQuery.data.length })}
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
            <>
              <MemberCardsPresentation
                current={{
                  ...toCard(currentMember),
                  isCurrent: true,
                }}
                currentLabel={t('members.currentTitle')}
                others={otherMembers.map(toCard)}
                othersLabel={t('members.others')}
              />
              {canReview && (
                <GradientPanel
                  className="flex items-center gap-3 px-4 py-3.5"
                  elevation="low"
                  surface="glass"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-primary-light/65 text-primary-deep shadow-ww-xs">
                    <ClipboardList size={20} strokeWidth={1.8} />
                  </span>
                  <button
                    className="flex min-w-0 flex-grow items-center justify-between border-0 bg-transparent p-0 text-left"
                    data-testid="ledger-members-requests"
                    onClick={() => navigate(ROUTES_PATH.LEDGER_JOIN_REQUESTS.getPath(ledgerId))}
                    type="button"
                  >
                    <span className="min-w-0">
                      <span className="block text-[13px] font-black text-ww-ink">
                        {t('members.requests')}
                      </span>
                      <span className="mt-0.5 block text-[10px] font-semibold text-ww-mid">
                        {t('members.requestsDescription')}
                      </span>
                    </span>
                    <ChevronRight className="ml-2 shrink-0 text-[#9eb1bd]" size={18} />
                  </button>
                </GradientPanel>
              )}
            </>
          )}
        </div>
      </main>
      {ledgerQuery.data && canInvite && (
        <div className="relative z-[2] shrink-0 bg-[linear-gradient(180deg,rgba(244,251,255,0)_0%,rgba(244,251,255,0.88)_40%,rgba(244,251,255,0.97)_100%)] px-[18px] pb-[max(16px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-[520px]">
            <button
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[18px] border-0 bg-primary text-[14px] font-extrabold text-white shadow-ww disabled:opacity-45"
              data-testid="ledger-members-invite"
              onClick={() => navigate(ROUTES_PATH.LEDGER_INVITES.getPath(ledgerId))}
              type="button"
            >
              <UserPlus size={18} />
              {t('members.invite')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LedgerMembersPage;
