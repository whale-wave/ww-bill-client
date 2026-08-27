import type { FC } from 'react';
import type { FamilyRecord, HouseholdCalendarDay } from '@/entities/household';
import { CategoryIcon } from '@/entities/category';
import { FamilyRecordPolicy } from '@/entities/household';
import { RecordOverviewList } from '@/entities/record';
import { MEMBER_COLOR_PALETTE } from '@/shared/config/member-colors';
import { cn } from '@/shared/lib';
import {
  getDisplayName,
  toHouseholdRecordOverviewGroups,
  toMoney,
} from '../model';

interface FamilyRecordListProps {
  countedLabel: string;
  dailyExpenseLabel?: string;
  dailyIncomeLabel?: string;
  dailyTotals?: HouseholdCalendarDay[];
  emptyLabel: string;
  inheritedLabel: string;
  isCompactGrouped?: boolean;
  groupedVariant?: 'compact' | 'default';
  locale: string;
  memberLabel: (name: string) => string;
  onSelect?: (record: FamilyRecord) => void;
  privateLabel: string;
  records: FamilyRecord[];
  uncountedLabel: string;
}

function getPolicyLabel(
  record: FamilyRecord,
  labels: Pick<FamilyRecordListProps, 'countedLabel' | 'inheritedLabel' | 'privateLabel' | 'uncountedLabel'>,
) {
  if (record.policy === FamilyRecordPolicy.INHERIT)
    return labels.inheritedLabel;
  if (record.policy === FamilyRecordPolicy.PRIVATE)
    return labels.privateLabel;
  return record.counted ? labels.countedLabel : labels.uncountedLabel;
}

export const FamilyRecordList: FC<FamilyRecordListProps> = ({
  countedLabel,
  dailyExpenseLabel,
  dailyIncomeLabel,
  dailyTotals = [],
  emptyLabel,
  inheritedLabel,
  isCompactGrouped = false,
  groupedVariant = 'default',
  locale,
  memberLabel,
  onSelect,
  privateLabel,
  records,
  uncountedLabel,
}) => {
  if (!records.length) {
    return <div className="card-rounded bg-white px-4 py-12 text-center text-sm text-font-gray">{emptyLabel}</div>;
  }

  const labels = { countedLabel, inheritedLabel, privateLabel, uncountedLabel };
  const renderRecord = (record: FamilyRecord, index: number) => {
    const content = (
      <>
        <span
          className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-gray text-base"
          style={record.creator.colorKey
            ? {
                backgroundColor: MEMBER_COLOR_PALETTE[record.creator.colorKey].background,
                color: MEMBER_COLOR_PALETTE[record.creator.colorKey].foreground,
              }
            : undefined}
        >
          {record.category?.icon || record.category?.name?.slice(0, 1) || '￥'}
        </span>
        <span className="min-w-0 flex-grow">
          <span className="one-line block text-sm font-medium text-font-black">
            {record.remark || record.category?.name || '—'}
          </span>
          <span className="mt-1 block text-xs text-font-gray">
            {memberLabel(getDisplayName(record.creator))}
            {record.tags.length > 0 ? ` · ${record.tags.map(tag => `#${tag.name}`).join(' ')}` : ''}
          </span>
          <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-font-gray">
            {getPolicyLabel(record, labels)}
          </span>
        </span>
        <span className={record.type === 'add' ? 'text-emerald-600' : 'text-rose-500'}>
          {record.type === 'add' ? '+' : '-'}
          {toMoney(record.amount)}
        </span>
      </>
    );
    const className = cn(
      'flex min-h-[76px] w-full items-center border-0 bg-white px-3 py-2 text-left',
      index > 0 && 'border-t border-solid border-[#EBEBEB]',
    );

    return onSelect
      ? (
          <button
            className={cn(className, 'active:bg-slate-50')}
            data-record-id={record.id}
            key={record.id}
            onClick={() => onSelect(record)}
            type="button"
          >
            {content}
          </button>
        )
      : (
          <div className={className} data-record-id={record.id} key={record.id}>{content}</div>
        );
  };

  if (isCompactGrouped) {
    const overviewGroups = toHouseholdRecordOverviewGroups(records, {
      countedLabel,
      dailyExpenseLabel,
      dailyIncomeLabel,
      dailyTotals,
      inheritedLabel,
      locale,
      memberLabel,
      onSelect,
      privateLabel,
      uncountedLabel,
    });

    return (
      <RecordOverviewList
        groups={overviewGroups}
        renderCategoryIcon={item => <CategoryIcon categoryName={item.categoryName} iconKey={item.iconName} size={18} />}
        variant={groupedVariant === 'compact' ? 'overview' : 'search'}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white">
      {records.map((record, index) => renderRecord(record, index))}
    </div>
  );
};
