import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';
import { FixedExpenseForm } from './ui';

const FixedExpenseEdit: React.FC = () => {
  const { t } = useTranslation('fixed-expense');
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };
  const onBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <div className="page-new overflow-hidden">
      <NavBar onBack={onBack}>编辑固定支出</NavBar>
      <div className="flex-grow overflow-auto bg-bg-gray pb-4">
        <FixedExpenseForm id={id} />
      </div>
    </div>
  );
};

export default FixedExpenseEdit;
