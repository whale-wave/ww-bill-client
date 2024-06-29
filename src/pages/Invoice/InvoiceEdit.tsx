import React, { useCallback } from 'react';
import { NavBar } from 'bw-mobile';
import { useNavigate, useParams } from 'react-router-dom';
import InvoiceInfoForm from '@/pages/Invoice/components/InvoiceInfoForm';

interface InvoiceEditProps {
}

const InvoiceEdit: React.FC<InvoiceEditProps> = () => {
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };

  const onBack = useCallback(() => {
    navigate(-1);
  }, []);

  return (
    <div className="page-new overflow-hidden">
      <NavBar onBack={onBack}>编辑抬头</NavBar>
      <div className="flex-grow py-2 bg-bg-gray">
        <InvoiceInfoForm id={id} />
      </div>
    </div>
  );
};

export default InvoiceEdit;
