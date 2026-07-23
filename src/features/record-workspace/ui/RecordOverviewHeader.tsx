import type { CSSProperties, FC, ReactNode } from 'react';
import { Icon } from '@/shared/ui';
import styles from './record-overview-header.module.scss';

interface RecordOverviewMetric {
  content: ReactNode;
  key: string;
  label: ReactNode;
}

interface RecordOverviewShortcut {
  icon?: ReactNode;
  iconName?: string;
  key: string;
  label: ReactNode;
  onClick: () => void;
  testId?: string;
}

interface RecordOverviewHeaderProps {
  accessory?: ReactNode;
  actions?: ReactNode;
  metrics: RecordOverviewMetric[];
  shortcuts: RecordOverviewShortcut[];
  themeColor?: string;
  title: ReactNode;
  titleAlign?: 'center' | 'left';
}

export const RecordOverviewHeader: FC<RecordOverviewHeaderProps> = ({
  accessory,
  actions,
  metrics,
  shortcuts,
  themeColor = 'var(--ww-theme-color)',
  title,
  titleAlign = 'center',
}) => (
  <header
    className={`${styles.header} record-detail-top`}
    style={{ '--record-overview-theme': themeColor } as CSSProperties}
  >
    <div className={`${styles.title} ${titleAlign === 'left' ? styles.titleLeft : ''}`}>{title}</div>
    {actions && <div className={styles.actions}>{actions}</div>}
    {accessory && <div className={styles.accessory}>{accessory}</div>}

    <div className={styles.metrics}>
      {metrics.map(metric => (
        <div className={`${styles.metric} top-text-1-wrapper`} key={metric.key}>
          <div className={styles.metricLabel}>{metric.label}</div>
          <div className={styles.metricContent}>{metric.content}</div>
        </div>
      ))}
    </div>

    <nav
      className={`${styles.shortcuts} list-wrapper`}
      style={{ '--record-overview-shortcut-count': shortcuts.length } as CSSProperties}
    >
      {shortcuts.map(shortcut => (
        <button
          className={styles.shortcut}
          data-testid={shortcut.testId}
          key={shortcut.key}
          onClick={shortcut.onClick}
          type="button"
        >
          {shortcut.icon ?? (shortcut.iconName ? <Icon name={shortcut.iconName} /> : null)}
          <span>{shortcut.label}</span>
        </button>
      ))}
    </nav>
  </header>
);
