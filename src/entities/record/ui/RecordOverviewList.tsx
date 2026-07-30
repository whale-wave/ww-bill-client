import type { FC, ReactNode } from 'react';
import { cn } from '@/shared/lib';
import { Icon } from '@/shared/ui';

export interface RecordOverviewListItem {
  amount: ReactNode;
  amountTone?: 'expense' | 'income' | 'neutral';
  iconName: string;
  id: number | string;
  onClick?: () => void;
  primary: ReactNode;
  secondary?: ReactNode;
}

export interface RecordOverviewListSummary {
  key: string;
  label: ReactNode;
  value: ReactNode;
}

export interface RecordOverviewListGroup {
  dateLabel: ReactNode;
  dateTime?: string;
  key: string;
  records: RecordOverviewListItem[];
  summaries?: RecordOverviewListSummary[];
}

interface RecordOverviewListProps {
  groups: RecordOverviewListGroup[];
  variant?: 'compact' | 'default' | 'overview' | 'search';
}

function getAmountClassName(tone: RecordOverviewListItem['amountTone']) {
  if (tone === 'income')
    return 'text-emerald-600';
  if (tone === 'expense')
    return 'text-rose-500';
  return 'text-font-black';
}

export const RecordOverviewList: FC<RecordOverviewListProps> = ({
  groups,
  variant = 'search',
}) => {
  const isOverview = variant === 'compact' || variant === 'overview';
  const semanticVariant = isOverview ? 'overview' : 'search';

  return (
    <div data-record-list-variant={semanticVariant} data-testid="record-overview-list">
      {groups.map(group => (
        <section
          className={isOverview
            ? 'last:border-b last:border-solid last:border-[#ebebeb]'
            : 'flex flex-col border-0 border-b border-solid border-[#ebebeb] pt-3 last:border-0'}
          data-date-group={group.key}
          key={group.key}
        >
          <header className={isOverview
            ? 'flex h-8 items-center justify-between border-0 border-b border-solid border-[#ebebeb] px-4 pl-[14px] text-[#969696]'
            : 'flex items-center justify-between px-4 text-sm text-[#969696]'}
          >
            {group.dateTime
              ? <time className="text-sm" dateTime={group.dateTime}>{group.dateLabel}</time>
              : <span className="text-sm">{group.dateLabel}</span>}
            <span className="flex space-x-3">
              {group.summaries?.map(summary => (
                <span className="text-sm" key={summary.key}>
                  {summary.label}
                  ：
                  {summary.value}
                </span>
              ))}
            </span>
          </header>
          {group.records.map((record, index) => {
            const content = (
              <>
                <span
                  className={isOverview
                    ? 'flex h-[54px] w-[65px] shrink-0 items-center justify-center'
                    : 'mx-4 flex shrink-0 items-center justify-center py-3'}
                  data-category-icon={record.iconName}
                >
                  <span className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-[#f4f4f4]">
                    <Icon className="text-xl" name={record.iconName || 'bill'} />
                  </span>
                </span>
                <span
                  className={cn(
                    'flex min-w-0 flex-grow items-center justify-between text-base font-normal text-[#333333]',
                    isOverview ? 'h-full pr-4' : 'h-[59px] py-3 pr-3',
                    index !== group.records.length - 1
                    && 'border-0 border-b border-solid border-[#ebebeb]',
                  )}
                >
                  <span className="min-w-0 flex-grow">
                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap">{record.primary}</span>
                    {record.secondary && (
                      <span className="mt-1 block overflow-hidden text-ellipsis whitespace-nowrap text-xs text-[#969696]">{record.secondary}</span>
                    )}
                  </span>
                  <span
                    className={cn(
                      isOverview ? 'ml-3 shrink-0' : 'ml-4',
                      getAmountClassName(record.amountTone),
                    )}
                  >
                    {record.amount}
                  </span>
                </span>
              </>
            );
            return (
              <div
                className={isOverview
                  ? 'flex h-[55px] w-full items-center'
                  : 'flex h-[59px] w-full items-center text-base'}
                data-record-id={record.id}
                key={record.id}
                onClick={record.onClick}
              >
                {content}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
};
