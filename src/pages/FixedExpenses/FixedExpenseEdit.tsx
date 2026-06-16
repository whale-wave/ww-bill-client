import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NavBar } from '@/components/ui/index.ts';
import { FixedExpenseForm } from './components';

const FixedExpenseEdit: React.FC = () => {
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
