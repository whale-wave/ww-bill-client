import type { BottomActionActionItem } from '@/shared/ui';
import { Dialog, Toast } from 'antd-mobile';
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeleteInvoiceMutation } from '@/entities/invoice';
import { useTranslation } from '@/shared/i18n';
import { BottomAction } from '@/shared/ui';

interface EditAndDeleteButtonProps {
  invoiceId?: string;
}

const EditAndDeleteButton: React.FC<EditAndDeleteButtonProps> = (props) => {
  const { invoiceId } = props;
  const navigate = useNavigate();
  const { t } = useTranslation('invoice');

  const [deleteInvoiceMutate] = useDeleteInvoiceMutation();

  const isHasInvoiceId = useCallback((invoiceId?: string): invoiceId is string => {
    if (invoiceId)
      return true;

    void Toast.show({
      content: t('invoiceNotFetched'),
    });

    return false;
  }, [t]);

  const actions = useMemo(() => {
    return [
      {
        key: 'edit',
        label: t('editButton.edit'),
        onClick: () => {
          if (!isHasInvoiceId(invoiceId))
            return;
          navigate(`/invoice/${invoiceId}/edit`);
        },
      },
      {
        key: 'delete',
        label: t('delete'),
        onClick: () => {
          if (!isHasInvoiceId(invoiceId))
            return;
          void Dialog.confirm({
            content: t('editButton.confirmDelete'),
            onConfirm: async () => {
              await deleteInvoiceMutate(invoiceId);
              navigate(-1);
            },
          });
        },
      },
    ] as BottomActionActionItem[];
  }, [invoiceId, t, isHasInvoiceId, deleteInvoiceMutate, navigate]);

  return (
    <BottomAction
      className="h-[50px]"
      placeholderClassName="h-[50px]"
      actions={actions}
    />
  );
};

export default EditAndDeleteButton;
