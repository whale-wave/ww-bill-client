import type { FC } from 'react';
import type { LedgerCreateFormValues } from './model/ledger-create-form';
import { Button, SpinLoading, Toast } from 'antd-mobile';
import { BookOpen, CircleAlert, Sparkles } from 'lucide-react';
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
import {
  GradientPanel,
  IllustratedEmptyState,
  PageHeader,
} from '@/shared/ui';
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
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-20 h-56 w-56 rounded-full bg-primary-light/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-16 h-52 w-52 rounded-full bg-ww-pink-light/25 blur-3xl" />
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={handleBack}
        subtitle={t('create.subtitle')}
        title={t('create.title')}
      />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-[max(28px,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-[520px]">
          {!templateKey && (
            <GradientPanel className="overflow-hidden" elevation="low" surface="glass">
              <IllustratedEmptyState
                accentIcon={<Sparkles size={17} />}
                description={t('create.invalidTemplateDescription')}
                icon={<BookOpen className="text-primary-deep" size={38} />}
                title={t('create.invalidTemplate')}
              />
              <div className="px-5 pb-5">
                <Button block color="primary" onClick={handleChooseTemplate} size="large">
                  {t('create.chooseTemplate')}
                </Button>
              </div>
            </GradientPanel>
          )}

          {templateKey && templateQuery.isLoading && (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-[12px] font-semibold text-ww-mid">
              <span className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/80 bg-white/70 shadow-ww-xs">
                <SpinLoading color="primary" />
              </span>
              <span>{t('templates.loading')}</span>
            </div>
          )}

          {templateKey && !templateQuery.isLoading && templateQuery.isError && (
            <GradientPanel className="overflow-hidden" elevation="low" surface="glass">
              <IllustratedEmptyState
                description={t('create.loadErrorDescription')}
                icon={<CircleAlert className="text-primary-deep" size={38} />}
                title={t('create.loadError')}
              />
              <div className="px-5 pb-5">
                <Button block color="primary" onClick={() => void templateQuery.refetch()} size="large">
                  {t('create.retry')}
                </Button>
              </div>
            </GradientPanel>
          )}

          {templateKey
            && !templateQuery.isLoading
            && !templateQuery.isError
            && !selectedTemplate && (
            <GradientPanel className="overflow-hidden" elevation="low" surface="glass">
              <IllustratedEmptyState
                accentIcon={<Sparkles size={17} />}
                description={t('create.invalidTemplateDescription')}
                icon={<BookOpen className="text-primary-deep" size={38} />}
                title={t('create.invalidTemplate')}
              />
              <div className="px-5 pb-5">
                <Button block color="primary" onClick={handleChooseTemplate} size="large">
                  {t('create.chooseTemplate')}
                </Button>
              </div>
            </GradientPanel>
          )}

          {selectedTemplate && !templateQuery.isLoading && !templateQuery.isError && (
            <div className="space-y-4">
              <GradientPanel className="relative overflow-hidden px-5 py-5" elevation="high" surface="ice">
                <div aria-hidden="true" className="absolute -right-7 -top-8 h-24 w-24 rounded-full border-[18px] border-solid border-white/20" />
                <div className="relative flex items-start justify-between gap-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary-deep" id="selected-template-heading">
                    {t('create.selectedTemplate')}
                  </span>
                  <button className="rounded-full border border-solid border-white/90 bg-white/60 px-3 py-1.5 text-[10px] font-extrabold text-primary-deep shadow-ww-xs" onClick={handleChooseTemplate} type="button">
                    {t('create.changeTemplate')}
                  </button>
                </div>
                <div aria-labelledby="selected-template-heading" className="relative mt-4 flex items-center gap-4">
                  <span className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[20px] border border-white/90 bg-white/70 text-[25px] text-primary-deep shadow-ww-xs">
                    <LedgerVisualIcon templateKey={selectedTemplate.key} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[18px] font-black text-ww-ink">
                      {t(`template.${selectedTemplate.key}.name`)}
                    </span>
                    <span className="mt-1 block text-[11px] leading-[17px] text-ww-mid">
                      {t(`template.${selectedTemplate.key}.description`)}
                    </span>
                    <span className="mt-2 inline-flex rounded-full bg-white/55 px-2.5 py-1 text-[9px] font-bold text-ww-soft">
                      {t('create.templateVersion', { version: selectedTemplate.version })}
                    </span>
                  </span>
                </div>
              </GradientPanel>
              <LedgerCreateForm
                defaultName={t(`template.${selectedTemplate.key}.name`)}
                isSubmitting={createState.isLoading}
                onSubmit={handleCreate}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LedgerCreatePage;
