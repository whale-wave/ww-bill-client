import type { FC, ReactNode } from 'react';
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
}

function getAmountClassName(tone: RecordOverviewListItem['amountTone']) {
  if (tone === 'income')
    return 'text-emerald-600';
  if (tone === 'expense')
    return 'text-rose-500';
  return 'text-font-black';
}

export const RecordOverviewList: FC<RecordOverviewListProps> = ({ groups }) => (
  <div data-testid="record-overview-list">
    {groups.map(group => (
      <section className="last:border-b last:border-solid last:border-[#ebebeb]" data-date-group={group.key} key={group.key}>
        <header className="flex h-8 items-center justify-between border-0 border-b border-solid border-[#ebebeb] px-4 pl-[14px] text-[#969696]">
          {group.dateTime
            ? <time className="text-sm" dateTime={group.dateTime}>{group.dateLabel}</time>
            : <span className="text-sm">{group.dateLabel}</span>}
          {group.summaries?.map(summary => (
            <span className="text-sm" key={summary.key}>
              {summary.label}
              ：
              {summary.value}
            </span>
          ))}
        </header>
        {group.records.map((record, index) => {
          const content = (
            <>
              <span
                className="flex h-[54px] w-[65px] shrink-0 items-center justify-center"
                data-category-icon={record.iconName}
              >
                <span className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-[#f4f4f4]">
                  <Icon className="text-xl" name={record.iconName || 'bill'} />
                </span>
              </span>
              <span className={`flex h-full min-w-0 flex-grow items-center justify-between pr-4 text-base font-normal text-[#333333] ${index === group.records.length - 1 ? '' : 'border-0 border-b border-solid border-[#ebebeb]'}`}>
                <span className="min-w-0 flex-grow">
                  <span className="block overflow-hidden text-ellipsis whitespace-nowrap">{record.primary}</span>
                  {record.secondary && (
                    <span className="mt-1 block overflow-hidden text-ellipsis whitespace-nowrap text-xs text-[#969696]">{record.secondary}</span>
                  )}
                </span>
                <span className={`ml-3 shrink-0 ${getAmountClassName(record.amountTone)}`}>
                  {record.amount}
                </span>
              </span>
            </>
          );
          return (
            <div
              className="flex h-[55px] w-full items-center"
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
