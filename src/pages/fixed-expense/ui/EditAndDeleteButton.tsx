import type { BottomActionActionItem } from '@/shared/ui';
import { Dialog, Toast } from 'antd-mobile';
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeleteFixedExpenseMutation } from '@/entities/fixed-expense';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { BottomAction } from '@/shared/ui';

interface EditAndDeleteButtonProps {
  fixedExpenseId?: string;
}

const EditAndDeleteButton: React.FC<EditAndDeleteButtonProps> = (props) => {
  const { fixedExpenseId } = props;
  const { t } = useTranslation('fixed-expense');
  const navigate = useNavigate();

  const [deleteMutate] = useDeleteFixedExpenseMutation();

  const ensureId = useCallback((id?: string): id is string => {
    if (id)
      return true;
    void Toast.show({ content: t('detail.noFixedExpenseInfo') });
    return false;
  }, [t]);

  const actions = useMemo(() => {
    return [
      {
        key: 'edit',
        label: t('detail.edit'),
        onClick: () => {
          if (!ensureId(fixedExpenseId))
            return;
          navigate(ROUTES_PATH.FIXED_EXPENSES_EDIT.getPath(fixedExpenseId));
        },
      },
      {
        key: 'delete',
        render: () => <span className="text-rose-500">{t('detail.delete')}</span>,
        onClick: () => {
          if (!ensureId(fixedExpenseId))
            return;
          void Dialog.confirm({
            content: t('detail.confirmDelete'),
            onConfirm: async () => {
              await deleteMutate(fixedExpenseId);
              void Toast.show({ icon: 'success', content: t('detail.deleteSuccess') });
              navigate(-1);
            },
          });
        },
      },
    ] as BottomActionActionItem[];
  }, [fixedExpenseId, ensureId, deleteMutate, navigate, t]);

  return (
    <BottomAction className="h-[50px]" placeholderClassName="h-[50px]" actions={actions} />
  );
};

export default EditAndDeleteButton;
