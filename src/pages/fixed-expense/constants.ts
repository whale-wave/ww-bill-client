import {
  FixedExpenseCurrency,
  FixedExpenseCycle,
  FixedExpensePriority,
  FixedExpenseStatus,
  FixedExpenseType,
} from '@/entities/fixed-expense';
import { i18n } from '@/shared/i18n';

export const getCycleLabelMap = (): Record<FixedExpenseCycle, string> => ({
  [FixedExpenseCycle.WEEKLY]: i18n.t('fixed-expense:cycle.weeklyShort'),
  [FixedExpenseCycle.MONTHLY]: i18n.t('fixed-expense:cycle.monthlyShort'),
  [FixedExpenseCycle.QUARTERLY]: i18n.t('fixed-expense:cycle.quarterlyShort'),
  [FixedExpenseCycle.HALF_YEARLY]: i18n.t('fixed-expense:cycle.halfYearlyShort'),
  [FixedExpenseCycle.YEARLY]: i18n.t('fixed-expense:cycle.yearlyShort'),
  [FixedExpenseCycle.CUSTOM]: i18n.t('fixed-expense:cycle.custom'),
});

export const cycleLabelMap: Record<FixedExpenseCycle, string> = getCycleLabelMap();

export const getStatusLabelMap = (): Record<FixedExpenseStatus, string> => ({
  [FixedExpenseStatus.ACTIVE]: i18n.t('fixed-expense:status.active'),
  [FixedExpenseStatus.PAUSED]: i18n.t('fixed-expense:status.paused'),
  [FixedExpenseStatus.CANCELLED]: i18n.t('fixed-expense:status.cancelled'),
  [FixedExpenseStatus.EXPIRED]: i18n.t('fixed-expense:status.expired'),
});

export const statusLabelMap: Record<FixedExpenseStatus, string> = getStatusLabelMap();

export const statusColorMap: Record<FixedExpenseStatus, { bg: string; text: string; dot: string }> = {
  [FixedExpenseStatus.ACTIVE]: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  [FixedExpenseStatus.PAUSED]: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  [FixedExpenseStatus.CANCELLED]: { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' },
  [FixedExpenseStatus.EXPIRED]: { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500' },
};

export const getTypeLabelMap = (): Record<FixedExpenseType, string> => ({
  [FixedExpenseType.SUBSCRIPTION]: i18n.t('fixed-expense:type.subscription'),
  [FixedExpenseType.UTILITY]: i18n.t('fixed-expense:type.utility'),
  [FixedExpenseType.HOUSING]: i18n.t('fixed-expense:type.housing'),
  [FixedExpenseType.TRANSPORT]: i18n.t('fixed-expense:type.transport'),
  [FixedExpenseType.FAMILY]: i18n.t('fixed-expense:type.family'),
  [FixedExpenseType.WORK]: i18n.t('fixed-expense:type.work'),
  [FixedExpenseType.OTHER]: i18n.t('fixed-expense:type.other'),
});

export const typeLabelMap: Record<FixedExpenseType, string> = getTypeLabelMap();

export const typeIconMap: Record<FixedExpenseType, string> = {
  [FixedExpenseType.SUBSCRIPTION]: '🎬',
  [FixedExpenseType.UTILITY]: '💡',
  [FixedExpenseType.HOUSING]: '🏠',
  [FixedExpenseType.TRANSPORT]: '🚌',
  [FixedExpenseType.FAMILY]: '👨‍👩‍👧',
  [FixedExpenseType.WORK]: '💼',
  [FixedExpenseType.OTHER]: '📦',
};

export const getPriorityLabelMap = (): Record<FixedExpensePriority, string> => ({
  [FixedExpensePriority.MUST]: i18n.t('fixed-expense:priority.must'),
  [FixedExpensePriority.NORMAL]: i18n.t('fixed-expense:priority.normal'),
  [FixedExpensePriority.OPTIONAL]: i18n.t('fixed-expense:priority.optional'),
});

export const priorityLabelMap: Record<FixedExpensePriority, string> = getPriorityLabelMap();

export const priorityBarColorMap: Record<FixedExpensePriority, string> = {
  [FixedExpensePriority.MUST]: 'bg-rose-400',
  [FixedExpensePriority.NORMAL]: 'bg-cyan-300',
  [FixedExpensePriority.OPTIONAL]: 'bg-slate-200',
};

export const getCurrencyLabelMap = (): Record<FixedExpenseCurrency, string> => ({
  [FixedExpenseCurrency.CNY]: i18n.t('fixed-expense:currency.cnyWithSymbol'),
  [FixedExpenseCurrency.USD]: i18n.t('fixed-expense:currency.usd'),
  [FixedExpenseCurrency.HKD]: i18n.t('fixed-expense:currency.hkd'),
  [FixedExpenseCurrency.JPY]: i18n.t('fixed-expense:currency.jpy'),
  [FixedExpenseCurrency.EUR]: i18n.t('fixed-expense:currency.eur'),
  [FixedExpenseCurrency.GBP]: i18n.t('fixed-expense:currency.gbp'),
});

export const currencyLabelMap: Record<FixedExpenseCurrency, string> = getCurrencyLabelMap();

export const currencySymbolMap: Record<FixedExpenseCurrency, string> = {
  [FixedExpenseCurrency.CNY]: '¥',
  [FixedExpenseCurrency.USD]: '$',
  [FixedExpenseCurrency.HKD]: 'HK$',
  [FixedExpenseCurrency.JPY]: '¥',
  [FixedExpenseCurrency.EUR]: '€',
  [FixedExpenseCurrency.GBP]: '£',
};

export const getCycleOptions = () => Object.values(FixedExpenseCycle).map(value => ({
  label: getCycleLabelMap()[value],
  value,
}));

export const cycleOptions = getCycleOptions();

export const getStatusOptions = () => Object.values(FixedExpenseStatus).map(value => ({
  label: getStatusLabelMap()[value],
  value,
}));

export const statusOptions = getStatusOptions();

export const getTypeOptions = () => Object.values(FixedExpenseType).map(value => ({
  label: getTypeLabelMap()[value],
  value,
}));

export const typeOptions = getTypeOptions();

export const getPriorityOptions = () => Object.values(FixedExpensePriority).map(value => ({
  label: getPriorityLabelMap()[value],
  value,
}));

export const priorityOptions = getPriorityOptions();

export const getCurrencyOptions = () => Object.values(FixedExpenseCurrency).map(value => ({
  label: getCurrencyLabelMap()[value],
  value,
}));

export const currencyOptions = getCurrencyOptions();

export interface StatusTabOption {
  key: 'all' | FixedExpenseStatus;
  label: string;
}

export const getStatusTabOptions = (): StatusTabOption[] => [
  { key: 'all', label: i18n.t('fixed-expense:list.all') },
  { key: FixedExpenseStatus.ACTIVE, label: i18n.t('fixed-expense:status.active') },
  { key: FixedExpenseStatus.PAUSED, label: i18n.t('fixed-expense:status.paused') },
  { key: FixedExpenseStatus.EXPIRED, label: i18n.t('fixed-expense:status.expired') },
];

export const statusTabOptions: StatusTabOption[] = getStatusTabOptions();
