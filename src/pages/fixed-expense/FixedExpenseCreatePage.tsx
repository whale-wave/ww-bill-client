import React from 'react';
import { useTranslation } from '@/shared/i18n';
import { FixedExpenseFormPage } from './ui/FixedExpenseFormPage';

const FixedExpenseCreate: React.FC = () => {
  const { t } = useTranslation('fixed-expense');
  return <FixedExpenseFormPage title={t('form.create')} />;
};

export default FixedExpenseCreate;
