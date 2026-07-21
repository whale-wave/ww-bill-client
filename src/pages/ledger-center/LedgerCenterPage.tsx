import type { FC } from 'react';
import type { Ledger } from '@/entities/ledger';
import { Button, ErrorBlock, SpinLoading } from 'antd-mobile';
import { AddOutline, FileOutline, TeamOutline } from 'antd-mobile-icons';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LedgerCard,
  LedgerKind,
  useLedgersQuery,
} from '@/entities/ledger';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';

function getLedgerTemplateKey(ledger: Ledger) {
  if (ledger.templateKey)
    return ledger.templateKey;

  return ledger.kind === LedgerKind.SYSTEM_DEFAULT ? 'system-default' : 'custom';
}

const LedgerCenterPage: FC = () => {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const ledgerQuery = useLedgersQuery();

  const groupedLedgers = useMemo(() => ({
    custom: ledgerQuery.data.filter(ledger => ledger.kind === LedgerKind.CUSTOM),
    system: ledgerQuery.data.filter(ledger => ledger.kind === LedgerKind.SYSTEM_DEFAULT),
  }), [ledgerQuery.data]);

  const handleBack = () => navigate(-1);
  const handleCreate = () => navigate(ROUTES_PATH.LEDGER_TEMPLATES.getPath());
  const handleOpenLedger = (ledgerId: string) => {
    navigate(ROUTES_PATH.LEDGER_DETAIL.getPath(ledgerId));
  };

  const renderLedger = (ledger: Ledger) => {
    const templateKey = getLedgerTemplateKey(ledger);
    const templateName = t(`template.${templateKey}.name`);

    return (
      <LedgerCard
        key={ledger.id}
        kindLabel={t(`kind.${ledger.kind}`)}
        ledger={ledger}
        onClick={() => handleOpenLedger(ledger.id)}
        roleLabel={t(`role.${ledger.myRole}`)}
        statusLabel={t(`status.${ledger.status}`)}
        templateLabel={t('center.template', { template: templateName })}
        themeLabel={t('center.theme', { theme: ledger.themeKey })}
      />
    );
  };

  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} onBack={handleBack}>
        {t('center.title')}
      </NavBar>
      <main className="min-h-0 flex-grow overflow-auto px-3 pb-[84px] pt-3">
        <section className="mb-4 grid grid-cols-2 gap-2">
          <button
            className="card-rounded flex min-h-[64px] items-center border-0 bg-white px-3 text-left active:bg-slate-50"
            onClick={() => navigate(ROUTES_PATH.LEDGER_JOIN.getPath())}
            type="button"
          >
            <TeamOutline className="mr-2 text-xl text-font-black" />
            <span className="text-sm text-font-black">{t('center.join')}</span>
          </button>
          <button
            className="card-rounded flex min-h-[64px] items-center border-0 bg-white px-3 text-left active:bg-slate-50"
            onClick={() => navigate(ROUTES_PATH.LEDGER_APPLICATIONS.getPath())}
            type="button"
          >
            <FileOutline className="mr-2 text-xl text-font-black" />
            <span className="text-sm text-font-black">{t('center.applications')}</span>
          </button>
        </section>
        {ledgerQuery.isLoading && (
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-sm text-font-gray" data-testid="ledger-center-loading">
            <SpinLoading />
            <span>{t('center.loading')}</span>
          </div>
        )}

        {!ledgerQuery.isLoading && ledgerQuery.isError && (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
            <ErrorBlock
              description={t('center.loadErrorDescription')}
              status="default"
              title={t('center.loadError')}
            />
            <Button
              color="primary"
              data-testid="ledger-center-retry"
              onClick={() => void ledgerQuery.refetch()}
            >
              {t('center.retry')}
            </Button>
          </div>
        )}

        {!ledgerQuery.isLoading && !ledgerQuery.isError && !ledgerQuery.data.length && (
          <div className="flex min-h-[340px] items-center justify-center">
            <ErrorBlock
              description={t('center.emptyDescription')}
              status="empty"
              title={t('center.empty')}
            />
          </div>
        )}

        {!ledgerQuery.isLoading && !ledgerQuery.isError && ledgerQuery.data.length > 0 && (
          <div className="space-y-4">
            {groupedLedgers.system.length > 0 && (
              <section aria-labelledby="system-ledger-heading">
                <h2 className="mb-2 px-1 text-sm font-medium text-font-black" id="system-ledger-heading">
                  {t('center.systemSection')}
                </h2>
                <div className="space-y-2">
                  {groupedLedgers.system.map(renderLedger)}
                </div>
              </section>
            )}
            <section aria-labelledby="custom-ledger-heading">
              <h2 className="mb-2 px-1 text-sm font-medium text-font-black" id="custom-ledger-heading">
                {t('center.customSection')}
              </h2>
              {groupedLedgers.custom.length
                ? (
                    <div className="space-y-2">
                      {groupedLedgers.custom.map(renderLedger)}
                    </div>
                  )
                : (
                    <div className="card-rounded bg-white px-4 py-6 text-center text-sm text-font-gray">
                      {t('center.customEmpty')}
                    </div>
                  )}
            </section>
          </div>
        )}
      </main>
      <div className="fixed inset-x-0 bottom-0 z-10 border-0 border-t border-solid border-[#EBEBEB] bg-white p-3">
        <Button block color="primary" onClick={handleCreate} size="large">
          <span className="flex items-center justify-center gap-1">
            <AddOutline />
            {t('center.create')}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default LedgerCenterPage;
