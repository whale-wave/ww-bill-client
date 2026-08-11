import type { FC, ReactNode } from 'react';
import { Toast } from 'antd-mobile';
import { cn } from '@/shared/lib';
import { ActionMenuCard, GradientPanel, MetricGrid } from '@/shared/ui';

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
      <div className="flex h-[52px] items-start justify-between gap-3 px-[22px] pb-4 pt-0.5">
        {renderTitle(titleClassName)}
        {actions && <div className="flex shrink-0 items-center gap-[10px] [&>button]:flex [&>button]:h-9 [&>button]:w-9 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:border [&>button]:border-solid [&>button]:border-border-primary [&>button]:bg-white/[0.85] [&>button]:text-primary-deep [&>button]:shadow-ww-xs">{actions}</div>}
      </div>
      <div className="px-[18px] pb-4">
        <GradientPanel
          className="relative h-[229.25px] overflow-hidden px-[22px] pb-5 pt-[22px]"
          data-record-overview-summary=""
          elevation="high"
          surface="aurora"
        >
          <div className="relative flex h-[39px] items-center justify-between gap-3">
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
            {amountToggle && (
              <button
                aria-label="toggle amount visibility"
                className="mt-[58px] flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/75 text-primary-deep shadow-ww-xs"
                onClick={amountToggle.onClick}
                type="button"
              >
                {amountToggle.content}
              </button>
            )}
          </div>
          <MetricGrid
            align="start"
            className="relative mt-[14px] w-[261px] [&>div]:px-0 [&>div+div]:pl-4"
            columns={2}
            items={metrics.map((metric, index) => ({
              key: metric.key,
              label: metric.label,
              tone: index === 0 ? 'income' : 'expense',
              value: <span data-testid={metric.testId}>{metric.value}</span>,
            }))}
          />
          <ActionMenuCard
            aria-label="record shortcuts"
            className="relative mt-5 overflow-hidden [&>button]:h-[70px] [&>button]:min-w-[calc((100%_-_20px)/3)] [&>button]:w-[calc((100%_-_20px)/3)]"
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
            variant="gradient-tiles"
          />
          {shortcutsTestId && <span className="hidden" data-testid={shortcutsTestId} />}
        </GradientPanel>
      </div>
    </div>
  );
};
