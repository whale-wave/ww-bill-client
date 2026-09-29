import type { BudgetEntityType } from '@/entities/budget';
import type { CategoryEntity } from '@/entities/category';
import classNames from 'classnames';
import { ArrowLeft, ChevronRight, Settings2 } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BudgetEntityLevel } from '@/entities/budget';
import { CategoryIcon, useGetCategoryQuery } from '@/entities/category';
import { BudgetModel } from '@/pages/budget/ui';
import { ROUTES_PATH } from '@/shared/config/routes';
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

  return (
    <div className="page-new h-[100dvh] min-h-[100svh] overflow-hidden" data-create-budget-category-page>
      <header className="relative z-10 shrink-0 px-[18px] pb-4 pt-[max(10px,var(--ww-safe-area-top))]">
        <div className="relative flex h-11 items-center justify-center">
          <button
            aria-label={t('nav.back')}
            className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full border border-solid border-border-primary bg-white/80 text-primary-deep shadow-ww-xs"
            onClick={onBack}
            type="button"
          >
            <ArrowLeft size={17} strokeWidth={2} />
          </button>
          <h1 className="text-[20px] font-extrabold text-ww-ink">{t('budget:createCategory')}</h1>
        </div>
        <button
          className="mt-3 flex min-h-[68px] w-full items-center gap-3 rounded-[18px] border border-solid border-border-primary bg-white/80 px-4 py-3 text-left shadow-ww-xs"
          data-budget-category-settings
          onClick={() => navigate(ROUTES_PATH.CATEGORY_SETTINGS.getPath())}
          type="button"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-primary-light/60 text-primary-deep">
            <Settings2 aria-hidden="true" size={20} strokeWidth={1.9} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-bold text-ww-ink">{t('record:bookkeeping.categorySettings')}</span>
            <span className="mt-0.5 block truncate text-[11px] text-ww-mid">{t('budget:categorySettingsDescription')}</span>
          </span>
          <ChevronRight aria-hidden="true" className="shrink-0 text-ww-soft" size={18} strokeWidth={2} />
        </button>
      </header>

      <main className="min-h-0 flex-grow overflow-y-auto overscroll-contain px-[14px] pb-[calc(20px+env(safe-area-inset-bottom))]" data-budget-category-list>
        <div className="grid grid-cols-4 gap-[9px]">
          {data.filter(category => !category.parentId).map(category => (
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
                <CategoryIcon categoryName={category.name} iconKey={category.icon} iconType={category.iconType} textIconEnabled={category.textIconEnabled} textIconIndex={category.textIconIndex} size={24} />
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
