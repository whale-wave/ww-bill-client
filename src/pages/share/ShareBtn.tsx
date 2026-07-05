import type { FC } from 'react';
import { useTranslation } from '@/shared/i18n';
import styles from './ShareBtn.module.scss';

interface ShareBtnProps {
  onSave: () => void;
  onShare?: () => void;
}

const ShareBtn: FC<ShareBtnProps> = ({ onSave, onShare }) => {
  const { t } = useTranslation('community');
  return (
    <div className={styles.wrapper}>
      <button
        className={styles.btn}
        type="button"
        aria-label={t('share.saveImage')}
        onClick={onSave}
      >
        <i className={styles.icon} aria-hidden="true" />
        <span>{t('share.saveImage')}</span>
      </button>
      {onShare && (
        <button
          className={styles.btn}
          type="button"
          aria-label={t('share.shareBill')}
          onClick={onShare}
        >
          <i className={`${styles.icon} ${styles.shareIcon}`} aria-hidden="true" />
          <span>{t('common:action.share')}</span>
        </button>
      )}
    </div>
  );
};

export default ShareBtn;
