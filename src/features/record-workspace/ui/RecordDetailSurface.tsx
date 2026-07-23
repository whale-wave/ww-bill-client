import type { FC, ReactNode } from 'react';
import { Icon, NavBar } from '@/shared/ui';
import styles from './record-detail-surface.module.scss';

interface RecordDetailHeroProps {
  backLabel: string;
  categoryIcon?: string;
  categoryName: string;
  onBack: () => void;
}

interface RecordDetailRow {
  label: string;
  value: ReactNode;
}

export const RecordDetailHero: FC<RecordDetailHeroProps> = ({
  backLabel,
  categoryIcon,
  categoryName,
  onBack,
}) => (
  <div>
    <NavBar back={backLabel} backArrow={false} onBack={onBack} />
    <div className={styles.hero}>
      <div className={styles.heroMain}>
        <div className={styles.icon}>
          {categoryIcon ? <Icon name={categoryIcon} style={{ fontSize: 36 }} /> : '¥'}
        </div>
        <span>{categoryName}</span>
      </div>
    </div>
  </div>
);

export const RecordDetailRows: FC<{
  action?: ReactNode;
  rows: RecordDetailRow[];
}> = ({ action, rows }) => (
  <div className={styles.rows}>
    {rows.map(row => (
      <div className={styles.row} key={row.label}>
        <span>{row.label}</span>
        <span>{row.value}</span>
      </div>
    ))}
    {action}
  </div>
);
