import type { FC, ReactNode } from 'react';
import { cn } from '@/shared/lib';
import { Icon } from '@/shared/ui';
import styles from './RecordOverviewList.module.scss';

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
  recordElement?: 'button' | 'div';
}

function getAmountClassName(tone: RecordOverviewListItem['amountTone']) {
  if (tone === 'income')
    return 'text-emerald-600';
  if (tone === 'expense')
    return 'text-rose-500';
  return 'text-font-black';
}

export const RecordOverviewList: FC<RecordOverviewListProps> = ({ groups, recordElement = 'button' }) => (
  <div data-testid="record-overview-list">
    {groups.map(group => (
      <section className={styles.group} data-date-group={group.key} key={group.key}>
        <header className={styles.title}>
          {group.dateTime
            ? <time className={styles.titleLeft} dateTime={group.dateTime}>{group.dateLabel}</time>
            : <span className={styles.titleLeft}>{group.dateLabel}</span>}
          {group.summaries?.map(summary => (
            <span className={styles.titleSummary} key={summary.key}>
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
                className={styles.recordIconCell}
                data-category-icon={record.iconName}
              >
                <span className={styles.icon}>
                  <Icon className="text-xl" name={record.iconName || 'bill'} />
                </span>
              </span>
              <span className={cn(styles.recordContent, index === group.records.length - 1 && styles.lastRecordContent)}>
                <span className={styles.recordText}>
                  <span className={styles.primary}>{record.primary}</span>
                  {record.secondary && (
                    <span className={styles.secondary}>{record.secondary}</span>
                  )}
                </span>
                <span className={cn(styles.price, getAmountClassName(record.amountTone))}>
                  {record.amount}
                </span>
              </span>
            </>
          );
          const className = cn(styles.record, record.secondary && styles.recordWithSecondary);

          return record.onClick && recordElement === 'button'
            ? (
                <button
                  className={cn(className, styles.recordButton)}
                  data-record-id={record.id}
                  key={record.id}
                  onClick={record.onClick}
                  type="button"
                >
                  {content}
                </button>
              )
            : (
                <div
                  className={className}
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
