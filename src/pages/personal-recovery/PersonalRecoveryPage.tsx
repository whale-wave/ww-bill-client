import { CircleAlert, Inbox } from 'lucide-react';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  usePersonalRecoveryRecordsQuery,
  useRestorePersonalRecordMutation,
} from '@/entities/ledger-data';
import { RecoveryList } from '@/pages/ledger-recovery/LedgerRecoveryPage';
import { useTranslation } from '@/shared/i18n';
import { IllustratedEmptyState, PageHeader, PageLoadingState, Surface } from '@/shared/ui';
import { showAppError } from '@/shared/ui/app-feedback';

export default function PersonalRecoveryPage() {
  const { t } = useTranslation(['ledger', 'common']);
  const navigate = useNavigate();
  const query = usePersonalRecoveryRecordsQuery({ params: { days: 30 } });
  const [restore] = useRestorePersonalRecordMutation();
  const [restoringId, setRestoringId] = useState<number>();

  const handleRestore = async (recordId: number, version: number) => {
    if (restoringId !== undefined)
      return;
    setRestoringId(recordId);
    try {
      await restore({ recordId, data: { version } });
    }
    catch {
      await query.refetch();
      showAppError({ icon: 'fail', content: t('ledger:recovery.failed') });
    }
    finally {
      setRestoringId(undefined);
    }
  };

  return (
    <div className="page-new bg-bg-gray">
      <PageHeader backLabel={t('common:nav.back')} onBack={() => navigate(-1)} title={t('ledger:recovery.title')} />
      {query.isLoading && <PageLoadingState label={t('common:nav.loading')} testId="personal-recovery-loading" />}
      {query.isError && (
        <div className="mx-auto w-full max-w-[520px] px-[var(--ww-page-gutter)] py-6">
          <Surface className="overflow-hidden" material="content">
            <IllustratedEmptyState
              actionLabel={t('common:nav.retry')}
              description={t('common:error.networkError')}
              icon={<CircleAlert className="text-primary-deep" size={38} strokeWidth={1.8} />}
              onAction={() => void query.refetch()}
              title={t('common:error.loadFail')}
            />
          </Surface>
        </div>
      )}
      {!query.isLoading && !query.isError && query.data.length === 0 && (
        <IllustratedEmptyState className="px-4" description={t('ledger:recovery.empty')} icon={<Inbox className="text-primary-deep" size={38} strokeWidth={1.7} />} title={t('ledger:recovery.title')} />
      )}
      {!query.isLoading && !query.isError && query.data.length > 0 && (
        <main className="mx-auto w-full max-w-[520px]">
          <RecoveryList records={query.data} onRestore={record => handleRestore(record.id, record.version)} restoringId={restoringId} />
        </main>
      )}
    </div>
  );
}
