import type { FC } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from '@/shared/i18n';

interface ChartRetryButtonProps {
  isLoading: boolean;
  onRetry: () => void;
}

export const ChartRetryButton: FC<ChartRetryButtonProps> = ({ isLoading, onRetry }) => {
  const { t } = useTranslation('asset');

  return (
    <button
      aria-busy={isLoading}
      className="mt-3 flex h-8 items-center gap-1.5 rounded-full border border-solid border-border-primary bg-white/75 px-3 text-[11px] font-extrabold text-primary-deep shadow-ww-xs transition active:bg-white disabled:opacity-60"
      disabled={isLoading}
      onClick={onRetry}
      type="button"
    >
      <RefreshCw className={isLoading ? 'animate-spin' : ''} size={13} strokeWidth={2.2} />
      {isLoading ? t('common:nav.loading') : t('retry')}
    </button>
  );
};
