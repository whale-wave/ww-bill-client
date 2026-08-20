import { Button, ErrorBlock, Toast } from 'antd-mobile';
import { Inbox } from 'lucide-react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LedgerCapability } from '@/entities/ledger';
import { useLedgerRecoveryRecordsQuery, useRestoreLedgerRecordMutation } from '@/entities/ledger-data';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { useTranslation } from '@/shared/i18n';
import { IllustratedEmptyState, PageHeader, PageLoadingState } from '@/shared/ui';

function RecoveryContent({ ledgerId }: { ledgerId: string }) {
  const { t } = useTranslation('ledger');
  const query = useLedgerRecoveryRecordsQuery({ params: { days: 30, ledgerId } });
  const [restore, restoreState] = useRestoreLedgerRecordMutation();
  const restoringRef = useRef<number>();
  if (query.isLoading)
    return <PageLoadingState label={t('common:nav.loading')} testId="recovery-loading" />;
  if (query.isError)
    return <ErrorBlock />;
  if (query.data.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center px-4">
        <IllustratedEmptyState
          icon={<Inbox className="text-primary-deep" size={38} strokeWidth={1.7} />}
          title={t('recovery.title')}
          description={t('recovery.empty')}
        />
      </div>
    );
  }
  return (
    <>
      {query.data.map(record => (
        <div className="flex min-h-[59px] items-center justify-between border-0 border-b border-solid border-[#EBEBEB] bg-white px-4" key={record.id}>
          <span>{record.remark}</span>
          <Button
            disabled={restoreState.isLoading}
            onClick={async () => {
              if (restoringRef.current)
                return;
              restoringRef.current = record.id;
              try {
                await restore({ data: { version: record.version }, ledgerId, recordId: record.id });
              }
              catch {
                await query.refetch();
                Toast.show({ icon: 'fail', content: t('recovery.failed') });
              }
              finally {
                restoringRef.current = undefined;
              }
            }}
            size="small"
          >
            {t('recovery.restore')}
          </Button>
        </div>
      ))}
    </>
  );
}

export default function LedgerRecoveryPage() {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  return (
    <div className="page-new bg-bg-gray">
      <PageHeader backLabel={t('common:nav.back')} onBack={() => navigate(-1)} title={t('recovery.title')} />
      <LedgerScopeBoundary capability={LedgerCapability.DATA_RECOVERY}>{({ ledgerId }) => <RecoveryContent ledgerId={ledgerId} />}</LedgerScopeBoundary>
    </div>
  );
}
