import type { FC, FormEvent } from 'react';
import { Button, Dialog, Toast } from 'antd-mobile';
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
  getAssignableRoles,
  getErrorMessage,
  validateMemberPatch,
} from '@/pages/ledger-collaboration/model';
import {
  CollaborationQueryState,
  LedgerUserRow,
} from '@/pages/ledger-collaboration/ui';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';

function isConflict(error: unknown) {
  return typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409;
}

const LedgerMemberDetailPage: FC = () => {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const { ledgerId = '', memberId = '' } = useParams<{
    ledgerId: string;
    memberId: string;
  }>();
  const ledgerQuery = useLedgerQuery({
    params: { ledgerId },
    queryOptions: { enabled: Boolean(ledgerId) },
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
    const confirmed = await Dialog.confirm({
      cancelText: t('common.cancel'),
      confirmText: t('memberDetail.removeConfirmAction'),
      content: t('memberDetail.removeConfirmDescription'),
      title: t('memberDetail.removeConfirmTitle'),
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
    const confirmed = await Dialog.confirm({
      cancelText: t('common.cancel'),
      confirmText: t('memberDetail.transferConfirmAction'),
      content: t('memberDetail.transferConfirmDescription'),
      title: t('memberDetail.transferConfirmTitle'),
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
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} onBack={() => navigate(-1)}>
        {t('memberDetail.title')}
      </NavBar>
      <main className="min-h-0 flex-grow overflow-auto pb-6">
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
            <section className="mt-3 bg-white">
              <LedgerUserRow
                fallback={t('common.unknownUser')}
                secondary={`ID: ${member.user.id}`}
                user={member.user}
              />
              <div className="px-4 py-4">
                <p className="text-xs text-font-gray">{t('memberDetail.joinedAt')}</p>
                <p className="mt-1 text-sm text-font-black">
                  {new Date(member.joinedAt).toLocaleString()}
                </p>
              </div>
            </section>
            <section className="mt-3 bg-white px-4 py-4">
              <label className="block text-sm text-font-black" htmlFor="member-nickname">
                {t('memberDetail.nickname')}
              </label>
              <input
                className="mt-3 h-[48px] w-full box-border rounded border border-solid border-[#EBEBEB] px-3 text-base outline-none disabled:bg-bg-gray disabled:text-font-gray"
                disabled={!canEditNickname}
                id="member-nickname"
                maxLength={30}
                onChange={event => setNicknameOverride(event.target.value)}
                value={nickname}
              />
              <label className="mt-5 block text-sm text-font-black" htmlFor="member-role">
                {t('memberDetail.role')}
              </label>
              <select
                className="mt-3 h-[48px] w-full rounded border border-solid border-[#EBEBEB] bg-white px-3 text-base disabled:bg-bg-gray disabled:text-font-gray"
                disabled={!canManageRole}
                id="member-role"
                onChange={event => setRoleOverride(event.target.value as LedgerRole)}
                value={role}
              >
                {!assignableRoles.includes(role as never) && (
                  <option value={role}>{t(`role.${role}`)}</option>
                )}
                {assignableRoles.map(item => (
                  <option key={item} value={item}>{t(`role.${item}`)}</option>
                ))}
              </select>
              <p className="mt-4 text-xs leading-5 text-font-gray">
                {t('memberDetail.capabilityHint', { count: member.capabilities.length })}
              </p>
              {errorMessage && <p className="mt-3 text-sm text-red-500" role="alert">{errorMessage}</p>}
              {(canEditNickname || canManageRole) && (
                <Button
                  block
                  className="mt-6"
                  color="primary"
                  disabled={mutation.isLoading}
                  loading={mutation.isLoading}
                  type="submit"
                >
                  {t('common.save')}
                </Button>
              )}
              {canRemove && (
                <Button
                  block
                  className="mt-3"
                  color="danger"
                  data-testid="ledger-member-remove"
                  loading={removeMutation.isLoading}
                  onClick={handleRemove}
                  type="button"
                >
                  {t('memberDetail.remove')}
                </Button>
              )}
              {canTransferOwnership && (
                <Button
                  block
                  className="mt-3"
                  color="warning"
                  data-testid="ledger-ownership-transfer"
                  loading={transferMutation.isLoading}
                  onClick={handleTransferOwnership}
                  type="button"
                >
                  {t('memberDetail.transferOwnership')}
                </Button>
              )}
            </section>
          </form>
        )}
      </main>
    </div>
  );
};

export default LedgerMemberDetailPage;
