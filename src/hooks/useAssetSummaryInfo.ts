import { useMemo } from 'react';
import { useGetAssetQuery } from './query';
import { formatAmount, math } from '@/utils';
import type { AssetGroup } from '@/api';

export function useAssetSummaryInfo() {
  const { data: list } = useGetAssetQuery();

  const addAssetList = useMemo(() => {
    if (!list)
      return [];
    return list.filter(asset => asset.assetGroup.type === 'add');
  }, [list]);

  const addAsset = useMemo(() => {
    if (!list)
      return 0;
    return addAssetList.reduce((sum, asset) => {
      return math.add(sum, asset.amount).toNumber();
    }, 0);
  }, [list, addAssetList]);

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

  const addAssetGroupPercent = useMemo(() => {
    const groupId = [...new Set<string>(addAssetList.map(asset => asset.assetGroup.id))];
    type Result = { group: AssetGroup; percent: number; percentStr: string }[];
    const result: Result = groupId.map((id) => {
      const assetList = addAssetList.filter(asset => asset.assetGroup.id === id);
      const total = assetList.reduce((sum, asset) => Number(math.add(sum, asset.amount).toString()), 0);
      const percent = Number(math.divide(total, addAsset));

      return {
        group: assetList[0].assetGroup,
        percent,
        percentStr: `${Number(math.multiply(percent, 100)).toFixed(1)}%`,
      };
    });
    return result;
  }, [addAssetList, addAsset]);

  return {
    ...result,
    addAssetGroupPercent,
  };
}
