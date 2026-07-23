import type { MouseEventHandler } from 'react';
import { CompassOutline, MoreOutline } from 'antd-mobile-icons';
import { useTranslation } from '@/shared/i18n';

export interface MiniProgramCapsuleProps {
  isPersonal: boolean;
  moreExpanded?: boolean;
  onMore: MouseEventHandler<HTMLButtonElement>;
  onPersonal?: () => void;
}

export function MiniProgramCapsule({
  isPersonal,
  moreExpanded,
  onMore,
  onPersonal,
}: MiniProgramCapsuleProps) {
  const { t } = useTranslation('ledger');

  return (
    <div
      aria-label={t('switcher.more')}
      className="ledger-switcher-capsule"
      data-testid="mini-program-capsule"
      role="group"
    >
      <button
        aria-expanded={moreExpanded}
        aria-haspopup="dialog"
        aria-label={t('switcher.more')}
        className="ledger-switcher-capsule__button"
        data-testid="ledger-capsule-more"
        onClick={onMore}
        type="button"
      >
        <MoreOutline aria-hidden="true" />
      </button>
      <span aria-hidden="true" className="ledger-switcher-capsule__divider" />
      <button
        aria-current={isPersonal ? 'page' : undefined}
        aria-label={isPersonal
          ? t('switcher.currentPersonal')
          : t('switcher.returnPersonal')}
        className="ledger-switcher-capsule__button"
        data-testid="ledger-capsule-personal"
        onClick={isPersonal ? undefined : onPersonal}
        type="button"
      >
        <CompassOutline aria-hidden="true" />
      </button>
    </div>
  );
}
