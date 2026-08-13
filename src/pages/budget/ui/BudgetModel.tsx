import type { CategoryEntity } from '@/entities/category';
import { Dialog } from 'antd-mobile';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BUDGET_CENTER_POPUP_CLASS_NAME,
  BUDGET_DIALOG_BODY_CLASS_NAME,
  BUDGET_OVERLAY_MASK_CLASS_NAME,
  BudgetEditorPresentation,
  BudgetEntityLevel,
  BudgetEntityType,
} from '@/entities/budget';
import { useTranslation } from '@/shared/i18n';
import { useBudgetSubmit } from '../model/useBudgetSubmit';
import { ERROR_MAP, normalizeAmount, validateAmount } from '../model/validateAmount';

// eslint-disable-next-line react-refresh/only-export-components
export const BudgetModelModelTypeMap = { CREATE: 'create', EDIT: 'edit' } as const;
export type BudgetModelModelType = (typeof BudgetModelModelTypeMap)[keyof typeof BudgetModelModelTypeMap];

interface BudgetModelProps {
  modelType?: BudgetModelModelType;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  type: BudgetEntityType;
  level: BudgetEntityLevel;
  category?: CategoryEntity;
  budgetId?: string;
  onClose: () => void;
}

export const BudgetModel: React.FC<BudgetModelProps> = ({
  modelType = BudgetModelModelTypeMap.CREATE,
  budgetId,
  visible,
  setVisible,
  type,
  level,
  category,
  onClose,
}) => {
  const { t } = useTranslation('budget');
  const navigate = useNavigate();
  const { submit } = useBudgetSubmit();
  const [amount, setAmount] = useState('');

  const title = useMemo(() => {
    const isMonthly = type === BudgetEntityType.MONTH;
    const catName = category?.name ?? '';
    if (level === BudgetEntityLevel.SUMMARY) {
      return isMonthly ? t('model.title.monthlySummary') : t('model.title.yearlySummary');
    }
    return isMonthly ? t('model.title.monthlyCategory', { category: catName }) : t('model.title.yearlyCategory', { category: catName });
  }, [type, level, category, t]);

  const handleConfirm = async () => {
    const error = validateAmount(amount);
    if (error) {
      return Dialog.alert({
        bodyClassName: BUDGET_DIALOG_BODY_CLASS_NAME,
        className: BUDGET_CENTER_POPUP_CLASS_NAME,
        content: ERROR_MAP[error],
        maskClassName: BUDGET_OVERLAY_MASK_CLASS_NAME,
      });
    }

    const normalizedAmount = normalizeAmount(amount);

    const warning = await submit({
      modelType,
      level,
      type,
      category,
      budgetId,
      amount: normalizedAmount,
      onSuccess: () => {
        setVisible(false);
        setAmount('');
        navigate(`/budget?type=${type}`, { replace: true });
      },
    });

    if (warning) {
      setTimeout(() => {
        Dialog.alert({
          bodyClassName: BUDGET_DIALOG_BODY_CLASS_NAME,
          className: BUDGET_CENTER_POPUP_CLASS_NAME,
          confirmText: t('actions.save'),
          content: warning,
          maskClassName: BUDGET_OVERLAY_MASK_CLASS_NAME,
        });
      }, 250);
    }
  };

  const handleCancel = () => {
    setVisible(false);
    setAmount('');
    setTimeout(onClose, 500);
  };

  return (
    <BudgetEditorPresentation
      amount={amount}
      amountPlaceholder={t('model.amountPlaceholder')}
      cancelLabel={t('actions.cancel')}
      inputName="budgetAmount"
      onAfterClose={onClose}
      onAmountChange={setAmount}
      onCancel={handleCancel}
      onSave={handleConfirm}
      saveLabel={t('actions.save')}
      title={title}
      visible={visible}
    />
  );
};
