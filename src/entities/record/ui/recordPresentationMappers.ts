import type { RecordEntry } from '../types';
import type { RecordOverviewListGroup } from './RecordOverviewList';
import dayjs from 'dayjs';
import { math } from '@/shared/lib';

interface RecordSearchGroupOptions {
  expenseLabel: string;
  incomeLabel: string;
  onRecordClick?: (record: RecordEntry) => void;
  showCategoryAsSecondary?: boolean;
}

export function toRecordSearchGroups(
  records: readonly RecordEntry[],
  options: RecordSearchGroupOptions,
): RecordOverviewListGroup[] {
  const groups = new Map<string, RecordEntry[]>();

  records.forEach((record) => {
    const dateKey = dayjs(record.time).format('YYYY-MM-DD');
    const group = groups.get(dateKey);
    if (group)
      group.push(record);
    else
      groups.set(dateKey, [record]);
  });

  return Array.from(groups, ([dateKey, groupedRecords]) => {
    const income = groupedRecords.reduce(
      (total, record) => record.type === 'add'
        ? math.add(total, record.amount).toNumber()
        : total,
      0,
    );
    const expense = groupedRecords.reduce(
      (total, record) => record.type === 'sub'
        ? math.add(total, record.amount).toNumber()
        : total,
      0,
    );

    return {
      dateLabel: dayjs(dateKey).format('YYYY年MM月DD日'),
      dateTime: dateKey,
      key: dateKey,
      records: groupedRecords.map(record => ({
        amount: `${record.type === 'sub' ? '-' : ''}${record.amount}`,
        amountTone: record.type === 'add' ? 'income' : 'expense',
        iconName: record.category.icon,
        id: record.id,
        onClick: options.onRecordClick
          ? () => options.onRecordClick?.(record)
          : undefined,
        primary: record.remark || record.category.name,
        secondary: options.showCategoryAsSecondary
          ? record.category.name
          : undefined,
      })),
      summaries: [
        ...(income
          ? [{ key: 'income', label: options.incomeLabel, value: income }]
          : []),
        ...(expense
          ? [{ key: 'expense', label: options.expenseLabel, value: expense }]
          : []),
      ],
    };
  });
}
