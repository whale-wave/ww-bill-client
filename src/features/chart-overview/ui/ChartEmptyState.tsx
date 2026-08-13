import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { DesignIcon, IllustratedEmptyState } from '@/shared/ui';

export const ChartEmptyState: FC = () => {
  const { t } = useTranslation('chart');
  const navigate = useNavigate();

  const handleBookkeeping = () => {
    navigate(ROUTES_PATH.BOOKKEEPING.getPath());
  };

  return (
    <IllustratedEmptyState
      accentIcon={<DesignIcon name="tab-add" size={20} />}
      actionLabel={t('emptyAction')}
      className="min-h-[360px] flex-grow pb-12"
      description={t('emptyDescription')}
      icon={<DesignIcon name="tab-chart-active" size={46} />}
      onAction={handleBookkeeping}
      testId="chart-empty-state"
      title={t('emptyTitle')}
    />
  );
};
