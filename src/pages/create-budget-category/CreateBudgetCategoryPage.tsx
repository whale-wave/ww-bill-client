import type { BudgetEntityType } from '@/entities/budget';
import type { CategoryEntity } from '@/entities/category';
import classNames from 'classnames';
import { ArrowLeft, Tags } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BudgetEntityLevel, BudgetEntityType as BudgetType } from '@/entities/budget';
import { CategoryIcon, useGetCategoryQuery } from '@/entities/category';
import { BudgetModel } from '@/pages/budget/ui';
import { useTranslation } from '@/shared/i18n';

interface CreateBudgetCategoryProps {
}

const CreateBudgetCategory: React.FC<CreateBudgetCategoryProps> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'budget']);
  const { type: typeParam } = useParams() as { type: string };
  const type = Number(typeParam) as BudgetEntityType;

  const [selectCategory, setSelectCategory] = useState<CategoryEntity>();
  const [visible, setVisible] = useState(false);
  const { data } = useGetCategoryQuery({ params: { type: 'sub' } });

  const onBack = useCallback(() => {
    navigate(`/budget?type=${type}`, { replace: true });
  }, [navigate, type]);

  const onSelectCategory = useCallback((category: CategoryEntity) => {
    setSelectCategory(category);
    setVisible(true);
  }, []);

  const onCloseModel = useCallback(() => {
    setSelectCategory(undefined);
  }, []);

  const periodLabel = type === BudgetType.YEAR
    ? t('budget:dropdown.yearlyBudget')
    : t('budget:dropdown.monthlyBudget');

  return (
    <div className="page-new h-[100dvh] min-h-[100svh] overflow-hidden" data-create-budget-category-page>
      <header className="relative z-10 shrink-0 px-[18px] pb-4 pt-[max(10px,env(safe-area-inset-top))]">
        <div className="relative flex h-10 items-center justify-center">
          <button
            aria-label={t('nav.back')}
            className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full border border-solid border-border-primary bg-white/80 text-primary-deep shadow-ww-xs"
            onClick={onBack}
            type="button"
          >
            <ArrowLeft size={17} strokeWidth={2} />
          </button>
          <h1 className="text-[20px] font-extrabold text-ww-ink">{t('budget:createCategory')}</h1>
        </div>
        <div className="mt-3 flex items-center gap-3 rounded-[18px] border border-solid border-border-primary bg-white/65 px-4 py-3 shadow-ww-xs backdrop-blur-xl">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-primary-light/60 text-primary-deep">
            <Tags size={20} strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-ww-ink">{t('budget:selectCategoryTitle')}</p>
            <p className="mt-0.5 text-[11px] text-ww-mid">{t('budget:selectCategoryDescription', { period: periodLabel })}</p>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-grow overflow-y-auto overscroll-contain px-[14px] pb-[calc(20px+env(safe-area-inset-bottom))]" data-budget-category-list>
        <div className="grid grid-cols-4 gap-[9px]">
          {data.map(category => (
            <button
              aria-pressed={selectCategory?.id === category.id}
              className="flex h-[92.5px] min-w-0 flex-col items-center gap-[7px] rounded-[18px] border border-solid border-border-primary bg-white/80 px-1 pb-[10px] pt-[13px] shadow-ww-xs transition active:scale-95"
              data-budget-category={category.id}
              key={category.id}
              onClick={() => onSelectCategory(category)}
              type="button"
            >
              <span className={classNames(
                'ww-category-choice-icon flex h-11 w-11 items-center justify-center rounded-full',
              )}
              >
                <CategoryIcon categoryName={category.name} iconKey={category.icon} size={24} />
              </span>
              <span className="w-full truncate text-[11px] font-semibold leading-[16.5px] text-ww-mid">{category.name}</span>
            </button>
          ))}
        </div>
      </main>

      <BudgetModel
        budgetId={undefined}
        category={selectCategory}
        level={BudgetEntityLevel.CATEGORY}
        onClose={onCloseModel}
        setVisible={setVisible}
        type={type}
        visible={visible}
      />
    </div>
  );
};

export default CreateBudgetCategory;
