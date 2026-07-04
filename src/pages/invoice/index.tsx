import type { InvoiceEntity } from '@/entities/invoice';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetInvoiceQuery } from '@/entities/invoice';
import AddInvoiceButton from '@/pages/invoice/ui/AddInvoiceButton';
import InvoiceItem from '@/pages/invoice/ui/InvoiceItem';
import { NavBar } from '@/shared/ui';

interface InvoiceProps {}

const Invoice: React.FC<InvoiceProps> = () => {
  const navigate = useNavigate();

  const { data } = useGetInvoiceQuery();

  const onBack = useCallback(() => {
    navigate(-1);
  }, []);

  const onClickInvoiceItem = useCallback((invoice: InvoiceEntity) => {
    navigate(`/invoice/${invoice.id}`);
  }, []);

  return (
    <div className="page-new overflow-hidden">
      <NavBar onBack={onBack}>发票助手</NavBar>
      <div className="flex-grow h-0 bg-bg-gray px-3 pb-3 overflow-auto">
        {data.map(invoice => (
          <InvoiceItem key={invoice.id} className="mt-3" invoice={invoice} onClick={onClickInvoiceItem} />
        ))}
      </div>
      <AddInvoiceButton />
    </div>
  );
};

export default Invoice;
