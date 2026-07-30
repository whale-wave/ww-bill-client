import type { FC, FormEvent } from 'react';
import type { Household } from '@/entities/household';
import { Button, ErrorBlock, Popup, Toast } from 'antd-mobile';
import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  HouseholdMemberRole,
  useHouseholdMembersQuery,
  useUpdateMyHouseholdNicknameMutation,
} from '@/entities/household';
import { useGetUserUserInfoQuery } from '@/entities/user';
import {
  getApiErrorMessage,
  getApiErrorStatus,
  getDisplayName,
  HouseholdPageState,
  HouseholdScopeBoundary,
} from '@/features/household';
import {
  useWorkspaceBack,
  WorkspaceNavHeader,
} from '@/features/workspace-navigation';
import { MemberCardsPresentation } from '@/features/workspace-settings';
import { useTranslation } from '@/shared/i18n';

const MembersContent: FC<{ household: Household }> = ({ household }) => {
  const { t } = useTranslation('household');
  const query = useHouseholdMembersQuery({
    params: { householdId: household.id },
  });
  const userQuery = useGetUserUserInfoQuery();
  const [isEditing, setIsEditing] = useState(false);
  const [updateNickname, updateState] = useUpdateMyHouseholdNicknameMutation();
  const submittingRef = useRef(false);
  const current = query.data.find(member => member.user.id === userQuery.data?.id);
  const others = current
    ? query.data.filter(member => member.id !== current.id)
    : [];

  const handleNickname = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!current || submittingRef.current)
      return;
    const nickname = String(
      new FormData(event.currentTarget).get('nickname') ?? '',
    ).trim();
    submittingRef.current = true;
    try {
      await updateNickname({
        data: { nickname, version: current.version },
        householdId: household.id,
      });
      Toast.show({ content: t('settings.updated'), icon: 'success' });
      setIsEditing(false);
    }
    catch (error) {
      if (getApiErrorStatus(error) === 409)
        await query.refetch();
      Toast.show({
        content: getApiErrorMessage(error, t('common.failed')),
        icon: 'fail',
      });
    }
    finally {
      submittingRef.current = false;
    }
  };

  const toCard = (member: typeof query.data[number], editable = false) => ({
    avatar: member.user.avatar,
    badge: member.role === HouseholdMemberRole.OWNER
      ? t('members.owner')
      : t('members.partner'),
    description: member.nickname,
    id: member.id,
    name: getDisplayName(member.user),
    onClick: editable ? () => setIsEditing(true) : undefined,
    userId: member.user.id,
  });

  return (
    <HouseholdPageState
      errorDescription={t('common.loadErrorDescription')}
      errorTitle={t('common.loadError')}
      isError={query.isError || userQuery.isError}
      isLoading={query.isLoading || userQuery.isLoading}
      loadingLabel={t('common.loading')}
      onRetry={() => void Promise.all([query.refetch(), userQuery.refetch()])}
      retryLabel={t('common.retry')}
    >
      {!current
        ? <ErrorBlock status="empty" title={t('members.empty')} />
        : (
            <>
              <MemberCardsPresentation
                current={{
                  ...toCard(current, true),
                  isCurrent: true,
                }}
                others={others.map(member => toCard(member))}
                othersLabel={t('members.partner')}
              />
              <Popup
                bodyClassName="rounded-t-[12px]"
                destroyOnClose
                onMaskClick={() => setIsEditing(false)}
                position="bottom"
                showCloseButton
                visible={isEditing}
                onClose={() => setIsEditing(false)}
              >
                <form className="px-4 pb-[calc(24px+env(safe-area-inset-bottom))] pt-12" onSubmit={handleNickname}>
                  <h2 className="text-lg font-medium text-font-black">{t('settings.nicknameTitle')}</h2>
                  <p className="mt-2 text-sm text-font-gray">{t('settings.nicknamePlaceholder')}</p>
                  <input
                    className="mt-4 h-12 w-full rounded border border-solid border-[#EBEBEB] px-3 text-base outline-none"
                    defaultValue={current.nickname}
                    maxLength={30}
                    name="nickname"
                    placeholder={t('settings.nicknamePlaceholder')}
                  />
                  <Button block className="mt-5" color="primary" loading={updateState.isLoading} type="submit">
                    {t('common.save')}
                  </Button>
                </form>
              </Popup>
            </>
          )}
    </HouseholdPageState>
  );
};

const HouseholdMembersPage: FC = () => {
  const { t } = useTranslation('household');
  const { householdId = '' } = useParams<{ householdId: string }>();
  const onBack = useWorkspaceBack({ householdId, type: 'household' });
  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <WorkspaceNavHeader
        onBack={onBack}
        scope={{ householdId, type: 'household' }}
        title={t('members.title')}
      />
      <main className="min-h-0 flex-grow overflow-auto">
        <HouseholdScopeBoundary householdId={householdId}>
          {household => <MembersContent household={household} />}
        </HouseholdScopeBoundary>
      </main>
    </div>
  );
};

export default HouseholdMembersPage;
