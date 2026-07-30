import type { BudgetInfo } from '@/entities/budget';
import type { Ledger } from '@/entities/ledger';
import { ActionSheet, Dialog, ErrorBlock, Modal, SpinLoading, Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { useMemo, useRef, useState } from 'react';
import {
  BudgetEditorPresentation,
  BudgetEntityLevel,
  BudgetEntityType,
  BudgetPageShell,
  BudgetPeriodDropdown,
  BudgetPresentation,
  useClearLedgerBudgetMutation,
  useCreateLedgerBudgetCategoryMutation,
  useCreateLedgerBudgetSummaryMutation,
  useDeleteLedgerBudgetCategoryMutation,
  useLedgerBudgetInfoQuery,
  usePatchLedgerBudgetAmountMutation,
} from '@/entities/budget';
import { useLedgerCategoriesQuery } from '@/entities/category';
import { LedgerCapability } from '@/entities/ledger';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { useCurrentWorkspaceBack, useWorkspaceBack } from '@/features/workspace-navigation';
import { useTranslation } from '@/shared/i18n';

interface BudgetEditor {
  item?: BudgetInfo;
  level: BudgetEntityLevel;
}

interface BudgetContentProps {
  budgetEntityType: BudgetEntityType;
  canManage: boolean;
  ledgerId: string;
  periodStart: string;
}

function BudgetContent({
  budgetEntityType,
  canManage,
  ledgerId,
  periodStart,
}: BudgetContentProps) {
  const { t } = useTranslation('budget');
  const { t: tLedger } = useTranslation('ledger');
  const filters = useMemo(() => ({
    periodStart,
    type: budgetEntityType,
  }), [budgetEntityType, periodStart]);
  const query = useLedgerBudgetInfoQuery({ params: { filters, ledgerId } });
  const categoriesQuery = useLedgerCategoriesQuery({
    params: { ledgerId, type: 'sub' },
    queryOptions: { enabled: canManage },
  });
  const [createSummary, createSummaryState] = useCreateLedgerBudgetSummaryMutation();
  const [createCategory, createCategoryState] = useCreateLedgerBudgetCategoryMutation();
  const [patchBudget, patchState] = usePatchLedgerBudgetAmountMutation();
  const [clearBudget, clearState] = useClearLedgerBudgetMutation();
  const [deleteCategory, deleteState] = useDeleteLedgerBudgetCategoryMutation();
  const [editor, setEditor] = useState<BudgetEditor>();
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const isSaving = createSummaryState.isLoading || createCategoryState.isLoading || patchState.isLoading;
  const categoryOptions = useMemo(() => {
    const usedCategoryIds = new Set((query.data.categoryBudgets ?? []).map(item => item.category?.id));
    return categoriesQuery.data.filter(category => !usedCategoryIds.has(category.id));
  }, [categoriesQuery.data, query.data.categoryBudgets]);

  const closeEditor = () => {
    setEditor(undefined);
    setAmount('');
    setCategoryId('');
  };

  const openEditor = (level: BudgetEntityLevel, item?: BudgetInfo) => {
    setEditor({ item, level });
    setAmount(item ? String(item.budgetAmount) : '');
    setCategoryId(item?.category ? String(item.category.id) : '');
  };

  const handleSave = async () => {
    const normalizedAmount = amount.trim();
    if (!(Number(normalizedAmount) > 0)
      || (editor?.level === BudgetEntityLevel.CATEGORY && !editor.item && !categoryId)) {
      Toast.show({ icon: 'fail', content: t('validation.invalidAmount') });
      return;
    }

    try {
      const response = editor?.item
        ? await patchBudget({
            budgetId: editor.item.id,
            data: { amount: normalizedAmount, ...filters },
            ledgerId,
          })
        : editor?.level === BudgetEntityLevel.CATEGORY
          ? await createCategory({
              data: { amount: normalizedAmount, category: Number(categoryId), ...filters },
              ledgerId,
            })
          : await createSummary({
              data: { amount: normalizedAmount, ...filters },
              ledgerId,
            });
      closeEditor();
      if (response.statusCode === 4017) {
        setTimeout(() => {
          void Dialog.alert({
            content: t('warning.categoryBudgetExceedsTotal'),
            confirmText: t('actions.save'),
          });
        }, 250);
      }
    }
    catch {
      Toast.show({ icon: 'fail', content: tLedger('budget.saveFailed') });
    }
  };

  const showActions = (item: BudgetInfo, level: BudgetEntityLevel) => {
    const isSummary = level === BudgetEntityLevel.SUMMARY;
    const actionSheet = ActionSheet.show({
      actions: [
        {
          key: 'edit',
          onClick: () => {
            actionSheet.close();
            openEditor(level, item);
          },
          text: isSummary
            ? t('editSummaryBudget', { period: budgetEntityType === BudgetEntityType.MONTH ? t('common:time.month') : t('common:time.year') })
            : t('editCategoryBudget', { category: item.category?.name }),
        },
        {
          danger: true,
          disabled: clearState.isLoading || deleteState.isLoading,
          key: 'delete',
          onClick: async () => {
            actionSheet.close();
            try {
              if (isSummary) {
                const confirm = await Modal.confirm({
                  content: t('clearSummaryBudgetWarning'),
                  title: t('warning.title'),
                });
                if (!confirm)
                  return;
                await clearBudget({ data: filters, ledgerId });
              }
              else {
                await deleteCategory({ budgetId: item.id, data: filters, ledgerId });
              }
            }
            catch {
              Toast.show({ icon: 'fail', content: tLedger('budget.saveFailed') });
            }
          },
          text: isSummary
            ? t('clearSummaryBudget', { period: budgetEntityType === BudgetEntityType.MONTH ? t('common:time.month') : t('common:time.year') })
            : t('deleteCategoryBudget', { category: item.category?.name }),
        },
      ],
      cancelText: t('actions.cancel'),
    });
  };

  if (query.isError) {
    return (
      <div className="flex flex-grow items-center justify-center" data-ledger-budget-error>
        <ErrorBlock status="default" />
      </div>
    );
  }

  return (
    <>
      <BudgetEditorPresentation
        amount={amount}
        amountPlaceholder={t('model.amountPlaceholder')}
        cancelLabel={t('actions.cancel')}
        categoryEmptyContent={t('emptyCategoryBudget')}
        categoryOptions={editor?.level === BudgetEntityLevel.CATEGORY && !editor.item
          ? categoryOptions.map(category => ({
              label: category.name,
              value: String(category.id),
            }))
          : undefined}
        categoryValue={categoryId}
        inputName="ledgerBudgetAmount"
        isSaving={isSaving}
        onAfterClose={closeEditor}
        onAmountChange={setAmount}
        onCancel={closeEditor}
        onCategoryChange={setCategoryId}
        onSave={handleSave}
        saveLabel={t('actions.save')}
        title={editor?.level === BudgetEntityLevel.CATEGORY
          ? t(budgetEntityType === BudgetEntityType.MONTH
              ? 'model.title.monthlyCategory'
              : 'model.title.yearlyCategory', {
              category: editor.item?.category?.name ?? '',
            })
          : t(budgetEntityType === BudgetEntityType.MONTH
              ? 'model.title.monthlySummary'
              : 'model.title.yearlySummary')}
        visible={Boolean(editor)}
      />
      <BudgetPresentation
        budgetEntityType={budgetEntityType}
        categories={query.data.categoryBudgets ?? []}
        isLoading={query.isLoading}
        onAddCategory={() => openEditor(BudgetEntityLevel.CATEGORY)}
        onCategoryEdit={(budgetId) => {
          const item = query.data.categoryBudgets?.find(category => category.id === budgetId);
          if (item)
            showActions(item, BudgetEntityLevel.CATEGORY);
        }}
        onSummaryCreate={() => openEditor(BudgetEntityLevel.SUMMARY)}
        onSummaryEdit={() => {
          if (query.data.summaryBudget)
            showActions(query.data.summaryBudget, BudgetEntityLevel.SUMMARY);
        }}
        readOnly={!canManage}
        summary={query.data.summaryBudget}
      />
    </>
  );
}

function ScopedLedgerBudgetPage({
  ledger,
  ledgerId,
}: {
  ledger: Ledger;
  ledgerId: string;
}) {
  const onBack = useWorkspaceBack({
    capabilities: ledger.capabilities,
    ledgerId,
    type: 'custom',
  });
  const dropDownWrapperRef = useRef<HTMLDivElement>(null);
  const [budgetEntityType, setBudgetEntityType] = useState(BudgetEntityType.MONTH);
  const periodStart = useMemo(() => dayjs()
    .startOf(budgetEntityType === BudgetEntityType.MONTH ? 'month' : 'year')
    .format('YYYY-MM-DD'), [budgetEntityType]);

  return (
    <BudgetPageShell
      header={(
        <BudgetPeriodDropdown
          budgetEntityType={budgetEntityType}
          dropDownWrapperRef={dropDownWrapperRef}
          onBack={onBack}
          onBudgetEntityTypeChange={setBudgetEntityType}
        />
      )}
      wrapperRef={dropDownWrapperRef}
    >
      <BudgetContent
        budgetEntityType={budgetEntityType}
        canManage={ledger.capabilities.includes(LedgerCapability.BUDGET_MANAGE)}
        ledgerId={ledgerId}
        periodStart={periodStart}
      />
    </BudgetPageShell>
  );
}

export default function LedgerBudgetPage() {
  const onBack = useCurrentWorkspaceBack();
  const dropDownWrapperRef = useRef<HTMLDivElement>(null);
  const [budgetEntityType, setBudgetEntityType] = useState(BudgetEntityType.MONTH);

  return (
    <LedgerScopeBoundary
      capability={LedgerCapability.BUDGET_READ}
      renderState={state => (
        <BudgetPageShell
          header={(
            <BudgetPeriodDropdown
              budgetEntityType={budgetEntityType}
              dropDownWrapperRef={dropDownWrapperRef}
              onBack={onBack}
              onBudgetEntityTypeChange={setBudgetEntityType}
            />
          )}
          wrapperRef={dropDownWrapperRef}
        >
          <div className="flex flex-grow items-center justify-center" data-ledger-budget-scope-state={state}>
            {state === 'loading'
              ? <SpinLoading />
              : <ErrorBlock status="default" />}
          </div>
        </BudgetPageShell>
      )}
    >
      {({ ledger, ledgerId }) => (
        <ScopedLedgerBudgetPage ledger={ledger} ledgerId={ledgerId} />
      )}
    </LedgerScopeBoundary>
  );
}
