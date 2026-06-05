import { NavBar } from 'bw-mobile';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FixedExpenseForm } from './components';

const FixedExpenseCreate: React.FC = () => {
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
