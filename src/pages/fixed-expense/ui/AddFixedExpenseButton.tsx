import { Plus } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { AppButton } from '@/shared/ui';

const AddFixedExpenseButton: React.FC = () => {
  const { t } = useTranslation('fixed-expense');
  const navigate = useNavigate();

  return (
    <footer className="relative z-20 shrink-0 px-[18px] pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
      <AppButton
        className="ww-theme-primary-action mx-auto max-w-[520px]"
        data-testid="fixed-expense-create-action"
        fullWidth
        onClick={() => navigate(ROUTES_PATH.FIXED_EXPENSES_CREATE.getPath())}
      >
        <Plus size={19} strokeWidth={2.2} />
        <span>{t('list.addFixedExpense')}</span>
      </AppButton>
    </footer>
  );
};

export default AddFixedExpenseButton;
