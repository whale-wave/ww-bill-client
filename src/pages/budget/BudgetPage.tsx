import type { BudgetInfo } from '@/entities/budget';
import type { CategoryEntity } from '@/entities/category';
import type { BudgetModelModelType } from '@/pages/budget/ui';
import { ActionSheet, Dialog } from 'antd-mobile';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BUDGET_ACTION_SHEET_CLASS_NAME,
  BUDGET_CENTER_POPUP_CLASS_NAME,
  BUDGET_DIALOG_BODY_CLASS_NAME,
  BUDGET_OVERLAY_MASK_CLASS_NAME,
  BudgetEntityLevel,
  BudgetEntityType,
  BudgetPageShell,
  BudgetPresentation,
  useDeleteBudgetCategoryByBudgetIdMutation,
  useGetBudgetInfoQuery,
  usePostBudgetClearMutation,
} from '@/entities/budget';
import { BudgetPageContext } from '@/pages/budget/model/budgetPageContext.ts';
import { BudgetModel, BudgetModelModelTypeMap, BudgetTop } from '@/pages/budget/ui';
import { useTranslation } from '@/shared/i18n';

interface BudgetProps {
}

const Budget: React.FC<BudgetProps> = () => {
  const { t } = useTranslation('budget');
  const [searchParams] = useSearchParams();
  const typeByUrl = searchParams.get('type');
  const [budgetEntityType, setBudgetEntityType] = useState<BudgetEntityType>(typeByUrl ? Number(typeByUrl) : BudgetEntityType.MONTH);
  const budgetPageContentValue = useMemo(() => ({ budgetEntityType, setBudgetEntityType }), [budgetEntityType, setBudgetEntityType]);

  const navigate = useNavigate();

  const { data, isLoading } = useGetBudgetInfoQuery({ params: { type: budgetEntityType } });
  const [postBudgetClearMutate] = usePostBudgetClearMutation();
  const [deleteBudgetCategoryByBudgetIdMutate] = useDeleteBudgetCategoryByBudgetIdMutation();

  const dropDownWrapperRef = useRef<HTMLDivElement>(null);
  const [isAddSummaryBudgetVisible, setIsAddSummaryBudgetVisible] = useState(false);
  const [curLevel, setCurLevel] = useState<BudgetEntityLevel | undefined>();
  const [curBudgetId, setCurBudgetId] = useState<string | undefined>();
  const [curCategory, setCurCategory] = useState<CategoryEntity | undefined>();
  const [modelType, setModelType] = useState<BudgetModelModelType>(BudgetModelModelTypeMap.CREATE);

  const onBudgetClick = useCallback((budgetInfo: BudgetInfo, level: BudgetEntityLevel) => () => {
    const isSummaryBudget = level === BudgetEntityLevel.SUMMARY;
    const text = budgetPageContentValue.budgetEntityType === BudgetEntityType.MONTH ? t('common:time.month') : t('common:time.year');

    const actionSheet = ActionSheet.show({
      popupClassName: BUDGET_ACTION_SHEET_CLASS_NAME,
      styles: { mask: { backdropFilter: 'blur(2px)', background: 'rgba(38, 54, 74, 0.35)' } },
      cancelText: t('common:nav.cancel'),
      actions: [
        {
          text: isSummaryBudget ? t('editSummaryBudget', { period: text }) : t('editCategoryBudget', { category: budgetInfo.category!.name }),
          key: 'edit',
          onClick: async () => {
            actionSheet.close();

            setIsAddSummaryBudgetVisible(true);
            setCurLevel(level);
            setCurBudgetId(budgetInfo.id);
            setModelType(BudgetModelModelTypeMap.EDIT);

            if (level === BudgetEntityLevel.CATEGORY) {
              setCurCategory(budgetInfo.category!);
            }
          },
        },
        {
          text: isSummaryBudget ? t('clearSummaryBudget', { period: text }) : t('deleteCategoryBudget', { category: budgetInfo.category!.name }),
          key: 'clear',
          onClick: async () => {
            actionSheet.close();

            if (isSummaryBudget) {
              const confirm = await Dialog.confirm({
                bodyClassName: BUDGET_DIALOG_BODY_CLASS_NAME,
                className: BUDGET_CENTER_POPUP_CLASS_NAME,
                title: t('warning.title'),
                content: t('clearSummaryBudgetWarning'),
                maskClassName: BUDGET_OVERLAY_MASK_CLASS_NAME,
              });
              if (!confirm)
                return;

              await postBudgetClearMutate({
                type: budgetPageContentValue.budgetEntityType,
              });
            }
            else {
              await deleteBudgetCategoryByBudgetIdMutate({ budgetId: budgetInfo.id, data: { type: budgetPageContentValue.budgetEntityType } });
            }
          },
        },
      ],
    });
  }, [
    budgetPageContentValue.budgetEntityType,
    deleteBudgetCategoryByBudgetIdMutate,
    postBudgetClearMutate,
    t,
  ]);

  const onAddSummaryBudget = useCallback(() => {
    setIsAddSummaryBudgetVisible(true);
    setCurLevel(BudgetEntityLevel.SUMMARY);
  }, []);

  const onCloseBudgetModel = useCallback(() => {
    setCurLevel(undefined);
    setCurBudgetId(undefined);
    setCurCategory(undefined);
    setModelType(BudgetModelModelTypeMap.CREATE);
  }, []);

  const onGoToCreateBudgetCategoryPage = useCallback(() => {
    navigate(`/budget/category/${budgetPageContentValue.budgetEntityType}`, { replace: true });
  }, [budgetPageContentValue.budgetEntityType, navigate]);

  const handleSummaryEdit = useCallback(() => {
    if (data?.summaryBudget)
      onBudgetClick(data.summaryBudget, BudgetEntityLevel.SUMMARY)();
  }, [data?.summaryBudget, onBudgetClick]);

  const handleCategoryEdit = useCallback((budgetId: string) => {
    const item = data?.categoryBudgets?.find(budget => budget.id === budgetId);
    if (item)
      onBudgetClick(item, BudgetEntityLevel.CATEGORY)();
  }, [data?.categoryBudgets, onBudgetClick]);

  return (
    <BudgetPageContext.Provider value={budgetPageContentValue}>
      <BudgetPageShell
        header={<BudgetTop dropDownWrapperRef={dropDownWrapperRef} />}
        wrapperRef={dropDownWrapperRef}
      >
        { typeof curLevel === 'number' && (
          <BudgetModel
            modelType={modelType}
            visible={isAddSummaryBudgetVisible}
            setVisible={setIsAddSummaryBudgetVisible}
            type={budgetPageContentValue.budgetEntityType}
            level={curLevel}
            onClose={onCloseBudgetModel}
            budgetId={curBudgetId}
            category={curCategory}
          />
        )}
        <BudgetPresentation
          budgetEntityType={budgetEntityType}
          categories={data?.categoryBudgets ?? []}
          isLoading={isLoading}
          onAddCategory={onGoToCreateBudgetCategoryPage}
          onCategoryEdit={handleCategoryEdit}
          onSummaryCreate={onAddSummaryBudget}
          onSummaryEdit={handleSummaryEdit}
          summary={data?.summaryBudget}
        />
      </BudgetPageShell>
    </BudgetPageContext.Provider>
  );
};

export default Budget;
