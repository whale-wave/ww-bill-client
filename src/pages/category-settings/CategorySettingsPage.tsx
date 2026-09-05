import { CircleAlert } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LedgerKind, useLedgersQuery } from '@/entities/ledger';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { IllustratedEmptyState, PageHeader, PageLoadingState, Surface } from '@/shared/ui';

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
              <PageLoadingState label={t('nav.loading')} testId="category-settings-loading" />
            )
          : (
              <Surface className="w-full max-w-[360px] overflow-hidden" material="content">
                <IllustratedEmptyState
                  actionLabel={t('retry')}
                  description={query.isError
                    ? t('categorySettings.loadFailDesc')
                    : t('categorySettings.emptyDesc')}
                  icon={<CircleAlert className="text-primary-deep" size={38} strokeWidth={1.8} />}
                  onAction={() => void query.refetch()}
                  title={query.isError
                    ? t('categorySettings.loadFail')
                    : t('categorySettings.empty')}
                />
              </Surface>
            )}
      </main>
    </div>
  );
}
