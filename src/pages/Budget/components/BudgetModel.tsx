import React, { useMemo, useState } from 'react';
import { Dialog, Input, Modal } from 'antd-mobile';
import { isNaN } from 'mathjs';
import { useNavigate } from 'react-router-dom';
import {
  usePatchBudgetAmountByBudgetIdMutation,
  usePostBudgetCategoryMutation,
  usePostBudgetSummaryMutation,
} from '@/hooks';
import { BudgetEntityLevel, BudgetEntityType } from '@/api/budget.ts';
import type { CategoryEntity } from '@/api';

export enum BudgetModelModelType {
  CREATE,
  EDIT,
}

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

export const BudgetModel: React.FC<BudgetModelProps> = ({ modelType = BudgetModelModelType.CREATE, budgetId, visible, setVisible, type, level, category, onClose }) => {
  const navigate = useNavigate();

  const [postBudgetSummaryMutate] = usePostBudgetSummaryMutation();
  const [postBudgetCategoryMutate] = usePostBudgetCategoryMutation();
  const [patchBudgetAmountByBudgetIdMutate] = usePatchBudgetAmountByBudgetIdMutation();

  const [amount, setAmount] = useState('');

  const title = useMemo(() => {
    if (modelType === BudgetModelModelType.EDIT) {
      if (level === BudgetEntityLevel.SUMMARY) {
        return '每月总预算';
      }
      else {
        return `每月${category?.name}预算`;
      }
    }
    else if (type === BudgetEntityType.MONTH) {
      if (level === BudgetEntityLevel.SUMMARY) {
        return '每月总预算';
      }
      else {
        return `每月${category?.name}预算`;
      }
    }
    else {
      if (level === BudgetEntityLevel.SUMMARY) {
        return '年度总预算';
      }
      else {
        return `年度${category?.name}预算`;
      }
    }
  }, [type, level, category]);

  const actions = [
    {
      key: 'confirm',
      text: '确认',
      primary: true,
      onClick: async () => {
        const [before, after] = amount.split('.');
        let _amount = amount;

        if (!amount) {
          return Dialog.alert({
            content: '请输入金额',
          });
        }

        if (Number(amount) === 0) {
          return Dialog.alert({
            content: '预算不能为 0',
          });
        }

        if (amount.split('').filter(s => s === '.').length > 1) {
          return Dialog.alert({
            content: '请输入正确的金额',
          });
        }

        if (!before) {
          return Dialog.alert({
            content: '请输入正确的金额',
          });
        }

        if (isNaN(Number(before))) {
          return Dialog.alert({
            content: '请输入正确的金额',
          });
        }

        if (before.length > 9) {
          return Dialog.alert({
            content: '最多 9 位数字',
          });
        }

        if (after) {
          if (isNaN(Number(after))) {
            return Dialog.alert({
              content: '请输入正确的金额',
            });
          }

          if (after.length > 2) {
            return Dialog.alert({
              content: '最多 2 位小数',
            });
          }
        }

        if (_amount.lastIndexOf('.') === _amount.length - 1) {
          _amount = _amount.substring(0, _amount.length - 1);
        }

        if (modelType === BudgetModelModelType.EDIT) {
          const res = await patchBudgetAmountByBudgetIdMutate({
            budgetId: budgetId!,
            data: {
              amount: _amount,
            },
          });

          if (res.statusCode === 4017) {
            navigate(`/budget?type=${type}`, { replace: true });

            setTimeout(() => {
              Dialog.alert({
                content: '分类预算之和已超过总预算, 将自动更新总预算',
                confirmText: '好的',
              });
            }, 250);
          }
          else if (res.statusCode !== 200) {
            await Dialog.alert({
              content: res.message,
            });
          }
          else {
            navigate(`/budget?type=${type}`, { replace: true });
          }
        }
        else if (level === BudgetEntityLevel.SUMMARY) {
          const res = await postBudgetSummaryMutate({
            type,
            amount: _amount,
          });

          if (res.statusCode === 4017) {
            navigate(`/budget?type=${type}`, { replace: true });

            setTimeout(() => {
              Dialog.alert({
                content: '分类预算之和已超过总预算, 将自动更新总预算',
                confirmText: '好的',
              });
            }, 250);
          }
          else if (res.statusCode !== 200) {
            await Dialog.alert({
              content: res.message,
            });
          }
          else {
            navigate(`/budget?type=${type}`, { replace: true });
          }
        }
        else {
          const res = await postBudgetCategoryMutate({
            type,
            amount: _amount,
            category: category!.id,
          });

          if (res.statusCode === 4017) {
            navigate(`/budget?type=${type}`, { replace: true });

            setTimeout(() => {
              Dialog.alert({
                content: '分类预算之和已超过总预算, 将自动更新总预算',
                confirmText: '好的',
              });
            }, 250);
          }
          else if (res.statusCode !== 200) {
            await Dialog.alert({
              content: res.message,
            });
          }
          else {
            navigate(`/budget?type=${type}`, { replace: true });
          }
        }

        setVisible(false);
        setAmount('');
      },
    },
    {
      key: 'cancel',
      text: '取消',
      onClick: () => {
        setVisible(false);
        setAmount('');
        setTimeout(() => {
          onClose();
        }, 500);
      },
    },
  ];

  return (
    <Modal
      visible={visible}
      title={title}
      content={(
        <div className="py-3">
          <div className="!bg-[#fcfcfc] p-2">
            <Input type="number" placeholder="请输入预算金额" value={amount} onChange={setAmount} />
          </div>
        </div>
      )}
      onClose={() => {
        setVisible(false);
      }}
      afterClose={onClose}
      actions={actions}
      closeOnMaskClick
    />
  );
};
