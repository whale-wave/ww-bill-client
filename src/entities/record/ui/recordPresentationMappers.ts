import type { RecordEntry } from '../types';
import type { RecordOverviewListGroup } from './RecordOverviewList';
import { groupRecordsByKey, sumRecordAmounts } from '@ww-bill/bill-core';
import dayjs from 'dayjs';
import { i18n } from '@/shared/i18n';
import { money } from '@/shared/lib';

interface RecordSearchGroupOptions {
  expenseLabel: string;
  incomeLabel: string;
  onRecordClick?: (record: RecordEntry) => void;
  showCategoryAsSecondary?: boolean;
}

interface RecordListIndicatorSource {
  adjustmentSummary?: RecordEntry['adjustmentSummary'];
  attachments?: readonly unknown[];
  tags?: readonly { name: string }[];
}

export function getRecordListIndicators(record: RecordListIndicatorSource) {
  const summary = record.adjustmentSummary;
  const adjustmentSummary = summary
    ? [
        money.compare(summary.refundAmount, 0) > 0
          ? i18n.t('adjustment.refundWithAmount', { amount: summary.refundAmount, ns: 'record' })
          : undefined,
        money.compare(summary.cashbackAmount, 0) > 0
          ? i18n.t('adjustment.cashbackWithAmount', { amount: summary.cashbackAmount, ns: 'record' })
          : undefined,
        money.compare(summary.supplementAmount, 0) > 0
          ? i18n.t('adjustment.supplementWithAmount', { amount: summary.supplementAmount, ns: 'record' })
          : undefined,
      ].filter(Boolean).join(' · ')
    : undefined;
  return {
    adjustmentSummary,
    hasAttachment: Boolean(record.attachments?.length),
    tagSummary: record.tags?.map(tag => `#${tag.name}`).join(' ') || undefined,
  };
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
          originalAmount: record.originalAmount
            ? `${record.type === 'sub' ? '-' : ''}${money.formatNatural(record.originalAmount)}`
            : undefined,
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
