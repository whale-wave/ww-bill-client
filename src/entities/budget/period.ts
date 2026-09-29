import { BudgetEntityType } from './api';

export const BUDGET_PERIODS = [
  BudgetEntityType.DAY,
  BudgetEntityType.MONTH,
  BudgetEntityType.YEAR,
] as const;

export const BUDGET_PERIOD_META = {
  [BudgetEntityType.DAY]: {
    categoryTitleKey: 'model.title.dailyCategory',
    dropdownKey: 'dropdown.dailyBudget',
    summaryTitleKey: 'model.title.dailySummary',
    timeKey: 'common:time.day',
    unit: 'day',
  },
  [BudgetEntityType.MONTH]: {
    categoryTitleKey: 'model.title.monthlyCategory',
    dropdownKey: 'dropdown.monthlyBudget',
    summaryTitleKey: 'model.title.monthlySummary',
    timeKey: 'common:time.month',
    unit: 'month',
  },
  [BudgetEntityType.YEAR]: {
    categoryTitleKey: 'model.title.yearlyCategory',
    dropdownKey: 'dropdown.yearlyBudget',
    summaryTitleKey: 'model.title.yearlySummary',
    timeKey: 'common:time.year',
    unit: 'year',
  },
} as const;

export function getBudgetPeriodMeta(type: BudgetEntityType) {
  return BUDGET_PERIOD_META[type];
}
