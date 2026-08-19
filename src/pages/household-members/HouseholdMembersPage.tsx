import type { FC, FormEvent } from 'react';
import type { Household } from '@/entities/household';
import { Button, ErrorBlock, Toast } from 'antd-mobile';
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
import { useWorkspaceBack } from '@/features/workspace-navigation';
import { MemberCardsPresentation } from '@/features/workspace-settings';
import { useTranslation } from '@/shared/i18n';
import { AppBottomSheet, PageHeader } from '@/shared/ui';

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
              <AppBottomSheet
                closeIconAlign="heading"
                destroyOnClose
                onMaskClick={() => setIsEditing(false)}
                position="bottom"
                showCloseButton
                visible={isEditing}
                onClose={() => setIsEditing(false)}
              >
                <form className="px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-14" onSubmit={handleNickname}>
                  <h2>{t('settings.nicknameTitle')}</h2>
                  <p className="mt-2 text-[12px] font-semibold text-ww-mid">{t('settings.nicknamePlaceholder')}</p>
                  <input
                    className="mt-5 h-[52px] w-full border border-solid px-4 text-[15px] font-bold"
                    defaultValue={current.nickname}
                    maxLength={30}
                    name="nickname"
                    placeholder={t('settings.nicknamePlaceholder')}
                  />
                  <Button block className="mt-5 bg-[linear-gradient(135deg,#50bfd8,#14afc5)] text-white shadow-[0_8px_18px_rgba(20,175,197,0.25)]" loading={updateState.isLoading} type="submit">
                    {t('common.save')}
                  </Button>
                </form>
              </AppBottomSheet>
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
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-20 h-56 w-56 rounded-full bg-primary-light/45 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-10 h-48 w-48 rounded-full bg-ww-pink/15 blur-3xl" />
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={onBack}
        subtitle={t('members.subtitle')}
        title={t('members.title')}
      />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-8 pt-2">
        <HouseholdScopeBoundary householdId={householdId}>
          {household => <MembersContent household={household} />}
        </HouseholdScopeBoundary>
      </main>
    </div>
  );
};

export default HouseholdMembersPage;
