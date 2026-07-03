import type { Dispatch } from 'react';
import type { BudgetEntityType } from '@/entities/budget';
import { createContext } from 'react';

interface BudgetPageContextType {
  budgetEntityType: BudgetEntityType;
  setBudgetEntityType: Dispatch<BudgetEntityType>;
}

export const BudgetPageContext = createContext<BudgetPageContextType | undefined>(undefined);
