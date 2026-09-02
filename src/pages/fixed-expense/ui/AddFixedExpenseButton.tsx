import { Plus } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';

const AddFixedExpenseButton: React.FC = () => {
  const { t } = useTranslation('fixed-expense');
  const navigate = useNavigate();

  return (
    <footer className="relative z-20 shrink-0 px-[18px] pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
      <button
        className="ww-theme-primary-action mx-auto flex h-[50px] w-full max-w-[520px] items-center justify-center gap-2 rounded-[17px] border-0 text-[14px] font-extrabold"
        data-testid="fixed-expense-create-action"
        onClick={() => navigate(ROUTES_PATH.FIXED_EXPENSES_CREATE.getPath())}
        type="button"
      >
        <Plus size={19} strokeWidth={2.2} />
        <span>{t('list.addFixedExpense')}</span>
      </button>
    </footer>
  );
};

export default AddFixedExpenseButton;
