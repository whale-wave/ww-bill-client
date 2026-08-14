import { Button, ErrorBlock, SpinLoading } from 'antd-mobile';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LedgerKind, useLedgersQuery } from '@/entities/ledger';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { PageHeader } from '@/shared/ui';

export default function CategorySettingsPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const query = useLedgersQuery({ params: { kind: LedgerKind.SYSTEM_DEFAULT } });
  const defaultLedger = query.data.find(ledger => ledger.kind === LedgerKind.SYSTEM_DEFAULT);

  useEffect(() => {
    if (defaultLedger) {
      navigate(ROUTES_PATH.LEDGER_CATEGORIES.getPath(defaultLedger.id), {
        replace: true,
      });
    }
  }, [defaultLedger, navigate]);

  return (
    <div className="page-new relative overflow-hidden">
      <PageHeader backLabel={t('nav.back')} onBack={() => navigate(-1)} title={t('categorySettings.title')} />
      <main className="flex min-h-0 flex-1 items-center justify-center px-6 pb-12">
        {query.isLoading || defaultLedger
          ? (
              <div className="flex flex-col items-center gap-3 text-[12px] font-bold text-ww-mid">
                <SpinLoading color="primary" />
                <span>{t('loading')}</span>
              </div>
            )
          : (
              <div className="w-full max-w-[360px] text-center">
                <ErrorBlock
                  description={query.isError
                    ? t('categorySettings.loadFailDesc')
                    : t('categorySettings.emptyDesc')}
                  status="default"
                  title={query.isError
                    ? t('categorySettings.loadFail')
                    : t('categorySettings.empty')}
                />
                <Button className="mt-4" onClick={() => void query.refetch()} size="small">
                  {t('retry')}
                </Button>
              </div>
            )}
      </main>
    </div>
  );
}
