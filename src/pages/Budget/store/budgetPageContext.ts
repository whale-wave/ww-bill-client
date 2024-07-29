import type { Dispatch } from 'react';
import { createContext } from 'react';
import type { BudgetEntityType } from '@/api/budget.ts';

interface BudgetPageContextType {
  budgetEntityType: BudgetEntityType;
  setBudgetEntityType: Dispatch<BudgetEntityType>;
}

export const BudgetPageContext = createContext<BudgetPageContextType | undefined>(undefined);
