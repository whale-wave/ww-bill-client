import type { SettingsOverviewSection } from '@/features/workspace-settings';
import { ErrorBlock, Toast } from 'antd-mobile';
import {
  Archive,
  LogOut,
  Palette,
  Settings2,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  DEFAULT_LEDGER_ICON_KEY,
  isLedgerIconKey,
  LEDGER_ICON_KEYS,
  LedgerCapability,
  LedgerChartDisplay,
  LedgerChartMetric,
  LedgerChartPeriod,
  LedgerIconGlyph,
  LedgerKind,
  LedgerMemberStatus,
  LedgerRecordType,
  LedgerRole,
  LedgerStatus,
  LedgerVisualIcon,
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
import { useWorkspaceBack } from '@/features/workspace-navigation';
import { SettingsOverviewPresentation } from '@/features/workspace-settings';
import {
  LEDGER_THEME_CLASS_NAMES,
  LEDGER_THEME_KEYS,
} from '@/shared/config/ledger-themes';
import { MEMBER_COLOR_PALETTE } from '@/shared/config/member-colors';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import {
  AppBottomSheet,
  AppButton,
  confirmAppAction,
  PageHeader,
  SheetHeader,
  Surface,
} from '@/shared/ui';

function isConflict(error: unknown) {
  return typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409;
}

function PreferenceSwitch({
  checked,
  label,
  onChange,
  testId,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
  testId?: string;
}) {
  return (
    <label className="flex min-h-[58px] items-center justify-between rounded-[17px] border border-solid border-border-primary bg-white/75 px-4 shadow-ww-xs">
      <span className="text-[13px] font-bold text-ww-ink">{label}</span>
      <input
        checked={checked}
        className="peer sr-only"
        data-testid={testId}
        onChange={event => onChange(event.target.checked)}
        type="checkbox"
      />
      <span className="relative h-7 w-12 rounded-full bg-ww-surface-tint transition peer-checked:bg-primary">
        <span className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-ww-xs transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function ChoiceGroup({
  label,
  onChange,
  options,
  testId,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  testId: string;
  value: string;
}) {
  return (
    <div>
      <span className="mb-2 block text-[11px] font-bold text-ww-mid">{label}</span>
      <select
        aria-hidden="true"
        className="sr-only"
        data-testid={testId}
        onChange={event => onChange(event.target.value)}
        tabIndex={-1}
        value={value}
      >
        {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <div className={`grid gap-1.5 rounded-[16px] border border-solid border-border-primary bg-white/75 p-1.5 shadow-ww-xs ${options.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {options.map(option => (
          <button
            aria-pressed={option.value === value}
            className={`min-h-11 rounded-[13px] px-2 text-[12px] font-bold transition ${option.value === value ? 'bg-primary text-white shadow-ww-xs' : 'bg-white/40 text-ww-mid'}`}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
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
    const confirmed = await confirmAppAction({
      cancelText: t('common.cancel'),
      confirmText: t('settings.leaveConfirmAction'),
      description: t('settings.leaveConfirmDescription'),
      icon: <LogOut size={22} strokeWidth={1.8} />,
      title: t('settings.leaveConfirmTitle'),
      tone: 'danger',
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
    const confirmed = await confirmAppAction({
      cancelText: t('common.cancel'),
      confirmText: t('settings.archiveConfirmAction'),
      description: t('settings.archiveConfirmDescription'),
      icon: <Archive size={22} strokeWidth={1.8} />,
      title: t('settings.archiveConfirmTitle'),
      tone: 'danger',
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
  if (ledgerQuery.data?.status === LedgerStatus.ARCHIVED)
    return <Navigate replace to={ROUTES_PATH.DETAIL.getPath()} />;

  const showDeveloping = () => Toast.show(t('settings.developing'));
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
                  name: member.nickname || member.user.name || member.user.username || '',
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
              }, ...(membersQuery.data.some(member => member.user.id === userQuery.data?.id)
                ? [{
                    icon: 'appearance' as const,
                    id: 'member-color',
                    kind: 'link' as const,
                    label: '我的成员颜色',
                    description: '在多人账本中区分不同成员的账单',
                    onClick: () => navigate(ROUTES_PATH.LEDGER_MEMBER_COLOR.getPath(ledgerId)),
                    value: (() => {
                      const member = membersQuery.data.find(item => item.user.id === userQuery.data?.id);
                      return member?.colorKey ? MEMBER_COLOR_PALETTE[member.colorKey].label : '海蓝';
                    })(),
                  }]
                : [])]
            : [],
          title: t('settings.members'),
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
                  value: `${t(`settings.iconOptions.${ledger.iconKey}`, { defaultValue: ledger.iconKey })} · ${t(`settings.themeOptions.${ledger.themeKey}`, { defaultValue: ledger.themeKey })}`,
                }
              : {
                  icon: 'appearance',
                  id: 'appearance',
                  kind: 'value',
                  label: `${t('settings.icon')} · ${t('settings.theme')}`,
                  value: `${t(`settings.iconOptions.${ledger.iconKey}`, { defaultValue: ledger.iconKey })} · ${t(`settings.themeOptions.${ledger.themeKey}`, { defaultValue: ledger.themeKey })}`,
                },
          ],
          title: t('settings.basic'),
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
            value: (preferenceQuery.data?.defaultRecordType ?? LedgerRecordType.EXPENSE) === LedgerRecordType.INCOME
              ? t('settings.income')
              : t('settings.expense'),
          }],
          title: t('settings.preferences'),
        },
        {
          id: 'management',
          rows: [
            ...(ledger.capabilities.includes(LedgerCapability.CATEGORY_READ)
              ? [{
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
              label: t('settings.help'),
              onClick: showDeveloping,
            },
            {
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
  const previewIconKey = isLedgerIconKey(iconKey) ? iconKey : DEFAULT_LEDGER_ICON_KEY;
  const themePreviewClass = LEDGER_THEME_CLASS_NAMES[themeKey as typeof LEDGER_THEME_KEYS[number]] ?? 'bg-primary';
  const currentThemeClass = LEDGER_THEME_CLASS_NAMES[ledger?.themeKey as typeof LEDGER_THEME_KEYS[number]] ?? 'bg-primary';

  return (
    <div className="page-new relative overflow-hidden" data-ledger-settings-page>
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-24 h-52 w-52 rounded-full bg-primary-light/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-[52%] h-48 w-48 rounded-full bg-ww-pink-light/25 blur-3xl" />
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={onBack}
        subtitle={t('settings.subtitle')}
        title={t('settings.title')}
      />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-[max(24px,env(safe-area-inset-bottom))]" data-ledger-settings-content>
        <div className="mx-auto w-full max-w-[520px]">
          {ledger && (
            <Surface className="mb-5 flex items-center gap-3.5 px-4 py-4" data-ledger-settings-overview material="raised">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[17px] border border-white/80 text-white shadow-ww-xs ${currentThemeClass}`}>
                <LedgerVisualIcon
                  className="h-[22px] w-[22px]"
                  iconKey={ledger.iconKey}
                  kind={ledger.kind}
                  templateKey={ledger.templateKey}
                />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[14px] font-extrabold text-ww-ink">{ledger.name}</h2>
                <p className="mt-0.5 text-[11px] leading-4 text-ww-mid">{t('settings.overviewDescription')}</p>
              </div>
              <span className="shrink-0 rounded-full border border-white/80 bg-white/60 px-2.5 py-1 text-[10px] font-bold text-primary-deep">
                {t('settings.monthStartDayValue', { day: ledger.monthStartDay })}
              </span>
            </Surface>
          )}
          <SettingsOverviewPresentation sections={sections} />
        </div>
      </main>
      <AppBottomSheet
        bodyClassName="h-[82dvh] max-h-[720px] overflow-hidden"
        destroyOnClose
        onMaskClick={() => setEditor(null)}
        position="bottom"
        showCloseButton={false}
        visible={editor !== null}
        onClose={() => setEditor(null)}
      >
        {editor === 'basic' && (
          <section className="flex h-full flex-col">
            <SheetHeader
              closeLabel={t('common:nav.close')}
              description={t('settings.basicHint')}
              icon={<Palette size={21} />}
              onClose={() => setEditor(null)}
              title={t('settings.basic')}
            />
            <div className="min-h-0 flex-1 overflow-y-auto px-[18px] pb-[calc(24px+env(safe-area-inset-bottom))] pt-5">
              <label className="block">
                <span className="text-[11px] font-bold text-ww-mid">{t('settings.name')}</span>
                <input className="mt-2 h-12 w-full rounded-[16px] border border-solid border-border-primary bg-white/80 px-4 text-[14px] font-semibold text-ww-ink outline-none shadow-ww-xs transition focus:border-primary" maxLength={30} onChange={event => setName(event.target.value)} value={name} />
              </label>
              <label className="mt-4 block">
                <span className="text-[11px] font-bold text-ww-mid">{t('settings.monthStartDay')}</span>
                <input className="mt-2 h-12 w-full rounded-[16px] border border-solid border-border-primary bg-white/80 px-4 text-[14px] font-semibold text-ww-ink outline-none shadow-ww-xs transition focus:border-primary" max="28" min="1" onChange={event => setMonthStartDay(Number(event.target.value))} type="number" value={monthStartDay} />
              </label>
              <div className="mt-5">
                <span className="block text-[11px] font-bold text-ww-mid">{t('settings.icon')}</span>
                <select aria-hidden="true" className="sr-only" data-testid="ledger-icon" onChange={event => setIconKey(event.target.value)} tabIndex={-1} value={iconKey}>
                  {!isLedgerIconKey(iconKey) && <option value={iconKey}>{iconKey}</option>}
                  {LEDGER_ICON_KEYS.map(value => <option key={value} value={value}>{t(`settings.iconOptions.${value}`)}</option>)}
                </select>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {LEDGER_ICON_KEYS.map((value) => {
                    const selected = iconKey === value;
                    return (
                      <button aria-pressed={selected} className={`flex min-h-[62px] flex-col items-center justify-center gap-1 rounded-[16px] border border-solid text-[10px] font-bold transition ${selected ? 'border-primary bg-primary-light/55 text-primary-deep shadow-ww-xs' : 'border-border-primary bg-white/65 text-ww-mid'}`} key={value} onClick={() => setIconKey(value)} type="button">
                        <LedgerIconGlyph iconKey={value} size={19} strokeWidth={1.8} />
                        {t(`settings.iconOptions.${value}`)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-5">
                <span className="block text-[11px] font-bold text-ww-mid">{t('settings.theme')}</span>
                <select aria-hidden="true" className="sr-only" data-testid="ledger-theme" onChange={event => setThemeKey(event.target.value)} tabIndex={-1} value={themeKey}>
                  {!LEDGER_THEME_KEYS.includes(themeKey as typeof LEDGER_THEME_KEYS[number]) && <option value={themeKey}>{themeKey}</option>}
                  {LEDGER_THEME_KEYS.map(value => <option key={value} value={value}>{t(`settings.themeOptions.${value}`)}</option>)}
                </select>
                <div className="mt-2 grid grid-cols-6 gap-1">
                  {LEDGER_THEME_KEYS.map(value => (
                    <button aria-label={t(`settings.themeOptions.${value}`)} aria-pressed={themeKey === value} className={`flex aspect-square min-h-11 min-w-11 items-center justify-center rounded-[15px] border-2 border-solid transition ${themeKey === value ? 'border-primary bg-white shadow-ww-xs' : 'border-transparent bg-white/55'}`} key={value} onClick={() => setThemeKey(value)} type="button">
                      <span className={`h-6 w-6 rounded-full ${LEDGER_THEME_CLASS_NAMES[value]}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-[17px] border border-solid border-border-primary bg-white/75 px-4 py-3 shadow-ww-xs">
                <span className={`flex h-11 w-11 items-center justify-center rounded-[15px] text-white shadow-ww-xs ${themePreviewClass}`}><LedgerIconGlyph iconKey={previewIconKey} size={21} /></span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-extrabold text-ww-ink">{name || ledger?.name}</span>
              </div>
              <AppButton className="mt-5" data-testid="ledger-basic-save" fullWidth loading={patchState.isLoading} loadingLabel={t('common.loading')} onClick={handleBasicSave}>{t('common.save')}</AppButton>
            </div>
          </section>
        )}
        {editor === 'preferences' && (
          <section className="flex h-full flex-col">
            <SheetHeader
              closeLabel={t('common:nav.close')}
              description={t('settings.preferencesHint')}
              icon={<Settings2 size={21} />}
              onClose={() => setEditor(null)}
              title={t('settings.preferences')}
            />
            <div className="min-h-0 flex-1 overflow-y-auto px-[18px] pb-[calc(24px+env(safe-area-inset-bottom))] pt-5">
              <div className="space-y-2">
                <PreferenceSwitch checked={hideTotalAmount} label={t('settings.hideTotal')} onChange={setHideTotalAmount} testId="ledger-hide-total" />
                <PreferenceSwitch checked={showDailySummary} label={t('settings.dailySummary')} onChange={setShowDailySummary} />
              </div>
              <div className="mt-4 space-y-3">
                <ChoiceGroup label={t('settings.defaultRecordType')} onChange={value => setDefaultRecordType(value as LedgerRecordType)} options={[{ label: t('settings.expense'), value: LedgerRecordType.EXPENSE }, { label: t('settings.income'), value: LedgerRecordType.INCOME }]} testId="ledger-default-record-type" value={defaultRecordType} />
                <ChoiceGroup label={t('settings.defaultChartPeriod')} onChange={value => setDefaultChartPeriod(value as LedgerChartPeriod)} options={[{ label: t('charts.period.week'), value: LedgerChartPeriod.WEEK }, { label: t('charts.period.month'), value: LedgerChartPeriod.MONTH }, { label: t('charts.period.year'), value: LedgerChartPeriod.YEAR }]} testId="ledger-default-chart-period" value={defaultChartPeriod} />
                <ChoiceGroup label={t('settings.defaultChartMetric')} onChange={value => setDefaultChartMetric(value as LedgerChartMetric)} options={[{ label: t('settings.expense'), value: LedgerChartMetric.EXPENSE }, { label: t('settings.income'), value: LedgerChartMetric.INCOME }, { label: t('settings.net'), value: LedgerChartMetric.NET }]} testId="ledger-default-chart-metric" value={defaultChartMetric} />
                <ChoiceGroup label={t('settings.defaultChartDisplay')} onChange={value => setDefaultChartDisplay(value as LedgerChartDisplay)} options={[{ label: t('charts.display.pie'), value: LedgerChartDisplay.PIE }, { label: t('charts.display.line'), value: LedgerChartDisplay.LINE }]} testId="ledger-default-chart-display" value={defaultChartDisplay} />
              </div>
              <AppButton className="mt-5" data-testid="ledger-preferences-save" fullWidth loading={preferenceState.isLoading} loadingLabel={t('common.loading')} onClick={handlePreferenceSave}>{t('common.save')}</AppButton>
            </div>
          </section>
        )}
      </AppBottomSheet>
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
