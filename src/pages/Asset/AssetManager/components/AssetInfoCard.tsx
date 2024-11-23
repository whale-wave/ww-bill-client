import { type FC, useMemo } from 'react';
import { useGetAssetQuery } from '@/hooks';
import { formatAmount, math } from '@/utils';

export const AssetInfoCard: FC = () => {
  const { data: list } = useGetAssetQuery();

  const addAsset = useMemo(() => {
    if (!list)
      return 0;
    return list.filter(asset => asset.assetGroup.type === 'add').reduce((sum, asset) => {
      return math.add(sum, asset.amount).toNumber();
    }, 0);
  }, [list]);

  const subAsset = useMemo(() => {
    if (!list)
      return 0;
    return list.filter(asset => asset.assetGroup.type === 'sub').reduce((sum, asset) => {
      return math.add(sum, asset.amount).toNumber();
    }, 0);
  }, [list]);

  const totalAsset = useMemo(() => {
    return math.subtract(addAsset, subAsset).toNumber();
  }, [addAsset, subAsset]);

  return (
    <div className="flex flex-col bg-primary rounded-lg py-4 px-5 space-y-4">
      <div className="flex flex-col">
        <div>
          净资产
        </div>
        <div className="text-3xl font-bold">{formatAmount(totalAsset)}</div>
      </div>
      <div className="flex flex-row">
        <div className="flex flex-1 space-x-1">
          <div>资产</div>
          <div>{formatAmount(addAsset)}</div>
        </div>
        <div className="flex flex-1 space-x-1">
          <div>负债</div>
          <div>{formatAmount(subAsset)}</div>
        </div>
      </div>
    </div>
  );
};
