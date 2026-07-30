import type { SettingsOverviewSection } from '@/features/workspace-settings';
import { Button, Dialog, ErrorBlock, Popup, Toast } from 'antd-mobile';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LedgerCapability,
  LedgerChartDisplay,
  LedgerChartMetric,
  LedgerChartPeriod,
  LedgerKind,
  LedgerMemberStatus,
  LedgerRecordType,
  LedgerRole,
  LedgerStatus,
  useArchiveLedgerMutation,
  useLeaveLedgerMutation,
  useLedgerMembersQuery,
  useLedgerPreferencesQuery,
  useLedgerQuery,
  usePatchLedgerMutation,
  usePatchLedgerPreferencesMutation,
} from '@/entities/ledger';
import { useGetUserUserInfoQuery } from '@/entities/user';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import {
  useWorkspaceBack,
  WorkspaceNavHeader,
} from '@/features/workspace-navigation';
import { SettingsOverviewPresentation } from '@/features/workspace-settings';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';

const LEDGER_ICON_KEYS = ['wallet', 'briefcase', 'receipt', 'building', 'users', 'store'] as const;
const LEDGER_THEME_KEYS = ['blue', 'green', 'amber', 'orange', 'indigo', 'pink'] as const;

function isConflict(error: unknown) {
  return typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409;
}

function LedgerSettingsContent({ ledgerId }: { ledgerId: string }) {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const ledgerQuery = useLedgerQuery({ params: { ledgerId }, queryOptions: { enabled: Boolean(ledgerId) } });
  const preferenceQuery = useLedgerPreferencesQuery({ params: { ledgerId }, queryOptions: { enabled: Boolean(ledgerId) } });
  const userQuery = useGetUserUserInfoQuery({ options: { enabled: Boolean(ledgerId) } });
  const onBack = useWorkspaceBack({
    capabilities: ledgerQuery.data?.capabilities,
    ledgerId,
    type: 'custom',
  });
  const canReadMembers = Boolean(
    ledgerQuery.data?.capabilities.includes(LedgerCapability.MEMBER_READ),
  );
  const canLeave = Boolean(
    ledgerQuery.data?.status === LedgerStatus.ACTIVE
    && ledgerQuery.data.myRole !== LedgerRole.OWNER
    && canReadMembers,
  );
  const membersQuery = useLedgerMembersQuery({
    params: { ledgerId, status: LedgerMemberStatus.ACTIVE },
    queryOptions: { enabled: canReadMembers },
  });
  const currentMember = membersQuery.data.find(member => member.user.id === userQuery.data?.id);
  const [patchLedger, patchState] = usePatchLedgerMutation();
  const [patchPreferences, preferenceState] = usePatchLedgerPreferencesMutation();
  const [archiveLedger, archiveState] = useArchiveLedgerMutation();
  const [leaveLedger, leaveState] = useLeaveLedgerMutation();
  const [name, setName] = useState('');
  const [monthStartDay, setMonthStartDay] = useState(1);
  const [iconKey, setIconKey] = useState('wallet');
  const [themeKey, setThemeKey] = useState('blue');
  const [hideTotalAmount, setHideTotalAmount] = useState(false);
  const [showDailySummary, setShowDailySummary] = useState(false);
  const [defaultRecordType, setDefaultRecordType] = useState(LedgerRecordType.EXPENSE);
  const [defaultChartPeriod, setDefaultChartPeriod] = useState(LedgerChartPeriod.MONTH);
  const [defaultChartMetric, setDefaultChartMetric] = useState(LedgerChartMetric.EXPENSE);
  const [defaultChartDisplay, setDefaultChartDisplay] = useState(LedgerChartDisplay.PIE);
  const [editor, setEditor] = useState<'basic' | 'preferences' | null>(null);
  const submittingRef = useRef(false);

  const openBasicEditor = () => {
    const ledger = ledgerQuery.data;
    if (!ledger)
      return;
    setName(ledger.name);
    setMonthStartDay(ledger.monthStartDay);
    setIconKey(ledger.iconKey);
    setThemeKey(ledger.themeKey);
    setEditor('basic');
  };

  const openPreferenceEditor = () => {
    const preference = preferenceQuery.data;
    if (!preference)
      return;
    setHideTotalAmount(preference.hideTotalAmount);
    setShowDailySummary(preference.showDailySummary);
    setDefaultRecordType(preference.defaultRecordType);
    setDefaultChartPeriod(preference.defaultChartPeriod);
    setDefaultChartMetric(preference.defaultChartMetric);
    setDefaultChartDisplay(preference.defaultChartDisplay);
    setEditor('preferences');
  };

  const handleBasicSave = async () => {
    const ledger = ledgerQuery.data;
    if (!ledger || ledger.status !== LedgerStatus.ACTIVE || submittingRef.current)
      return;
    submittingRef.current = true;
    try {
      await patchLedger({
        ledgerId,
        data: {
          iconKey,
          monthStartDay,
          name: name.trim(),
          themeKey,
          version: ledger.version,
        },
      });
      Toast.show({ icon: 'success', content: t('settings.saved') });
      setEditor(null);
    }
    catch (error) {
      if (isConflict(error)) {
        const draft = { iconKey, monthStartDay, name, themeKey };
        await ledgerQuery.refetch();
        setName(draft.name);
        setMonthStartDay(draft.monthStartDay);
        setIconKey(draft.iconKey);
        setThemeKey(draft.themeKey);
        Toast.show({ icon: 'fail', content: t('common.conflict') });
        return;
      }
      Toast.show({ icon: 'fail', content: t('settings.saveFailed') });
    }
    finally {
      submittingRef.current = false;
    }
  };

  const handlePreferenceSave = async () => {
    const preference = preferenceQuery.data;
    if (!preference || ledgerQuery.data?.status !== LedgerStatus.ACTIVE || submittingRef.current)
      return;
    submittingRef.current = true;
    try {
      await patchPreferences({
        ledgerId,
        data: {
          defaultChartDisplay,
          defaultChartMetric,
          defaultChartPeriod,
          defaultRecordType,
          hideTotalAmount,
          showDailySummary,
          version: preference.version,
        },
      });
      Toast.show({ icon: 'success', content: t('settings.saved') });
      setEditor(null);
    }
    catch (error) {
      if (isConflict(error)) {
        const draft = {
          defaultChartDisplay,
          defaultChartMetric,
          defaultChartPeriod,
          defaultRecordType,
          hideTotalAmount,
          showDailySummary,
        };
        await preferenceQuery.refetch();
        setDefaultChartDisplay(draft.defaultChartDisplay);
        setDefaultChartMetric(draft.defaultChartMetric);
        setDefaultChartPeriod(draft.defaultChartPeriod);
        setDefaultRecordType(draft.defaultRecordType);
        setHideTotalAmount(draft.hideTotalAmount);
        setShowDailySummary(draft.showDailySummary);
        Toast.show({ icon: 'fail', content: t('common.conflict') });
        return;
      }
      Toast.show({ icon: 'fail', content: t('settings.saveFailed') });
    }
    finally {
      submittingRef.current = false;
    }
  };

  const handleLeave = async () => {
    if (!currentMember || !canLeave || submittingRef.current)
      return;
    const confirmed = await Dialog.confirm({
      cancelText: t('common.cancel'),
      confirmText: t('settings.leaveConfirmAction'),
      content: t('settings.leaveConfirmDescription'),
      title: t('settings.leaveConfirmTitle'),
    });
    if (!confirmed)
      return;
    submittingRef.current = true;
    try {
      await leaveLedger({ ledgerId, version: currentMember.version });
      navigate(ROUTES_PATH.DETAIL.getPath(), { replace: true });
    }
    catch (error) {
      if (isConflict(error))
        await membersQuery.refetch();
      Toast.show({ icon: 'fail', content: t('settings.leaveFailed') });
    }
    finally {
      submittingRef.current = false;
    }
  };

  const handleArchive = async () => {
    const ledger = ledgerQuery.data;
    if (!ledger || ledger.status !== LedgerStatus.ACTIVE || ledger.kind === LedgerKind.SYSTEM_DEFAULT || submittingRef.current)
      return;
    const confirmed = await Dialog.confirm({
      cancelText: t('common.cancel'),
      confirmText: t('settings.archiveConfirmAction'),
      content: t('settings.archiveConfirmDescription'),
      title: t('settings.archiveConfirmTitle'),
    });
    if (!confirmed)
      return;
    submittingRef.current = true;
    try {
      await archiveLedger({ ledgerId, data: { confirmed: true, version: ledger.version } });
      navigate(ROUTES_PATH.DETAIL.getPath(), { replace: true });
    }
    catch (error) {
      if (isConflict(error))
        await ledgerQuery.refetch();
      Toast.show({ icon: 'fail', content: t('settings.archiveFailed') });
    }
    finally {
      submittingRef.current = false;
    }
  };

  const ledger = ledgerQuery.data;
  const ledgerWritable = ledger?.status === LedgerStatus.ACTIVE;
  const preferencesWritable = ledgerWritable;
  if (!ledgerId || ledgerQuery.isError)
    return <ErrorBlock title={t('common.invalidLedger')} />;

  const showDeveloping = () => Toast.show('开发中');
  const canUpdateLedger = Boolean(
    ledgerWritable
    && ledger?.capabilities.includes(LedgerCapability.LEDGER_UPDATE),
  );
  const sections: SettingsOverviewSection[] = ledger
    ? [
        {
          id: 'members',
          rows: canReadMembers
            ? [{
                avatars: membersQuery.data.map(member => ({
                  alt: member.nickname || member.user.name || '',
                  id: member.id,
                  src: member.user.avatar,
                })),
                icon: 'member',
                id: 'members',
                kind: 'avatarStack',
                label: t('settings.members'),
                onClick: () => navigate(
                  ROUTES_PATH.LEDGER_MEMBERS.getPath(ledgerId),
                ),
                overflowCount: Math.max(0, membersQuery.data.length - 3),
              }]
            : [],
        },
        {
          id: 'basic',
          rows: [
            canUpdateLedger
              ? {
                  icon: 'account',
                  id: 'basic',
                  kind: 'link',
                  label: t('settings.name'),
                  onClick: openBasicEditor,
                  value: `${ledger.name} · ${t('settings.monthStartDay')} ${ledger.monthStartDay}`,
                }
              : {
                  icon: 'account',
                  id: 'basic',
                  kind: 'value',
                  label: ledger.name,
                  value: `${t('settings.monthStartDay')} ${ledger.monthStartDay}`,
                },
            canUpdateLedger
              ? {
                  icon: 'appearance',
                  id: 'appearance',
                  kind: 'link',
                  label: `${t('settings.icon')} · ${t('settings.theme')}`,
                  onClick: openBasicEditor,
                  value: `${ledger.iconKey} · ${ledger.themeKey}`,
                }
              : {
                  icon: 'appearance',
                  id: 'appearance',
                  kind: 'value',
                  label: `${t('settings.icon')} · ${t('settings.theme')}`,
                  value: `${ledger.iconKey} · ${ledger.themeKey}`,
                },
          ],
        },
        {
          id: 'preferences',
          rows: [{
            disabled: !preferencesWritable,
            icon: 'record',
            id: 'preferences',
            kind: 'link',
            label: t('settings.preferences'),
            onClick: openPreferenceEditor,
            value: t(`settings.${preferenceQuery.data?.defaultRecordType ?? LedgerRecordType.EXPENSE}`),
          }],
        },
        {
          id: 'management',
          rows: [
            ...(ledger.capabilities.includes(LedgerCapability.CATEGORY_MANAGE)
              ? [{
                  disabled: !ledgerWritable,
                  icon: 'category' as const,
                  id: 'categories',
                  kind: 'link' as const,
                  label: t('settings.categories'),
                  onClick: () => navigate(
                    ROUTES_PATH.LEDGER_CATEGORIES.getPath(ledgerId),
                  ),
                }]
              : []),
            ...(ledger.capabilities.includes(LedgerCapability.TAG_MANAGE)
              ? [{
                  disabled: !ledgerWritable,
                  icon: 'tag' as const,
                  id: 'tags',
                  kind: 'link' as const,
                  label: t('settings.tags'),
                  onClick: () => navigate(
                    ROUTES_PATH.LEDGER_TAGS.getPath(ledgerId),
                  ),
                }]
              : []),
            ...(ledger.capabilities.includes(LedgerCapability.DATA_RECOVERY)
              ? [{
                  disabled: !ledgerWritable,
                  icon: 'archive' as const,
                  id: 'recovery',
                  kind: 'link' as const,
                  label: t('settings.recovery'),
                  onClick: () => navigate(
                    ROUTES_PATH.LEDGER_RECOVERY.getPath(ledgerId),
                  ),
                }]
              : []),
            ...(ledger.capabilities.includes(LedgerCapability.DATA_TRANSFER)
              ? [{
                  disabled: !ledgerWritable,
                  icon: 'record' as const,
                  id: 'transfer',
                  kind: 'link' as const,
                  label: t('settings.transfer'),
                  onClick: () => navigate(
                    ROUTES_PATH.LEDGER_TRANSFER.getPath(ledgerId),
                  ),
                }]
              : []),
            ...(ledger.capabilities.includes(LedgerCapability.DATA_EXPORT)
              ? [{
                  icon: 'export' as const,
                  id: 'export',
                  kind: 'link' as const,
                  label: t('settings.export'),
                  onClick: () => navigate(
                    ROUTES_PATH.LEDGER_EXPORT.getPath(ledgerId),
                  ),
                }]
              : []),
          ],
          title: t('settings.management'),
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
          rows: [
            ...(canLeave && currentMember
              ? [{
                  danger: true,
                  disabled: leaveState.isLoading,
                  icon: 'archive' as const,
                  id: 'leave',
                  kind: 'action' as const,
                  label: t('settings.leave'),
                  onClick: () => void handleLeave(),
                }]
              : []),
            ...(ledgerWritable
              && ledger.kind !== LedgerKind.SYSTEM_DEFAULT
              && ledger.capabilities.includes(LedgerCapability.LEDGER_ARCHIVE)
              ? [{
                  danger: true,
                  disabled: archiveState.isLoading,
                  icon: 'archive' as const,
                  id: 'archive',
                  kind: 'action' as const,
                  label: t('settings.archive'),
                  onClick: () => void handleArchive(),
                }]
              : []),
          ],
        },
      ]
    : [];

  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <WorkspaceNavHeader
        onBack={onBack}
        scope={{
          capabilities: ledger?.capabilities,
          ledgerId,
          type: 'custom',
        }}
        title={t('settings.title')}
      />
      <main className="min-h-0 flex-grow overflow-auto">
        <SettingsOverviewPresentation sections={sections} />
      </main>
      <Popup
        bodyClassName="rounded-t-[12px]"
        destroyOnClose
        onMaskClick={() => setEditor(null)}
        position="bottom"
        showCloseButton
        visible={editor !== null}
        onClose={() => setEditor(null)}
      >
        {editor === 'basic' && (
          <section className="max-h-[82vh] overflow-auto px-4 pb-[calc(24px+env(safe-area-inset-bottom))] pt-12">
            <h2 className="text-lg font-medium">{t('settings.basic')}</h2>
            <label className="mt-4 block text-sm text-font-gray">
              {t('settings.name')}
              <input className="mt-1 h-12 w-full rounded border border-solid border-[#EBEBEB] px-3 text-font-black" maxLength={30} onChange={event => setName(event.target.value)} value={name} />
            </label>
            <label className="mt-4 block text-sm text-font-gray">
              {t('settings.monthStartDay')}
              <input className="mt-1 h-12 w-full rounded border border-solid border-[#EBEBEB] px-3 text-font-black" max="28" min="1" onChange={event => setMonthStartDay(Number(event.target.value))} type="number" value={monthStartDay} />
            </label>
            <label className="mt-4 block text-sm text-font-gray">
              {t('settings.icon')}
              <select className="mt-1 h-12 w-full rounded border border-solid border-[#EBEBEB] bg-white px-3 text-font-black" data-testid="ledger-icon" onChange={event => setIconKey(event.target.value)} value={iconKey}>
                {!LEDGER_ICON_KEYS.includes(iconKey as typeof LEDGER_ICON_KEYS[number]) && <option value={iconKey}>{iconKey}</option>}
                {LEDGER_ICON_KEYS.map(value => <option key={value} value={value}>{t(`settings.iconOptions.${value}`)}</option>)}
              </select>
            </label>
            <label className="mt-4 block text-sm text-font-gray">
              {t('settings.theme')}
              <select className="mt-1 h-12 w-full rounded border border-solid border-[#EBEBEB] bg-white px-3 text-font-black" data-testid="ledger-theme" onChange={event => setThemeKey(event.target.value)} value={themeKey}>
                {!LEDGER_THEME_KEYS.includes(themeKey as typeof LEDGER_THEME_KEYS[number]) && <option value={themeKey}>{themeKey}</option>}
                {LEDGER_THEME_KEYS.map(value => <option key={value} value={value}>{t(`settings.themeOptions.${value}`)}</option>)}
              </select>
            </label>
            <Button block className="mt-5" color="primary" data-testid="ledger-basic-save" loading={patchState.isLoading} onClick={handleBasicSave}>{t('common.save')}</Button>
          </section>
        )}
        {editor === 'preferences' && (
          <section className="max-h-[82vh] overflow-auto px-4 pb-[calc(24px+env(safe-area-inset-bottom))] pt-12">
            <h2 className="text-lg font-medium">{t('settings.preferences')}</h2>
            <label className="mt-4 flex min-h-12 items-center justify-between text-sm text-font-black">
              {t('settings.hideTotal')}
              <input checked={hideTotalAmount} data-testid="ledger-hide-total" onChange={event => setHideTotalAmount(event.target.checked)} type="checkbox" />
            </label>
            <label className="flex min-h-12 items-center justify-between text-sm text-font-black">
              {t('settings.dailySummary')}
              <input checked={showDailySummary} onChange={event => setShowDailySummary(event.target.checked)} type="checkbox" />
            </label>
            <label className="mt-3 block text-sm text-font-gray">
              {t('settings.defaultRecordType')}
              <select className="mt-1 h-12 w-full rounded border border-solid border-[#EBEBEB] bg-white px-3 text-font-black" data-testid="ledger-default-record-type" onChange={event => setDefaultRecordType(event.target.value as LedgerRecordType)} value={defaultRecordType}>
                <option value={LedgerRecordType.EXPENSE}>{t('settings.expense')}</option>
                <option value={LedgerRecordType.INCOME}>{t('settings.income')}</option>
              </select>
            </label>
            <label className="mt-4 block text-sm text-font-gray">
              {t('settings.defaultChartPeriod')}
              <select className="mt-1 h-12 w-full rounded border border-solid border-[#EBEBEB] bg-white px-3 text-font-black" data-testid="ledger-default-chart-period" onChange={event => setDefaultChartPeriod(event.target.value as LedgerChartPeriod)} value={defaultChartPeriod}>
                <option value={LedgerChartPeriod.WEEK}>{t('charts.period.week')}</option>
                <option value={LedgerChartPeriod.MONTH}>{t('charts.period.month')}</option>
                <option value={LedgerChartPeriod.YEAR}>{t('charts.period.year')}</option>
              </select>
            </label>
            <label className="mt-4 block text-sm text-font-gray">
              {t('settings.defaultChartMetric')}
              <select className="mt-1 h-12 w-full rounded border border-solid border-[#EBEBEB] bg-white px-3 text-font-black" data-testid="ledger-default-chart-metric" onChange={event => setDefaultChartMetric(event.target.value as LedgerChartMetric)} value={defaultChartMetric}>
                <option value={LedgerChartMetric.EXPENSE}>{t('settings.expense')}</option>
                <option value={LedgerChartMetric.INCOME}>{t('settings.income')}</option>
                <option value={LedgerChartMetric.NET}>{t('settings.net')}</option>
              </select>
            </label>
            <label className="mt-4 block text-sm text-font-gray">
              {t('settings.defaultChartDisplay')}
              <select className="mt-1 h-12 w-full rounded border border-solid border-[#EBEBEB] bg-white px-3 text-font-black" data-testid="ledger-default-chart-display" onChange={event => setDefaultChartDisplay(event.target.value as LedgerChartDisplay)} value={defaultChartDisplay}>
                <option value={LedgerChartDisplay.PIE}>{t('charts.display.pie')}</option>
                <option value={LedgerChartDisplay.LINE}>{t('charts.display.line')}</option>
              </select>
            </label>
            <Button block className="mt-5" color="primary" data-testid="ledger-preferences-save" loading={preferenceState.isLoading} onClick={handlePreferenceSave}>{t('common.save')}</Button>
          </section>
        )}
      </Popup>
    </div>
  );
}

export default function LedgerSettingsPage() {
  return (
    <LedgerScopeBoundary capability={LedgerCapability.LEDGER_READ}>
      {({ ledgerId }) => <LedgerSettingsContent ledgerId={ledgerId} />}
    </LedgerScopeBoundary>
  );
}
