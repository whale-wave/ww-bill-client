import type { FixedExpenseCurrency } from '@/api';
import dayjs from 'dayjs';
import { currencySymbolMap } from './constants';

export function formatAmountWithCurrency(amount: string | number, currency?: FixedExpenseCurrency) {
  const num = Number(amount || 0);
  const symbol = currency ? currencySymbolMap[currency] : '¥';
  return `${symbol}${num.toFixed(2)}`;
}

export function formatThousands(amount: string | number) {
  const num = Number(amount || 0);
  const fixed = num.toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  return `${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${decPart}`;
}

export function formatNextBillingDate(date?: string) {
  if (!date)
    return '';

  const target = dayjs(date).startOf('day');
  const today = dayjs().startOf('day');
  const diff = target.diff(today, 'day');

  if (diff === 0)
    return '今天到期';
  if (diff === 1)
    return '明天到期';
  if (diff > 1 && diff <= 7)
    return `${diff} 天后到期`;
  if (diff > 7)
    return target.format('M月D日 到期');
  if (diff === -1)
    return '昨天已到期';
  return `已逾期 ${Math.abs(diff)} 天`;
}

export function getNextBillingTone(date?: string): 'urgent' | 'soon' | 'normal' | 'overdue' {
  if (!date)
    return 'normal';
  const diff = dayjs(date).startOf('day').diff(dayjs().startOf('day'), 'day');
  if (diff < 0)
    return 'overdue';
  if (diff <= 1)
    return 'urgent';
  if (diff <= 7)
    return 'soon';
  return 'normal';
}

export function formatDate(date?: string, fmt = 'YYYY-MM-DD') {
  if (!date)
    return '';
  return dayjs(date).format(fmt);
}
