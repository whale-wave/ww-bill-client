import type { Dispatch } from 'react';
import type { BudgetEntityType } from '@/api/budget.ts';
import { createContext } from 'react';

interface BudgetPageContextType {
  budgetEntityType: BudgetEntityType;
  setBudgetEntityType: Dispatch<BudgetEntityType>;
}

export const BudgetPageContext = createContext<BudgetPageContextType | undefined>(undefined);
