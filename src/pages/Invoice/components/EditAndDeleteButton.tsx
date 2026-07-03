import type { BottomActionActionItem } from '@/components';
import { Dialog, Toast } from 'antd-mobile';
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomAction } from '@/components';
import { useDeleteInvoiceMutation } from '@/hooks/mutation/useDeleteInvoiceMutation';

interface EditAndDeleteButtonProps {
  invoiceId?: string;
}

const EditAndDeleteButton: React.FC<EditAndDeleteButtonProps> = (props) => {
  const { invoiceId } = props;
  const navigate = useNavigate();

  const [deleteInvoiceMutate] = useDeleteInvoiceMutation();

  const isHasInvoiceId = useCallback((invoiceId?: string): invoiceId is string => {
    if (invoiceId)
      return true;

    void Toast.show({
      content: '未获取到发票信息',
    });

    return false;
  }, []);

  const actions = useMemo(() => {
    return [
      {
        key: 'edit',
        label: '编辑',
        onClick: () => {
          if (!isHasInvoiceId(invoiceId))
            return;
          navigate(`/invoice/${invoiceId}/edit`);
        },
      },
      {
        key: 'delete',
        label: '删除',
        onClick: () => {
          if (!isHasInvoiceId(invoiceId))
            return;
          void Dialog.confirm({
            content: '确定删除该发票信息?',
            onConfirm: async () => {
              await deleteInvoiceMutate(invoiceId);
              navigate(-1);
            },
          });
        },
      },
    ] as BottomActionActionItem[];
  }, [invoiceId]);

  return (
    <BottomAction
      className="h-[50px]"
      placeholderClassName="h-[50px]"
      actions={actions}
    />
  );
};

export default EditAndDeleteButton;
