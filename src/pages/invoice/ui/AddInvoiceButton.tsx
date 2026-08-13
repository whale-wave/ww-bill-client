import { Plus } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/i18n';

interface AddInvoiceButtonProps {
}

const AddInvoiceButton: React.FC<AddInvoiceButtonProps> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('invoice');

  return (
    <footer className="relative z-20 shrink-0 px-[18px] pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
      <button
        className="mx-auto flex h-[50px] w-full max-w-[520px] items-center justify-center gap-2 rounded-[17px] border-0 bg-[linear-gradient(135deg,#6fc2dc,#4aaac4)] text-[14px] font-extrabold text-white shadow-ww"
        data-testid="invoice-create-action"
        onClick={() => navigate('/invoice/create')}
        type="button"
      >
        <Plus size={19} strokeWidth={2.2} />
        <span>{t('addInvoiceInfo')}</span>
      </button>
    </footer>
  );
};

export default AddInvoiceButton;
