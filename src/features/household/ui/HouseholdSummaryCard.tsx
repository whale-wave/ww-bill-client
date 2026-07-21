import type { FC } from 'react';
import type { HouseholdRecordSummary } from '@/entities/household';
import { toMoney } from '../model';

interface HouseholdSummaryCardProps {
  expenseLabel: string;
  incomeLabel: string;
  netLabel: string;
  summary?: HouseholdRecordSummary;
}

export const HouseholdSummaryCard: FC<HouseholdSummaryCardProps> = ({
  expenseLabel,
  incomeLabel,
  netLabel,
  summary,
}) => (
  <section className="card-rounded grid grid-cols-3 gap-2 bg-white px-3 py-4 text-center">
    <div>
      <span className="block text-xs text-font-gray">{incomeLabel}</span>
      <strong className="mt-1 block text-base font-medium text-emerald-600">{toMoney(summary?.income)}</strong>
    </div>
    <div>
      <span className="block text-xs text-font-gray">{expenseLabel}</span>
      <strong className="mt-1 block text-base font-medium text-rose-500">{toMoney(summary?.expense)}</strong>
    </div>
    <div>
      <span className="block text-xs text-font-gray">{netLabel}</span>
      <strong className="mt-1 block text-base font-medium text-font-black">{toMoney(summary?.net)}</strong>
    </div>
  </section>
);
