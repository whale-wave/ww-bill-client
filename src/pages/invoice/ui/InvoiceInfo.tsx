import type { InvoiceEntity } from '@/entities/invoice';
import { Toast } from 'antd-mobile';
import copy from 'copy-to-clipboard';
import { Copy } from 'lucide-react';
import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from '@/shared/i18n';
import { Surface } from '@/shared/ui';

interface InvoiceInfoProps {
  invoice: InvoiceEntity;
}

interface OptionItem {
  key: string;
  label: string;
  value?: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export function getOptionListByInvoice(invoice: InvoiceEntity, t: (key: string) => string) {
  const options = [
    {
      key: 'companyName',
      label: t('form.companyName'),
    },
    {
      key: 'taxNumber',
      label: t('form.taxNumber'),
    },
    {
      key: 'companyAddress',
      label: t('form.companyAddress'),
    },
    {
      key: 'phone',
      label: t('form.phone'),
    },
    {
      key: 'accountOpeningBank',
      label: t('form.accountOpeningBank'),
    },
    {
      key: 'bankAccount',
      label: t('form.bankAccount'),
    },
  ] as OptionItem[];

  return options.map((o) => {
    const value = invoice[o.key as keyof InvoiceEntity];
    return {
      ...o,
      value,
    };
  });
}

const InvoiceInfo: React.FC<InvoiceInfoProps> = memo((props) => {
  const { invoice } = props;
  const { t } = useTranslation('invoice');
  const list = useMemo(() => {
    return getOptionListByInvoice(invoice, t);
  }, [invoice, t]);

  const onCopyField = useCallback(
    (value?: string) => () => {
      if (!value)
        return;

      copy(value);

      void Toast.show({
        content: t('common:confirm.copySuccess'),
      });
    },
    [t],
  );

  return (
    <Surface className="overflow-hidden px-4 py-1" material="content">
      {list.map(item => (
        <button
          aria-label={t('copyField', { field: item.label })}
          className="flex min-h-[62px] w-full items-center gap-3 border-0 border-b border-solid border-border-primary bg-transparent py-3 text-left last:border-b-0 disabled:cursor-default"
          disabled={!item.value}
          key={item.key}
          onClick={onCopyField(item.value)}
          type="button"
        >
          <span className="w-[82px] shrink-0 text-[11px] font-bold leading-4 text-ww-soft">{item.label}</span>
          <span className={`min-w-0 flex-1 break-all text-[13px] font-bold leading-5 ${item.value ? 'text-ww-ink' : 'text-ww-ghost'}`}>
            {item.value || t('notProvided')}
          </span>
          {item.value && <Copy className="shrink-0 text-primary-deep" size={16} strokeWidth={1.8} />}
        </button>
      ))}
    </Surface>
  );
});

export default InvoiceInfo;
