import type { FC, FormEvent } from 'react';
import type { Household } from '@/entities/household';
import { Button, Toast } from 'antd-mobile';
import { RightOutline } from 'antd-mobile-icons';
import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HouseholdMemberRole,
  useDissolveHouseholdMutation,
  useHouseholdMembersQuery,
  useMyHouseholdQuery,
  useUpdateHouseholdMutation,
  useUpdateMyHouseholdNicknameMutation,
} from '@/entities/household';
import { useGetUserUserInfoQuery } from '@/entities/user';
import {
  getApiErrorMessage,
  getApiErrorStatus,
  HouseholdPageState,
  HouseholdScopeBoundary,
} from '@/features/household';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';

const SettingsContent: FC<{ household: Household }> = ({ household }) => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const householdQuery = useMyHouseholdQuery();
  const userQuery = useGetUserUserInfoQuery();
  const membersQuery = useHouseholdMembersQuery({ params: { householdId: household.id } });
  const currentMember = membersQuery.data.find(member => member.user.id === userQuery.data?.id);
  const [updateHousehold, updateState] = useUpdateHouseholdMutation();
  const [updateNickname, nicknameState] = useUpdateMyHouseholdNicknameMutation();
  const [dissolve, dissolveState] = useDissolveHouseholdMutation();
  const submittingRef = useRef(false);

  const handleError = async (error: unknown) => {
    if (getApiErrorStatus(error) === 409) {
      await Promise.all([
        householdQuery.refetch(),
        membersQuery.refetch(),
      ]);
      void Toast.show({ content: t('common.conflict'), icon: 'fail' });
      return;
    }
    void Toast.show({ content: getApiErrorMessage(error, t('common.failed')), icon: 'fail' });
  };

  const handleNickname = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentMember || submittingRef.current)
      return;
    const nickname = String(new FormData(event.currentTarget).get('nickname') ?? '').trim();
    submittingRef.current = true;
    try {
      await updateNickname({ data: { nickname, version: currentMember.version }, householdId: household.id });
      void Toast.show({ content: t('settings.updated'), icon: 'success' });
    }
    catch (error) {
      await handleError(error);
    }
    finally {
      submittingRef.current = false;
    }
  };

  const handleSharedStart = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current)
      return;
    const month = String(new FormData(event.currentTarget).get('sharedStartMonth') ?? '');
    submittingRef.current = true;
    try {
      await updateHousehold({ data: { sharedStartMonth: `${month}-01`, version: household.version }, householdId: household.id });
      void Toast.show({ content: t('settings.updated'), icon: 'success' });
    }
    catch (error) {
      await handleError(error);
    }
    finally {
      submittingRef.current = false;
    }
  };

  const handleDissolve = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current)
      return;
    const data = new FormData(event.currentTarget);
    if (data.get('confirmDissolve') !== 'on') {
      void Toast.show({ content: t('settings.confirmDissolve') });
      return;
    }
    submittingRef.current = true;
    try {
      const reason = String(data.get('reason') ?? '').trim();
      await dissolve({ data: { confirmed: true, ...(reason ? { reason } : {}), version: household.version }, householdId: household.id });
      void Toast.show({ content: t('settings.dissolved'), icon: 'success' });
      navigate(ROUTES_PATH.HOUSEHOLD.getPath(), { replace: true });
    }
    catch (error) {
      await handleError(error);
    }
    finally {
      submittingRef.current = false;
    }
  };

  return (
    <HouseholdPageState
      errorDescription={t('common.loadErrorDescription')}
      errorTitle={t('common.loadError')}
      isError={membersQuery.isError}
      isLoading={membersQuery.isLoading || userQuery.isLoading}
      loadingLabel={t('common.loading')}
      onRetry={() => void membersQuery.refetch()}
      retryLabel={t('common.retry')}
    >
      <div className="space-y-3">
        <section className="overflow-hidden rounded-xl bg-white">
          <button className="flex min-h-[58px] w-full items-center border-0 bg-white px-4 text-left" onClick={() => navigate(ROUTES_PATH.HOUSEHOLD_MEMBERS.getPath(household.id))} type="button">
            <span className="flex-grow text-sm text-font-black">{t('settings.members')}</span>
            <span className="mr-2 text-sm text-font-gray">{membersQuery.data.length}</span>
            <RightOutline className="text-font-gray" />
          </button>
        </section>

        <section className="overflow-hidden rounded-xl bg-white">
          <button className="flex min-h-[58px] w-full items-center border-0 bg-white px-4 text-left" onClick={() => navigate(ROUTES_PATH.HOUSEHOLD_EXPORT.getPath(household.id))} type="button">
            <span className="flex-grow text-sm text-font-black">{t('settings.export')}</span>
            <RightOutline className="text-font-gray" />
          </button>
        </section>

        <form className="card-rounded bg-white px-4 py-4" data-testid="household-nickname-form" onSubmit={handleNickname}>
          <h2 className="text-base font-medium text-font-black">{t('settings.nicknameTitle')}</h2>
          <div className="mt-3 flex gap-2">
            <input className="h-11 min-w-0 flex-grow rounded-xl border-0 bg-bg-gray px-3 text-sm outline-none" defaultValue={currentMember?.nickname ?? ''} maxLength={30} name="nickname" placeholder={t('settings.nicknamePlaceholder')} />
            <Button color="primary" loading={nicknameState.isLoading} type="submit">{t('common.save')}</Button>
          </div>
        </form>

        {household.myRole === HouseholdMemberRole.OWNER && (
          <form className="card-rounded bg-white px-4 py-4" onSubmit={handleSharedStart}>
            <h2 className="text-base font-medium text-font-black">{t('settings.sharedStartTitle')}</h2>
            <p className="mt-1 text-xs leading-5 text-font-gray">{t('settings.sharedStartHint')}</p>
            <div className="mt-3 flex gap-2">
              <input
                className="h-11 min-w-0 flex-grow rounded-xl border-0 bg-bg-gray px-3 text-sm"
                defaultValue={household.sharedStartMonth.slice(0, 7)}
                min={household.sharedStartMonth.slice(0, 7)}
                name="sharedStartMonth"
                required
                type="month"
              />
              <Button color="primary" loading={updateState.isLoading} type="submit">{t('common.save')}</Button>
            </div>
          </form>
        )}

        <form className="card-rounded border border-solid border-rose-100 bg-white px-4 py-4" onSubmit={handleDissolve}>
          <h2 className="text-base font-medium text-rose-600">{t('settings.dissolveTitle')}</h2>
          <p className="mt-2 text-sm leading-6 text-font-gray">{t('settings.dissolveDescription')}</p>
          <textarea className="mt-3 min-h-[82px] w-full rounded-xl border-0 bg-bg-gray p-3 text-sm outline-none" maxLength={500} name="reason" placeholder={t('settings.dissolveReasonPlaceholder')} />
          <label className="mt-3 flex items-start gap-2 text-sm leading-5 text-font-black">
            <input className="mt-1 accent-rose-500" name="confirmDissolve" type="checkbox" />
            <span>{t('settings.confirmDissolve')}</span>
          </label>
          <Button block className="mt-4" color="danger" loading={dissolveState.isLoading} type="submit">{t('settings.dissolveAction')}</Button>
        </form>
      </div>
    </HouseholdPageState>
  );
};

const HouseholdSettingsPage: FC = () => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const { householdId = '' } = useParams<{ householdId: string }>();
  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} onBack={() => navigate(-1)}>{t('settings.title')}</NavBar>
      <main className="min-h-0 flex-grow overflow-auto px-3 py-3">
        <HouseholdScopeBoundary householdId={householdId}>{household => <SettingsContent household={household} />}</HouseholdScopeBoundary>
      </main>
    </div>
  );
};

export default HouseholdSettingsPage;
