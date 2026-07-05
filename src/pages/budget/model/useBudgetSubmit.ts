import type { BudgetModelModelType } from '../ui/BudgetModel';
import type {
  BudgetEntityType,
} from '@/entities/budget';
import type { CategoryEntity } from '@/entities/category';
import {
  BudgetEntityLevel,
  usePatchBudgetAmountByBudgetIdMutation,
  usePostBudgetCategoryMutation,
  usePostBudgetSummaryMutation,
} from '@/entities/budget';
import { BudgetModelModelTypeMap } from '../ui/BudgetModel';

interface SubmitParams {
  modelType: BudgetModelModelType;
  level: BudgetEntityLevel;
  type: BudgetEntityType;
  category?: CategoryEntity;
  budgetId?: string;
  amount: string;
  onSuccess: () => void;
}

export function useBudgetSubmit() {
  const [postSummaryMutate] = usePostBudgetSummaryMutation();
  const [postCategoryMutate] = usePostBudgetCategoryMutation();
  const [patchAmountMutate] = usePatchBudgetAmountByBudgetIdMutation();

  const submit = async (params: SubmitParams): Promise<string | null> => {
    const { modelType, level, type, category, budgetId, amount, onSuccess } = params;

    const handleResult = async (statusCode: number, message?: string): Promise<string | null> => {
      if (statusCode === 4017) {
        onSuccess();
        return '分类预算之和已超过总预算, 将自动更新总预算';
      }
      if (statusCode !== 200) {
        return message ?? '操作失败';
      }
      onSuccess();
      return null;
    };

    if (modelType === BudgetModelModelTypeMap.EDIT) {
      const res = await patchAmountMutate({
        budgetId: budgetId!,
        data: { amount, type },
      });
      return handleResult(res.statusCode, res.message);
    }

    if (level === BudgetEntityLevel.SUMMARY) {
      const res = await postSummaryMutate({ type, amount });
      return handleResult(res.statusCode, res.message);
    }

    const res = await postCategoryMutate({
      type,
      amount,
      category: category!.id,
    });
    return handleResult(res.statusCode, res.message);
  };

  return { submit };
}
