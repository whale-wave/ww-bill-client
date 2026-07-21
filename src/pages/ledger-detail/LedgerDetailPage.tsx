import type { FC, ReactNode } from 'react';
import { ErrorBlock, SpinLoading } from 'antd-mobile';
import {
  AddSquareOutline,
  CheckShieldOutline,
  PayCircleOutline,
  PieOutline,
  RightOutline,
  SetOutline,
  TeamOutline,
  UnorderedListOutline,
} from 'antd-mobile-icons';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LedgerCapability,
  LedgerKind,
  LedgerVisualIcon,
  useLedgerQuery,
} from '@/entities/ledger';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';

const LEDGER_MODULES = ['records', 'budget', 'charts', 'settings'] as const;

const MODULE_CAPABILITIES = {
  budget: LedgerCapability.BUDGET_READ,
  charts: LedgerCapability.CHART_READ,
  records: LedgerCapability.RECORD_READ,
  settings: LedgerCapability.LEDGER_READ,
} as const;

function getModuleIcon(moduleKey: typeof LEDGER_MODULES[number]): ReactNode {
  switch (moduleKey) {
    case 'records':
      return <UnorderedListOutline />;
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
  const templateKey = ledger?.templateKey
    ?? (ledger?.kind === LedgerKind.SYSTEM_DEFAULT ? 'system-default' : 'custom');

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
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} onBack={handleBack}>
        {ledger?.name ?? t('detail.title')}
      </NavBar>
      <main className="min-h-0 flex-grow overflow-auto pb-4">
        {!ledgerId && (
          <div className="flex min-h-[360px] items-center justify-center px-4">
            <ErrorBlock
              description={t('detail.invalidLedgerDescription')}
              status="default"
              title={t('detail.invalidLedger')}
            />
          </div>
        )}

        {ledgerId && ledgerQuery.isLoading && (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-sm text-font-gray">
            <SpinLoading />
            <span>{t('detail.loading')}</span>
          </div>
        )}

        {ledgerId && !ledgerQuery.isLoading && ledgerQuery.isError && (
          <div className="flex min-h-[360px] items-center justify-center px-4">
            <ErrorBlock
              description={t('detail.loadErrorDescription')}
              status="default"
              title={t('detail.loadError')}
            />
          </div>
        )}

        {ledger && !ledgerQuery.isLoading && !ledgerQuery.isError && (
          <div>
            <section className="bg-white px-4 py-4">
              <div className="flex items-center">
                <span className="mr-3 flex h-[55px] w-[55px] items-center justify-center rounded-full bg-primary text-2xl text-font-black">
                  <LedgerVisualIcon templateKey={templateKey} />
                </span>
                <div className="min-w-0">
                  <h1 className="one-line text-xl font-medium text-font-black">{ledger.name}</h1>
                  <p className="mt-1 text-sm text-font-gray">
                    {t(`kind.${ledger.kind}`)}
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-3 bg-white" aria-labelledby="ledger-basic-info-heading">
              <h2 className="px-4 pb-2 pt-3 text-sm font-medium text-font-black" id="ledger-basic-info-heading">
                {t('detail.basicInfo')}
              </h2>
              {[
                [t('detail.template'), t(`template.${templateKey}.name`)],
                [t('detail.theme'), ledger.themeKey],
                [t('detail.role'), t(`role.${ledger.myRole}`)],
                [t('detail.status'), t(`status.${ledger.status}`)],
                [t('detail.monthStartDay'), t('detail.monthStartDayValue', { day: ledger.monthStartDay })],
              ].map(([label, value]) => (
                <div className="ml-4 flex min-h-[55px] items-center justify-between border-0 border-t border-solid border-[#EBEBEB] pr-4" key={label}>
                  <span className="text-sm text-font-black">{label}</span>
                  <span className="ml-4 text-right text-sm text-font-gray">{value}</span>
                </div>
              ))}
            </section>

            <section className="mt-3 bg-white" aria-labelledby="ledger-modules-heading">
              <h2 className="px-4 pb-2 pt-3 text-sm font-medium text-font-black" id="ledger-modules-heading">
                {t('detail.modules')}
              </h2>
              {LEDGER_MODULES.map((moduleKey) => {
                const isEnabled = ledger.capabilities.includes(MODULE_CAPABILITIES[moduleKey]);
                const paths = {
                  budget: ROUTES_PATH.LEDGER_BUDGET.getPath(ledger.id),
                  charts: ROUTES_PATH.LEDGER_CHARTS.getPath(ledger.id),
                  records: ROUTES_PATH.LEDGER_RECORDS.getPath(ledger.id),
                  settings: ROUTES_PATH.LEDGER_SETTINGS.getPath(ledger.id),
                };
                return (
                  <button
                    aria-disabled={!isEnabled}
                    className="ml-4 flex min-h-[59px] w-[calc(100%-1rem)] items-center border-0 border-t border-solid border-[#EBEBEB] bg-white pr-4 text-left"
                    key={moduleKey}
                    onClick={() => isEnabled && navigate(paths[moduleKey])}
                    type="button"
                  >
                    <span className="mr-3 flex h-[35px] w-[35px] items-center justify-center rounded-full bg-bg-gray text-lg text-font-black">
                      {getModuleIcon(moduleKey)}
                    </span>
                    <span className="flex-grow text-base text-font-black">
                      {t(`detail.module.${moduleKey}`)}
                    </span>
                    {isEnabled ? <RightOutline className="text-font-gray" /> : <span className="text-xs text-font-gray">{t('detail.comingSoon')}</span>}
                  </button>
                );
              })}
            </section>

            {collaborationItems.length > 0 && (
              <section className="mt-3 bg-white" aria-labelledby="ledger-collaboration-heading">
                <h2 className="px-4 pb-2 pt-3 text-sm font-medium text-font-black" id="ledger-collaboration-heading">
                  {t('detail.collaboration')}
                </h2>
                {collaborationItems.map(item => (
                  <button
                    className="ml-4 flex min-h-[59px] w-[calc(100%-1rem)] items-center border-0 border-t border-solid border-[#EBEBEB] bg-white pr-4 text-left active:bg-slate-50"
                    data-testid={`ledger-${item.key}`}
                    key={item.key}
                    onClick={() => navigate(item.path)}
                    type="button"
                  >
                    <span className="mr-3 flex h-[35px] w-[35px] items-center justify-center rounded-full bg-primary text-lg text-font-black">
                      {item.icon}
                    </span>
                    <span className="flex-grow text-base text-font-black">
                      {t(`detail.collaborationItem.${item.key}`)}
                    </span>
                    <RightOutline className="text-font-gray" />
                  </button>
                ))}
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default LedgerDetailPage;
