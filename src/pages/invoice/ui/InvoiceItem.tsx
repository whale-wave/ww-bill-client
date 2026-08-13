import type { InvoiceEntity } from '@/entities/invoice';
import { Building2, ChevronRight } from 'lucide-react';
import React, { memo, useCallback } from 'react';
import { useTranslation } from '@/shared/i18n';

interface InvoiceItemProps {
  className?: string;
  invoice: InvoiceEntity;
  onClick?: (invoice: InvoiceEntity) => void;
}

const InvoiceItem: React.FC<InvoiceItemProps> = memo((props) => {
  const { className, invoice, onClick: _onClick } = props;
  const { t } = useTranslation('invoice');

  const onClick = useCallback(() => {
    _onClick?.(invoice);
  }, [invoice, _onClick]);

  return (
    <button
      className={`${className ?? ''} flex min-h-[82px] w-full items-center gap-3 rounded-[20px] border border-solid border-border-primary bg-white/80 px-4 py-3 text-left shadow-ww-xs backdrop-blur-xl transition active:scale-[0.99]`}
      data-invoice-item={invoice.id}
      onClick={onClick}
      type="button"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[linear-gradient(145deg,#c8eaf6,#e8f6ff)] text-primary-deep shadow-ww-xs">
        <Building2 size={23} strokeWidth={1.7} />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-[14px] font-extrabold leading-5 text-ww-ink">{invoice.companyName}</strong>
        <span className="mt-1 block truncate text-[11px] font-semibold leading-4 text-ww-soft">
          {t('form.taxNumber')}
          {' · '}
          {invoice.taxNumber}
        </span>
      </span>
      <ChevronRight className="shrink-0 text-ww-ghost" size={18} />
    </button>
  );
});

export default InvoiceItem;
