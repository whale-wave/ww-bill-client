import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';

export type MoneyDisplayValue = number | string;
export type MoneyTone = 'default' | 'expense' | 'income' | 'muted';

export interface MoneyAmountProps {
  className?: string;
  currency?: ReactNode;
  fractionDigits?: number;
  masked?: boolean;
  tone?: MoneyTone;
  value: MoneyDisplayValue;
}

const toneClassNames: Record<MoneyTone, string> = {
  default: 'text-fg',
  expense: 'text-finance-expense',
  income: 'text-finance-income',
  muted: 'text-fg-muted',
};

function formatMoneyDisplayValue(value: MoneyDisplayValue, fractionDigits: number): string {
  if (typeof value === 'string')
    return value;
  if (!Number.isFinite(value))
    return '—';
  return value.toFixed(fractionDigits);
}

export function MoneyAmount({
  className,
  currency = '¥',
  fractionDigits = 2,
  masked = false,
  tone = 'default',
  value,
}: MoneyAmountProps) {
  const displayValue = masked ? '••••' : formatMoneyDisplayValue(value, fractionDigits);

  return (
    <span className={cn('font-number tabular-nums', toneClassNames[tone], className)}>
      {!masked && currency}
      {displayValue}
    </span>
  );
}
