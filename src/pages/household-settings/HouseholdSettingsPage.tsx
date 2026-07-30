import type { FC, FormEvent } from 'react';
import type { Household } from '@/entities/household';
import { Button, Popup, Toast } from 'antd-mobile';
import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HouseholdMemberRole,
  useDissolveHouseholdMutation,
  useHouseholdMembersQuery,
  useMyHouseholdQuery,
  useUpdateHouseholdMutation,
} from '@/entities/household';
import {
  getApiErrorMessage,
  getApiErrorStatus,
  HouseholdPageState,
  HouseholdScopeBoundary,
} from '@/features/household';
import {
  useWorkspaceBack,
  WorkspaceNavHeader,
} from '@/features/workspace-navigation';
import { SettingsOverviewPresentation } from '@/features/workspace-settings';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';

type Editor = 'dissolve' | 'sharedStart' | null;

const SettingsContent: FC<{ household: Household }> = ({ household }) => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const householdQuery = useMyHouseholdQuery();
  const membersQuery = useHouseholdMembersQuery({
    params: { householdId: household.id },
  });
  const [updateHousehold, updateState] = useUpdateHouseholdMutation();
  const [dissolve, dissolveState] = useDissolveHouseholdMutation();
  const [editor, setEditor] = useState<Editor>(null);
  const submittingRef = useRef(false);

  const handleError = async (error: unknown) => {
    if (getApiErrorStatus(error) === 409) {
      await Promise.all([householdQuery.refetch(), membersQuery.refetch()]);
      Toast.show({ content: t('common.conflict'), icon: 'fail' });
      return;
    }
    Toast.show({
      content: getApiErrorMessage(error, t('common.failed')),
      icon: 'fail',
    });
  };

  const handleSharedStart = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current)
      return;
    const month = String(
      new FormData(event.currentTarget).get('sharedStartMonth') ?? '',
    );
    submittingRef.current = true;
    try {
      await updateHousehold({
        data: {
          sharedStartMonth: `${month}-01`,
          version: household.version,
        },
        householdId: household.id,
      });
      Toast.show({ content: t('settings.updated'), icon: 'success' });
      setEditor(null);
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
      Toast.show({ content: t('settings.confirmDissolve') });
      return;
    }
    submittingRef.current = true;
    try {
      const reason = String(data.get('reason') ?? '').trim();
      await dissolve({
        data: {
          confirmed: true,
          ...(reason ? { reason } : {}),
          version: household.version,
        },
        householdId: household.id,
      });
      Toast.show({ content: t('settings.dissolved'), icon: 'success' });
      navigate(ROUTES_PATH.HOUSEHOLD.getPath(), { replace: true });
    }
    catch (error) {
      await handleError(error);
    }
    finally {
      submittingRef.current = false;
    }
  };

  const showDeveloping = () => Toast.show('开发中');
  const isOwner = household.myRole === HouseholdMemberRole.OWNER;

  return (
    <HouseholdPageState
      errorDescription={t('common.loadErrorDescription')}
      errorTitle={t('common.loadError')}
      isError={membersQuery.isError}
      isLoading={membersQuery.isLoading}
      loadingLabel={t('common.loading')}
      onRetry={() => void membersQuery.refetch()}
      retryLabel={t('common.retry')}
    >
      <SettingsOverviewPresentation
        sections={[
          {
            id: 'members',
            rows: [
              {
                avatars: membersQuery.data.map(member => ({
                  alt: member.nickname,
                  id: member.id,
                  src: member.user.avatar,
                })),
                icon: 'member',
                id: 'members',
                kind: 'avatarStack',
                label: t('settings.members'),
                onClick: () => navigate(
                  ROUTES_PATH.HOUSEHOLD_MEMBERS.getPath(household.id),
                ),
              },
              isOwner
                ? {
                    description: t('settings.sharedStartHint'),
                    icon: 'calendar',
                    id: 'shared-start',
                    kind: 'link',
                    label: t('settings.sharedStartTitle'),
                    onClick: () => setEditor('sharedStart'),
                    value: household.sharedStartMonth.slice(0, 7),
                  }
                : {
                    description: t('settings.sharedStartHint'),
                    icon: 'calendar',
                    id: 'shared-start',
                    kind: 'value',
                    label: t('settings.sharedStartTitle'),
                    value: household.sharedStartMonth.slice(0, 7),
                  },
            ],
          },
          {
            id: 'data',
            rows: [{
              icon: 'export',
              id: 'export',
              kind: 'link',
              label: t('settings.export'),
              onClick: () => navigate(
                ROUTES_PATH.HOUSEHOLD_EXPORT.getPath(household.id),
              ),
            }],
          },
          {
            id: 'placeholders',
            rows: [
              {
                icon: 'help',
                id: 'help',
                kind: 'placeholder',
                label: '使用帮助',
                onClick: showDeveloping,
              },
              {
                icon: 'desktop',
                id: 'desktop',
                kind: 'placeholder',
                label: '添加桌面入口',
                onClick: showDeveloping,
              },
            ],
          },
          {
            id: 'danger',
            rows: [{
              danger: true,
              icon: 'archive',
              id: 'dissolve',
              kind: 'action',
              label: t('settings.dissolveTitle'),
              onClick: () => setEditor('dissolve'),
            }],
          },
        ]}
      />
      <Popup
        bodyClassName="rounded-t-[12px]"
        destroyOnClose
        onMaskClick={() => setEditor(null)}
        position="bottom"
        showCloseButton
        visible={editor !== null}
        onClose={() => setEditor(null)}
      >
        {editor === 'sharedStart' && (
          <form className="px-4 pb-[calc(24px+env(safe-area-inset-bottom))] pt-12" onSubmit={handleSharedStart}>
            <h2 className="text-lg font-medium text-font-black">{t('settings.sharedStartTitle')}</h2>
            <p className="mt-2 text-sm leading-6 text-font-gray">{t('settings.sharedStartHint')}</p>
            <input
              className="mt-4 h-12 w-full rounded border border-solid border-[#EBEBEB] px-3 text-base"
              defaultValue={household.sharedStartMonth.slice(0, 7)}
              min={household.sharedStartMonth.slice(0, 7)}
              name="sharedStartMonth"
              required
              type="month"
            />
            <Button block className="mt-5" color="primary" loading={updateState.isLoading} type="submit">
              {t('common.save')}
            </Button>
          </form>
        )}
        {editor === 'dissolve' && (
          <form className="px-4 pb-[calc(24px+env(safe-area-inset-bottom))] pt-12" onSubmit={handleDissolve}>
            <h2 className="text-lg font-medium text-red-500">{t('settings.dissolveTitle')}</h2>
            <p className="mt-2 text-sm leading-6 text-font-gray">{t('settings.dissolveDescription')}</p>
            <textarea className="mt-4 min-h-[88px] w-full rounded border border-solid border-[#EBEBEB] p-3 text-sm outline-none" maxLength={500} name="reason" placeholder={t('settings.dissolveReasonPlaceholder')} />
            <label className="mt-3 flex items-start gap-2 text-sm text-font-black">
              <input className="mt-1 accent-red-500" name="confirmDissolve" type="checkbox" />
              <span>{t('settings.confirmDissolve')}</span>
            </label>
            <Button block className="mt-5" color="danger" loading={dissolveState.isLoading} type="submit">
              {t('settings.dissolveAction')}
            </Button>
          </form>
        )}
      </Popup>
    </HouseholdPageState>
  );
};

const HouseholdSettingsPage: FC = () => {
  const { t } = useTranslation('household');
  const { householdId = '' } = useParams<{ householdId: string }>();
  const onBack = useWorkspaceBack({ householdId, type: 'household' });
  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <WorkspaceNavHeader
        onBack={onBack}
        scope={{ householdId, type: 'household' }}
        title={t('settings.title')}
      />
      <main className="min-h-0 flex-grow overflow-auto">
        <HouseholdScopeBoundary householdId={householdId}>
          {household => <SettingsContent household={household} />}
        </HouseholdScopeBoundary>
      </main>
    </div>
  );
};

export default HouseholdSettingsPage;
