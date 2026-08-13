import type { FC } from 'react';
import type { Asset, AssetGroup } from '@/entities/asset';
import { Button, Dialog, ErrorBlock, SpinLoading, SwipeAction, Toast } from 'antd-mobile';
import { ChevronRight } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDeleteAssetByIdMutation, useGetAssetGroupQuery, useGetAssetQuery } from '@/entities/asset';
import { ROUTES_PATH } from '@/shared/config/routes';
import { formatAmount, math } from '@/shared/lib';
import { DesignIcon, IllustratedEmptyState } from '@/shared/ui';
import { IconBlock } from '../../ui';

interface AssetListGroup {
  amount: number;
  id: string;
  list: Asset[];
  name: string;
  type: 'add' | 'sub';
}

export const AssetList: FC = () => {
  const { t } = useTranslation('asset');
  const navigate = useNavigate();
  const {
    data: list,
    isError: isListError,
    isLoading: isListLoading,
    refetch: refetchList,
  } = useGetAssetQuery();
  const [deleteAssetByIdMutate] = useDeleteAssetByIdMutation();
  const {
    data: groups,
    isError: isGroupError,
    isLoading: isGroupLoading,
    refetch: refetchGroups,
  } = useGetAssetGroupQuery();

  const listGroups = useMemo<AssetListGroup[]>(() => {
    const groupMap = new Map<string, AssetGroup>();
    const groupListMap = new Map<string, Asset[]>();

    groups.forEach(assetGroup => groupMap.set(assetGroup.id, assetGroup));
    list.forEach((asset) => {
      const groupId = asset.assetGroup.parentId || asset.assetGroup.id;
      const assetList = groupListMap.get(groupId) ?? [];
      assetList.push(asset);
      groupListMap.set(groupId, assetList);
    });

    return groups.flatMap((group) => {
      const assets = groupListMap.get(group.id);
      if (!assets)
        return [];

      return [{
        amount: assets.reduce((sum, asset) => math.add(sum, asset.amount).toNumber(), 0),
        id: group.id,
        list: assets,
        name: groupMap.get(group.id)?.name ?? group.name,
        type: group.type,
      }];
    });
  }, [groups, list]);

  const handleItemClick = useCallback((item: Asset) => () => {
    navigate(ROUTES_PATH.ASSET_DETAIL.getPath(item.id));
  }, [navigate]);

  const handleDelete = useCallback((item: Asset) => async () => {
    Dialog.confirm({
      title: t('manager.confirmDeleteTitle'),
      content: t('manager.confirmDeleteContent'),
      confirmText: t('manager.confirmDelete'),
      onConfirm: async () => {
        try {
          Toast.show({
            icon: 'loading',
            content: t('manager.deleting'),
          });
          await deleteAssetByIdMutate(item.id);
        }
        finally {
          Toast.clear();
        }
      },
    });
  }, [deleteAssetByIdMutate, t]);

  const parseAmount = useCallback((amount: string | number, type: 'add' | 'sub') => {
    return `${type === 'add' ? '' : '-'}¥${formatAmount(Number(amount))}`;
  }, []);

  if (isListLoading || isGroupLoading) {
    return (
      <div className="flex min-h-[260px] items-center justify-center rounded-[20px] border border-border-primary bg-white/70">
        <SpinLoading color="primary" />
      </div>
    );
  }

  if (isListError || isGroupError) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-[20px] border border-border-primary bg-white/75 px-5 shadow-ww-xs">
        <ErrorBlock description={t('manager.loadErrorDescription')} title={t('manager.loadError')} />
        <Button
          color="primary"
          fill="outline"
          onClick={() => void Promise.all([refetchList(), refetchGroups()])}
          size="small"
        >
          {t('common:button.retry')}
        </Button>
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between px-1 pb-[10px]">
        <h2 className="text-[14px] font-bold leading-[21px] text-ww-ink">{t('manager.accounts')}</h2>
        <span className="font-number text-[12px] font-semibold text-ww-soft">
          {t('manager.accountCount', { count: list.length })}
        </span>
      </div>
      {listGroups.length > 0
        ? (
            <div className="space-y-[12px]">
              {listGroups.map(group => (
                <section
                  className="overflow-hidden rounded-[20px] border border-border-primary bg-white/85 shadow-ww-xs backdrop-blur-xl"
                  key={group.id}
                >
                  <header className="flex h-[46px] items-center justify-between bg-[linear-gradient(90deg,rgba(226,246,255,0.72),rgba(255,242,247,0.45))] px-[18px]">
                    <div className="flex items-center gap-2">
                      <span className={group.type === 'add' ? 'h-2 w-2 rounded-full bg-[#58b888]' : 'h-2 w-2 rounded-full bg-[#d66b8f]'} />
                      <h3 className="text-[13px] font-bold text-ww-ink">{group.name}</h3>
                    </div>
                    <span className={group.type === 'add'
                      ? 'font-number text-[14px] font-extrabold text-[#2a9460]'
                      : 'font-number text-[14px] font-extrabold text-[#c04870]'}
                    >
                      {parseAmount(group.amount, group.type)}
                    </span>
                  </header>
                  <div>
                    {group.list.map((asset, index) => (
                      <SwipeAction
                        key={asset.id}
                        rightActions={[{
                          key: 'delete',
                          text: t('manager.confirmDelete'),
                          color: 'danger',
                          onClick: handleDelete(asset),
                        }]}
                      >
                        <button
                          className={index > 0
                            ? 'relative ml-[18px] flex h-[70px] w-[calc(100%-18px)] items-center gap-3 border-0 border-t border-solid border-[rgba(110,194,220,0.16)] bg-transparent pr-[14px] text-left'
                            : 'flex h-[70px] w-full items-center gap-3 border-0 bg-transparent px-[18px] text-left'}
                          onClick={handleItemClick(asset)}
                          type="button"
                        >
                          <IconBlock name={asset.assetGroup.icon} />
                          <span className="min-w-0 flex-1">
                            <span className="flex min-w-0 items-baseline gap-1.5">
                              <span className="truncate text-[14px] font-bold text-ww-ink">{asset.name}</span>
                              {asset.cardId && (
                                <span className="shrink-0 font-number text-[10px] text-ww-soft">
                                  ••••
                                  {asset.cardId}
                                </span>
                              )}
                            </span>
                            <span className="mt-0.5 block truncate text-[11px] leading-4 text-ww-mid">
                              {asset.comment || asset.assetGroup.name}
                            </span>
                          </span>
                          <span className="flex shrink-0 items-center gap-1.5">
                            <span className={asset.assetGroup.type === 'add'
                              ? 'font-number text-[15px] font-extrabold text-ww-ink'
                              : 'font-number text-[15px] font-extrabold text-[#c04870]'}
                            >
                              {parseAmount(asset.amount, asset.assetGroup.type)}
                            </span>
                            <ChevronRight className="text-ww-ghost" size={15} strokeWidth={2} />
                          </span>
                        </button>
                      </SwipeAction>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )
        : (
            <div className="overflow-hidden rounded-[20px] border border-border-primary bg-white/75 shadow-ww-xs backdrop-blur-xl">
              <IllustratedEmptyState
                accentIcon={<DesignIcon name="tab-add" size={20} />}
                className="min-h-[300px]"
                description={t('manager.emptyDescription')}
                icon={<DesignIcon name="discovery-asset" size={46} />}
                testId="asset-empty-state"
                title={t('manager.emptyTitle')}
              />
            </div>
          )}
    </section>
  );
};
