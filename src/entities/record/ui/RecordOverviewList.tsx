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

function renderDateLabel(label: ReactNode) {
  if (typeof label !== 'string')
    return label;
  const [date, ...detail] = label.split(' ');
  return (
    <>
      <span className="font-bold">{date}</span>
      {detail.length > 0 && (
        <>
          {' '}
          <span className="text-[11px] font-normal leading-[16.5px] text-ww-soft">{detail.join(' ')}</span>
        </>
      )}
    </>
  );
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
            ? 'mb-3'
            : 'flex flex-col border-0 border-b border-solid border-[#ebebeb] pt-3 last:border-0'}
          data-date-group={group.key}
          key={group.key}
        >
          <header className={isOverview
            ? 'flex h-[27px] items-start justify-between gap-2 px-0.5 text-[12.5px] leading-[18.75px] text-ww-ink'
            : 'flex items-center justify-between px-4 text-sm text-[#969696]'}
          >
            {group.dateTime
              ? <time dateTime={group.dateTime}>{renderDateLabel(group.dateLabel)}</time>
              : <span>{renderDateLabel(group.dateLabel)}</span>}
            <span className="flex shrink-0 space-x-3 text-[11px] font-semibold leading-[16.5px] text-ww-mid">
              {group.summaries?.map(summary => (
                <span key={summary.key}>
                  {summary.label}
                  {' '}
                  {summary.value}
                </span>
              ))}
            </span>
          </header>
          <div className={isOverview ? 'overflow-hidden rounded-[20px] border border-border-primary bg-white/[0.84] py-0.5 shadow-ww backdrop-blur-xl' : ''}>
            {group.records.map((record, index) => {
              const content = (
                <>
                  <span
                    className={isOverview
                      ? 'flex h-full w-[52px] shrink-0 items-center justify-start'
                      : 'mx-4 flex shrink-0 items-center justify-center py-3'}
                    data-category-icon={record.iconName}
                  >
                    <span className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      index % 4 === 1
                        ? 'bg-[#ffe8ee] text-[#d06080]'
                        : index % 4 === 2
                          ? 'bg-[#e0f6ee] text-[#3e9e7b]'
                          : index % 4 === 3
                            ? 'bg-[#ede8ff] text-[#705cc0]'
                            : 'bg-[#e4f5fa] text-primary-deep',
                    )}
                    >
                      <Icon className="text-[18px]" name={record.iconName || 'bill'} />
                    </span>
                  </span>
                  <span
                    className={cn(
                      'flex min-w-0 flex-grow items-center justify-between text-[14px] font-semibold leading-[21px] text-ww-ink',
                      isOverview ? 'h-full pr-1' : 'h-[59px] py-3 pr-3',
                      index !== group.records.length - 1
                      && 'border-0 border-b border-solid border-[#eaf2f5]',
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
                        isOverview ? 'ml-3 max-w-[42%] shrink-0 truncate font-number text-[16px] font-bold leading-6' : 'ml-4',
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
                    ? cn('flex w-full items-center', group.records.length === 1 ? 'h-[66px]' : 'h-16')
                    : 'flex h-[59px] w-full items-center text-base'}
                  data-record-id={record.id}
                  key={record.id}
                  onClick={record.onClick}
                >
                  {content}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
