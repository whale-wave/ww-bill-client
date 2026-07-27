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
  showCategoriesWithoutSummary?: boolean;
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
  showCategoriesWithoutSummary = false,
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

  if (!summary && !showCategoriesWithoutSummary) {
    return (
      <div className="flex flex-grow flex-col items-center justify-center space-y-4">
        <div className="flex -translate-y-[30%] flex-col items-center justify-center space-y-4">
          <ErrorBlock status="empty" title={t('emptyBudget')} description={false} />
          <Button
            className="flex w-[200px] items-center"
            color="primary"
            data-budget-create-summary
            onClick={onSummaryCreate}
            shape="rounded"
          >
            <AddOutline />
            <span>{t('addBudget')}</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-grow flex-col">
      {summary
        ? (
            <BudgetItem
              budgetEntityType={budgetEntityType}
              className="mb-3"
              data={summary}
              onClick={onSummaryEdit}
            />
          )
        : (
            <div className="mb-3 flex flex-shrink-0 flex-col items-center justify-center space-y-4 bg-white py-5">
              <ErrorBlock status="empty" title={t('emptyBudget')} description={false} />
              <Button
                className="flex w-[200px] items-center"
                color="primary"
                data-budget-create-summary
                onClick={onSummaryCreate}
                shape="rounded"
              >
                <AddOutline />
                <span>{t('addBudget')}</span>
              </Button>
            </div>
          )}
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
                  index={index}
                  key={item.id}
                  lastIndex={categories.length - 1}
                  onClick={() => onCategoryEdit(item.id)}
                  type={BudgetEntityLevel.CATEGORY}
                />
              ))}
            </div>
          )}
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
    </div>
  );
};
