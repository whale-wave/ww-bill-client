import type { FC } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from '@/shared/i18n';
import { AppButton } from '@/shared/ui';

interface ChartRetryButtonProps {
  isLoading: boolean;
  onRetry: () => void;
}

export const ChartRetryButton: FC<ChartRetryButtonProps> = ({ isLoading, onRetry }) => {
  const { t } = useTranslation('asset');

  return (
    <AppButton
      className="mt-3"
      loading={isLoading}
      loadingLabel={t('common:nav.loading')}
      onClick={onRetry}
      size="compact"
      variant="secondary"
    >
      <RefreshCw className={isLoading ? 'animate-spin' : ''} size={13} strokeWidth={2.2} />
      {t('retry')}
    </AppButton>
  );
};
