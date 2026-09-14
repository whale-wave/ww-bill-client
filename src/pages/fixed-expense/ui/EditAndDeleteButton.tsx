import { Pencil, Trash2 } from 'lucide-react';

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeleteFixedExpenseMutation } from '@/entities/fixed-expense';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { AppButton, confirmAppAction } from '@/shared/ui';
import { showAppError, showAppNotice } from '@/shared/ui/app-feedback';

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
    void showAppNotice({ content: t('detail.noFixedExpenseInfo') });
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
      navigate(-1);
    }
    catch {
      showAppError({ icon: 'fail', content: t('deleteFailed') });
    }
  };

  return (
    <footer className="relative z-20 grid shrink-0 grid-cols-2 gap-3 px-[18px] pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
      <AppButton disabled={!fixedExpenseId} fullWidth onClick={handleEdit} variant="secondary">
        <Pencil size={17} strokeWidth={1.9} />
        {t('detail.edit')}
      </AppButton>
      <AppButton disabled={!fixedExpenseId || deleteState.isLoading} fullWidth loading={deleteState.isLoading} onClick={() => void handleDelete()} variant="danger">
        <Trash2 size={17} strokeWidth={1.9} />
        {t('detail.delete')}
      </AppButton>
    </footer>
  );
};

export default EditAndDeleteButton;
