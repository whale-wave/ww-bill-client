import type { FC, RefObject } from 'react';
import config from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import styles from './ShareCanvas.module.scss';

export interface ShareData {
  amount: string;
  type: 'sub' | 'add';
  categoryName: string;
  remark?: string;
  dateText: string;
}

interface ShareCanvasProps {
  canvasRef: RefObject<HTMLDivElement>;
  data: ShareData;
}

function getAmountParts(amount: string) {
  const normalizedAmount = Number(amount);
  const formattedAmount = Number.isFinite(normalizedAmount)
    ? Math.abs(normalizedAmount).toFixed(2)
    : amount;
  const [integer = '0', decimal = '00'] = formattedAmount.split('.');

  return {
    integer,
    decimal: decimal.padEnd(2, '0').slice(0, 2),
  };
}

const ShareCanvas: FC<ShareCanvasProps> = ({ canvasRef, data }) => {
  const { t } = useTranslation('community');
  const amountParts = getAmountParts(data.amount);
  const typeText = data.type === 'add' ? t('common:amount.income') : t('common:amount.expend');

  return (
    <div
      className="flex-grow flex justify-center items-center"
      style={{ background: '#f5f5f5' }}
    >
      <div className={styles.canvas} ref={canvasRef}>
        <main>
          <div className={styles.qccode}>
            <div className={styles.brandMark}>{config.appName.slice(0, 1)}</div>
            <span>{config.appName}</span>
          </div>
          <div>{data.dateText}</div>
          <div className={styles.type}>{data.categoryName}</div>
          <div className={styles.desc}>{data.remark || t('share.noRemark')}</div>
          <div className={styles.money}>
            {typeText}
            <div>
              <span>{amountParts.integer}</span>
              .
              {amountParts.decimal}
            </div>
          </div>
        </main>
        <footer>
          <div className={styles.poster}>
            <div className={styles.posterTitle}>{config.appName}</div>
            <div className={styles.posterText}>{t('share.recordBill')}</div>
            <div className={styles.linkHint}>{t('share.linkHint')}</div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ShareCanvas;
