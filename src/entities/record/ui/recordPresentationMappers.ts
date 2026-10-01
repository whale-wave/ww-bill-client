import type { RecordIndicatorSource } from '@ww-bill/bill-core';
import type { RecordEntry } from '../types';
import type { RecordOverviewListGroup } from './RecordOverviewList';
import { formatRecordOriginalAmount, getRecordIndicators, groupRecordsByKey, sumRecordAmounts } from '@ww-bill/bill-core';
import dayjs from 'dayjs';
import { i18n } from '@/shared/i18n';
import { money } from '@/shared/lib';

interface RecordSearchGroupOptions {
  expenseLabel: string;
  incomeLabel: string;
  onRecordClick?: (record: RecordEntry) => void;
  showCategoryAsSecondary?: boolean;
}

export function getRecordListIndicators(record: RecordIndicatorSource) {
  return getRecordIndicators(record, (kind, amount) => i18n.t(`adjustment.${kind}WithAmount`, { amount, ns: 'record' }));
}

export function toRecordSearchGroups(
  records: readonly RecordEntry[],
  options: RecordSearchGroupOptions,
): RecordOverviewListGroup[] {
  const groups = groupRecordsByKey(records, record => dayjs(record.time).format('YYYY-MM-DD'));

  return Array.from(groups, ([dateKey, groupedRecords]) => {
    const { income, expense } = sumRecordAmounts(groupedRecords);

    return {
      dateLabel: dayjs(dateKey).format('YYYY年MM月DD日'),
      dateTime: dateKey,
      key: dateKey,
      records: groupedRecords.map((record) => {
        const indicators = getRecordListIndicators(record);
        const secondary = [
          options.showCategoryAsSecondary
            ? `${record.category.name}${record.creator ? ` · @${record.creator.nickname || record.creator.name || record.creator.username || '成员'}` : ''}`
            : undefined,
          indicators.tagSummary,
          indicators.adjustmentSummary,
        ].filter(Boolean).join(' · ') || undefined;
        return {
          amount: `${record.type === 'sub' ? '-' : ''}${money.formatNatural(record.amount)}`,
          amountTone: record.type === 'add' ? 'income' : 'expense',
          categoryName: record.category.name,
          hasAttachment: indicators.hasAttachment,
          iconName: record.category.icon,
          iconType: record.category.iconType,
          backgroundColor: record.category.backgroundColor,
          textIconEnabled: record.category.textIconEnabled,
          textIconIndex: record.category.textIconIndex,
          memberColorKey: record.creator?.colorKey,
          id: record.id,
          onClick: options.onRecordClick
            ? () => options.onRecordClick?.(record)
            : undefined,
          overviewSecondary: secondary,
          originalAmount: formatRecordOriginalAmount(record.type, record.originalAmount),
          primary: record.remark || record.category.name,
          secondary,
        };
      }),
      summaries: [
        ...(money.compare(income, 0) > 0
          ? [{ key: 'income', label: options.incomeLabel, value: money.formatNatural(income) }]
          : []),
        ...(money.compare(expense, 0) > 0
          ? [{ key: 'expense', label: options.expenseLabel, value: money.formatNatural(expense) }]
          : []),
      ],
    };
  });
}
