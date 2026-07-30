import type { FC, ReactNode } from 'react';
import { cn } from '@/shared/lib';

export interface RecordOverviewMetric {
  key: string;
  label: ReactNode;
  testId?: string;
  value: ReactNode;
}

export interface RecordOverviewShortcut {
  disabled?: boolean;
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
    'record-overview-title absolute top-[5px] min-w-0 truncate text-xl font-bold text-[#323334]',
    titleAlignment === 'start'
      ? 'left-5 right-16 text-left'
      : 'left-1/2 -translate-x-1/2',
  );

  return (
    <div
      className="record-detail-top relative h-[182px] w-full shrink-0 bg-[linear-gradient(180deg,var(--ww-theme-color)_0%,var(--ww-theme-color)_75%,#fefefe_89%,#fefefe_100%)]"
      data-record-overview-header=""
      data-testid={testId}
    >
      {renderTitle(titleClassName)}
      <div
        className="absolute left-5 top-[50px] flex flex-col"
        data-record-overview-metrics
      >
        <div className="text-sm font-normal text-[#333333]">{period.label}</div>
        <div className="relative h-10 w-[70px] text-base font-normal text-[#333333]">
          <div className="absolute -right-2 bottom-1 h-[40%] w-px bg-[#333333] opacity-50"></div>
          <div
            className={cn(
              'absolute bottom-0',
              period.valueWidth === 'cell' ? 'w-[88px]' : 'w-[300px]',
            )}
            data-testid={period.testId}
            onClick={period.onClick}
          >
            {period.value}
          </div>
        </div>
      </div>
      {metrics.map((metric, index) => (
        <div
          className={cn(
            'absolute top-[50px] flex min-w-0 flex-col',
            index === 0 ? 'left-[121px]' : 'left-[230px]',
          )}
          key={metric.key}
        >
          <div className="max-w-24 truncate text-sm font-normal text-[#333333]">{metric.label}</div>
          <div className="relative h-[37px] w-24 text-base font-normal text-[#333333]">
            <div className="absolute bottom-0 max-w-full truncate" data-testid={metric.testId}>
              {metric.value}
            </div>
          </div>
        </div>
      ))}

      {amountToggle && (
        <div className="absolute bottom-[116px] right-4 px-1 text-lg" onClick={amountToggle.onClick}>
          {amountToggle.content}
        </div>
      )}
      {actions && <div className="absolute right-0 top-0 flex items-center gap-3 p-2">{actions}</div>}

      <div className="absolute bottom-0 left-[10px] right-[10px] h-[68px]">
        <nav
          className="flex h-[68px] w-full rounded-lg bg-[#fefefe] shadow-[1px_1px_4px_rgba(0,0,0,0.16)]"
          data-testid={shortcutsTestId}
        >
          {shortcuts.map(shortcut => (
            <button
              aria-disabled={shortcut.disabled}
              className={cn(
                'flex shrink-0 grow basis-0 flex-col items-center justify-center border-0 bg-transparent text-sm text-[#333333]',
                shortcut.disabled && 'opacity-45',
              )}
              data-testid={shortcut.testId}
              disabled={shortcut.disabled}
              key={shortcut.key}
              onClick={shortcut.onClick}
              type="button"
            >
              <span className="text-2xl">{shortcut.icon}</span>
              <span className="mt-1">{shortcut.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
