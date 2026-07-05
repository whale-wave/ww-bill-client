import type { InvoiceEntity } from '@/entities/invoice';
import { Toast } from 'antd-mobile';
import classNames from 'classnames';
import copy from 'copy-to-clipboard';
import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from '@/shared/i18n';

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

  const leftColumnWidth = 'w-[94px]';
  const columnHeight = 'h-[36px]';

  const onCopyField = useCallback(
    (value?: string) => () => {
      if (!value)
        return;

      copy(value);

      void Toast.show({
        content: t('common:confirm.copySuccess'),
      });
    },
    [],
  );

  return (
    <div className="rounded-radius-small overflow-hidden border-solid border-[1px] border-[var(--ww-border-color)] text-[13px]">
      {list.map((i, index) => (
        <React.Fragment key={i.label}>
          {index === 0 && (
            <div className="flex">
              <span
                className={classNames(leftColumnWidth, 'pt-3 bg-[#f9f9f9]')}
              >
              </span>
              <span className="flex-grow bg-white"></span>
            </div>
          )}
          <div
            className={classNames('flex', columnHeight)}
            onClick={onCopyField(i.value)}
          >
            <span
              className={classNames(
                leftColumnWidth,
                'flex-shrink-0 bg-[#f9f9f9] flex items-center pl-5 text-font-gray',
              )}
            >
              {i.label}
            </span>
            <span className="flex-grow flex items-center px-3 bg-white">
              {i.value}
            </span>
          </div>
          {index === list.length - 1 && (
            <div className="flex">
              <span
                className={classNames(leftColumnWidth, 'pt-3 bg-[#f9f9f9]')}
              >
              </span>
              <span className="flex-grow bg-white"></span>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
});

export default InvoiceInfo;
