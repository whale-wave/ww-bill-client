import type { FC } from 'react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const AssetHeader: FC = () => {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate(-1);
  }, []);

  return (
    <div className="flex justify-between items-center px-3 py-3">
      <div className="flex-1 flex-shrink-0 px-2"></div>
      <div className="text-xl font-bold">资产管家</div>
      <div className="text-lg text-gray-500 flex-1 text-right px-2" onClick={handleBack}>
        返回
      </div>
    </div>
  );
};
