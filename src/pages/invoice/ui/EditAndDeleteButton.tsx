import { Toast } from 'antd-mobile';
import { Pencil, Trash2 } from 'lucide-react';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeleteInvoiceMutation } from '@/entities/invoice';
import { useTranslation } from '@/shared/i18n';
import { confirmAppAction } from '@/shared/ui';

interface EditAndDeleteButtonProps {
  invoiceId?: string;
}

const EditAndDeleteButton: React.FC<EditAndDeleteButtonProps> = (props) => {
  const { invoiceId } = props;
  const navigate = useNavigate();
  const { t } = useTranslation('invoice');

  const [deleteInvoiceMutate, deleteState] = useDeleteInvoiceMutation();

  const isHasInvoiceId = useCallback((invoiceId?: string): invoiceId is string => {
    if (invoiceId)
      return true;

    void Toast.show({
      content: t('invoiceNotFetched'),
    });

    return false;
  }, [t]);

  const handleEdit = () => {
    if (!isHasInvoiceId(invoiceId))
      return;
    navigate(`/invoice/${invoiceId}/edit`);
  };

  const handleDelete = async () => {
    if (!isHasInvoiceId(invoiceId) || deleteState.isLoading)
      return;
    const confirmed = await confirmAppAction({
      cancelText: t('common:nav.cancel'),
      confirmText: t('delete'),
      description: t('deleteDescription'),
      icon: <Trash2 size={22} strokeWidth={1.8} />,
      title: t('deleteTitle'),
      tone: 'danger',
    });
    if (!confirmed)
      return;
    try {
      await deleteInvoiceMutate(invoiceId);
      navigate(-1);
    }
    catch {
      Toast.show({ icon: 'fail', content: t('deleteFailed') });
    }
  };

  return (
    <footer className="relative z-20 grid shrink-0 grid-cols-2 gap-3 px-[18px] pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
      <button className="flex h-[48px] items-center justify-center gap-2 rounded-[16px] border border-solid border-border-primary bg-white/85 text-[13px] font-extrabold text-primary-deep shadow-ww-xs" disabled={!invoiceId} onClick={handleEdit} type="button">
        <Pencil size={17} strokeWidth={1.9} />
        {t('editButton.edit')}
      </button>
      <button className="flex h-[48px] items-center justify-center gap-2 rounded-[16px] border border-solid border-[#f2c5d5] bg-[#fff1f6]/90 text-[13px] font-extrabold text-[#ad496b] shadow-ww-xs disabled:opacity-45" disabled={!invoiceId || deleteState.isLoading} onClick={() => void handleDelete()} type="button">
        <Trash2 size={17} strokeWidth={1.9} />
        {t('delete')}
      </button>
    </footer>
  );
};

export default EditAndDeleteButton;
