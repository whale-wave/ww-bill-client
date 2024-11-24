import { useMemo } from 'react';
import { useGetAssetQuery } from './query';
import { formatAmount, math } from '@/utils';

export function useAssetSummaryInfo() {
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

  const result = useMemo(() => {
    const info = {
      addAsset,
      subAsset,
      totalAsset,
    };

    const formatInfo = Object.keys(info).reduce((acc, key) => {
      acc[key as keyof typeof info] = formatAmount(info[key as keyof typeof info]);
      return acc;
    }, {} as {
      addAsset: string;
      subAsset: string;
      totalAsset: string;
    });

    return {
      info,
      formatInfo,
    };
  }, [addAsset, subAsset, totalAsset]);

  return result;
}
