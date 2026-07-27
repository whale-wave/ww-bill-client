import type { FC, ReactNode } from 'react';
import { cn } from '@/shared/lib';
import styles from './RecordOverviewHeader.module.scss';

export interface RecordOverviewMetric {
  key: string;
  label: ReactNode;
  testId?: string;
  value: ReactNode;
}

export interface RecordOverviewShortcut {
  icon: ReactNode;
  key: string;
  label: ReactNode;
  onClick: () => void;
  testId?: string;
}

interface RecordOverviewHeaderProps {
  actions?: ReactNode;
  amountToggle?: ReactNode;
  metrics: [RecordOverviewMetric, RecordOverviewMetric];
  period: {
    label: ReactNode;
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
  const titleClassName = cn(styles.title, titleAlignment === 'start' && styles.titleStart);

  return (
    <div
      className={cn(styles.top, 'record-detail-top')}
      data-record-overview-header=""
      data-testid={testId}
    >
      {renderTitle(titleClassName)}
      <div className={cn(styles.left, styles.topTextWrapper)}>
        <div className={styles.topText}>{period.label}</div>
        <div className={styles.leftBottom}>
          <div className={styles.periodDivider}></div>
          <div
            className={cn(
              styles.bottomWrapper,
              styles.periodValue,
              period.valueWidth === 'cell' && styles.periodValueCell,
            )}
          >
            {period.value}
          </div>
        </div>
      </div>
      {metrics.map((metric, index) => (
        <div
          className={cn(index === 0 ? styles.middle : styles.right, styles.topTextWrapper)}
          key={metric.key}
        >
          <div className={styles.topText}>{metric.label}</div>
          <div className={index === 0 ? styles.middleBottom : styles.rightBottom}>
            <div className={styles.bottomWrapper} data-testid={metric.testId}>{metric.value}</div>
          </div>
        </div>
      ))}

      {amountToggle && <div className={styles.toggle}>{amountToggle}</div>}
      {actions && <div className={styles.actions}>{actions}</div>}

      <div className={styles.listWrapper}>
        <nav className={styles.shortcuts} data-testid={shortcutsTestId}>
          {shortcuts.map(shortcut => (
            <button
              className={styles.shortcut}
              data-testid={shortcut.testId}
              key={shortcut.key}
              onClick={shortcut.onClick}
              type="button"
            >
              <span className={styles.shortcutIcon}>{shortcut.icon}</span>
              <span className={styles.shortcutLabel}>{shortcut.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
