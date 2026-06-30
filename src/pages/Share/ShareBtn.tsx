import type { FC } from 'react';
import styles from './ShareBtn.module.scss';

interface ShareBtnProps {
  onSave: () => void;
  onShare?: () => void;
}

const ShareBtn: FC<ShareBtnProps> = ({ onSave, onShare }) => {
  return (
    <div className={styles.wrapper}>
      <button
        className={styles.btn}
        type="button"
        aria-label="保存图片"
        onClick={onSave}
      >
        <i className={styles.icon} aria-hidden="true" />
        <span>保存图片</span>
      </button>
      {onShare && (
        <button
          className={styles.btn}
          type="button"
          aria-label="分享账单"
          onClick={onShare}
        >
          <i className={`${styles.icon} ${styles.shareIcon}`} aria-hidden="true" />
          <span>分享</span>
        </button>
      )}
    </div>
  );
};

export default ShareBtn;
