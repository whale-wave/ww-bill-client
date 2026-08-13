import type { AssetGroup } from '../api';
import { useMemo } from 'react';
import { formatAmount, math } from '@/shared/lib';
import { useGetAssetQuery } from '../hooks';

type Result = { group: AssetGroup; percent: number; percentStr: string }[];

export function useAssetSummaryInfo() {
  const query = useGetAssetQuery();
  const { data: list } = query;

  const addAssetList = useMemo(() => {
    if (!list)
      return [];
    return list.filter(asset => asset.assetGroup.type === 'add');
  }, [list]);

  const subAssetList = useMemo(() => {
    if (!list)
      return [];
    return list.filter(asset => asset.assetGroup.type === 'sub');
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
    const result: Result = groupId.map((id) => {
      const assetList = addAssetList.filter(asset => asset.assetGroup.id === id);
      const total = assetList.reduce((sum, asset) => Number(math.add(sum, asset.amount).toString()), 0);
      const percent = addAsset === 0 ? 0 : Number(math.divide(total, addAsset));

      return {
        group: assetList[0].assetGroup,
        percent,
        percentStr: `${Number(math.multiply(percent, 100)).toFixed(1)}%`,
      };
    });
    return result;
  }, [addAssetList, addAsset]);

  const subAssetGroupPercent = useMemo(() => {
    const groupId = [...new Set<string>(subAssetList.map(asset => asset.assetGroup.id))];
    const result: Result = groupId.map((id) => {
      const assetList = subAssetList.filter(asset => asset.assetGroup.id === id);
      const total = assetList.reduce((sum, asset) => Number(math.add(sum, asset.amount).toString()), 0);
      const percent = subAsset === 0 ? 0 : Number(math.divide(total, subAsset));

      return {
        group: assetList[0].assetGroup,
        percent,
        percentStr: `${Number(math.multiply(percent, 100)).toFixed(1)}%`,
      };
    });
    return result;
  }, [subAssetList, subAsset]);

  return {
    ...result,
    addAssetGroupPercent,
    isError: query.isError,
    isLoading: query.isLoading,
    refetch: query.refetch,
    subAssetGroupPercent,
  };
}
