import type { FixedExpenseCurrency } from '@/entities/fixed-expense';
import dayjs from 'dayjs';
import { i18n } from '@/shared/i18n';
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
    return i18n.t('fixed-expense:list.todayDue');
  if (diff === 1)
    return i18n.t('fixed-expense:list.tomorrowDue');
  if (diff > 1 && diff <= 7)
    return i18n.t('fixed-expense:list.daysLaterDue', { days: diff });
  if (diff > 7) {
    const locale = i18n.resolvedLanguage ?? i18n.language;
    const date = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' })
      .format(target.toDate());
    return i18n.t('fixed-expense:list.dateDue', { date });
  }
  if (diff === -1)
    return i18n.t('fixed-expense:list.yesterdayOverdue');
  return i18n.t('fixed-expense:list.overdueDays', { days: Math.abs(diff) });
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
