import { Pencil, Trash2 } from 'lucide-react';

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeleteInvoiceMutation } from '@/entities/invoice';
import { useTranslation } from '@/shared/i18n';
import { AppButton, confirmAppAction } from '@/shared/ui';
import { showAppError, showAppNotice } from '@/shared/ui/app-feedback';

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

    void showAppNotice({
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
      showAppError({ icon: 'fail', content: t('deleteFailed') });
    }
  };

  return (
    <footer className="relative z-20 grid shrink-0 grid-cols-2 gap-3 px-[18px] pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
      <AppButton disabled={!invoiceId} fullWidth onClick={handleEdit} variant="secondary">
        <Pencil size={17} strokeWidth={1.9} />
        {t('editButton.edit')}
      </AppButton>
      <AppButton disabled={!invoiceId || deleteState.isLoading} fullWidth loading={deleteState.isLoading} onClick={() => void handleDelete()} variant="danger">
        <Trash2 size={17} strokeWidth={1.9} />
        {t('delete')}
      </AppButton>
    </footer>
  );
};

export default EditAndDeleteButton;
