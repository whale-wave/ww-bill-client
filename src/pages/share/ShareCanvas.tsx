import type { FC, RefObject } from 'react';
import { CategoryIcon } from '@/entities/category';
import config from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { BrandAvatar } from '@/shared/ui';
import styles from './ShareCanvas.module.scss';

export interface ShareData {
  amount: string;
  categoryIcon?: string;
  categoryName: string;
  dateText: string;
  remark?: string;
  type: 'sub' | 'add';
}

interface ShareCanvasProps {
  canvasRef: RefObject<HTMLDivElement>;
  data: ShareData;
}

function formatAmount(amount: string) {
  const value = Number(amount);
  return Number.isFinite(value) ? Math.abs(value).toFixed(2) : amount;
}

const ShareCanvas: FC<ShareCanvasProps> = ({ canvasRef, data }) => {
  const { t } = useTranslation('community');
  const isIncome = data.type === 'add';
  const typeText = isIncome ? t('common:amount.income') : t('common:amount.expend');

  return (
    <div className={styles.stage}>
      <article className={`${styles.canvas} ${isIncome ? styles.income : styles.expense}`} ref={canvasRef}>
        <div className={styles.glowTop} />
        <div className={styles.glowBottom} />

        <header className={styles.brand}>
          <BrandAvatar className={styles.brandMark} imageClassName={styles.brandMarkImage} />
          <span>
            <strong>{config.appName}</strong>
            <small>{t('share.posterKicker')}</small>
          </span>
        </header>

        <main className={styles.receipt}>
          <div className={styles.categoryIcon}>
            <CategoryIcon categoryName={data.categoryName} iconKey={data.categoryIcon} size={28} strokeWidth={1.7} />
          </div>
          <span className={styles.typePill} data-share-type-pill>{typeText}</span>
          <h1>{data.categoryName}</h1>
          <p className={styles.date}>{data.dateText}</p>

          <div className={styles.amount}>
            <span>{isIncome ? '+' : '-'}</span>
            <small>¥</small>
            {formatAmount(data.amount)}
          </div>

          <div className={styles.dashedLine} />
          <div className={styles.note}>
            <span>{t('share.noteLabel')}</span>
            <p>{data.remark || t('share.noRemark')}</p>
          </div>
        </main>

        <footer className={styles.footer}>
          <span>{t('share.recordBill')}</span>
          <strong>{t('share.posterSignature')}</strong>
        </footer>
      </article>
    </div>
  );
};

export default ShareCanvas;
