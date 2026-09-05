import type { FC, ReactNode } from 'react';
import {
  AddSquareOutline,
  BillOutline,
  CheckShieldOutline,
  PayCircleOutline,
  PieOutline,
  RightOutline,
  SetOutline,
  TeamOutline,
  UnorderedListOutline,
} from 'antd-mobile-icons';
import { CircleAlert } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LedgerCapability,
  LedgerVisualIcon,
  useLedgerQuery,
} from '@/entities/ledger';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { IllustratedEmptyState, PageHeader, PageLoadingState, Surface } from '@/shared/ui';

const LEDGER_MODULES = ['records', 'bill', 'budget', 'charts', 'settings'] as const;

const MODULE_CAPABILITIES = {
  bill: LedgerCapability.RECORD_READ,
  budget: LedgerCapability.BUDGET_READ,
  charts: LedgerCapability.CHART_READ,
  records: LedgerCapability.RECORD_READ,
  settings: LedgerCapability.LEDGER_READ,
} as const;

function getModuleIcon(moduleKey: typeof LEDGER_MODULES[number]): ReactNode {
  switch (moduleKey) {
    case 'records':
      return <UnorderedListOutline />;
    case 'bill':
      return <BillOutline />;
    case 'budget':
      return <PayCircleOutline />;
    case 'charts':
      return <PieOutline />;
    case 'settings':
      return <SetOutline />;
  }
}

const LedgerDetailPage: FC = () => {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const { ledgerId = '' } = useParams<{ ledgerId: string }>();
  const ledgerQuery = useLedgerQuery({
    params: { ledgerId },
    queryOptions: { enabled: Boolean(ledgerId) },
  });
  const ledger = ledgerQuery.data;

  const handleBack = () => navigate(-1);
  const collaborationItems = ledger
    ? [
        ledger.capabilities.includes(LedgerCapability.MEMBER_READ)
          ? {
              icon: <TeamOutline />,
              key: 'members',
              path: ROUTES_PATH.LEDGER_MEMBERS.getPath(ledger.id),
            }
          : undefined,
        ledger.capabilities.includes(LedgerCapability.MEMBER_INVITE)
          ? {
              icon: <AddSquareOutline />,
              key: 'invite',
              path: ROUTES_PATH.LEDGER_INVITES.getPath(ledger.id),
            }
          : undefined,
        ledger.capabilities.includes(LedgerCapability.MEMBER_REVIEW)
          ? {
              icon: <CheckShieldOutline />,
              key: 'requests',
              path: ROUTES_PATH.LEDGER_JOIN_REQUESTS.getPath(ledger.id),
            }
          : undefined,
      ].filter((item): item is NonNullable<typeof item> => Boolean(item))
    : [];

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-24 h-52 w-52 rounded-full bg-primary-light/35 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={handleBack} title={ledger?.name ?? t('detail.title')} />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[var(--ww-page-gutter)] pb-[max(24px,env(safe-area-inset-bottom))]">
        {!ledgerId && (
          <div className="mx-auto flex min-h-[360px] w-full max-w-[520px] items-center">
            <Surface className="w-full overflow-hidden" material="content">
              <IllustratedEmptyState
                actionLabel={t('common:nav.back')}
                description={t('detail.invalidLedgerDescription')}
                icon={<CircleAlert className="text-primary-deep" size={38} strokeWidth={1.8} />}
                onAction={handleBack}
                title={t('detail.invalidLedger')}
              />
            </Surface>
          </div>
        )}

        {ledgerId && ledgerQuery.isLoading && (
          <PageLoadingState label={t('detail.loading')} testId="ledger-detail-loading" />
        )}

        {ledgerId && !ledgerQuery.isLoading && ledgerQuery.isError && (
          <div className="mx-auto flex min-h-[360px] w-full max-w-[520px] items-center">
            <Surface className="w-full overflow-hidden" material="content">
              <IllustratedEmptyState
                actionLabel={t('common:nav.retry')}
                description={t('detail.loadErrorDescription')}
                icon={<CircleAlert className="text-primary-deep" size={38} strokeWidth={1.8} />}
                onAction={() => void ledgerQuery.refetch()}
                title={t('detail.loadError')}
              />
            </Surface>
          </div>
        )}

        {ledger && !ledgerQuery.isLoading && !ledgerQuery.isError && (
          <div className="mx-auto w-full max-w-[520px] space-y-3 pt-2">
            <Surface className="px-5 py-5" material="raised">
              <div className="flex items-center">
                <span className="mr-3.5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-[18px] bg-primary text-2xl text-white shadow-ww-xs">
                  <LedgerVisualIcon iconKey={ledger.iconKey} kind={ledger.kind} templateKey={ledger.templateKey} />
                </span>
                <div className="min-w-0">
                  <h1 className="one-line text-[19px] font-black text-ww-ink">{ledger.name}</h1>
                  <p className="mt-1 text-[12px] font-semibold text-ww-mid">
                    {t(`kind.${ledger.kind}`)}
                  </p>
                </div>
              </div>
            </Surface>

            <Surface aria-labelledby="ledger-basic-info-heading" className="overflow-hidden" material="content">
              <h2 className="px-5 pb-2 pt-4 text-[13px] font-extrabold text-ww-ink" id="ledger-basic-info-heading">
                {t('detail.basicInfo')}
              </h2>
              {[
                [t('detail.template'), ledger.templateKey ? t(`template.${ledger.templateKey}.name`) : t('detail.unknownTemplate')],
                [t('detail.theme'), ledger.themeKey],
                [t('detail.role'), t(`role.${ledger.myRole}`)],
                [t('detail.status'), t(`status.${ledger.status}`)],
                [t('detail.monthStartDay'), t('detail.monthStartDayValue', { day: ledger.monthStartDay })],
              ].map(([label, value]) => (
                <div className="ml-5 flex min-h-[54px] items-center justify-between border-0 border-t border-solid border-border-primary pr-5" key={label}>
                  <span className="text-[13px] font-bold text-ww-ink">{label}</span>
                  <span className="ml-4 text-right text-[12px] font-semibold text-ww-mid">{value}</span>
                </div>
              ))}
            </Surface>

            <Surface aria-labelledby="ledger-modules-heading" className="overflow-hidden" material="content">
              <h2 className="px-5 pb-2 pt-4 text-[13px] font-extrabold text-ww-ink" id="ledger-modules-heading">
                {t('detail.modules')}
              </h2>
              {LEDGER_MODULES.map((moduleKey) => {
                const isEnabled = ledger.capabilities.includes(MODULE_CAPABILITIES[moduleKey]);
                const paths = {
                  bill: ROUTES_PATH.LEDGER_BILL.getPath(ledger.id),
                  budget: ROUTES_PATH.LEDGER_BUDGET.getPath(ledger.id),
                  charts: ROUTES_PATH.LEDGER_CHARTS.getPath(ledger.id),
                  records: ROUTES_PATH.LEDGER_RECORDS.getPath(ledger.id),
                  settings: ROUTES_PATH.LEDGER_SETTINGS.getPath(ledger.id),
                };
                return (
                  <button
                    aria-disabled={!isEnabled}
                    className="ml-5 flex min-h-[60px] w-[calc(100%-1.25rem)] items-center border-0 border-t border-solid border-border-primary bg-transparent pr-5 text-left"
                    data-module-key={moduleKey}
                    key={moduleKey}
                    onClick={() => isEnabled && navigate(paths[moduleKey])}
                    type="button"
                  >
                    <span className="mr-3 flex h-9 w-9 items-center justify-center rounded-[12px] bg-ww-surface-tint text-lg text-primary-deep">
                      {getModuleIcon(moduleKey)}
                    </span>
                    <span className="flex-grow text-[14px] font-bold text-ww-ink">
                      {t(`detail.module.${moduleKey}`)}
                    </span>
                    {isEnabled ? <RightOutline className="text-ww-ghost" /> : <span className="text-[11px] font-semibold text-ww-soft">{t('detail.comingSoon')}</span>}
                  </button>
                );
              })}
            </Surface>

            {collaborationItems.length > 0 && (
              <Surface aria-labelledby="ledger-collaboration-heading" className="overflow-hidden" material="content">
                <h2 className="px-5 pb-2 pt-4 text-[13px] font-extrabold text-ww-ink" id="ledger-collaboration-heading">
                  {t('detail.collaboration')}
                </h2>
                {collaborationItems.map(item => (
                  <button
                    className="ml-5 flex min-h-[60px] w-[calc(100%-1.25rem)] items-center border-0 border-t border-solid border-border-primary bg-transparent pr-5 text-left active:bg-ww-surface-tint"
                    data-testid={`ledger-${item.key}`}
                    key={item.key}
                    onClick={() => navigate(item.path)}
                    type="button"
                  >
                    <span className="mr-3 flex h-9 w-9 items-center justify-center rounded-[12px] bg-primary text-lg text-white">
                      {item.icon}
                    </span>
                    <span className="flex-grow text-[14px] font-bold text-ww-ink">
                      {t(`detail.collaborationItem.${item.key}`)}
                    </span>
                    <RightOutline className="text-ww-ghost" />
                  </button>
                ))}
              </Surface>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default LedgerDetailPage;
