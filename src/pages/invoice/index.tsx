import type { InvoiceEntity } from '@/entities/invoice';
import { FilePlus2, Plus, ReceiptText } from 'lucide-react';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetInvoiceQuery } from '@/entities/invoice';
import AddInvoiceButton from '@/pages/invoice/ui/AddInvoiceButton';
import InvoiceItem from '@/pages/invoice/ui/InvoiceItem';
import { useTranslation } from '@/shared/i18n';
import { IllustratedEmptyState, PageHeader, PageLoadingState, Surface } from '@/shared/ui';

interface InvoiceProps {}

const Invoice: React.FC<InvoiceProps> = () => {
  const { t } = useTranslation('invoice');
  const navigate = useNavigate();

  const query = useGetInvoiceQuery();

  const onBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onClickInvoiceItem = useCallback((invoice: InvoiceEntity) => {
    navigate(`/invoice/${invoice.id}`);
  }, [navigate]);

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-16 h-56 w-56 rounded-full bg-primary-light/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-24 h-48 w-48 rounded-full bg-ww-pink/15 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={onBack} title={t('indexTitle')} />
      <main className="relative z-[1] min-h-0 flex-grow overflow-y-auto px-[18px] pb-5 pt-2">
        <div className="mx-auto w-full max-w-[520px]">
          <Surface className="relative mb-4 overflow-hidden px-5 py-5" material="raised">
            <div aria-hidden="true" className="absolute -right-6 -top-8 h-28 w-28 rounded-full border-[18px] border-solid border-white/25" />
            <div className="relative flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[19px] border border-white/80 bg-white/75 text-primary-deep shadow-ww">
                <ReceiptText size={28} strokeWidth={1.7} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-[17px] font-extrabold leading-6 text-ww-ink">{t('indexTitle')}</h2>
                <p className="mt-1 text-[11px] font-semibold leading-[17px] text-ww-mid">{t('subtitle')}</p>
              </div>
              <span className="shrink-0 rounded-full border border-white/80 bg-white/65 px-2.5 py-1 text-[10px] font-extrabold text-primary-deep">
                {t('count', { count: query.data.length })}
              </span>
            </div>
          </Surface>

          {query.isLoading && (
            <PageLoadingState compact label={t('common:nav.loading')} testId="invoice-loading" />
          )}
          {!query.isLoading && query.isError && (
            <Surface material="content">
              <IllustratedEmptyState
                accentIcon={<ReceiptText size={18} />}
                actionLabel={t('retry')}
                description={t('loadErrorDescription')}
                icon={<FilePlus2 className="text-primary-deep" size={40} strokeWidth={1.6} />}
                onAction={() => void query.refetch()}
                title={t('loadError')}
              />
            </Surface>
          )}
          {!query.isLoading && !query.isError && query.data.length === 0 && (
            <Surface material="content">
              <IllustratedEmptyState
                accentIcon={<Plus size={19} />}
                actionLabel={t('addInvoiceInfo')}
                description={t('emptyDescription')}
                icon={<ReceiptText className="text-primary-deep" size={42} strokeWidth={1.6} />}
                onAction={() => navigate('/invoice/create')}
                title={t('empty')}
              />
            </Surface>
          )}
          {!query.isLoading && !query.isError && query.data.length > 0 && (
            <div className="space-y-3" data-testid="invoice-list">
              {query.data.map(invoice => (
                <InvoiceItem key={invoice.id} invoice={invoice} onClick={onClickInvoiceItem} />
              ))}
            </div>
          )}
        </div>
      </main>
      <AddInvoiceButton />
    </div>
  );
};

export default Invoice;
