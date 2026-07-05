import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';
import { FixedExpenseForm } from './ui';

const FixedExpenseCreate: React.FC = () => {
  const { t } = useTranslation('fixed-expense');
  const navigate = useNavigate();
  const onBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <div className="page-new overflow-hidden">
      <NavBar onBack={onBack}>新增固定支出</NavBar>
      <div className="flex-grow overflow-auto bg-bg-gray pb-4">
        <FixedExpenseForm />
      </div>
    </div>
  );
};

export default FixedExpenseCreate;
