import type { RecoverableLedgerRecord } from '@/entities/ledger-data';
import { Toast } from 'antd-mobile';
import { CircleAlert, Inbox } from 'lucide-react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryIcon } from '@/entities/category';
import { useLedgerRecoveryRecordsQuery, useRestoreLedgerRecordMutation } from '@/entities/ledger-data';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { useTranslation } from '@/shared/i18n';
import { formatLocalizedDateTime } from '@/shared/lib';
import { AppButton, confirmAppAction, IllustratedEmptyState, PageHeader, PageLoadingState, Surface } from '@/shared/ui';

interface RecoveryListProps {
  records: RecoverableLedgerRecord[];
  restoringId?: number;
  onRestore: (record: RecoverableLedgerRecord) => Promise<void>;
  showDeletedBy?: boolean;
}

export function RecoveryList({ records, restoringId, onRestore, showDeletedBy = false }: RecoveryListProps) {
  const { t, i18n } = useTranslation('ledger');
  const handleConfirmRestore = async (record: RecoverableLedgerRecord) => {
    const confirmed = await confirmAppAction({
      cancelText: t('common:nav.cancel'),
      confirmText: t('recovery.restore'),
      description: t('recovery.confirmDescription'),
      title: t('recovery.confirmTitle'),
    });
    if (confirmed)
      await onRestore(record);
  };

  return (
    <main className="mx-auto w-full max-w-[520px] px-[18px] pb-6">
      <div className="mb-3 rounded-[20px] bg-primary-light/55 px-4 py-3 text-[12px] font-semibold leading-5 text-primary-deep">
        {t('recovery.retention')}
      </div>
      <Surface className="overflow-hidden" material="content">
        {records.map(record => (
          <div className="flex min-h-[82px] items-center gap-3 border-0 border-b border-solid border-border-primary px-3 last:border-b-0" key={record.id}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-primary-light text-primary-deep">
              <CategoryIcon categoryName={record.category?.name} iconKey={record.category?.icon} size={21} />
            </div>
            <div className="min-w-0 flex-1 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[14px] font-extrabold text-ww-ink">{record.category?.name ?? t('recovery.unknownCategory')}</span>
                <span className={`shrink-0 font-number text-[16px] font-black ${record.type === 'sub' ? 'text-ww-ink' : 'text-feedback-success'}`}>
                  {record.type === 'sub' ? '-' : '+'}
                  {record.amount}
                </span>
              </div>
              <div className="mt-1 truncate text-[12px] text-ww-mid">{record.remark || t('recovery.noRemark')}</div>
              <div className="mt-1 truncate text-[11px] text-ww-soft">
                {formatLocalizedDateTime(record.time, i18n.language)}
                {' '}
                ·
                {t('recovery.deletedAt', { time: formatLocalizedDateTime(record.deletedAt, i18n.language) })}
                {showDeletedBy && record.deletedBy?.name ? ` · ${t('recovery.deletedBy', { name: record.deletedBy.name })}` : ''}
              </div>
            </div>
            <AppButton aria-label={`${t('recovery.restore')} ${record.category?.name ?? ''}`} disabled={restoringId !== undefined} loading={restoringId === record.id} onClick={() => void handleConfirmRestore(record)} size="compact" variant="secondary">
              {t('recovery.restore')}
            </AppButton>
          </div>
        ))}
      </Surface>
    </main>
  );
}

function RecoveryContent({ ledgerId }: { ledgerId: string }) {
  const { t } = useTranslation('ledger');
  const query = useLedgerRecoveryRecordsQuery({ params: { days: 30, ledgerId } });
  const [restore] = useRestoreLedgerRecordMutation();
  const restoringRef = useRef<number>();
  if (query.isLoading)
    return <PageLoadingState label={t('common:nav.loading')} testId="recovery-loading" />;
  if (query.isError) {
    return (
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
    );
  }
  if (query.data.length === 0) {
    return (
      <IllustratedEmptyState
        className="px-4"
        icon={<Inbox className="text-primary-deep" size={38} strokeWidth={1.7} />}
        title={t('recovery.title')}
        description={t('recovery.empty')}
      />
    );
  }
  return (
    <RecoveryList
      records={query.data}
      restoringId={restoringRef.current}
      onRestore={async (record) => {
        restoringRef.current = record.id;
        try {
          await restore({ data: { version: record.version }, ledgerId, recordId: record.id });
          Toast.show({ icon: 'success', content: t('recovery.restored') });
        }
        catch {
          await query.refetch();
          Toast.show({ icon: 'fail', content: t('recovery.failed') });
        }
        finally {
          restoringRef.current = undefined;
        }
      }}
      showDeletedBy
    />
  );
}

export default function LedgerRecoveryPage() {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  return (
    <div className="page-new bg-bg-gray">
      <PageHeader backLabel={t('common:nav.back')} onBack={() => navigate(-1)} title={t('recovery.title')} />
      <LedgerScopeBoundary>{({ ledgerId }) => <RecoveryContent ledgerId={ledgerId} />}</LedgerScopeBoundary>
    </div>
  );
}
