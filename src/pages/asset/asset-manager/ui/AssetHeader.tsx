import type { FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/ui';

export const AssetHeader: FC = () => {
  const { t } = useTranslation('asset');
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <PageHeader
      backLabel={t('common:nav.back')}
      onBack={handleBack}
      title={t('manager.title')}
    />
  );
};
