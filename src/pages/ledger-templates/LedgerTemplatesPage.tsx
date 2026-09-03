import type { FC } from 'react';
import { Button, SpinLoading } from 'antd-mobile';
import { CircleAlert, Layers3 } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LedgerTemplateCard,
  PUBLIC_LEDGER_TEMPLATE_KEYS,
  useLedgerTemplatesQuery,
} from '@/entities/ledger';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import {
  IllustratedEmptyState,
  PageHeader,
  Surface,
} from '@/shared/ui';

const LedgerTemplatesPage: FC = () => {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const templateQuery = useLedgerTemplatesQuery();

  const orderedTemplates = useMemo(() => {
    const templateMap = new Map(templateQuery.data.map(template => [template.key, template]));
    return PUBLIC_LEDGER_TEMPLATE_KEYS.flatMap((key) => {
      const template = templateMap.get(key);
      return template ? [template] : [];
    });
  }, [templateQuery.data]);

  const handleBack = () => navigate(-1);
  const handleSelectTemplate = (templateKey: string) => {
    const searchParams = new URLSearchParams({ template: templateKey });
    navigate(`${ROUTES_PATH.LEDGER_CREATE.getPath()}?${searchParams.toString()}`);
  };

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-20 h-56 w-56 rounded-full bg-primary-light/30 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-20 h-52 w-52 rounded-full bg-ww-pink-light/25 blur-3xl" />
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={handleBack}
        title={t('templates.title')}
      />
      <main className="relative min-h-0 flex-grow overflow-auto px-[18px] pb-[max(28px,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-[620px]">
          <section className="mb-4 flex items-center gap-3 rounded-[22px] border border-solid border-white/80 bg-white/65 p-4 shadow-ww-xs backdrop-blur-xl">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] bg-primary-light/60 text-primary-deep">
              <Layers3 size={23} strokeWidth={1.8} />
            </span>
            <div>
              <h1 className="text-[17px] font-extrabold leading-6 text-ww-ink">{t('templates.heading')}</h1>
              <p className="mt-0.5 text-[12px] leading-[18px] text-ww-mid">{t('templates.guide')}</p>
            </div>
          </section>

          {templateQuery.isLoading && (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-[12px] font-semibold text-ww-mid">
              <span className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/80 bg-white/70 shadow-ww-xs"><SpinLoading color="primary" /></span>
              <span>{t('templates.loading')}</span>
            </div>
          )}

          {!templateQuery.isLoading && templateQuery.isError && (
            <Surface className="overflow-hidden" material="content">
              <IllustratedEmptyState
                description={t('templates.loadErrorDescription')}
                icon={<CircleAlert className="text-primary-deep" size={38} />}
                title={t('templates.loadError')}
              />
              <div className="px-5 pb-5">
                <Button block color="primary" onClick={() => void templateQuery.refetch()} size="large">
                  {t('templates.retry')}
                </Button>
              </div>
            </Surface>
          )}

          {!templateQuery.isLoading && !templateQuery.isError && !orderedTemplates.length && (
            <div className="flex min-h-[300px] items-center justify-center">
              <IllustratedEmptyState
                description={t('templates.emptyDescription')}
                icon={<Layers3 size={42} strokeWidth={1.5} />}
                title={t('templates.empty')}
              />
            </div>
          )}

          {!templateQuery.isLoading && !templateQuery.isError && orderedTemplates.length > 0 && (
            <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2">
              {orderedTemplates.map(template => (
                <LedgerTemplateCard
                  description={t(`template.${template.key}.description`)}
                  key={template.key}
                  name={t(`template.${template.key}.name`)}
                  onClick={() => handleSelectTemplate(template.key)}
                  template={template}
                  themeLabel={t('center.theme', {
                    theme: t(`settings.themeOptions.${template.themeKey}`, {
                      defaultValue: template.themeKey,
                    }),
                  })}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LedgerTemplatesPage;
