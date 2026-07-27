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
  <div className="overflow-hidden bg-white" data-testid="record-overview-list">
    {groups.map(group => (
      <section data-date-group={group.key} key={group.key}>
        <header className="flex h-8 items-center justify-between border-0 border-b border-solid border-[#EBEBEB] bg-bg-gray px-3 text-xs text-font-gray">
          {group.dateTime
            ? <time dateTime={group.dateTime}>{group.dateLabel}</time>
            : <span>{group.dateLabel}</span>}
          {group.summaries && group.summaries.length > 0 && (
            <span className="flex gap-3">
              {group.summaries.map(summary => (
                <span key={summary.key}>
                  {summary.label}
                  {' '}
                  {summary.value}
                </span>
              ))}
            </span>
          )}
        </header>
        {group.records.map((record, index) => {
          const content = (
            <>
              <span
                className="mx-[15px] flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-full bg-[#f4f4f4]"
                data-category-icon={record.iconName}
              >
                <Icon className="text-xl" name={record.iconName || 'bill'} />
              </span>
              <span className={`flex min-w-0 flex-grow items-center self-stretch pr-4 ${index < group.records.length - 1 ? 'border-0 border-b border-solid border-[#EBEBEB]' : ''}`}>
                <span className="min-w-0 flex-grow">
                  <span className="one-line block text-sm text-font-black">{record.primary}</span>
                  {record.secondary && (
                    <span className="mt-1 one-line block text-xs text-font-gray">{record.secondary}</span>
                  )}
                </span>
                <span className={`ml-3 shrink-0 text-base ${getAmountClassName(record.amountTone)}`}>
                  {record.amount}
                </span>
              </span>
            </>
          );
          const className = `flex w-full items-center border-0 bg-white p-0 text-left ${record.secondary ? 'min-h-[60px]' : 'h-[55px]'}`;

          return record.onClick
            ? (
                <button
                  className={`${className} active:bg-slate-50`}
                  data-record-id={record.id}
                  key={record.id}
                  onClick={record.onClick}
                  type="button"
                >
                  {content}
                </button>
              )
            : (
                <div className={className} data-record-id={record.id} key={record.id}>
                  {content}
                </div>
              );
        })}
      </section>
    ))}
  </div>
);
