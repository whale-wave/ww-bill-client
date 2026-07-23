import { Button, Dialog, ErrorBlock, Input, List, NavBar, Switch, Toast } from 'antd-mobile';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';

const LEDGER_ICON_KEYS = ['wallet', 'briefcase', 'receipt', 'building', 'users', 'store'] as const;
const LEDGER_THEME_KEYS = ['blue', 'green', 'amber', 'orange', 'indigo', 'pink'] as const;

function isConflict(error: unknown) {
  return typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409;
}

export default function LedgerSettingsPage() {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const { ledgerId = '' } = useParams<{ ledgerId: string }>();
  const ledgerQuery = useLedgerQuery({ params: { ledgerId }, queryOptions: { enabled: Boolean(ledgerId) } });
  const preferenceQuery = useLedgerPreferencesQuery({ params: { ledgerId }, queryOptions: { enabled: Boolean(ledgerId) } });
  const userQuery = useGetUserUserInfoQuery({ options: { enabled: Boolean(ledgerId) } });
  const canLeave = Boolean(
    ledgerQuery.data?.status === LedgerStatus.ACTIVE
    && ledgerQuery.data.myRole !== LedgerRole.OWNER
    && ledgerQuery.data.capabilities.includes(LedgerCapability.MEMBER_READ),
  );
  const membersQuery = useLedgerMembersQuery({
    params: { ledgerId, status: LedgerMemberStatus.ACTIVE },
    queryOptions: { enabled: canLeave },
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
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!ledgerQuery.data)
      return;
    setName(ledgerQuery.data.name);
    setMonthStartDay(ledgerQuery.data.monthStartDay);
    setIconKey(ledgerQuery.data.iconKey);
    setThemeKey(ledgerQuery.data.themeKey);
  }, [ledgerQuery.data]);

  useEffect(() => {
    if (!preferenceQuery.data)
      return;
    setHideTotalAmount(preferenceQuery.data.hideTotalAmount);
    setShowDailySummary(preferenceQuery.data.showDailySummary);
    setDefaultRecordType(preferenceQuery.data.defaultRecordType);
    setDefaultChartPeriod(preferenceQuery.data.defaultChartPeriod);
    setDefaultChartMetric(preferenceQuery.data.defaultChartMetric);
    setDefaultChartDisplay(preferenceQuery.data.defaultChartDisplay);
  }, [preferenceQuery.data]);

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
    }
    catch (error) {
      if (isConflict(error))
        await ledgerQuery.refetch();
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
    }
    catch (error) {
      if (isConflict(error))
        await preferenceQuery.refetch();
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
  const preferencesWritable = ledger?.status === LedgerStatus.ACTIVE;
  if (!ledgerId || ledgerQuery.isError)
    return <ErrorBlock title={t('common.invalidLedger')} />;

  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar onBack={() => navigate(-1)}>{t('settings.title')}</NavBar>
      <main className="min-h-0 flex-grow overflow-auto pb-6">
        {ledger && (
          <>
            {ledger.capabilities.includes(LedgerCapability.LEDGER_UPDATE) && (
              <section className="mt-3 bg-white px-4 py-3">
                <h2 className="mb-3 text-base font-medium">{t('settings.basic')}</h2>
                <label className="mb-3 block text-sm text-font-gray">
                  {t('settings.name')}
                  <Input className="mt-1" disabled={!preferencesWritable} maxLength={30} onChange={setName} value={name} />
                </label>
                <label className="mb-3 block text-sm text-font-gray">
                  {t('settings.monthStartDay')}
                  <input className="mt-1 w-full border border-solid border-[#EBEBEB] p-2" disabled={!preferencesWritable} max="28" min="1" onChange={event => setMonthStartDay(Number(event.target.value))} type="number" value={monthStartDay} />
                </label>
                <label className="mb-3 block text-sm text-font-gray">
                  {t('settings.icon')}
                  <select className="mt-1 w-full border border-solid border-[#EBEBEB] p-2 text-font-black" data-testid="ledger-icon" disabled={!preferencesWritable} onChange={event => setIconKey(event.target.value)} value={iconKey}>
                    {!LEDGER_ICON_KEYS.includes(iconKey as typeof LEDGER_ICON_KEYS[number]) && <option value={iconKey}>{iconKey}</option>}
                    {LEDGER_ICON_KEYS.map(value => <option key={value} value={value}>{t(`settings.iconOptions.${value}`)}</option>)}
                  </select>
                </label>
                <label className="mb-3 block text-sm text-font-gray">
                  {t('settings.theme')}
                  <select className="mt-1 w-full border border-solid border-[#EBEBEB] p-2 text-font-black" data-testid="ledger-theme" disabled={!preferencesWritable} onChange={event => setThemeKey(event.target.value)} value={themeKey}>
                    {!LEDGER_THEME_KEYS.includes(themeKey as typeof LEDGER_THEME_KEYS[number]) && <option value={themeKey}>{themeKey}</option>}
                    {LEDGER_THEME_KEYS.map(value => <option key={value} value={value}>{t(`settings.themeOptions.${value}`)}</option>)}
                  </select>
                </label>
                <Button block data-testid="ledger-basic-save" disabled={!preferencesWritable} loading={patchState.isLoading} onClick={handleBasicSave}>{t('common.save')}</Button>
              </section>
            )}

            <section className="mt-3 bg-white px-4 py-3">
              <h2 className="mb-3 text-base font-medium">{t('settings.preferences')}</h2>
              <div className="flex min-h-[55px] items-center justify-between border-0 border-b border-solid border-[#EBEBEB]">
                <span>{t('settings.hideTotal')}</span>
                <label className="relative">
                  <input
                    checked={hideTotalAmount}
                    className="sr-only"
                    data-testid="ledger-hide-total"
                    disabled={!preferencesWritable}
                    onChange={event => setHideTotalAmount(event.target.checked)}
                    type="checkbox"
                  />
                  <Switch checked={hideTotalAmount} disabled={!preferencesWritable} onChange={setHideTotalAmount} />
                </label>
              </div>
              <div className="flex min-h-[55px] items-center justify-between">
                <span>{t('settings.dailySummary')}</span>
                <Switch checked={showDailySummary} disabled={!preferencesWritable} onChange={setShowDailySummary} />
              </div>
              <label className="mb-3 block text-sm text-font-gray">
                {t('settings.defaultRecordType')}
                <select className="mt-1 w-full border border-solid border-[#EBEBEB] p-2 text-font-black" data-testid="ledger-default-record-type" disabled={!preferencesWritable} onChange={event => setDefaultRecordType(event.target.value as LedgerRecordType)} value={defaultRecordType}>
                  <option value={LedgerRecordType.EXPENSE}>{t('settings.expense')}</option>
                  <option value={LedgerRecordType.INCOME}>{t('settings.income')}</option>
                </select>
              </label>
              <label className="mb-3 block text-sm text-font-gray">
                {t('settings.defaultChartPeriod')}
                <select className="mt-1 w-full border border-solid border-[#EBEBEB] p-2 text-font-black" data-testid="ledger-default-chart-period" disabled={!preferencesWritable} onChange={event => setDefaultChartPeriod(event.target.value as LedgerChartPeriod)} value={defaultChartPeriod}>
                  <option value={LedgerChartPeriod.WEEK}>{t('charts.period.week')}</option>
                  <option value={LedgerChartPeriod.MONTH}>{t('charts.period.month')}</option>
                  <option value={LedgerChartPeriod.YEAR}>{t('charts.period.year')}</option>
                </select>
              </label>
              <label className="mb-3 block text-sm text-font-gray">
                {t('settings.defaultChartMetric')}
                <select className="mt-1 w-full border border-solid border-[#EBEBEB] p-2 text-font-black" data-testid="ledger-default-chart-metric" disabled={!preferencesWritable} onChange={event => setDefaultChartMetric(event.target.value as LedgerChartMetric)} value={defaultChartMetric}>
                  <option value={LedgerChartMetric.EXPENSE}>{t('settings.expense')}</option>
                  <option value={LedgerChartMetric.INCOME}>{t('settings.income')}</option>
                  <option value={LedgerChartMetric.NET}>{t('settings.net')}</option>
                </select>
              </label>
              <label className="mb-3 block text-sm text-font-gray">
                {t('settings.defaultChartDisplay')}
                <select className="mt-1 w-full border border-solid border-[#EBEBEB] p-2 text-font-black" data-testid="ledger-default-chart-display" disabled={!preferencesWritable} onChange={event => setDefaultChartDisplay(event.target.value as LedgerChartDisplay)} value={defaultChartDisplay}>
                  <option value={LedgerChartDisplay.PIE}>{t('charts.display.pie')}</option>
                  <option value={LedgerChartDisplay.LINE}>{t('charts.display.line')}</option>
                </select>
              </label>
              <Button block data-testid="ledger-preferences-save" disabled={!preferencesWritable} loading={preferenceState.isLoading} onClick={handlePreferenceSave}>{t('common.save')}</Button>
            </section>

            <List className="mt-3" header={t('settings.management')}>
              {preferencesWritable && ledger.capabilities.includes(LedgerCapability.CATEGORY_MANAGE) && <List.Item clickable data-testid="ledger-settings-categories" onClick={() => navigate(ROUTES_PATH.LEDGER_CATEGORIES.getPath(ledgerId))}>{t('settings.categories')}</List.Item>}
              {preferencesWritable && ledger.capabilities.includes(LedgerCapability.TAG_MANAGE) && <List.Item clickable data-testid="ledger-settings-tags" onClick={() => navigate(ROUTES_PATH.LEDGER_TAGS.getPath(ledgerId))}>{t('settings.tags')}</List.Item>}
              {ledger.capabilities.includes(LedgerCapability.MEMBER_READ) && <List.Item clickable onClick={() => navigate(ROUTES_PATH.LEDGER_MEMBERS.getPath(ledgerId))}>{t('settings.members')}</List.Item>}
              {preferencesWritable && ledger.capabilities.includes(LedgerCapability.DATA_RECOVERY) && <List.Item clickable onClick={() => navigate(ROUTES_PATH.LEDGER_RECOVERY.getPath(ledgerId))}>{t('settings.recovery')}</List.Item>}
              {preferencesWritable && ledger.capabilities.includes(LedgerCapability.DATA_TRANSFER) && <List.Item clickable onClick={() => navigate(ROUTES_PATH.LEDGER_TRANSFER.getPath(ledgerId))}>{t('settings.transfer')}</List.Item>}
              {ledger.capabilities.includes(LedgerCapability.DATA_EXPORT) && <List.Item clickable onClick={() => navigate(ROUTES_PATH.LEDGER_EXPORT.getPath(ledgerId))}>{t('settings.export')}</List.Item>}
            </List>

            {canLeave && currentMember && (
              <div className="px-4 pt-4">
                <Button block color="danger" data-testid="ledger-leave" loading={leaveState.isLoading} onClick={handleLeave}>{t('settings.leave')}</Button>
              </div>
            )}

            {preferencesWritable && ledger.kind !== LedgerKind.SYSTEM_DEFAULT && ledger.capabilities.includes(LedgerCapability.LEDGER_ARCHIVE) && (
              <div className="px-4 py-4">
                <Button block color="danger" data-testid="ledger-archive" loading={archiveState.isLoading} onClick={handleArchive}>{t('settings.archive')}</Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
