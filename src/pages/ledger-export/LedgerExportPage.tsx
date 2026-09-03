import { Toast } from 'antd-mobile';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LedgerCapability } from '@/entities/ledger';
import { useCreateLedgerExportMutation, useDownloadLedgerExportMutation, useLedgerExportTaskQuery } from '@/entities/ledger-data';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { useTranslation } from '@/shared/i18n';
import { PageHeader, Surface } from '@/shared/ui';

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
    <main className="min-h-0 flex-grow overflow-auto px-[18px] pb-6 pt-2">
      <div className="mx-auto w-full max-w-[520px]">
        <Surface className="px-4 py-4" material="raised">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white/70 text-primary-deep shadow-ww-xs"><FileSpreadsheet size={21} /></span>
            <strong className="text-[14px] font-extrabold text-ww-ink">{t('export.title')}</strong>
          </div>
          <label className="block text-[11px] font-bold text-ww-soft">
            {t('export.format')}
            <select className="mt-2 h-12 w-full rounded-[15px] border border-solid border-border-primary bg-white/85 px-3 text-[13px] font-bold text-ww-ink" onChange={event => setFormat(event.target.value as 'csv' | 'xlsx')} value={format}>
              <option value="csv">CSV</option>
              <option value="xlsx">XLSX</option>
            </select>
          </label>
          <button
            className="mt-4 h-[52px] w-full rounded-[18px] border-0 bg-primary text-[14px] font-extrabold text-white shadow-ww disabled:opacity-45"
            disabled={createState.isLoading}
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
            type="button"
          >
            {createState.isLoading ? t('export.creating') : t('export.create')}
          </button>
          {task.data && (
            <div className="mt-4 rounded-[15px] border border-solid border-white/80 bg-white/65 px-3 py-3">
              <p className="text-[12px] font-bold text-ww-mid">{t(`export.status.${task.data.status}`)}</p>
              {task.data.status === 'COMPLETED' && (
                <button
                  className="mt-3 flex h-12 items-center justify-center gap-2 rounded-[16px] border border-solid border-border-primary bg-white/85 px-4 text-[13px] font-extrabold text-primary-deep shadow-ww-xs disabled:opacity-45"
                  disabled={downloadState.isLoading}
                  onClick={async () => {
                    const blob = await download({ ledgerId, taskId: task.data!.id });
                    const url = URL.createObjectURL(blob);
                    const anchor = document.createElement('a');
                    anchor.href = url;
                    anchor.download = task.data?.fileName ?? `ledger.${format}`;
                    anchor.click();
                    URL.revokeObjectURL(url);
                  }}
                  type="button"
                >
                  <Download size={15} />
                  {downloadState.isLoading ? t('export.downloading') : t('export.download')}
                </button>
              )}
            </div>
          )}
        </Surface>
      </div>
    </main>
  );
}

export default function LedgerExportPage() {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-24 h-52 w-52 rounded-full bg-primary-light/35 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={() => navigate(-1)} title={t('export.title')} />
      <LedgerScopeBoundary capability={LedgerCapability.DATA_EXPORT}>{({ ledgerId }) => <ExportContent ledgerId={ledgerId} />}</LedgerScopeBoundary>
    </div>
  );
}
