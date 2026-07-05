import { useTranslation } from '@/shared/i18n';
import type { BottomActionActionItem } from '@/shared/ui';
import { Dialog, Toast } from 'antd-mobile';
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeleteFixedExpenseMutation } from '@/entities/fixed-expense';
import { ROUTES_PATH } from '@/shared/config/routes';
import { BottomAction } from '@/shared/ui';

interface EditAndDeleteButtonProps {
  fixedExpenseId?: string;
}

const EditAndDeleteButton: React.FC<EditAndDeleteButtonProps> = (props) => {
  const { fixedExpenseId } = props;
  const navigate = useNavigate();

  const [deleteMutate] = useDeleteFixedExpenseMutation();

  const ensureId = useCallback((id?: string): id is string => {
    if (id)
      return true;
    void Toast.show({ content: '未获取到固定支出信息' });
    return false;
  }, []);

  const actions = useMemo(() => {
    return [
      {
        key: 'edit',
        label: '编辑',
        onClick: () => {
          if (!ensureId(fixedExpenseId))
            return;
          navigate(ROUTES_PATH.FIXED_EXPENSES_EDIT.getPath(fixedExpenseId));
        },
      },
      {
        key: 'delete',
        render: () => <span className="text-rose-500">删除</span>,
        onClick: () => {
          if (!ensureId(fixedExpenseId))
            return;
          void Dialog.confirm({
            content: '确定删除该固定支出?',
            onConfirm: async () => {
              await deleteMutate(fixedExpenseId);
              void Toast.show({ icon: 'success', content: '删除成功' });
              navigate(-1);
            },
          });
        },
      },
    ] as BottomActionActionItem[];
  }, [fixedExpenseId, ensureId, deleteMutate, navigate]);

  return (
    <BottomAction className="h-[50px]" placeholderClassName="h-[50px]" actions={actions} />
  );
};

export default EditAndDeleteButton;
