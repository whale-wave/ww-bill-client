import type { BudgetEntityType } from '../api';
import type { BudgetPresentationItem } from './BudgetItem';
import { Button, ErrorBlock, Skeleton } from 'antd-mobile';
import { AddOutline } from 'antd-mobile-icons';
import { useTranslation } from '@/shared/i18n';
import { BottomAction } from '@/shared/ui';
import { BudgetEntityLevel } from '../api';
import BudgetItem from './BudgetItem';

export interface BudgetPresentationProps {
  budgetEntityType: BudgetEntityType;
  categories: BudgetPresentationItem[];
  isLoading?: boolean;
  onAddCategory: () => void;
  onCategoryEdit: (id: string) => void;
  onSummaryCreate: () => void;
  onSummaryEdit: () => void;
  readOnly?: boolean;
  summary?: BudgetPresentationItem;
}

export const BudgetPresentation: React.FC<BudgetPresentationProps> = ({
  budgetEntityType,
  categories,
  isLoading = false,
  onAddCategory,
  onCategoryEdit,
  onSummaryCreate,
  onSummaryEdit,
  readOnly = false,
  summary,
}) => {
  const { t } = useTranslation('budget');

  if (isLoading) {
    return (
      <div className="flex flex-grow flex-col px-4">
        <Skeleton.Title animated />
        <Skeleton.Paragraph lineCount={5} animated />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex flex-grow flex-col items-center justify-center space-y-4">
        <div className="flex -translate-y-[30%] flex-col items-center justify-center space-y-4">
          <ErrorBlock status="empty" title={t('emptyBudget')} description={false} />
          {!readOnly && (
            <Button
              className="flex w-[200px] items-center justify-center !bg-primary"
              color="primary"
              data-budget-create-summary
              fill="solid"
              onClick={onSummaryCreate}
              shape="rounded"
            >
              <span
                className="inline-flex items-center justify-center gap-1"
                data-budget-create-summary-content
              >
                <AddOutline />
                <span>{t('addBudget')}</span>
              </span>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-grow flex-col">
      <BudgetItem
        budgetEntityType={budgetEntityType}
        className="mb-3"
        data={summary}
        editable={!readOnly}
        onClick={readOnly ? undefined : onSummaryEdit}
      />
      {categories.length === 0
        ? (
            <div className="mb-[50px] flex flex-grow items-center justify-center bg-[#fff]">
              <ErrorBlock description="" status="empty" title={t('emptyCategoryBudget')} />
            </div>
          )
        : (
            <div className="flex min-h-0 flex-grow flex-col overflow-auto pb-[50px]">
              <div className="bg-[#fff] p-3 text-base">{t('categoryBudget')}</div>
              {categories.map((item, index) => (
                <BudgetItem
                  budgetEntityType={budgetEntityType}
                  data={item}
                  editable={!readOnly}
                  index={index}
                  key={item.id}
                  lastIndex={categories.length - 1}
                  onClick={readOnly ? undefined : () => onCategoryEdit(item.id)}
                  type={BudgetEntityLevel.CATEGORY}
                />
              ))}
            </div>
          )}
      {!readOnly && (
        <BottomAction
          actions={[{
            key: 'add',
            onClick: onAddCategory,
            render: () => (
              <div className="flex items-center" data-budget-add-category>
                <AddOutline />
                <span>{t('addCategoryBudget')}</span>
              </div>
            ),
          }]}
          className="h-[50px] shadow-md"
        />
      )}
    </div>
  );
};
