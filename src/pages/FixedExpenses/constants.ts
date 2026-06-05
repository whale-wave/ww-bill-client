import {
  FixedExpenseCurrency,
  FixedExpenseCycle,
  FixedExpensePriority,
  FixedExpenseStatus,
  FixedExpenseType,
} from '@/api';

export const cycleLabelMap: Record<FixedExpenseCycle, string> = {
  [FixedExpenseCycle.WEEKLY]: '周',
  [FixedExpenseCycle.MONTHLY]: '月',
  [FixedExpenseCycle.QUARTERLY]: '季度',
  [FixedExpenseCycle.HALF_YEARLY]: '半年',
  [FixedExpenseCycle.YEARLY]: '年',
  [FixedExpenseCycle.CUSTOM]: '自定义',
};

export const statusLabelMap: Record<FixedExpenseStatus, string> = {
  [FixedExpenseStatus.ACTIVE]: '生效中',
  [FixedExpenseStatus.PAUSED]: '已暂停',
  [FixedExpenseStatus.CANCELLED]: '已取消',
  [FixedExpenseStatus.EXPIRED]: '已过期',
};

export const statusColorMap: Record<FixedExpenseStatus, { bg: string; text: string; dot: string }> = {
  [FixedExpenseStatus.ACTIVE]: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  [FixedExpenseStatus.PAUSED]: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  [FixedExpenseStatus.CANCELLED]: { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' },
  [FixedExpenseStatus.EXPIRED]: { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500' },
};

export const typeLabelMap: Record<FixedExpenseType, string> = {
  [FixedExpenseType.SUBSCRIPTION]: '订阅',
  [FixedExpenseType.UTILITY]: '水电燃气',
  [FixedExpenseType.HOUSING]: '房屋居住',
  [FixedExpenseType.TRANSPORT]: '出行交通',
  [FixedExpenseType.FAMILY]: '家庭补贴',
  [FixedExpenseType.WORK]: '工作开销',
  [FixedExpenseType.OTHER]: '其他',
};

export const typeIconMap: Record<FixedExpenseType, string> = {
  [FixedExpenseType.SUBSCRIPTION]: '🎬',
  [FixedExpenseType.UTILITY]: '💡',
  [FixedExpenseType.HOUSING]: '🏠',
  [FixedExpenseType.TRANSPORT]: '🚌',
  [FixedExpenseType.FAMILY]: '👨‍👩‍👧',
  [FixedExpenseType.WORK]: '💼',
  [FixedExpenseType.OTHER]: '📦',
};

export const priorityLabelMap: Record<FixedExpensePriority, string> = {
  [FixedExpensePriority.MUST]: '必要',
  [FixedExpensePriority.NORMAL]: '普通',
  [FixedExpensePriority.OPTIONAL]: '可选',
};

export const priorityBarColorMap: Record<FixedExpensePriority, string> = {
  [FixedExpensePriority.MUST]: 'bg-rose-400',
  [FixedExpensePriority.NORMAL]: 'bg-cyan-300',
  [FixedExpensePriority.OPTIONAL]: 'bg-slate-200',
};

export const currencyLabelMap: Record<FixedExpenseCurrency, string> = {
  [FixedExpenseCurrency.CNY]: '人民币 (¥)',
  [FixedExpenseCurrency.USD]: '美元 ($)',
  [FixedExpenseCurrency.HKD]: '港币 (HK$)',
  [FixedExpenseCurrency.JPY]: '日元 (¥)',
  [FixedExpenseCurrency.EUR]: '欧元 (€)',
  [FixedExpenseCurrency.GBP]: '英镑 (£)',
};

export const currencySymbolMap: Record<FixedExpenseCurrency, string> = {
  [FixedExpenseCurrency.CNY]: '¥',
  [FixedExpenseCurrency.USD]: '$',
  [FixedExpenseCurrency.HKD]: 'HK$',
  [FixedExpenseCurrency.JPY]: '¥',
  [FixedExpenseCurrency.EUR]: '€',
  [FixedExpenseCurrency.GBP]: '£',
};

export const cycleOptions = Object.values(FixedExpenseCycle).map(value => ({
  label: cycleLabelMap[value],
  value,
}));

export const statusOptions = Object.values(FixedExpenseStatus).map(value => ({
  label: statusLabelMap[value],
  value,
}));

export const typeOptions = Object.values(FixedExpenseType).map(value => ({
  label: typeLabelMap[value],
  value,
}));

export const priorityOptions = Object.values(FixedExpensePriority).map(value => ({
  label: priorityLabelMap[value],
  value,
}));

export const currencyOptions = Object.values(FixedExpenseCurrency).map(value => ({
  label: currencyLabelMap[value],
  value,
}));

export interface StatusTabOption {
  key: 'all' | FixedExpenseStatus;
  label: string;
}

export const statusTabOptions: StatusTabOption[] = [
  { key: 'all', label: '全部' },
  { key: FixedExpenseStatus.ACTIVE, label: '生效中' },
  { key: FixedExpenseStatus.PAUSED, label: '已暂停' },
  { key: FixedExpenseStatus.EXPIRED, label: '已过期' },
];
