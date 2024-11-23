import { Button } from 'antd-mobile';
import { AddOutline } from 'antd-mobile-icons';
import type { FC } from 'react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/constants';

export const AddAssetAccountButton: FC = () => {
  const navigate = useNavigate();

  const handleAddAssetAccount = useCallback(() => {
    navigate(ROUTES_PATH.ASSET_ADD_ACCOUNT.getPath());
  }, [navigate]);

  return (
    <div className="mt-4 mb-11">
      <Button color="primary" block onClick={handleAddAssetAccount}>
        <div className="flex justify-center items-center space-x-1">
          <AddOutline />
          <div>添加账户</div>
        </div>
      </Button>
    </div>
  );
};
