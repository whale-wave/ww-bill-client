import type { FC, ReactNode } from 'react';
import { Toast } from 'antd-mobile';
import { cn } from '@/shared/lib';
import { ActionMenuCard, MetricGrid, Surface } from '@/shared/ui';

export interface RecordOverviewMetric {
  key: string;
  label: ReactNode;
  testId?: string;
  value: ReactNode;
}

export interface RecordOverviewShortcut {
  disabled?: boolean;
  disabledMessage?: string;
  icon: ReactNode;
  key: string;
  label: ReactNode;
  onClick: () => void;
  testId?: string;
}

export interface RecordOverviewHeaderProps {
  actions?: ReactNode;
  amountToggle?: {
    content: ReactNode;
    disabled?: boolean;
    onClick: () => void;
  };
  metrics: readonly [RecordOverviewMetric, RecordOverviewMetric];
  period: {
    label: ReactNode;
    onClick?: () => void;
    testId?: string;
    value: ReactNode;
    valueWidth?: 'cell' | 'overlay';
  };
  renderTitle: (className: string) => ReactNode;
  shortcuts: RecordOverviewShortcut[];
  shortcutsTestId?: string;
  testId?: string;
  titleIcon?: ReactNode;
  titleIconContainerClassName?: string;
  titleAlignment?: 'center' | 'start';
}

export const RecordOverviewHeader: FC<RecordOverviewHeaderProps> = ({
  actions,
  amountToggle,
  metrics,
  period,
  renderTitle,
  shortcuts,
  shortcutsTestId,
  testId = 'record-overview-header',
  titleIcon,
  titleIconContainerClassName,
  titleAlignment = 'center',
}) => {
  const titleClassName = cn(
    'record-overview-title min-w-0 truncate text-[17px] font-bold leading-[25.5px] text-ww-ink',
    titleAlignment === 'start'
      ? 'text-left'
      : 'text-center',
  );

  return (
    <div
      className="record-detail-top w-full shrink-0 pt-[max(8px,env(safe-area-inset-top))]"
      data-record-overview-header=""
      data-testid={testId}
    >
      <div className="flex h-[60px] items-start justify-between gap-3 px-[22px] pb-4">
        <div className="flex h-8 min-w-0 items-center gap-2" data-record-overview-title-row>
          {titleIcon && (
            <span className={cn(
              'ww-overview-title-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-[16px]',
              titleIconContainerClassName,
            )}
            >
              {titleIcon}
            </span>
          )}
          {renderTitle(titleClassName)}
        </div>
        {actions && <div className="ww-overview-header-actions flex shrink-0 items-center gap-[10px] [&>button]:flex [&>button]:h-11 [&>button]:w-11 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:border [&>button]:border-solid">{actions}</div>}
      </div>
      <div className="px-[18px] pb-4">
        <Surface
          className="relative h-[211px] overflow-hidden px-[22px] pb-4 pt-[18px]"
          data-record-overview-summary=""
          material="raised"
        >
          <div className="relative flex h-[39px] items-center gap-[6px]">
            <div data-record-overview-metrics>
              <div className="sr-only">{period.label}</div>
              <div
                className={cn('min-w-0 text-ww-ink', period.valueWidth === 'cell' ? 'max-w-[190px]' : '')}
                data-testid={period.testId}
                onClick={period.onClick}
              >
                {period.value}
              </div>
            </div>
          </div>
          <div className="relative flex h-[57px] w-full items-center">
            <MetricGrid
              align="start"
              className="w-[249px] shrink-0"
              columns={2}
              items={metrics.map((metric, index) => ({
                key: metric.key,
                label: metric.label,
                tone: index === 0 ? 'income' : 'expense',
                value: <span data-testid={metric.testId}>{metric.value}</span>,
              }))}
              variant="detail-summary"
            />
            {amountToggle && (
              <button
                aria-label="toggle amount visibility"
                className={cn(
                  'ww-overview-amount-toggle mt-[14px] flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border',
                  amountToggle.disabled && 'opacity-45',
                )}
                disabled={amountToggle.disabled}
                onClick={amountToggle.onClick}
                type="button"
              >
                {amountToggle.content}
              </button>
            )}
          </div>
          <ActionMenuCard
            aria-label="record shortcuts"
            className="relative h-20 overflow-y-hidden pt-4"
            columns={3}
            items={shortcuts.map((shortcut, index) => ({
              ariaDisabled: shortcut.disabled,
              icon: shortcut.icon,
              key: shortcut.key,
              label: shortcut.label,
              onClick: () => {
                if (shortcut.disabled) {
                  Toast.show(shortcut.disabledMessage ?? '暂无权限');
                  return;
                }
                shortcut.onClick();
              },
              testId: shortcut.testId,
              tone: index === 1 ? 'pink' : index === 2 ? 'purple' : 'blue',
            }))}
            variant="detail-shortcuts"
          />
          {shortcutsTestId && <span className="hidden" data-testid={shortcutsTestId} />}
        </Surface>
      </div>
    </div>
  );
};
