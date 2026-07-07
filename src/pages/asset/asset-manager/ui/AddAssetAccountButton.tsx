import type { FC } from 'react';
import { Button } from 'antd-mobile';
import { AddOutline } from 'antd-mobile-icons';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';

export const AddAssetAccountButton: FC = () => {
  const { t } = useTranslation('asset');
  const navigate = useNavigate();

  const handleAddAssetAccount = useCallback(() => {
    navigate(ROUTES_PATH.ASSET_ADD_ACCOUNT.getPath());
  }, [navigate]);

  return (
    <div className="mt-4 mb-11">
      <Button color="primary" block onClick={handleAddAssetAccount}>
        <div className="flex justify-center items-center space-x-1">
          <AddOutline />
          <div>{t('addAccount')}</div>
        </div>
      </Button>
    </div>
  );
};
