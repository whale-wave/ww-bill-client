import { Button, Skeleton, Toast } from 'antd-mobile';
import copy from 'copy-to-clipboard';
import { Building2, Copy, FileWarning } from 'lucide-react';
import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetInvoiceByIdQuery } from '@/entities/invoice';
import EditAndDeleteButton from '@/pages/invoice/ui/EditAndDeleteButton';
import InvoiceInfo, {
  getOptionListByInvoice,
} from '@/pages/invoice/ui/InvoiceInfo';
import { useTranslation } from '@/shared/i18n';
import { GradientPanel, IllustratedEmptyState, PageHeader } from '@/shared/ui';

interface InvoiceDetailProps {}

const InvoiceDetail: React.FC<InvoiceDetailProps> = () => {
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };
  const { t } = useTranslation('invoice');

  const query = useGetInvoiceByIdQuery({
    params: { id },
  });
  const invoice = query.data;

  const onBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onCopyInvoiceInfo = useCallback(() => {
    if (!invoice) {
      void Toast.show({
        content: t('invoiceNotFetched'),
      });
      return;
    }

    const list = getOptionListByInvoice(invoice, t);
    const text = list.map(o => `${o.label}: ${o.value}`).join('\n');

    copy(text);

    void Toast.show({
      content: t('common:confirm.copySuccess'),
    });
  }, [invoice, t]);
  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-20 h-56 w-56 rounded-full bg-primary-light/40 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={onBack} subtitle={t('subtitle')} title={t('detail')} />
      <main className="relative z-[1] min-h-0 flex-grow overflow-y-auto px-[18px] pb-6 pt-2">
        <div className="mx-auto w-full max-w-[520px]">
          {query.isLoading && (
            <GradientPanel className="p-5" elevation="low" surface="glass">
              <Skeleton.Title animated />
              <Skeleton.Paragraph animated lineCount={6} />
            </GradientPanel>
          )}
          {!query.isLoading && (query.isError || !invoice) && (
            <GradientPanel elevation="low" surface="glass">
              <IllustratedEmptyState
                actionLabel={query.isError ? t('retry') : undefined}
                description={query.isError ? t('loadErrorDescription') : t('invoiceNotFetched')}
                icon={<FileWarning className="text-primary-deep" size={40} strokeWidth={1.6} />}
                onAction={query.isError ? () => void query.refetch() : undefined}
                title={query.isError ? t('loadError') : t('invoiceNotFetched')}
              />
            </GradientPanel>
          )}
          {!query.isLoading && invoice && (
            <>
              <GradientPanel className="relative mb-4 overflow-hidden px-5 py-5" elevation="high" surface="ice">
                <div aria-hidden="true" className="absolute -right-6 -top-8 h-28 w-28 rounded-full border-[18px] border-solid border-white/25" />
                <div className="relative flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[19px] border border-white/80 bg-white/75 text-primary-deep shadow-ww">
                    <Building2 size={27} strokeWidth={1.7} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-[16px] font-extrabold leading-6 text-ww-ink">{invoice.companyName}</h2>
                    <p className="mt-1 truncate text-[11px] font-semibold text-ww-mid">
                      {t('form.taxNumber')}
                      {' · '}
                      {invoice.taxNumber}
                    </p>
                  </div>
                </div>
              </GradientPanel>
              <InvoiceInfo invoice={invoice} />
              <Button
                block
                className="!mt-4 !h-[48px] !rounded-[16px] !border !border-solid !border-primary-light !bg-white/80 !text-[13px] !font-extrabold !text-primary-deep !shadow-ww-xs"
                onClick={onCopyInvoiceInfo}
              >
                <span className="inline-flex items-center gap-2">
                  <Copy size={17} />
                  {t('copyInfo')}
                </span>
              </Button>
            </>
          )}
        </div>
      </main>
      <EditAndDeleteButton invoiceId={invoice?.id} />
    </div>
  );
};

export default InvoiceDetail;
