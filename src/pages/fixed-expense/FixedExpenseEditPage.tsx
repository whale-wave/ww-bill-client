import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '@/shared/i18n';
import { FixedExpenseFormPage } from './ui/FixedExpenseFormPage';

const FixedExpenseEdit: React.FC = () => {
  const { t } = useTranslation('fixed-expense');
  const { id } = useParams() as { id: string };
  return <FixedExpenseFormPage id={id} title={t('form.edit')} />;
};

export default FixedExpenseEdit;
