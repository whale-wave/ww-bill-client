import { Plus } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/i18n';
import { AppButton } from '@/shared/ui';

interface AddInvoiceButtonProps {
}

const AddInvoiceButton: React.FC<AddInvoiceButtonProps> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('invoice');

  return (
    <footer className="relative z-20 shrink-0 px-[18px] pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
      <AppButton
        className="ww-theme-primary-action mx-auto max-w-[520px]"
        data-testid="invoice-create-action"
        fullWidth
        onClick={() => navigate('/invoice/create')}
      >
        <Plus size={19} strokeWidth={2.2} />
        <span>{t('addInvoiceInfo')}</span>
      </AppButton>
    </footer>
  );
};

export default AddInvoiceButton;
