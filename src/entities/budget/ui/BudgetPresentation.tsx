import type { BudgetEntityType } from '../api';
import type { BudgetPresentationItem } from './BudgetItem';
import { Skeleton } from 'antd-mobile';
import { Plus, Tags, WalletCards } from 'lucide-react';
import { useLayoutEffect, useRef } from 'react';
import { useTranslation } from '@/shared/i18n';
import { IllustratedEmptyState } from '@/shared/ui';
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (scrollContainerRef.current)
      scrollContainerRef.current.scrollTop = 0;
  }, [budgetEntityType]);

  if (isLoading) {
    return (
      <div className="flex flex-grow flex-col gap-4 px-[18px] py-2">
        <div className="rounded-[20px] border border-solid border-border-primary bg-white/70 p-5 shadow-ww-xs">
          <Skeleton.Title animated />
          <Skeleton.Paragraph lineCount={3} animated />
        </div>
        <div className="rounded-[20px] border border-solid border-border-primary bg-white/70 p-5 shadow-ww-xs">
          <Skeleton.Paragraph lineCount={4} animated />
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex flex-grow items-center px-[18px] pb-20">
        <div className="w-full rounded-[24px] border border-solid border-border-primary bg-white/70 shadow-ww backdrop-blur-xl">
          <IllustratedEmptyState
            accentIcon={<Plus size={19} strokeWidth={2.2} />}
            actionLabel={!readOnly ? t('addBudget') : undefined}
            className="min-h-[390px]"
            description={t('emptyBudgetDescription')}
            icon={<WalletCards className="text-primary-deep" size={42} strokeWidth={1.5} />}
            onAction={!readOnly ? onSummaryCreate : undefined}
            testId="budget-empty-state"
            title={t('emptyBudget')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-grow flex-col overflow-hidden">
      <div className="min-h-0 flex-grow overflow-y-auto overscroll-contain px-[18px] pb-[max(20px,env(safe-area-inset-bottom))] pt-1" data-budget-scroll-container ref={scrollContainerRef}>
        <BudgetItem
          budgetEntityType={budgetEntityType}
          data={summary}
          editable={!readOnly}
          onClick={readOnly ? undefined : onSummaryEdit}
        />
        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between px-1">
            <div>
              <h2 className="text-[16px] font-extrabold text-ww-ink">{t('categoryBudget')}</h2>
              <p className="mt-0.5 text-[11px] text-ww-mid">{t('categoryBudgetDescription')}</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-primary-light/55 text-primary-deep">
              <Tags size={18} strokeWidth={1.8} />
            </span>
          </div>
          {categories.length === 0
            ? (
                <div className="rounded-[20px] border border-dashed border-border-primary bg-white/55">
                  <IllustratedEmptyState
                    className="min-h-[250px] py-5"
                    description={t('emptyCategoryBudgetDescription')}
                    icon={<Tags className="text-primary-deep" size={38} strokeWidth={1.5} />}
                    title={t('emptyCategoryBudget')}
                  />
                </div>
              )
            : (
                <div className="space-y-3">
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
        </section>
      </div>
      {!readOnly && (
        <div className="z-10 shrink-0 border-0 border-t border-solid border-white/60 bg-[#f7f5f8]/90 px-[18px] pb-[max(12px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
          <button
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[16px] border-0 bg-[linear-gradient(135deg,#65c3dc,#16b3ca)] text-[14px] font-bold text-white shadow-ww"
            data-budget-add-category
            onClick={onAddCategory}
            type="button"
          >
            <Plus size={18} strokeWidth={2.2} />
            <span>{t('addCategoryBudget')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
