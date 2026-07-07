import type { FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const AssetHeader: FC = () => {
  const { t } = useTranslation('asset');
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate(-1);
  }, []);

  return (
    <div className="flex justify-between items-center px-3 py-3 fixed top-0 left-0 right-0 z-10 bg-white">
      <div className="flex-1 flex-shrink-0 px-2"></div>
      <div className="text-xl font-bold">{t('title')}</div>
      <div className="text-lg text-gray-500 flex-1 text-right px-2" onClick={handleBack}>
        {t('back')}
      </div>
    </div>
  );
};
