import type { FC } from 'react';
import mascotUrl from '@/assets/brand/whale-mascot-invite-v1.png';
import config from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { BrandAvatar } from '@/shared/ui';
import styles from './InvitePoster.module.scss';

interface InvitePosterProps {
  displayName: string;
  mode: 'screen' | 'export';
  qrCode: string;
}

export const InvitePoster: FC<InvitePosterProps> = ({ displayName, mode, qrCode }) => {
  const { t } = useTranslation('user');
  return (
    <article className={`${styles.poster} ${mode === 'export' ? styles.export : styles.screen}`} data-invite-poster={mode}>
      <span aria-hidden="true" className={styles.bubble} />
      <span aria-hidden="true" className={styles.bubbleSmall} />
      <div className="px-[18px] pb-5 pt-5">
        <div className={styles.brandMark}>
          <BrandAvatar className="h-7 w-7 bg-white p-0.5" imageClassName="object-contain" />
          <span>{config.appName}</span>
        </div>
        <h1 className={styles.headline}>{t('inviteFriends.headline', { name: displayName })}</h1>
        <p className={styles.description}>{t('inviteFriends.description')}</p>
        <img alt={t('inviteFriends.mascotAlt')} className={styles.mascot} src={mascotUrl} />
        <div className={styles.benefits}>
          <span className={styles.benefit}>{t('inviteFriends.benefitRecord')}</span>
          <span className={styles.benefit}>{t('inviteFriends.benefitBudget')}</span>
          <span className={styles.benefit}>{t('inviteFriends.benefitTogether')}</span>
        </div>
        <div className={styles.footer}>
          <img alt={t('inviteFriends.scan')} className={styles.qr} data-export-qr src={qrCode} />
          <div className="min-w-0">
            <div className={styles.scan}>{t('inviteFriends.scan')}</div>
            <div className={styles.scanHint}>{t('inviteFriends.scanHint')}</div>
          </div>
        </div>
        <p className={styles.tagline}>{t('inviteFriends.posterTagline')}</p>
      </div>
    </article>
  );
};
