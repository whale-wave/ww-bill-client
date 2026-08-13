import type { ReactNode, RefObject } from 'react';
import { ArrowLeft, CalendarRange } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/i18n';
import { BudgetEntityType } from '../api';

export interface BudgetPeriodDropdownProps {
  budgetEntityType: BudgetEntityType;
  dropDownWrapperRef: RefObject<HTMLDivElement>;
  onBudgetEntityTypeChange: (budgetEntityType: BudgetEntityType) => void;
  onBack?: () => void;
  right?: ReactNode;
}

export const BudgetPeriodDropdown: React.FC<BudgetPeriodDropdownProps> = ({
  budgetEntityType,
  dropDownWrapperRef: _dropDownWrapperRef,
  onBudgetEntityTypeChange,
  onBack,
  right,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation('budget');
  const actions = [
    {
      title: t('dropdown.monthlyBudget'),
      key: BudgetEntityType.MONTH,
    },
    {
      title: t('dropdown.yearlyBudget'),
      key: BudgetEntityType.YEAR,
    },
  ];

  return (
    <header className="relative z-10 shrink-0 px-[18px] pb-3 pt-[max(10px,env(safe-area-inset-top))]">
      <div className="relative flex h-10 items-center justify-center">
        <button
          aria-label={t('common:nav.back')}
          className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full border border-solid border-border-primary bg-white/80 text-primary-deep shadow-ww-xs"
          onClick={() => onBack ? onBack() : navigate(-1)}
          type="button"
        >
          <ArrowLeft size={17} strokeWidth={2} />
        </button>
        <div className="flex items-center gap-2 text-[20px] font-extrabold text-ww-ink">
          <CalendarRange className="text-primary-deep" size={20} strokeWidth={1.9} />
          <span>{t('title')}</span>
        </div>
        {right && <div className="absolute right-0">{right}</div>}
      </div>
      <div className="mx-auto mt-3 grid max-w-[360px] grid-cols-2 rounded-[16px] border border-solid border-border-primary bg-white/60 p-1 shadow-ww-xs backdrop-blur-xl">
        {actions.map(item => (
          <button
            className={`h-10 rounded-[13px] border-0 text-[13px] font-bold transition-all ${budgetEntityType === item.key ? 'bg-white text-primary-deep shadow-ww-xs' : 'bg-transparent text-ww-mid'}`}
            data-budget-type={item.key}
            key={item.title}
            onClick={() => onBudgetEntityTypeChange(item.key)}
            type="button"
          >
            {item.title}
          </button>
        ))}
      </div>
    </header>
  );
};
