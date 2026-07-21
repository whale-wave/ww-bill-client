import type { FC } from 'react';
import { Button, ErrorBlock, SpinLoading } from 'antd-mobile';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LedgerTemplateCard,
  PUBLIC_LEDGER_TEMPLATE_KEYS,
  useLedgerTemplatesQuery,
} from '@/entities/ledger';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';

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
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} onBack={handleBack}>
        {t('templates.title')}
      </NavBar>
      <main className="min-h-0 flex-grow overflow-auto px-3 py-3">
        <p className="mb-3 px-1 text-sm leading-5 text-font-gray">
          {t('templates.subtitle')}
        </p>

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
            <ErrorBlock
              description={t('templates.emptyDescription')}
              status="empty"
              title={t('templates.empty')}
            />
          </div>
        )}

        {!templateQuery.isLoading && !templateQuery.isError && orderedTemplates.length > 0 && (
          <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
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
