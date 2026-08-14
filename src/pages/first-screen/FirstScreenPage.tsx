import type { FC } from 'react';
import classNames from 'classnames';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import newLogo from '@/assets/brand/whale-logo-transparent.png';
import config from '@/shared/config';
import styles from './index.module.css';

const FirstScreen: FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate('/detail');
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className={classNames([
        styles.bg,
        'fixed inset-0 flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden',
      ])}
    >
      <span aria-hidden="true" className={styles.orbitOuter} />
      <span aria-hidden="true" className={styles.orbitInner} />
      <span aria-hidden="true" className={styles.bubbleLeft} />
      <span aria-hidden="true" className={styles.bubbleRight} />
      <main className={styles.content}>
        <div className={styles.logoFrame}>
          <span aria-hidden="true" className={styles.logoHalo} />
          <span aria-hidden="true" className={styles.logoSurface} />
          <span className={styles.logoWrap}>
            <img
              className={styles.logo}
              src={newLogo}
              alt={config.appName}
            />
          </span>
        </div>
        <div className={styles.brandCopy}>
          <span className={classNames(styles.logoText, 'font-display')}>{config.appName}</span>
          <span className={styles.tagline}>记清当下，理清生活</span>
        </div>
      </main>
      <div aria-label="正在加载" className={styles.loading} role="status">
        <span className={styles.loadingTrack}>
          <span className={styles.loadingFill} />
        </span>
      </div>
    </div>
  );
};

export default FirstScreen;
