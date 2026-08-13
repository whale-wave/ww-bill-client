import React from 'react';
import { useParams } from 'react-router-dom';
import { InvoiceFormPage } from '@/pages/invoice/ui/InvoiceFormPage';
import { useTranslation } from '@/shared/i18n';

interface InvoiceEditProps {
}

const InvoiceEdit: React.FC<InvoiceEditProps> = () => {
  const { id } = useParams() as { id: string };
  const { t } = useTranslation('invoice');
  return <InvoiceFormPage id={id} title={t('editTitle')} />;
};

export default InvoiceEdit;
