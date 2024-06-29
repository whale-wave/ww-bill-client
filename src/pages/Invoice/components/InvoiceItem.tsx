import React, { memo, useCallback } from 'react';
import classNames from 'classnames';
import type { InvoiceEntity } from '@/api';

interface InvoiceItemProps {
  className?: string;
  invoice: InvoiceEntity;
  onClick?: (invoice: InvoiceEntity) => void;
}

const InvoiceItem: React.FC<InvoiceItemProps> = memo((props) => {
  const { className, invoice, onClick: _onClick } = props;

  const onClick = useCallback(() => {
    _onClick?.(invoice);
  }, [invoice, _onClick]);

  return (
    <div className={classNames(className, 'flex h-[74px] bg-white rounded-radius-small')} onClick={onClick}>
      <div className="bg-primary w-1"></div>
      <div className="flex-grow flex flex-col justify-center space-y-3 pl-3">
        <div>
          <div>
            {invoice.companyName}
          </div>
        </div>
        <div className="space-x-2 text-font-gray text-[12px]">
          <span>税号:</span>
          <span>{invoice.taxNumber}</span>
        </div>
      </div>
    </div>
  );
});

export default InvoiceItem;
