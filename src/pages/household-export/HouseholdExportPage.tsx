import type { FC, FormEvent } from 'react';
import type { Household, HouseholdExportFilters } from '@/entities/household';
import { Button, Toast } from 'antd-mobile';
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
import { NavBar } from '@/shared/ui';

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
    <div className="space-y-3">
      <form className="card-rounded bg-white px-4 py-4" data-testid="household-export-form" onSubmit={handleCreate}>
        <h2 className="text-base font-medium text-font-black">{t('export.filters')}</h2>
        <p className="mt-1 text-xs leading-5 text-font-gray">{t('export.scopeHint')}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="text-xs text-font-gray">
            {t('export.startDate')}
            <input className="mt-1 h-11 w-full rounded-xl border-0 bg-bg-gray px-3 text-sm text-font-black" name="startDate" type="date" />
          </label>
          <label className="text-xs text-font-gray">
            {t('export.endDate')}
            <input className="mt-1 h-11 w-full rounded-xl border-0 bg-bg-gray px-3 text-sm text-font-black" name="endDate" type="date" />
          </label>
          <label className="text-xs text-font-gray">
            {t('export.type')}
            <select className="mt-1 h-11 w-full rounded-xl border-0 bg-bg-gray px-3 text-sm text-font-black" defaultValue="" name="type">
              <option value="">{t('export.all')}</option>
              <option value="sub">{t('export.expense')}</option>
              <option value="add">{t('export.income')}</option>
            </select>
          </label>
          <label className="text-xs text-font-gray">
            {t('export.counted')}
            <select className="mt-1 h-11 w-full rounded-xl border-0 bg-bg-gray px-3 text-sm text-font-black" defaultValue="" name="counted">
              <option value="">{t('export.all')}</option>
              <option value="true">{t('export.countedOnly')}</option>
              <option value="false">{t('export.uncountedOnly')}</option>
            </select>
          </label>
        </div>
        <label className="mt-3 block text-xs text-font-gray">
          {t('export.format')}
          <select className="mt-1 h-11 w-full rounded-xl border-0 bg-bg-gray px-3 text-sm text-font-black" defaultValue="xlsx" name="format">
            <option value="xlsx">XLSX</option>
            <option value="csv">CSV</option>
          </select>
        </label>
        <Button block className="mt-4" color="primary" loading={createState.isLoading} type="submit">
          {t('export.create')}
        </Button>
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
            <section className="card-rounded bg-white px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-medium text-font-black">{t('export.task')}</h2>
                <span className="text-xs text-font-gray">{t(`export.status.${taskQuery.data.status}`)}</span>
              </div>
              {taskQuery.data.status === 'COMPLETED' && (
                <p className="mt-2 text-sm text-font-gray">
                  {t('export.recordCount', { count: taskQuery.data.recordCount ?? 0 })}
                </p>
              )}
              {taskQuery.data.status === 'FAILED' && (
                <p className="mt-2 text-sm text-rose-600">{t('export.failed')}</p>
              )}
              {taskQuery.data.status === 'PENDING' && (
                <p className="mt-2 text-sm text-font-gray">{t('export.processing')}</p>
              )}
              {taskQuery.data.status === 'COMPLETED' && (
                <Button
                  block
                  className="mt-4"
                  color="primary"
                  data-testid="household-export-download"
                  loading={downloadState.isLoading}
                  onClick={handleDownload}
                >
                  {t('export.download')}
                </Button>
              )}
            </section>
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
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} onBack={() => navigate(-1)}>{t('export.title')}</NavBar>
      <main className="min-h-0 flex-grow overflow-auto px-3 py-3">
        <HouseholdScopeBoundary householdId={householdId}>
          {household => <ExportContent household={household} />}
        </HouseholdScopeBoundary>
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
