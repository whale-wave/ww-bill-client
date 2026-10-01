import type { FC, MouseEvent, ReactNode } from 'react';
import { RecordDateGroupHeader, RecordDateLabelVisual, RecordGroupSurface, RecordOverviewRowContent, RecordSecondaryContent } from '@ww-bill/bill-ui';
import { SwipeAction } from 'antd-mobile';
import { Image as ImageIcon } from 'lucide-react';
import { CategoryIcon } from '@/entities/category';
import { MEMBER_COLOR_PALETTE } from '@/shared/config/member-colors';
import { cn } from '@/shared/lib';
import { getCategoryIconForegroundColor } from '@/shared/lib/category-background';
import { getRecordDisplayTitle } from '../display-title';

export interface RecordOverviewListItem {
  amount: ReactNode;
  amountTone?: 'expense' | 'income' | 'neutral';
  originalAmount?: ReactNode;
  categoryName?: string;
  iconName: string;
  iconType?: 'BUILTIN' | 'IMAGE';
  backgroundColor?: string | null;
  textIconEnabled?: boolean;
  textIconIndex?: number;
  memberColorKey?: keyof typeof MEMBER_COLOR_PALETTE;
  id: number | string;
  hasAttachment?: boolean;
  onClick?: () => void;
  overviewSecondary?: ReactNode;
  primary: ReactNode;
  rightActions?: Array<{
    color?: 'danger' | 'light' | 'primary' | 'success' | 'warning' | string;
    key: string | number;
    onClick?: (event: MouseEvent) => void;
    text: ReactNode;
  }>;
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
  renderCategoryIcon?: (item: Pick<RecordOverviewListItem, 'categoryName' | 'iconName' | 'iconType' | 'textIconEnabled' | 'textIconIndex'>) => ReactNode;
  variant?: 'compact' | 'default' | 'overview' | 'search';
}

function getAmountClassName(tone: RecordOverviewListItem['amountTone']) {
  if (tone === 'income')
    return 'text-finance-income';
  if (tone === 'expense')
    return 'text-finance-expense';
  return 'text-font-black';
}

export const RecordOverviewList: FC<RecordOverviewListProps> = ({
  groups,
  renderCategoryIcon,
  variant = 'search',
}) => {
  const isOverview = variant === 'compact' || variant === 'overview';
  const semanticVariant = isOverview ? 'overview' : 'search';

  return (
    <div data-record-list-variant={semanticVariant} data-testid="record-overview-list">
      {groups.map(group => (
        <section
          className={isOverview
            ? 'pb-2'
            : 'flex flex-col border-0 border-b border-solid border-border-primary pt-3 last:border-0'}
          data-date-group={group.key}
          key={group.key}
        >
          <RecordDateGroupHeader
            variant={isOverview ? 'overview' : 'search'}
            date={(
              <>
                {group.dateTime
                  ? <time dateTime={group.dateTime}><RecordDateLabelVisual label={group.dateLabel} /></time>
                  : <span><RecordDateLabelVisual label={group.dateLabel} /></span>}

              </>
            )}
            summaries={(
              <>
                {group.summaries?.map(summary => (
                  <span
                    className={cn(
                      summary.key === 'income' && 'text-finance-income',
                      summary.key === 'expense' && 'text-finance-expense',
                    )}
                    key={summary.key}
                  >
                    {summary.label}
                    {' '}
                    {summary.value}
                  </span>
                ))}
              </>
            )}
          />
          <div className={isOverview ? 'bill-record-group__body' : ''}>
            <RecordGroupSurface variant={isOverview ? 'overview' : 'search'} single={isOverview && group.records.length === 1 && !group.records.some(record => record.overviewSecondary)}>
              {group.records.map((record, index) => {
                const primary = typeof record.primary === 'string'
                  ? getRecordDisplayTitle(record.primary, record.categoryName ?? '')
                  : record.primary;
                if (isOverview) {
                  const hasOverviewSecondary = Boolean(record.overviewSecondary) || record.hasAttachment;
                  const recordRow = (
                    <div
                      className={cn(
                        'relative flex w-full items-center',
                        hasOverviewSecondary ? 'min-h-[68px] py-0.5' : 'h-[60px]',
                      )}
                      data-record-id={record.id}
                      key={record.id}
                      onClick={record.onClick}
                    >
                      <RecordOverviewRowContent
                        amount={record.amount}
                        amountTone={record.amountTone}
                        originalAmount={record.originalAmount}
                        primary={primary}
                        secondary={hasOverviewSecondary
                          ? (
                              <RecordSecondaryContent
                                copy={record.overviewSecondary}
                                attachmentIcon={record.hasAttachment ? <ImageIcon aria-label="含图片" className="shrink-0 text-primary-deep" size={12} /> : undefined}
                              />
                            )
                          : undefined}
                        icon={(
                          <span
                            className={cn(
                              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                              record.memberColorKey && 'border border-solid border-white/70 shadow-ww-xs',
                              !record.memberColorKey && index % 4 === 1
                                ? 'bg-ww-pink-light text-ww-pink'
                                : !record.memberColorKey && index % 4 === 2
                                    ? 'bg-finance-income/10 text-finance-income'
                                    : !record.memberColorKey && index % 4 === 3
                                        ? 'bg-[color:var(--ww-surface-accent-color)] text-primary-deep'
                                        : !record.memberColorKey ? 'bg-[color:var(--ww-surface-tint-color)] text-primary-deep' : '',
                            )}
                            style={record.backgroundColor
                              ? { backgroundColor: record.backgroundColor, color: getCategoryIconForegroundColor(record.backgroundColor) ?? 'var(--ww-theme-text-color)', padding: record.iconType === 'IMAGE' ? 0 : 3 }
                              : record.memberColorKey
                                ? {
                                    backgroundColor: MEMBER_COLOR_PALETTE[record.memberColorKey].background,
                                    color: MEMBER_COLOR_PALETTE[record.memberColorKey].foreground,
                                    padding: record.iconType === 'IMAGE' ? 0 : 3,
                                  }
                                : undefined}
                            data-category-icon={record.iconName}
                          >
                            {renderCategoryIcon?.(record) ?? <CategoryIcon categoryName={record.categoryName} iconKey={record.iconName} iconType={record.iconType} textIconEnabled={record.textIconEnabled} textIconIndex={record.textIconIndex} size={18} />}
                          </span>
                        )}
                      />
                      {index !== group.records.length - 1 && (
                        <span aria-hidden="true" className="absolute bottom-0 left-[71px] right-0 h-px bg-border-primary" />
                      )}
                    </div>
                  );
                  return record.rightActions?.length
                    ? <SwipeAction className="ww-record-swipe-action" key={record.id} rightActions={record.rightActions}>{recordRow}</SwipeAction>
                    : recordRow;
                }

                const content = (
                  <>
                    <span
                      className={isOverview
                        ? 'flex h-full w-[52px] shrink-0 items-center justify-start'
                        : 'mx-4 flex shrink-0 items-center justify-center py-3'}
                      data-category-icon={record.iconName}
                    >
                      <span
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full',
                          record.memberColorKey && 'border border-solid border-white/70 shadow-ww-xs',
                          !record.memberColorKey && index % 4 === 1
                            ? 'bg-ww-pink-light text-ww-pink'
                            : index % 4 === 2
                              ? 'bg-finance-income/10 text-finance-income'
                              : index % 4 === 3
                                ? 'bg-[color:var(--ww-surface-accent-color)] text-primary-deep'
                                : 'bg-[color:var(--ww-surface-tint-color)] text-primary-deep',
                        )}
                        style={record.backgroundColor
                          ? { backgroundColor: record.backgroundColor, color: getCategoryIconForegroundColor(record.backgroundColor) ?? 'var(--ww-theme-text-color)', padding: record.iconType === 'IMAGE' ? 0 : 3 }
                          : record.memberColorKey
                            ? {
                                backgroundColor: MEMBER_COLOR_PALETTE[record.memberColorKey].background,
                                color: MEMBER_COLOR_PALETTE[record.memberColorKey].foreground,
                                padding: record.iconType === 'IMAGE' ? 0 : 3,
                              }
                            : undefined}
                      >
                        {renderCategoryIcon?.(record) ?? <CategoryIcon categoryName={record.categoryName} iconKey={record.iconName} iconType={record.iconType} textIconEnabled={record.textIconEnabled} textIconIndex={record.textIconIndex} size={18} />}
                      </span>
                    </span>
                    <span
                      className={cn(
                        'flex min-w-0 flex-grow items-center justify-between text-[14px] font-semibold leading-[21px] text-ww-ink',
                        isOverview ? 'h-full pr-1' : 'h-[59px] py-3 pr-3',
                        index !== group.records.length - 1
                        && 'border-0 border-b border-solid border-border-primary',
                      )}
                    >
                      <span className="min-w-0 flex-grow">
                        <span className="block overflow-hidden text-ellipsis whitespace-nowrap">{primary}</span>
                        {(record.secondary || record.hasAttachment) && (
                          <span className="mt-1 flex min-w-0 items-center gap-1 overflow-hidden text-xs text-ww-soft">
                            <RecordSecondaryContent copy={record.secondary} attachmentIcon={record.hasAttachment ? <ImageIcon aria-label="含图片" className="shrink-0 text-primary-deep" size={12} /> : undefined} />
                          </span>
                        )}
                      </span>
                      <span
                        className={cn(
                          isOverview ? 'ml-3 flex max-w-[42%] shrink-0 flex-col items-end font-number text-[16px] font-bold leading-6' : 'ml-4',
                          getAmountClassName(record.amountTone),
                        )}
                      >
                        <span className="truncate">{record.amount}</span>
                        {record.originalAmount && (
                          <del className="font-number text-[10px] font-semibold leading-3 text-ww-soft" data-record-original-amount>
                            {record.originalAmount}
                          </del>
                        )}
                      </span>
                    </span>
                  </>
                );
                const recordRow = (
                  <div
                    className={isOverview
                      ? cn('flex w-full items-center', group.records.length === 1 ? 'h-[62px]' : 'h-[60px]')
                      : 'flex h-[59px] w-full items-center text-base'}
                    data-record-id={record.id}
                    key={record.id}
                    onClick={record.onClick}
                  >
                    {content}
                  </div>
                );
                return record.rightActions?.length
                  ? <SwipeAction className="ww-record-swipe-action" key={record.id} rightActions={record.rightActions}>{recordRow}</SwipeAction>
                  : recordRow;
              })}
            </RecordGroupSurface>
          </div>
        </section>
      ))}
    </div>
  );
};
