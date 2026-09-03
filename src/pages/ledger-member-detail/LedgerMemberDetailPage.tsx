import type { FC, FormEvent } from 'react';
import { Toast } from 'antd-mobile';
import { Check, ChevronRight, Crown, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LedgerCapability,
  LedgerMemberStatus,
  LedgerRole,
  LedgerStatus,
  useLedgerMembersQuery,
  useLedgerQuery,
  useRemoveLedgerMemberMutation,
  useTransferLedgerOwnershipMutation,
  useUpdateLedgerMemberMutation,
} from '@/entities/ledger';
import { useGetUserUserInfoQuery } from '@/entities/user';
import {
  canEditMemberNickname,
  canEditMemberRole,
  CollaborationQueryState,
  getAssignableRoles,
  getErrorMessage,
  validateMemberPatch,
} from '@/features/ledger-collaboration';
import {
  useWorkspaceBack,
} from '@/features/workspace-navigation';
import { MemberEditorPresentation } from '@/features/workspace-settings';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { formatLocalizedDateTime } from '@/shared/lib';
import {
  ActionField,
  AppBottomSheet,
  confirmAppAction,
  ContentStack,
  FormField,
  PageHeader,
  Surface,
} from '@/shared/ui';

function isConflict(error: unknown) {
  return typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409;
}

function StaticInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div data-testid="member-static-row">
      <span className="block text-[12px] font-bold text-ww-mid">{label}</span>
      <span className="mt-2 block text-[14px] font-semibold text-ww-ink">{value}</span>
    </div>
  );
}

const LedgerMemberDetailPage: FC = () => {
  const { i18n, t } = useTranslation('ledger');
  const locale = i18n?.resolvedLanguage ?? i18n?.language ?? 'zh-CN';
  const navigate = useNavigate();
  const { ledgerId = '', memberId = '' } = useParams<{
    ledgerId: string;
    memberId: string;
  }>();
  const ledgerQuery = useLedgerQuery({
    params: { ledgerId },
    queryOptions: { enabled: Boolean(ledgerId) },
  });
  const onBack = useWorkspaceBack({
    capabilities: ledgerQuery.data?.capabilities,
    ledgerId,
    type: 'custom',
  });
  const canRead = ledgerQuery.data?.capabilities.includes(LedgerCapability.MEMBER_READ);
  const membersQuery = useLedgerMembersQuery({
    params: { ledgerId, status: LedgerMemberStatus.ACTIVE },
    queryOptions: { enabled: Boolean(ledgerId && memberId && canRead) },
  });
  const userQuery = useGetUserUserInfoQuery({
    options: { enabled: Boolean(ledgerId && memberId) },
  });
  const [updateMember, mutation] = useUpdateLedgerMemberMutation();
  const [removeMember, removeMutation] = useRemoveLedgerMemberMutation();
  const [transferOwnership, transferMutation] = useTransferLedgerOwnershipMutation();
  const member = membersQuery.data.find(item => item.id === memberId);
  const currentMember = membersQuery.data.find(item => item.user.id === userQuery.data?.id);
  const [nicknameOverride, setNicknameOverride] = useState<string>();
  const [roleOverride, setRoleOverride] = useState<LedgerRole>();
  const [roleSheetOpen, setRoleSheetOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const submittingRef = useRef(false);

  const nickname = nicknameOverride ?? member?.nickname ?? '';
  const role = roleOverride ?? member?.role ?? LedgerRole.VIEWER;
  const isWritable = ledgerQuery.data?.status === LedgerStatus.ACTIVE;

  const canManageRole = Boolean(
    isWritable
    && member
    && ledgerQuery.data?.capabilities.includes(LedgerCapability.MEMBER_MANAGE)
    && canEditMemberRole(ledgerQuery.data.myRole, member.role),
  );
  const canEditNickname = Boolean(
    isWritable && member && canEditMemberNickname(
      userQuery.data?.id,
      member.user.id,
      ledgerQuery.data?.capabilities ?? [],
    ),
  );
  const canRemove = Boolean(
    isWritable
    && member
    && member.user.id !== userQuery.data?.id
    && ledgerQuery.data?.capabilities.includes(LedgerCapability.MEMBER_MANAGE)
    && canEditMemberRole(ledgerQuery.data.myRole, member.role),
  );
  const canTransferOwnership = Boolean(
    isWritable
    && member
    && currentMember
    && member.user.id !== userQuery.data?.id
    && member.role !== LedgerRole.OWNER
    && ledgerQuery.data?.myRole === LedgerRole.OWNER
    && ledgerQuery.data.capabilities.includes(LedgerCapability.OWNERSHIP_TRANSFER),
  );
  const assignableRoles = getAssignableRoles(ledgerQuery.data?.myRole);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!member || submittingRef.current)
      return;
    let data: ReturnType<typeof validateMemberPatch>;
    try {
      data = validateMemberPatch({
        initialNickname: member.nickname,
        initialRole: member.role,
        nickname,
        role,
        version: member.version,
      });
    }
    catch (error) {
      const key = error instanceof Error ? error.message : 'invalid';
      setErrorMessage(t(`memberDetail.validation.${key}`));
      return;
    }
    if (!canEditNickname)
      delete data.nickname;
    if (!canManageRole)
      delete data.role;
    if (data.nickname === undefined && data.role === undefined) {
      setErrorMessage(t('memberDetail.validation.noPermissionChanges'));
      return;
    }

    submittingRef.current = true;
    setErrorMessage('');
    try {
      await updateMember({ data, ledgerId, memberId });
      setNicknameOverride(undefined);
      setRoleOverride(undefined);
      Toast.show({ content: t('memberDetail.saved'), icon: 'success' });
    }
    catch (error) {
      const message = getErrorMessage(error, t('memberDetail.saveFailed'));
      setErrorMessage(message);
      Toast.show({ content: message });
    }
    finally {
      submittingRef.current = false;
    }
  };

  const handleRemove = async () => {
    if (!member || !canRemove || submittingRef.current)
      return;
    const confirmed = await confirmAppAction({
      cancelText: t('common.cancel'),
      confirmText: t('memberDetail.removeConfirmAction'),
      description: t('memberDetail.removeConfirmDescription'),
      icon: <Trash2 size={22} strokeWidth={1.8} />,
      title: t('memberDetail.removeConfirmTitle'),
      tone: 'danger',
    });
    if (!confirmed)
      return;
    submittingRef.current = true;
    try {
      await removeMember({ ledgerId, memberId, version: member.version });
      Toast.show({ content: t('memberDetail.removed'), icon: 'success' });
      navigate(ROUTES_PATH.LEDGER_MEMBERS.getPath(ledgerId), { replace: true });
    }
    catch (error) {
      if (isConflict(error))
        await membersQuery.refetch();
      Toast.show({ content: t('memberDetail.removeFailed'), icon: 'fail' });
    }
    finally {
      submittingRef.current = false;
    }
  };

  const handleTransferOwnership = async () => {
    if (!member || !currentMember || !canTransferOwnership || submittingRef.current)
      return;
    const confirmed = await confirmAppAction({
      cancelText: t('common.cancel'),
      confirmText: t('memberDetail.transferConfirmAction'),
      description: t('memberDetail.transferConfirmDescription'),
      icon: <Crown size={22} strokeWidth={1.8} />,
      title: t('memberDetail.transferConfirmTitle'),
      tone: 'warning',
    });
    if (!confirmed)
      return;
    submittingRef.current = true;
    try {
      await transferOwnership({
        data: {
          ownerVersion: currentMember.version,
          targetMemberId: member.id,
          targetVersion: member.version,
        },
        ledgerId,
      });
      Toast.show({ content: t('memberDetail.transferred'), icon: 'success' });
      navigate(ROUTES_PATH.LEDGER_MEMBERS.getPath(ledgerId), { replace: true });
    }
    catch (error) {
      if (isConflict(error)) {
        await Promise.all([ledgerQuery.refetch(), membersQuery.refetch()]);
      }
      Toast.show({ content: t('memberDetail.transferFailed'), icon: 'fail' });
    }
    finally {
      submittingRef.current = false;
    }
  };

  const loading = ledgerQuery.isLoading || (canRead && membersQuery.isLoading);
  const error = ledgerQuery.isError || (canRead && membersQuery.isError);

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-20 h-56 w-56 rounded-full bg-primary-light/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-16 h-52 w-52 rounded-full bg-ww-pink-light/25 blur-3xl" />
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={onBack}
        subtitle={t('memberDetail.subtitle')}
        title={t('memberDetail.title')}
      />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-6">
        <div className="mx-auto w-full max-w-[520px]">
          {(!ledgerId || !memberId) && (
            <CollaborationQueryState
              description={t('memberDetail.invalidDescription')}
              title={t('memberDetail.invalid')}
              type="invalid"
            />
          )}
          {ledgerId && memberId && loading && (
            <CollaborationQueryState title={t('members.loading')} type="loading" />
          )}
          {ledgerId && memberId && error && (
            <CollaborationQueryState
              description={t('members.loadErrorDescription')}
              onRetry={() => {
                ledgerQuery.refetch();
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
          {canRead && !loading && !error && !member && (
            <CollaborationQueryState
              description={t('memberDetail.notFoundDescription')}
              title={t('memberDetail.notFound')}
              type="empty"
            />
          )}
          {member && !loading && !error && (
            <form onSubmit={handleSubmit}>
              <MemberEditorPresentation
                member={{
                  avatar: member.user.avatar,
                  badge: t(`role.${member.role}`),
                  description: t('memberDetail.joinedAtValue', {
                    date: formatLocalizedDateTime(member.joinedAt, locale),
                  }),
                  id: member.id,
                  name: member.user.name || member.user.username || t('common.unknownUser'),
                  user: member.user,
                  userId: member.user.id,
                }}
              >
                <ContentStack>
                  {canEditNickname
                    ? (
                        <FormField
                          id="member-nickname"
                          label={t('memberDetail.nickname')}
                          maxLength={30}
                          onChange={setNicknameOverride}
                          value={nickname}
                        />
                      )
                    : (
                        <StaticInfoRow label={t('memberDetail.nickname')} value={nickname || '-'} />
                      )}
                  {canManageRole
                    ? (
                        <ActionField
                          label={t('memberDetail.role')}
                          onClick={() => setRoleSheetOpen(true)}
                          testId="member-role-row"
                          value={t(`role.${role}`)}
                        />
                      )
                    : (
                        <StaticInfoRow label={t('memberDetail.role')} value={t(`role.${role}`)} />
                      )}
                  <p className="text-[11px] font-semibold leading-4 text-ww-soft">{t('memberDetail.capabilityHint', { count: member.capabilities.length })}</p>
                  {errorMessage && <p className="text-[12px] font-bold text-feedback-danger" role="alert">{errorMessage}</p>}
                  {(canEditNickname || canManageRole) && (
                    <button
                      className="h-[52px] w-full rounded-[18px] border-0 bg-primary text-[14px] font-extrabold text-white shadow-ww disabled:opacity-45"
                      disabled={mutation.isLoading}
                      type="submit"
                    >
                      {t('common.save')}
                    </button>
                  )}
                </ContentStack>
              </MemberEditorPresentation>

              {(canRemove || canTransferOwnership) && (
                <Surface className="overflow-hidden px-4 py-1" material="content">
                  <h2 className="px-0 pb-1 pt-3 text-[11px] font-extrabold tracking-[0.4px] text-ww-mid">
                    {t('memberDetail.manage')}
                  </h2>
                  {canTransferOwnership && (
                    <button
                      className="flex min-h-[56px] w-full items-center justify-between gap-2 border-0 border-b border-solid border-border-primary bg-transparent p-0 text-left"
                      data-testid="ledger-ownership-transfer"
                      disabled={transferMutation.isLoading}
                      onClick={() => void handleTransferOwnership()}
                      type="button"
                    >
                      <span className="flex items-center gap-2 text-[13px] font-black text-feedback-warning">
                        <Crown size={17} strokeWidth={1.8} />
                        {t('memberDetail.transferOwnership')}
                      </span>
                      <ChevronRight className="shrink-0 text-ww-ghost" size={18} />
                    </button>
                  )}
                  {canRemove && (
                    <button
                      className="flex min-h-[56px] w-full items-center justify-between gap-2 border-0 border-b border-solid border-border-primary bg-transparent p-0 text-left last:border-b-0"
                      data-testid="ledger-member-remove"
                      disabled={removeMutation.isLoading}
                      onClick={() => void handleRemove()}
                      type="button"
                    >
                      <span className="flex items-center gap-2 text-[13px] font-black text-feedback-danger">
                        <Trash2 size={17} strokeWidth={1.8} />
                        {t('memberDetail.remove')}
                      </span>
                      <ChevronRight className="shrink-0 text-ww-ghost" size={18} />
                    </button>
                  )}
                </Surface>
              )}
            </form>
          )}
        </div>
      </main>

      <AppBottomSheet
        destroyOnClose
        onClose={() => setRoleSheetOpen(false)}
        onMaskClick={() => setRoleSheetOpen(false)}
        showCloseButton
        visible={roleSheetOpen}
      >
        <section className="px-4 pb-[max(20px,env(safe-area-inset-bottom))]" data-testid="member-role-sheet">
          <h2 className="py-2 text-center">{t('memberDetail.roleSheetTitle')}</h2>
          <div className="space-y-2" role="listbox">
            {assignableRoles.map(item => (
              <button
                aria-selected={role === item}
                className="flex w-full items-center gap-3 rounded-[16px] border border-solid border-border-primary bg-white/90 px-4 py-3 text-left shadow-ww-xs"
                data-testid={`member-role-${item}`}
                key={item}
                onClick={() => {
                  setRoleOverride(item);
                  setErrorMessage('');
                  setRoleSheetOpen(false);
                }}
                role="option"
                type="button"
              >
                <span className="min-w-0 flex-grow">
                  <span className="block text-[14px] font-black text-ww-ink">{t(`role.${item}`)}</span>
                  <span className="mt-0.5 block text-[11px] font-semibold leading-4 text-ww-mid">
                    {t(`requestDetail.roleDescriptions.${item}`)}
                  </span>
                </span>
                {role === item && (
                  <Check aria-label={t('requestDetail.selected')} className="shrink-0 text-primary-deep" size={18} />
                )}
              </button>
            ))}
          </div>
        </section>
      </AppBottomSheet>
    </div>
  );
};

export default LedgerMemberDetailPage;
