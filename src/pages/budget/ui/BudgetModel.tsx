import type { CategoryEntity } from '@/entities/category';
import { Dialog, Input, Modal } from 'antd-mobile';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
    const scope = isMonthly ? '每月' : '年度';
    const catName = category?.name ?? '';
    if (level === BudgetEntityLevel.SUMMARY) {
      return isMonthly ? '每月总预算' : '年度总预算';
    }
    return `${scope}${catName}预算`;
  }, [type, level, category]);

  const handleConfirm = async () => {
    const error = validateAmount(amount);
    if (error) {
      return Dialog.alert({ content: ERROR_MAP[error] });
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
        Dialog.alert({ content: warning, confirmText: t('actions.save') });
      }, 250);
    }
  };

  const handleCancel = () => {
    setVisible(false);
    setAmount('');
    setTimeout(onClose, 500);
  };

  return (
    <Modal
      visible={visible}
      title={title}
      content={(
        <div className="py-3">
          <div className="!bg-[#fcfcfc] p-2">
            <Input
              type="number"
              placeholder={t('model.amountPlaceholder')}
              value={amount}
              onChange={setAmount}
            />
          </div>
        </div>
      )}
      onClose={() => setVisible(false)}
      afterClose={onClose}
      actions={[
        { key: 'confirm', text: t('actions.save'), primary: true, onClick: handleConfirm },
        { key: 'cancel', text: t('actions.cancel'), onClick: handleCancel },
      ]}
      closeOnMaskClick
    />
  );
};
