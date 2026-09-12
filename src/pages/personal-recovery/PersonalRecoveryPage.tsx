import { Button, Toast } from 'antd-mobile';
import { CircleAlert, Inbox } from 'lucide-react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  usePersonalRecoveryRecordsQuery,
  useRestorePersonalRecordMutation,
} from '@/entities/ledger-data';
import { useTranslation } from '@/shared/i18n';
import { IllustratedEmptyState, PageHeader, PageLoadingState, Surface } from '@/shared/ui';

export default function PersonalRecoveryPage() {
  const { t } = useTranslation(['ledger', 'common']);
  const navigate = useNavigate();
  const query = usePersonalRecoveryRecordsQuery({ params: { days: 30 } });
  const [restore, restoreState] = useRestorePersonalRecordMutation();
  const restoringRef = useRef<number>();

  const handleRestore = async (recordId: number, version: number) => {
    if (restoringRef.current)
      return;
    restoringRef.current = recordId;
    try {
      await restore({ recordId, data: { version } });
      Toast.show({ icon: 'success', content: t('ledger:recovery.restored', { defaultValue: '记录已恢复' }) });
    }
    catch {
      await query.refetch();
      Toast.show({ icon: 'fail', content: t('ledger:recovery.failed') });
    }
    finally {
      restoringRef.current = undefined;
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
          <p className="px-4 py-3 text-xs text-ww-mid">{t('settings:recovery.description')}</p>
          {query.data.map(record => (
            <div className="flex min-h-[68px] items-center justify-between gap-3 border-0 border-b border-solid border-border-primary bg-white px-4" key={record.id}>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{record.category?.name ?? t('ledger:recovery.unknownCategory', { defaultValue: '原分类已失效' })}</div>
                <div className="truncate text-xs text-ww-mid">{record.remark || t('ledger:recovery.noRemark', { defaultValue: '无备注' })}</div>
              </div>
              <Button disabled={restoreState.isLoading && restoringRef.current === record.id} onClick={() => void handleRestore(record.id, record.version)} size="small">{t('ledger:recovery.restore')}</Button>
            </div>
          ))}
        </main>
      )}
    </div>
  );
}
