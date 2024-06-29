import React, { useCallback } from 'react';
import { NavBar } from 'bw-mobile';
import { useNavigate } from 'react-router-dom';
import AddInvoiceButton from '@/pages/Invoice/components/AddInvoiceButton';
import InvoiceItem from '@/pages/Invoice/components/InvoiceItem';
import { useGetInvoiceQuery } from '@/hooks';
import type { InvoiceEntity } from '@/api';

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
