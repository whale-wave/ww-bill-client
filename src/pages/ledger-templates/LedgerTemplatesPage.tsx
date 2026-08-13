import type { FC } from 'react';
import { Button, ErrorBlock, SpinLoading } from 'antd-mobile';
import { Layers3 } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LedgerTemplateCard,
  PUBLIC_LEDGER_TEMPLATE_KEYS,
  useLedgerTemplatesQuery,
} from '@/entities/ledger';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { IllustratedEmptyState, NavBar } from '@/shared/ui';

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
      <NavBar back={t('common:nav.back')} onBack={handleBack}>
        {t('templates.title')}
      </NavBar>
      <main className="relative min-h-0 flex-grow overflow-auto px-[18px] pb-6 pt-4">
        <section className="mb-4 flex items-center gap-3 rounded-[22px] border border-solid border-white/80 bg-white/65 p-4 shadow-ww-xs backdrop-blur-xl">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] bg-primary-light/60 text-primary-deep">
            <Layers3 size={23} strokeWidth={1.8} />
          </span>
          <div>
            <h1 className="text-[17px] font-extrabold leading-6 text-ww-ink">{t('templates.heading')}</h1>
            <p className="mt-0.5 text-[12px] leading-[18px] text-ww-mid">{t('templates.subtitle')}</p>
          </div>
        </section>

        {templateQuery.isLoading && (
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-sm text-font-gray">
            <SpinLoading />
            <span>{t('templates.loading')}</span>
          </div>
        )}

        {!templateQuery.isLoading && templateQuery.isError && (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
            <ErrorBlock
              description={t('templates.loadErrorDescription')}
              status="default"
              title={t('templates.loadError')}
            />
            <Button color="primary" onClick={() => void templateQuery.refetch()}>
              {t('templates.retry')}
            </Button>
          </div>
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
                themeLabel={t('center.theme', { theme: template.themeKey })}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default LedgerTemplatesPage;
