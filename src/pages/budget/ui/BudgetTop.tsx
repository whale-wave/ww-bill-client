import type { RefObject } from 'react';
import React, { useContext } from 'react';
import { BudgetPeriodDropdown } from '@/entities/budget';
import { BudgetPageContext } from '@/pages/budget/model/budgetPageContext.ts';

interface BudgetTopProps {
  dropDownWrapperRef: RefObject<HTMLDivElement>;
}

export const BudgetTop: React.FC<BudgetTopProps> = (props) => {
  const { dropDownWrapperRef } = props;
  const budgetPageContentValue = useContext(BudgetPageContext);
  if (!budgetPageContentValue)
    return null;

  return (
    <BudgetPeriodDropdown
      budgetEntityType={budgetPageContentValue.budgetEntityType}
      dropDownWrapperRef={dropDownWrapperRef}
      onBudgetEntityTypeChange={budgetPageContentValue.setBudgetEntityType}
    />
  );
};
