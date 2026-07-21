import { Button, NavBar, Toast } from 'antd-mobile';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LedgerCapability } from '@/entities/ledger';
import { useCreateLedgerExportMutation, useDownloadLedgerExportMutation, useLedgerExportTaskQuery } from '@/entities/ledger-data';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { useTranslation } from '@/shared/i18n';

function createIdempotencyKey() {
  return globalThis.crypto?.randomUUID?.() ?? `export-${Date.now()}`;
}

function ExportContent({ ledgerId }: { ledgerId: string }) {
  const { t } = useTranslation('ledger');
  const [format, setFormat] = useState<'csv' | 'xlsx'>('csv');
  const [taskId, setTaskId] = useState('');
  const [createExport, createState] = useCreateLedgerExportMutation();
  const task = useLedgerExportTaskQuery({ params: { ledgerId, taskId }, queryOptions: { enabled: Boolean(taskId), refetchInterval: data => data?.data.status === 'PENDING' ? 1500 : false } });
  const [download, downloadState] = useDownloadLedgerExportMutation();
  const submittingRef = useRef(false);
  return (
    <section className="bg-white px-4 py-4">
      <label className="block text-sm text-font-gray">
        {t('export.format')}
        <select className="mt-1 min-h-[44px] w-full border border-solid border-[#EBEBEB] bg-white" onChange={event => setFormat(event.target.value as 'csv' | 'xlsx')} value={format}>
          <option value="csv">CSV</option>
          <option value="xlsx">XLSX</option>
        </select>
      </label>
      <Button
        block
        className="mt-4"
        loading={createState.isLoading}
        onClick={async () => {
          if (submittingRef.current)
            return;
          submittingRef.current = true;
          try {
            const response = await createExport({ data: { filters: {}, format, idempotencyKey: createIdempotencyKey() }, ledgerId });
            setTaskId(response.data.id);
          }
          catch {
            Toast.show({ icon: 'fail', content: t('export.failed') });
          }
          finally {
            submittingRef.current = false;
          }
        }}
      >
        {t('export.create')}
      </Button>
      {task.data && (
        <div className="mt-4">
          <p>{t(`export.status.${task.data.status}`)}</p>
          {task.data.status === 'COMPLETED' && (
            <Button
              loading={downloadState.isLoading}
              onClick={async () => {
                const blob = await download({ ledgerId, taskId: task.data!.id });
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = task.data?.fileName ?? `ledger.${format}`;
                anchor.click();
                URL.revokeObjectURL(url);
              }}
            >
              {t('export.download')}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}

export default function LedgerExportPage() {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  return (
    <div className="page-new bg-bg-gray">
      <NavBar onBack={() => navigate(-1)}>{t('export.title')}</NavBar>
      <LedgerScopeBoundary capability={LedgerCapability.DATA_EXPORT}>{({ ledgerId }) => <ExportContent ledgerId={ledgerId} />}</LedgerScopeBoundary>
    </div>
  );
}
