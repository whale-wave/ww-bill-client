import type { FC } from 'react';
import type { FamilyRecord, HouseholdCalendarDay } from '@/entities/household';
import { FamilyRecordPolicy } from '@/entities/household';
import { Icon } from '@/shared/ui';
import { getDisplayName, toMoney } from '../model';

interface FamilyRecordListProps {
  countedLabel: string;
  dailyExpenseLabel?: string;
  dailyIncomeLabel?: string;
  dailyTotals?: HouseholdCalendarDay[];
  emptyLabel: string;
  inheritedLabel: string;
  isCompactGrouped?: boolean;
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

interface RecordDateGroup {
  records: FamilyRecord[];
  time: string;
}

function getLocalDate(record: FamilyRecord) {
  const date = new Date(record.time);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function getRecordDateGroups(records: FamilyRecord[]) {
  return records.reduce<RecordDateGroup[]>((groups, record) => {
    const time = getLocalDate(record);
    const currentGroup = groups.find(group => group.time === time);
    if (!currentGroup) {
      groups.push({ records: [record], time });
      return groups;
    }

    currentGroup.records.push(record);
    return groups;
  }, []);
}

function formatDateHeading(date: string, locale: string) {
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  }).format(new Date(year, month - 1, day));
}

export const FamilyRecordList: FC<FamilyRecordListProps> = ({
  countedLabel,
  dailyExpenseLabel,
  dailyIncomeLabel,
  dailyTotals = [],
  emptyLabel,
  inheritedLabel,
  isCompactGrouped = false,
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
  const renderRecord = (record: FamilyRecord, index: number, isCompact: boolean) => {
    const content = (
      <>
        {isCompact
          ? (
              <span className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-gray text-font-black" data-category-icon={record.category?.icon ?? ''}>
                <Icon className="text-lg" name={record.category?.icon ?? 'bill'} />
              </span>
            )
          : (
              <span className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-gray text-base">
                {record.category?.icon || record.category?.name?.slice(0, 1) || '￥'}
              </span>
            )}
        <span className="min-w-0 flex-grow">
          <span className="one-line block text-sm font-medium text-font-black">
            {record.remark || record.category?.name || '—'}
          </span>
          <span className="mt-1 block text-xs text-font-gray">
            {memberLabel(getDisplayName(record.creator))}
            {record.tags.length > 0 ? ` · ${record.tags.map(tag => `#${tag.name}`).join(' ')}` : ''}
            {isCompact ? ` · ${getPolicyLabel(record, labels)}` : ''}
          </span>
          {!isCompact && (
            <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-font-gray">
              {getPolicyLabel(record, labels)}
            </span>
          )}
        </span>
        <span className={`${record.type === 'add' ? 'text-emerald-600' : 'text-rose-500'}${isCompact ? ' shrink-0 pl-3' : ''}`}>
          {record.type === 'add' ? '+' : '-'}
          {toMoney(record.amount)}
        </span>
      </>
    );
    const className = `flex ${isCompact ? 'min-h-[60px]' : 'min-h-[76px]'} w-full items-center border-0 bg-white px-3 py-2 text-left ${index > 0 ? 'border-t border-solid border-[#EBEBEB]' : ''}`;

    return onSelect
      ? (
          <button
            className={`${className} active:bg-slate-50`}
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
    const dailyTotalMap = new Map(dailyTotals.map(total => [total.date, total]));
    return (
      <div className="overflow-hidden bg-white">
        {getRecordDateGroups(records).map((group) => {
          const dailyTotal = dailyTotalMap.get(group.time);
          return (
            <section data-date-group={group.time} key={group.time}>
              <header className="flex items-center justify-between border-0 border-b border-solid border-[#EBEBEB] bg-bg-gray px-3 py-2 text-xs text-font-gray">
                <time dateTime={group.time}>{formatDateHeading(group.time, locale)}</time>
                {dailyTotal && (
                  <span className="flex gap-3">
                    {dailyTotal.visibleIncome !== '0' && dailyTotal.visibleIncome !== '0.00' && (
                      <span>
                        {dailyIncomeLabel}
                        {' '}
                        {toMoney(dailyTotal.visibleIncome)}
                      </span>
                    )}
                    {dailyTotal.visibleExpense !== '0' && dailyTotal.visibleExpense !== '0.00' && (
                      <span>
                        {dailyExpenseLabel}
                        {' '}
                        {toMoney(dailyTotal.visibleExpense)}
                      </span>
                    )}
                  </span>
                )}
              </header>
              {group.records.map((record, index) => renderRecord(record, index, true))}
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white">
      {records.map((record, index) => renderRecord(record, index, false))}
    </div>
  );
};
