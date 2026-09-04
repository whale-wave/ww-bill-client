import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { DesignIcon } from '@/shared/ui';

interface AssetEmptyStateProps {
  actionLabel?: string;
  onAction?: () => void;
}

export const AssetEmptyState: FC<AssetEmptyStateProps> = ({ actionLabel, onAction }) => {
  const { t } = useTranslation('asset');

  return (
    <section className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center" data-testid="asset-empty-state">
      <DesignIcon aria-hidden="true" className="text-ww-soft" name="discovery-asset" size={42} />
      <h2 className="mt-5 text-[19px] font-extrabold leading-7 text-ww-ink">{t('manager.emptyTitle')}</h2>
      <p className="mt-2 max-w-[250px] text-[13px] leading-5 text-ww-mid">{t('manager.emptyDescription')}</p>
      {actionLabel && onAction && (
        <button
          className="mt-5 h-[48px] rounded-[16px] border-0 bg-primary px-6 text-[14px] font-extrabold text-white shadow-ww-xs active:opacity-85"
          onClick={onAction}
          type="button"
        >
          {actionLabel}
        </button>
      )}
    </section>
  );
};
