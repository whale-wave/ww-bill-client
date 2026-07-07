import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import InvoiceInfoForm from '@/pages/invoice/ui/InvoiceInfoForm';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';

interface InvoiceCreateProps {}

const InvoiceCreate: React.FC<InvoiceCreateProps> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('invoice');

  const onBack = useCallback(() => {
    navigate(-1);
  }, []);

  return (
    <div className="page-new overflow-hidden">
      <NavBar onBack={onBack}>{t('create')}</NavBar>
      <div className="flex-grow">
        <InvoiceInfoForm />
      </div>
    </div>
  );
};

export default InvoiceCreate;
