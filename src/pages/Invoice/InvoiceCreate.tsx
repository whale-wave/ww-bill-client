import React, { useCallback } from 'react';
import { NavBar } from 'bw-mobile';
import { useNavigate } from 'react-router-dom';
import InvoiceInfoForm from '@/pages/Invoice/components/InvoiceInfoForm';

interface InvoiceCreateProps {}

const InvoiceCreate: React.FC<InvoiceCreateProps> = () => {
  const navigate = useNavigate();

  const onBack = useCallback(() => {
    navigate(-1);
  }, []);

  return (
    <div className="page-new overflow-hidden">
      <NavBar onBack={onBack}>添加发票</NavBar>
      <div className="flex-grow">
        <InvoiceInfoForm />
      </div>
    </div>
  );
};

export default InvoiceCreate;
