import type { FC } from 'react';
import { useAssetSummaryInfo } from '@/hooks';

export const AssetInfoCard: FC = () => {
  const { formatInfo } = useAssetSummaryInfo();

  return (
    <div className="flex flex-col bg-primary rounded-lg py-4 px-5 space-y-7">
      <div className="flex flex-col">
        <div>
          净资产
        </div>
        <div className="text-3xl font-bold">{formatInfo.totalAsset}</div>
      </div>
      <div className="flex flex-row">
        <div className="flex flex-1 space-x-1">
          <div>资产</div>
          <div>{formatInfo.addAsset}</div>
        </div>
        <div className="flex flex-1 space-x-1">
          <div>负债</div>
          <div>{formatInfo.subAsset}</div>
        </div>
      </div>
    </div>
  );
};
