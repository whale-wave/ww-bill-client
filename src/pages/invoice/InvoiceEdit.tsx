import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import InvoiceInfoForm from '@/pages/invoice/ui/InvoiceInfoForm';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';

interface InvoiceEditProps {
}

const InvoiceEdit: React.FC<InvoiceEditProps> = () => {
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };
  const { t } = useTranslation('invoice');

  const onBack = useCallback(() => {
    navigate(-1);
  }, []);

  return (
    <div className="page-new overflow-hidden">
      <NavBar onBack={onBack}>{t('edit')}</NavBar>
      <div className="flex-grow py-2 bg-bg-gray">
        <InvoiceInfoForm id={id} />
      </div>
    </div>
  );
};

export default InvoiceEdit;
