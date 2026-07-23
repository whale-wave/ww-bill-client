import type { FC } from 'react';
import type { LedgerCreateFormValues } from './model/ledger-create-form';
import { Button, ErrorBlock, SpinLoading, Toast } from 'antd-mobile';
import { useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  isCreatableLedgerTemplateKey,
  LedgerVisualIcon,
  useCreateLedgerMutation,
  useLedgerTemplatesQuery,
} from '@/entities/ledger';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';
import { buildLedgerCreatePayload } from './model/ledger-create-form';
import { LedgerCreateForm } from './ui/LedgerCreateForm';

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim())
    return error.message;

  return fallback;
}

const LedgerCreatePage: FC = () => {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateKeyParam = searchParams.get('template');
  const templateKey = isCreatableLedgerTemplateKey(templateKeyParam)
    ? templateKeyParam
    : undefined;
  const templateQuery = useLedgerTemplatesQuery({
    queryOptions: { enabled: Boolean(templateKey) },
  });
  const [createLedger, createState] = useCreateLedgerMutation();
  const isSubmittingRef = useRef(false);
  const selectedTemplate = templateQuery.data.find(template => template.key === templateKey);

  const handleBack = () => navigate(-1);
  const handleChooseTemplate = () => navigate(ROUTES_PATH.LEDGER_TEMPLATES.getPath());
  const handleCreate = async (values: LedgerCreateFormValues) => {
    if (!templateKey || isSubmittingRef.current)
      return;

    isSubmittingRef.current = true;
    try {
      const response = await createLedger(buildLedgerCreatePayload(values, templateKey));
      void Toast.show({ content: t('create.success'), icon: 'success' });
      navigate(ROUTES_PATH.LEDGER_RECORDS.getPath(response.data.id), { replace: true });
    }
    catch (error) {
      void Toast.show({
        content: getErrorMessage(error, t('create.failed')),
        icon: 'fail',
      });
    }
    finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} onBack={handleBack}>
        {t('create.title')}
      </NavBar>
      <main className="min-h-0 flex-grow overflow-auto px-3 py-3">
        {!templateKey && (
          <div className="flex min-h-[340px] flex-col items-center justify-center gap-4">
            <ErrorBlock
              description={t('create.invalidTemplateDescription')}
              status="empty"
              title={t('create.invalidTemplate')}
            />
            <Button color="primary" onClick={handleChooseTemplate}>
              {t('create.chooseTemplate')}
            </Button>
          </div>
        )}

        {templateKey && templateQuery.isLoading && (
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-sm text-font-gray">
            <SpinLoading />
            <span>{t('templates.loading')}</span>
          </div>
        )}

        {templateKey && !templateQuery.isLoading && templateQuery.isError && (
          <div className="flex min-h-[340px] flex-col items-center justify-center gap-4">
            <ErrorBlock
              description={t('create.loadErrorDescription')}
              status="default"
              title={t('create.loadError')}
            />
            <Button color="primary" onClick={() => void templateQuery.refetch()}>
              {t('create.retry')}
            </Button>
          </div>
        )}

        {templateKey
          && !templateQuery.isLoading
          && !templateQuery.isError
          && !selectedTemplate && (
          <div className="flex min-h-[340px] flex-col items-center justify-center gap-4">
            <ErrorBlock
              description={t('create.invalidTemplateDescription')}
              status="empty"
              title={t('create.invalidTemplate')}
            />
            <Button color="primary" onClick={handleChooseTemplate}>
              {t('create.chooseTemplate')}
            </Button>
          </div>
        )}

        {selectedTemplate && !templateQuery.isLoading && !templateQuery.isError && (
          <div className="space-y-3">
            <section className="card-rounded bg-white px-4 py-3" aria-labelledby="selected-template-heading">
              <h2 className="mb-3 text-sm font-medium text-font-black" id="selected-template-heading">
                {t('create.selectedTemplate')}
              </h2>
              <div className="flex items-center">
                <span className="mr-3 flex h-[42px] w-[42px] items-center justify-center rounded-full bg-primary text-xl text-font-black">
                  <LedgerVisualIcon templateKey={selectedTemplate.key} />
                </span>
                <span className="min-w-0 flex-grow">
                  <span className="block text-base font-medium text-font-black">
                    {t(`template.${selectedTemplate.key}.name`)}
                  </span>
                  <span className="mt-1 block text-xs text-font-gray">
                    {t(`template.${selectedTemplate.key}.description`)}
                  </span>
                  <span className="mt-1 block text-xs text-font-gray">
                    {t('create.templateVersion', { version: selectedTemplate.version })}
                  </span>
                </span>
              </div>
            </section>
            <LedgerCreateForm
              defaultName={selectedTemplate.defaultName}
              isSubmitting={createState.isLoading}
              onSubmit={handleCreate}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default LedgerCreatePage;
