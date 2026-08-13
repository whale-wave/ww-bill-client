import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/i18n';
import { GradientPanel, PageHeader } from '@/shared/ui';
import InvoiceInfoForm from './InvoiceInfoForm';

interface InvoiceFormPageProps {
  id?: string;
  title: string;
}

export function InvoiceFormPage({ id, title }: InvoiceFormPageProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('invoice');

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-20 h-56 w-56 rounded-full bg-primary-light/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-16 h-48 w-48 rounded-full bg-ww-pink/15 blur-3xl" />
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={() => navigate(-1)}
        subtitle={t('subtitle')}
        title={title}
      />
      <main className="relative z-[1] min-h-0 flex-grow overflow-y-auto px-[18px] pb-8 pt-2">
        <div className="mx-auto w-full max-w-[520px]">
          <GradientPanel className="mb-4 flex items-center gap-3 px-4 py-3.5" elevation="low" surface="ice">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-white/75 text-primary-deep shadow-ww-xs">
              <FileText size={21} strokeWidth={1.8} />
            </span>
            <p className="text-[12px] font-semibold leading-5 text-ww-mid">{t('formDescription')}</p>
          </GradientPanel>
          <InvoiceInfoForm id={id} />
        </div>
      </main>
    </div>
  );
}
