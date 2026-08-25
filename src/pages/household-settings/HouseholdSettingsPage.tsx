import type { FC, FormEvent } from 'react';
import type { Household } from '@/entities/household';
import { Button, DatePicker, Toast } from 'antd-mobile';
import { CalendarDays, ShieldCheck } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HouseholdMemberRole,
  useDissolveHouseholdMutation,
  useHouseholdMembersQuery,
  useMyHouseholdQuery,
  useUpdateHouseholdMutation,
} from '@/entities/household';
import { useGetUserUserInfoQuery } from '@/entities/user';
import {
  formatMonthStart,
  getApiErrorMessage,
  getApiErrorStatus,
  HouseholdPageState,
  HouseholdScopeBoundary,
} from '@/features/household';
import { useWorkspaceBack } from '@/features/workspace-navigation';
import { SettingsOverviewPresentation } from '@/features/workspace-settings';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { AppBottomSheet, GradientPanel, PageHeader } from '@/shared/ui';

type Editor = 'dissolve' | 'sharedStart' | null;

function monthStartDate(value: string) {
  const [year, month] = value.slice(0, 7).split('-').map(Number);
  return new Date(year, month - 1, 1);
}

const SettingsContent: FC<{ household: Household }> = ({ household }) => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const householdQuery = useMyHouseholdQuery();
  const membersQuery = useHouseholdMembersQuery({
    params: { householdId: household.id },
  });
  const userQuery = useGetUserUserInfoQuery();
  const [updateHousehold, updateState] = useUpdateHouseholdMutation();
  const [dissolve, dissolveState] = useDissolveHouseholdMutation();
  const [editor, setEditor] = useState<Editor>(null);
  const [draftMonth, setDraftMonth] = useState<Date>(() => monthStartDate(household.sharedStartMonth));
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const [today] = useState(() => new Date());
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
    submittingRef.current = true;
    try {
      await updateHousehold({
        data: {
          sharedStartMonth: formatMonthStart(draftMonth),
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
      navigate(ROUTES_PATH.HOUSEHOLD.getPath(), {
        replace: true,
        state: { dissolved: true },
      });
    }
    catch (error) {
      await handleError(error);
    }
    finally {
      submittingRef.current = false;
    }
  };

  const showDeveloping = () => Toast.show(t('settings.comingSoon'));
  const isOwner = household.myRole === HouseholdMemberRole.OWNER;
  const currentMember = membersQuery.data.find(member => member.user.id === userQuery.data?.id);

  return (
    <HouseholdPageState
      errorDescription={t('common.loadErrorDescription')}
      errorTitle={t('common.loadError')}
      isError={membersQuery.isError || userQuery.isError}
      isLoading={membersQuery.isLoading || userQuery.isLoading}
      loadingLabel={t('common.loading')}
      onRetry={() => void Promise.all([membersQuery.refetch(), userQuery.refetch()])}
      retryLabel={t('common.retry')}
    >
      <GradientPanel className="mb-5 overflow-hidden px-5 py-5" elevation="standard" surface="aurora">
        <div className="flex items-start gap-3.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] bg-white/70 text-primary-deep shadow-ww-xs">
            <ShieldCheck size={23} strokeWidth={1.8} />
          </span>
          <div className="min-w-0 pt-0.5">
            <h2 className="text-[16px] font-black leading-6 text-ww-ink">{t('settings.overviewTitle')}</h2>
            <p className="mt-1 text-[11px] font-semibold leading-[18px] text-ww-mid">{t('settings.overviewDescription')}</p>
          </div>
        </div>
      </GradientPanel>
      <SettingsOverviewPresentation
        sections={[
          {
            id: 'members',
            title: t('settings.sectionFamily'),
            rows: [
              {
                avatars: membersQuery.data.map(member => ({
                  alt: member.nickname,
                  id: member.id,
                  name: member.nickname || member.user.name || member.user.username || '',
                  src: member.user.avatar,
                })),
                icon: 'member',
                id: 'members',
                kind: 'avatarStack',
                label: t('settings.members'),
                description: t('settings.membersDescription'),
                onClick: () => navigate(
                  ROUTES_PATH.HOUSEHOLD_MEMBERS.getPath(household.id),
                ),
              },
              {
                description: t('settings.nicknameDescription'),
                icon: 'account',
                id: 'nickname',
                kind: 'link',
                label: t('settings.nickname'),
                onClick: () => navigate(
                  ROUTES_PATH.HOUSEHOLD_MEMBERS.getPath(household.id),
                ),
                value: currentMember?.nickname,
              },
            ],
          },
          {
            id: 'sharing',
            title: t('settings.sectionSharing'),
            rows: [
              isOwner
                ? {
                    description: t('settings.sharedStartHint'),
                    icon: 'calendar',
                    id: 'shared-start',
                    kind: 'link',
                    label: t('settings.sharedStartTitle'),
                    onClick: () => {
                      setDraftMonth(monthStartDate(household.sharedStartMonth));
                      setEditor('sharedStart');
                    },
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
            title: t('settings.sectionData'),
            rows: [{
              description: t('settings.exportDescription'),
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
            title: t('settings.sectionMore'),
            rows: [
              {
                description: t('settings.appearanceDescription'),
                icon: 'appearance',
                id: 'appearance',
                kind: 'placeholder',
                label: t('settings.appearance'),
                onClick: showDeveloping,
              },
              {
                description: t('settings.helpDescription'),
                icon: 'help',
                id: 'help',
                kind: 'placeholder',
                label: t('settings.help'),
                onClick: showDeveloping,
              },
              {
                description: t('settings.desktopDescription'),
                icon: 'desktop',
                id: 'desktop',
                kind: 'placeholder',
                label: t('settings.desktop'),
                onClick: showDeveloping,
              },
            ],
          },
          {
            id: 'danger',
            title: t('settings.sectionDanger'),
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
      <AppBottomSheet
        destroyOnClose
        onMaskClick={() => setEditor(null)}
        position="bottom"
        showCloseButton
        visible={editor !== null}
        onClose={() => setEditor(null)}
      >
        {editor === 'sharedStart' && (
          <form className="px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-14" onSubmit={handleSharedStart}>
            <h2>{t('settings.sharedStartTitle')}</h2>
            <p className="mt-2 text-[12px] font-semibold leading-5 text-ww-mid">{t('settings.sharedStartHint')}</p>
            <button
              className="mt-5 flex h-[52px] w-full items-center justify-between rounded-[15px] border border-solid border-border-primary bg-white/85 px-4 text-[15px] font-bold text-ww-ink shadow-ww-xs"
              data-testid="shared-start-month-field"
              onClick={() => setMonthPickerVisible(true)}
              type="button"
            >
              {formatMonthStart(draftMonth).slice(0, 7)}
              <CalendarDays className="text-primary-deep" size={18} strokeWidth={1.8} />
            </button>
            <DatePicker
              className="ww-app-date-picker"
              max={today}
              min={monthStartDate(household.sharedStartMonth)}
              onClose={() => setMonthPickerVisible(false)}
              onConfirm={(value) => {
                setDraftMonth(value);
                setMonthPickerVisible(false);
              }}
              precision="month"
              value={draftMonth}
              visible={monthPickerVisible}
            />
            <Button block className="mt-5 bg-[linear-gradient(135deg,#50bfd8,#14afc5)] text-white shadow-[0_8px_18px_rgba(20,175,197,0.25)]" loading={updateState.isLoading} type="submit">
              {t('common.save')}
            </Button>
          </form>
        )}
        {editor === 'dissolve' && (
          <form className="px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-14" onSubmit={handleDissolve}>
            <h2 className="!text-[#ad496b]">{t('settings.dissolveTitle')}</h2>
            <p className="mt-2 text-[12px] font-semibold leading-5 text-ww-mid">{t('settings.dissolveDescription')}</p>
            <textarea className="mt-5 min-h-[96px] w-full border border-solid p-4 text-sm" maxLength={500} name="reason" placeholder={t('settings.dissolveReasonPlaceholder')} />
            <label className="mt-4 flex items-start gap-2.5 rounded-[15px] bg-ww-pink-light/45 px-3.5 py-3 text-[12px] font-bold leading-5 text-ww-ink">
              <input className="mt-1 accent-red-500" name="confirmDissolve" type="checkbox" />
              <span>{t('settings.confirmDissolve')}</span>
            </label>
            <Button block className="mt-5 !bg-[#ad496b] text-white" loading={dissolveState.isLoading} type="submit">
              {t('settings.dissolveAction')}
            </Button>
          </form>
        )}
      </AppBottomSheet>
    </HouseholdPageState>
  );
};

const HouseholdSettingsPage: FC = () => {
  const { t } = useTranslation('household');
  const { householdId = '' } = useParams<{ householdId: string }>();
  const onBack = useWorkspaceBack({ householdId, type: 'household' });
  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-16 h-56 w-56 rounded-full bg-primary-light/45 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-12 h-48 w-48 rounded-full bg-ww-pink/15 blur-3xl" />
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={onBack}
        subtitle={t('settings.subtitle')}
        title={t('settings.title')}
      />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-8 pt-2">
        <HouseholdScopeBoundary householdId={householdId}>
          {household => <SettingsContent household={household} />}
        </HouseholdScopeBoundary>
      </main>
    </div>
  );
};

export default HouseholdSettingsPage;
