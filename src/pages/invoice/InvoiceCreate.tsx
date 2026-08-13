import React from 'react';
import { InvoiceFormPage } from '@/pages/invoice/ui/InvoiceFormPage';
import { useTranslation } from '@/shared/i18n';

interface InvoiceCreateProps {}

const InvoiceCreate: React.FC<InvoiceCreateProps> = () => {
  const { t } = useTranslation('invoice');
  return <InvoiceFormPage title={t('createTitle')} />;
};

export default InvoiceCreate;
