import type { FC } from 'react';
import type { Household, HouseholdBudget } from '@/entities/household';
import {
  ActionSheet,
  DatePicker,
  Dialog,
  Input,
  Modal,
  Selector,
  Toast,
} from 'antd-mobile';
import dayjs from 'dayjs';
import { useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  BudgetEntityType,
  BudgetPeriodDropdown,
  BudgetPresentation,
} from '@/entities/budget';
import {
  HouseholdBudgetPeriodType,
  useDeleteHouseholdBudgetMutation,
  useHouseholdBudgetsQuery,
  useUpsertHouseholdBudgetMutation,
} from '@/entities/household';
import {
  formatMonthStart,
  getApiErrorMessage,
  getApiErrorStatus,
  HouseholdPageState,
  HouseholdScopeBoundary,
} from '@/features/household';
import { useTranslation } from '@/shared/i18n';

interface BudgetEditor {
  budget?: HouseholdBudget;
  kind: 'category' | 'summary';
}

interface BudgetContentProps {
  budgetEntityType: BudgetEntityType;
  household: Household;
  periodStart: string;
  periodType: HouseholdBudgetPeriodType;
}

const BudgetContent: FC<BudgetContentProps> = ({
  budgetEntityType,
  household,
  periodStart,
  periodType,
}) => {
  const [editor, setEditor] = useState<BudgetEditor>();
  const [amount, setAmount] = useState('');
  const [categoryKey, setCategoryKey] = useState('');
  const query = useHouseholdBudgetsQuery({
    params: { filters: { periodStart, periodType }, householdId: household.id },
    queryOptions: { enabled: true },
  });
  const [upsert, upsertState] = useUpsertHouseholdBudgetMutation();
  const [remove, removeState] = useDeleteHouseholdBudgetMutation();
  const { t } = useTranslation('household');
  const categoryOptions = useMemo(() => {
    const editingCategoryKey = editor?.budget?.categoryKey;
    const budgetedCategoryKeys = new Set(
      (query.data?.categories ?? []).map(category => category.budget.categoryKey),
    );
    const categories = new Map(
      (query.data?.availableCategories ?? [])
        .filter(category => (
          category.categoryKey === editingCategoryKey
          || !budgetedCategoryKeys.has(category.categoryKey)
        ))
        .map(category => [category.categoryKey, category]),
    );
    if (editingCategoryKey && editor.budget?.categoryName) {
      categories.set(editingCategoryKey, {
        categoryKey: editingCategoryKey,
        categoryName: editor.budget.categoryName,
        iconKey: editor.budget.iconKey,
      });
    }
    return [...categories.values()];
  }, [editor?.budget, query.data?.availableCategories, query.data?.categories]);
  const summary = useMemo(() => query.data?.summary.budget
    ? {
        amount: query.data.summary.spent,
        budgetAmount: query.data.summary.amount,
        id: query.data.summary.budget.id,
        remaining: query.data.summary.remaining,
        remainingPercentage: String((query.data.summary.remainingPercent ?? 0) * 100),
        title: periodType === HouseholdBudgetPeriodType.MONTH
          ? t('common.monthLabel', {
              month: Number(periodStart.slice(5, 7)),
              year: periodStart.slice(0, 4),
            })
          : t('common.yearLabel', { year: periodStart.slice(0, 4) }),
      }
    : undefined, [periodStart, periodType, query.data?.summary, t]);
  const categories = useMemo(() => (query.data?.categories ?? []).map(category => ({
    amount: category.spent,
    budgetAmount: category.budget.amount,
    category: {
      icon: category.budget.iconKey,
      name: category.budget.categoryName ?? '',
    },
    id: category.budget.id,
    remaining: category.remaining,
    remainingPercentage: String((category.remainingPercent ?? 0) * 100),
  })), [query.data?.categories]);

  const handleError = async (error: unknown) => {
    if (getApiErrorStatus(error) === 409) {
      await query.refetch();
      void Toast.show({ content: t('common.conflict'), icon: 'fail' });
      return true;
    }
    void Toast.show({ content: getApiErrorMessage(error, t('common.failed')), icon: 'fail' });
    return false;
  };

  const closeEditor = () => {
    setEditor(undefined);
    setAmount('');
    setCategoryKey('');
  };

  const openEditor = (kind: BudgetEditor['kind'], budget?: HouseholdBudget) => {
    setEditor({ budget: budget ? { ...budget } : undefined, kind });
    setAmount(budget?.amount ?? '');
    setCategoryKey(budget?.categoryKey ?? '');
  };

  const handleSave = async () => {
    const normalizedAmount = amount.trim();
    const selectedCategory = editor?.kind === 'category' && editor.budget?.categoryKey
      ? {
          categoryKey: editor.budget.categoryKey,
          categoryName: editor.budget.categoryName ?? '',
          iconKey: editor.budget.iconKey,
        }
      : categoryOptions.find(category => category.categoryKey === categoryKey);
    if (!(Number(normalizedAmount) > 0)
      || (editor?.kind === 'category' && !selectedCategory)) {
      void Toast.show({ content: t('budget.invalidAmount') });
      return;
    }

    try {
      await upsert({
        data: {
          amount: normalizedAmount,
          periodStart,
          periodType,
          ...(editor?.kind === 'category' && selectedCategory
            ? {
                categoryKey: selectedCategory.categoryKey,
                categoryNameSnapshot: selectedCategory.categoryName,
                ...(selectedCategory.iconKey
                  ? { iconKeySnapshot: selectedCategory.iconKey }
                  : {}),
              }
            : {}),
          ...(editor?.budget ? { version: editor.budget.version } : {}),
        },
        householdId: household.id,
      });
      closeEditor();
      void Toast.show({ content: t('budget.saved'), icon: 'success' });
    }
    catch (error) {
      const isConflict = await handleError(error);
      if (isConflict)
        closeEditor();
    }
  };

  const handleDelete = async (budget: HouseholdBudget, kind: BudgetEditor['kind']) => {
    const confirm = await Dialog.confirm({
      content: kind === 'summary'
        ? t('budget.confirmDeleteSummary')
        : t('budget.confirmDelete'),
      title: t('budget.deleteTitle'),
    });
    if (!confirm)
      return;

    try {
      await remove({
        budgetId: budget.id,
        householdId: household.id,
        version: budget.version,
      });
      void Toast.show({ content: t('budget.deleted'), icon: 'success' });
    }
    catch (error) {
      await handleError(error);
    }
  };

  const showActions = (budget: HouseholdBudget, kind: BudgetEditor['kind']) => {
    const actionSheet = ActionSheet.show({
      actions: [
        {
          disabled: upsertState.isLoading || removeState.isLoading,
          key: 'edit',
          onClick: () => {
            actionSheet.close();
            openEditor(kind, budget);
          },
          text: kind === 'summary'
            ? t('budget.editSummary')
            : t('budget.editCategory', { category: budget.categoryName }),
        },
        {
          danger: true,
          disabled: upsertState.isLoading || removeState.isLoading,
          key: 'delete',
          onClick: () => {
            actionSheet.close();
            void handleDelete(budget, kind);
          },
          text: kind === 'summary'
            ? t('budget.deleteSummary')
            : t('budget.deleteCategory', { category: budget.categoryName }),
        },
      ],
      cancelText: t('common.cancel'),
    });
  };

  return (
    <>
      <Modal
        actions={[
          {
            disabled: upsertState.isLoading
              || (editor?.kind === 'category' && !editor.budget && categoryOptions.length === 0),
            key: 'confirm',
            onClick: handleSave,
            primary: true,
            text: upsertState.isLoading ? t('common.saving') : t('common.save'),
          },
          {
            disabled: upsertState.isLoading,
            key: 'cancel',
            onClick: closeEditor,
            text: t('common.cancel'),
          },
        ]}
        afterClose={closeEditor}
        closeOnMaskClick={!upsertState.isLoading}
        content={(
          <div className="space-y-3 py-3">
            {editor?.kind === 'category' && (
              categoryOptions.length > 0
                ? (
                    <Selector
                      columns={1}
                      disabled={Boolean(editor.budget)}
                      onChange={values => setCategoryKey(String(values[0] ?? ''))}
                      options={categoryOptions.map(category => ({
                        label: category.categoryName,
                        value: category.categoryKey,
                      }))}
                      value={categoryKey ? [categoryKey] : []}
                    />
                  )
                : <p className="text-sm text-font-gray">{t('budget.noAvailableCategories')}</p>
            )}
            <div className="!bg-[#fcfcfc] p-2">
              <Input
                name="householdBudgetAmount"
                onChange={setAmount}
                placeholder={t('budget.amountPlaceholder')}
                type="number"
                value={amount}
              />
            </div>
          </div>
        )}
        onClose={closeEditor}
        title={editor?.kind === 'category'
          ? t(editor.budget ? 'budget.editCategoryTitle' : 'budget.addCategory')
          : t(editor?.budget ? 'budget.editSummaryTitle' : 'budget.addSummary')}
        visible={Boolean(editor)}
      />
      <HouseholdPageState
        errorDescription={t('common.loadErrorDescription')}
        errorTitle={t('common.loadError')}
        isError={query.isError}
        isLoading={false}
        loadingLabel={t('common.loading')}
        onRetry={() => void query.refetch()}
        retryLabel={t('common.retry')}
      >
        <BudgetPresentation
          budgetEntityType={budgetEntityType}
          categories={categories}
          isLoading={query.isLoading}
          onAddCategory={() => openEditor('category')}
          onCategoryEdit={(budgetId) => {
            const budget = query.data?.categories.find(item => item.budget.id === budgetId)?.budget;
            if (budget)
              showActions(budget, 'category');
          }}
          onSummaryCreate={() => openEditor('summary')}
          onSummaryEdit={() => {
            if (query.data?.summary.budget)
              showActions(query.data.summary.budget, 'summary');
          }}
          showCategoriesWithoutSummary
          summary={summary}
        />
      </HouseholdPageState>
    </>
  );
};

const HouseholdBudgetsPage: FC = () => {
  const { householdId = '' } = useParams<{ householdId: string }>();
  const dropDownWrapperRef = useRef<HTMLDivElement>(null);
  const [periodType, setPeriodType] = useState(HouseholdBudgetPeriodType.MONTH);
  const [periodStart, setPeriodStart] = useState(() => formatMonthStart(new Date()));
  const budgetEntityType = periodType === HouseholdBudgetPeriodType.MONTH
    ? BudgetEntityType.MONTH
    : BudgetEntityType.YEAR;

  const handleBudgetEntityTypeChange = (nextType: BudgetEntityType) => {
    const nextPeriodType = nextType === BudgetEntityType.MONTH
      ? HouseholdBudgetPeriodType.MONTH
      : HouseholdBudgetPeriodType.YEAR;
    setPeriodType(nextPeriodType);
    if (nextPeriodType === HouseholdBudgetPeriodType.YEAR)
      setPeriodStart(`${periodStart.slice(0, 4)}-01-01`);
  };

  const handlePeriodStart = () => {
    void DatePicker.prompt({
      defaultValue: dayjs(periodStart).toDate(),
      precision: periodType === HouseholdBudgetPeriodType.MONTH ? 'month' : 'year',
    }).then((selected) => {
      if (!selected)
        return;
      setPeriodStart(periodType === HouseholdBudgetPeriodType.MONTH
        ? formatMonthStart(selected)
        : `${selected.getFullYear()}-01-01`);
    });
  };

  return (
    <div
      className="page-new fixed left-0 top-0 h-screen w-full bg-[#f6f6f6]"
      ref={dropDownWrapperRef}
    >
      <BudgetPeriodDropdown
        budgetEntityType={budgetEntityType}
        dropDownWrapperRef={dropDownWrapperRef}
        onBudgetEntityTypeChange={handleBudgetEntityTypeChange}
        right={(
          <button
            className="border-0 bg-transparent px-0 text-xs text-font-gray"
            data-budget-period-start
            onClick={handlePeriodStart}
            type="button"
          >
            {periodType === HouseholdBudgetPeriodType.MONTH
              ? periodStart.slice(0, 7)
              : periodStart.slice(0, 4)}
          </button>
        )}
      />
      <div className="flex min-h-0 flex-grow flex-col overflow-auto">
        <HouseholdScopeBoundary householdId={householdId}>
          {household => (
            <BudgetContent
              budgetEntityType={budgetEntityType}
              household={household}
              periodStart={periodStart}
              periodType={periodType}
            />
          )}
        </HouseholdScopeBoundary>
      </div>
    </div>
  );
};

export default HouseholdBudgetsPage;
