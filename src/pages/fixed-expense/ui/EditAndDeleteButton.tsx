import { Toast } from 'antd-mobile';
import { Pencil, Trash2 } from 'lucide-react';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeleteFixedExpenseMutation } from '@/entities/fixed-expense';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { confirmAppAction } from '@/shared/ui';

interface EditAndDeleteButtonProps {
  fixedExpenseId?: string;
}

const EditAndDeleteButton: React.FC<EditAndDeleteButtonProps> = (props) => {
  const { fixedExpenseId } = props;
  const { t } = useTranslation('fixed-expense');
  const navigate = useNavigate();

  const [deleteMutate, deleteState] = useDeleteFixedExpenseMutation();

  const ensureId = useCallback((id?: string): id is string => {
    if (id)
      return true;
    void Toast.show({ content: t('detail.noFixedExpenseInfo') });
    return false;
  }, [t]);

  const handleEdit = () => {
    if (!ensureId(fixedExpenseId))
      return;
    navigate(ROUTES_PATH.FIXED_EXPENSES_EDIT.getPath(fixedExpenseId));
  };

  const handleDelete = async () => {
    if (!ensureId(fixedExpenseId) || deleteState.isLoading)
      return;
    const confirmed = await confirmAppAction({
      cancelText: t('common:nav.cancel'),
      confirmText: t('detail.delete'),
      description: t('deleteDescription'),
      icon: <Trash2 size={22} strokeWidth={1.8} />,
      title: t('deleteTitle'),
      tone: 'danger',
    });
    if (!confirmed)
      return;
    try {
      await deleteMutate(fixedExpenseId);
      Toast.show({ icon: 'success', content: t('detail.deleteSuccess') });
      navigate(-1);
    }
    catch {
      Toast.show({ icon: 'fail', content: t('deleteFailed') });
    }
  };

  return (
    <footer className="relative z-20 grid shrink-0 grid-cols-2 gap-3 px-[18px] pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
      <button className="flex h-[48px] items-center justify-center gap-2 rounded-[16px] border border-solid border-border-primary bg-white/85 text-[13px] font-extrabold text-primary-deep shadow-ww-xs" disabled={!fixedExpenseId} onClick={handleEdit} type="button">
        <Pencil size={17} strokeWidth={1.9} />
        {t('detail.edit')}
      </button>
      <button className="flex h-[48px] items-center justify-center gap-2 rounded-[16px] border border-solid border-feedback-danger bg-feedback-danger-surface/90 text-[13px] font-extrabold text-feedback-danger shadow-ww-xs disabled:opacity-45" disabled={!fixedExpenseId || deleteState.isLoading} onClick={() => void handleDelete()} type="button">
        <Trash2 size={17} strokeWidth={1.9} />
        {t('detail.delete')}
      </button>
    </footer>
  );
};

export default EditAndDeleteButton;
