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
  };
  shortcuts: RecordOverviewShortcut[];
  shortcutsTestId?: string;
  testId?: string;
  title: ReactNode;
  titleAlignment?: 'center' | 'start';
}

export const RecordOverviewHeader: FC<RecordOverviewHeaderProps> = ({
  actions,
  amountToggle,
  metrics,
  period,
  shortcuts,
  shortcutsTestId,
  testId = 'record-overview-header',
  title,
  titleAlignment = 'center',
}) => (
  <header
    className={cn(styles.header, 'record-detail-top')}
    data-record-overview-header=""
    data-testid={testId}
  >
    <div className={styles.titleRow}>
      <div className={cn(styles.title, titleAlignment === 'center' ? styles.titleCenter : styles.titleStart)}>
        {title}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>

    <div className={styles.summary}>
      <div className={styles.summaryCell}>
        <span className={styles.summaryLabel}>{period.label}</span>
        <div className={cn(styles.summaryValue, styles.periodValue)}>{period.value}</div>
      </div>
      {metrics.map(metric => (
        <div className={styles.summaryCell} key={metric.key}>
          <span className={styles.summaryLabel}>{metric.label}</span>
          <div className={styles.summaryValue} data-testid={metric.testId}>{metric.value}</div>
        </div>
      ))}
    </div>

    {amountToggle && <div className={styles.toggle}>{amountToggle}</div>}

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
  </header>
);
