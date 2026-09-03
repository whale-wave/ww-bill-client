import type { FC, FormEvent } from 'react';
import type { Household, HouseholdExportFilters } from '@/entities/household';
import { Toast } from 'antd-mobile';
import { FileSpreadsheet } from 'lucide-react';
import { useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  useCreateHouseholdExportMutation,
  useDownloadHouseholdExportMutation,
  useHouseholdExportTaskQuery,
} from '@/entities/household';
import {
  getApiErrorMessage,
  HouseholdPageState,
  HouseholdScopeBoundary,
} from '@/features/household';
import { useTranslation } from '@/shared/i18n';
import { PageHeader, Surface } from '@/shared/ui';

const ExportContent: FC<{ household: Household }> = ({ household }) => {
  const { t } = useTranslation('household');
  const [searchParams, setSearchParams] = useSearchParams();
  const taskId = searchParams.get('taskId') ?? '';
  const [createExport, createState] = useCreateHouseholdExportMutation();
  const [downloadExport, downloadState] = useDownloadHouseholdExportMutation();
  const taskQuery = useHouseholdExportTaskQuery({
    params: { householdId: household.id, taskId },
    queryOptions: {
      enabled: Boolean(taskId),
      refetchInterval: response => response?.data.status === 'PENDING' ? 1500 : false,
    },
  });
  const submittingRef = useRef(false);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current)
      return;
    const formData = new FormData(event.currentTarget);
    const startDate = String(formData.get('startDate') ?? '');
    const endDate = String(formData.get('endDate') ?? '');
    const type = String(formData.get('type') ?? '');
    const counted = String(formData.get('counted') ?? '');
    const filters: HouseholdExportFilters = {
      ...(startDate ? { startDate: `${startDate}T00:00:00.000Z` } : {}),
      ...(endDate ? { endDate: `${endDate}T23:59:59.999Z` } : {}),
      ...(type === 'add' || type === 'sub' ? { type } : {}),
      ...(counted === 'true' || counted === 'false'
        ? { counted: counted === 'true' }
        : {}),
    };
    submittingRef.current = true;
    try {
      const response = await createExport({
        data: {
          filters,
          format: String(formData.get('format')) === 'csv' ? 'csv' : 'xlsx',
          idempotencyKey: createIdempotencyKey(),
        },
        householdId: household.id,
      });
      setSearchParams({ taskId: response.data.id }, { replace: true });
      void Toast.show({ content: t('export.created'), icon: 'success' });
    }
    catch (error) {
      void Toast.show({ content: getApiErrorMessage(error, t('common.failed')), icon: 'fail' });
    }
    finally {
      submittingRef.current = false;
    }
  };

  const handleDownload = async () => {
    if (!taskQuery.data || taskQuery.data.status !== 'COMPLETED')
      return;
    try {
      const blob = await downloadExport({ householdId: household.id, taskId: taskQuery.data.id });
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = taskQuery.data.fileName ?? `household-export.${taskQuery.data.format}`;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    }
    catch (error) {
      void Toast.show({ content: getApiErrorMessage(error, t('export.downloadFailed')), icon: 'fail' });
    }
  };

  return (
    <div>
      <form className="mt-2" data-testid="household-export-form" onSubmit={handleCreate}>
        <Surface className="px-5 py-5" material="raised">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-white/80 bg-white/85 text-primary-deep shadow-ww-xs">
              <FileSpreadsheet size={21} />
            </span>
            <div className="min-w-0">
              <h2 className="text-[15px] font-extrabold leading-6 text-ww-ink">{t('export.filters')}</h2>
              <p className="mt-0.5 text-[12px] font-semibold leading-5 text-ww-mid">{t('export.scopeHint')}</p>
            </div>
          </div>
          <label className="block min-w-0 text-[12px] font-bold text-ww-mid">
            {t('export.startDate')}
            <span className="mt-2 flex h-12 min-w-0 items-center rounded-[16px] border border-solid border-border-primary bg-white/90 px-3 shadow-ww-xs transition focus-within:border-primary-mid focus-within:shadow-ww">
              <input className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] font-semibold text-ww-ink outline-none" name="startDate" type="date" />
            </span>
          </label>
          <label className="mt-3 block min-w-0 text-[12px] font-bold text-ww-mid">
            {t('export.endDate')}
            <span className="mt-2 flex h-12 min-w-0 items-center rounded-[16px] border border-solid border-border-primary bg-white/90 px-3 shadow-ww-xs transition focus-within:border-primary-mid focus-within:shadow-ww">
              <input className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] font-semibold text-ww-ink outline-none" name="endDate" type="date" />
            </span>
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="min-w-0 text-[12px] font-bold text-ww-mid">
              {t('export.type')}
              <select className="mt-2 h-12 w-full rounded-[16px] border border-solid border-border-primary bg-white/90 px-3 text-[14px] font-semibold text-ww-ink shadow-ww-xs outline-none" defaultValue="" name="type">
                <option value="">{t('export.all')}</option>
                <option value="sub">{t('export.expense')}</option>
                <option value="add">{t('export.income')}</option>
              </select>
            </label>
            <label className="min-w-0 text-[12px] font-bold text-ww-mid">
              {t('export.counted')}
              <select className="mt-2 h-12 w-full rounded-[16px] border border-solid border-border-primary bg-white/90 px-3 text-[14px] font-semibold text-ww-ink shadow-ww-xs outline-none" defaultValue="" name="counted">
                <option value="">{t('export.all')}</option>
                <option value="true">{t('export.countedOnly')}</option>
                <option value="false">{t('export.uncountedOnly')}</option>
              </select>
            </label>
          </div>
          <label className="mt-3 block min-w-0 text-[12px] font-bold text-ww-mid">
            {t('export.format')}
            <select className="mt-2 h-12 w-full rounded-[16px] border border-solid border-border-primary bg-white/90 px-3 text-[14px] font-semibold text-ww-ink shadow-ww-xs outline-none" defaultValue="xlsx" name="format">
              <option value="xlsx">XLSX</option>
              <option value="csv">CSV</option>
            </select>
          </label>
          <button
            className="mt-6 h-[52px] w-full rounded-[18px] border-0 bg-primary text-[14px] font-extrabold text-white shadow-ww disabled:opacity-45"
            disabled={createState.isLoading}
            type="submit"
          >
            {createState.isLoading ? t('export.creating') : t('export.create')}
          </button>
        </Surface>
      </form>

      {taskId && (
        <HouseholdPageState
          errorDescription={t('export.taskLoadError')}
          errorTitle={t('common.loadError')}
          isError={taskQuery.isError}
          isLoading={taskQuery.isLoading}
          loadingLabel={t('common.loading')}
          onRetry={() => void taskQuery.refetch()}
          retryLabel={t('common.retry')}
        >
          {taskQuery.data && (
            <Surface className="mt-4 px-5 py-5" material="content">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[15px] font-extrabold text-ww-ink">{t('export.task')}</h2>
                <span className="shrink-0 rounded-full bg-primary-light/35 px-3 py-1 text-[11px] font-bold text-primary-deep">
                  {t(`export.status.${taskQuery.data.status}`)}
                </span>
              </div>
              {taskQuery.data.status === 'COMPLETED' && (
                <p className="mt-2 text-[13px] font-semibold text-ww-mid">
                  {t('export.recordCount', { count: taskQuery.data.recordCount ?? 0 })}
                </p>
              )}
              {taskQuery.data.status === 'FAILED' && (
                <p className="mt-2 text-[13px] font-semibold text-feedback-danger">{t('export.failed')}</p>
              )}
              {taskQuery.data.status === 'PENDING' && (
                <p className="mt-2 text-[13px] font-semibold text-ww-mid">{t('export.processing')}</p>
              )}
              {taskQuery.data.status === 'COMPLETED' && (
                <button
                  className="mt-5 h-[52px] w-full rounded-[18px] border-0 bg-primary text-[14px] font-extrabold text-white shadow-ww disabled:opacity-45"
                  data-testid="household-export-download"
                  disabled={downloadState.isLoading}
                  onClick={handleDownload}
                  type="button"
                >
                  {downloadState.isLoading ? t('export.downloading') : t('export.download')}
                </button>
              )}
            </Surface>
          )}
        </HouseholdPageState>
      )}
    </div>
  );
};

const HouseholdExportPage: FC = () => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const { householdId = '' } = useParams<{ householdId: string }>();
  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-20 h-56 w-56 rounded-full bg-primary-light/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-16 h-52 w-52 rounded-full bg-ww-pink-light/25 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={() => navigate(-1)} title={t('export.title')} />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-[max(28px,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-[520px]">
          <HouseholdScopeBoundary householdId={householdId}>
            {household => <ExportContent household={household} />}
          </HouseholdScopeBoundary>
        </div>
      </main>
    </div>
  );
};

function createIdempotencyKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    return `household-export-${crypto.randomUUID()}`;
  return `household-export-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default HouseholdExportPage;
