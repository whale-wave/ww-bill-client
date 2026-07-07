import type { FC } from 'react';
import type { Asset, AssetGroup } from '@/entities/asset';
import { Dialog, ErrorBlock, List, SwipeAction, Toast } from 'antd-mobile';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDeleteAssetByIdMutation, useGetAssetGroupQuery, useGetAssetQuery } from '@/entities/asset';
import { ROUTES_PATH } from '@/shared/config/routes';
import { formatAmount, math } from '@/shared/lib';
import { IconBlock } from '../../ui';
import styles from './AssetList.module.scss';

export const AssetList: FC = () => {
  const { t } = useTranslation('asset');
  const navigate = useNavigate();
  const { data: list } = useGetAssetQuery();
  const [deleteAssetByIdMutate] = useDeleteAssetByIdMutation();
  const { data: group } = useGetAssetGroupQuery();
  const groupIds = useMemo(() => {
    if (!group)
      return [];
    return group.map(item => item.id);
  }, [group]);

  const listGroup = useMemo(() => {
    const result: { id: string; name: string; type: 'add' | 'sub'; amount: number; list: Asset[] }[] = [];
    if (!list || !group)
      return result;

    const groupMap = new Map<string, AssetGroup>();
    const groupListMap = new Map<string, Asset[]>();

    group.forEach((assetGroup) => {
      groupMap.set(assetGroup.id, assetGroup);
    });

    list.forEach((asset) => {
      const groupId = asset.assetGroup.parentId ? asset.assetGroup.parentId : asset.assetGroup.id;
      const assetList = groupListMap.get(groupId) || [];
      assetList.push(asset);
      groupListMap.set(groupId, assetList);
    });

    groupIds.filter(id => groupListMap.has(id)).forEach((groupId) => {
      const assetList = groupListMap.get(groupId)!;
      result.push({
        id: groupId,
        name: groupMap.get(groupId)!.name,
        type: groupMap.get(groupId)!.type,
        amount: assetList.reduce((sum, asset) => {
          return math.add(sum, asset.amount).toNumber();
        }, 0),
        list: assetList,
      });
    });

    return result;
  }, [list, groupIds]);

  const handleItemClick = useCallback((item: Asset) => () => {
    navigate(ROUTES_PATH.ASSET_DETAIL.getPath(item.id));
  }, []);

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
  }, []);

  const parseAmount = useCallback((amount: string | number, type: 'add' | 'sub') => {
    const amountNumber = formatAmount(Number(amount)).toString();
    return type === 'add' ? amountNumber : `-${amountNumber}`;
  }, []);

  return (
    <div className={styles['asset-list']}>
      {
        listGroup.length > 0
          ? listGroup.map(group => (
              <List
                key={group.id}
                header={(
                  <div className="flex justify-between items-center">
                    <span>{group.name}</span>
                    <span className="!text-[#999]">
                      {parseAmount(group.amount.toString(), group.type)}
                    </span>
                  </div>
                )}
              >
                {group.list.map(asset => (
                  <SwipeAction
                    key={asset.id}
                    rightActions={[{
                      key: 'delete',
                      text: t('manager.confirmDelete'),
                      color: 'danger',
                      onClick: handleDelete(asset),
                    }]}
                  >
                    <List.Item
                      className="!pl-[12px] !px-0"
                      style={{
                        // eslint-disable-next-line ts/ban-ts-comment
                        // @ts-expect-error
                        '--adm-color-weak': '#333',
                        '--adm-font-size-main': '11px',
                      }}
                      prefix={<IconBlock name={asset.assetGroup.icon} />}
                      description={asset.comment}
                      onClick={handleItemClick(asset)}
                      arrow={false}
                      extra={parseAmount(asset.amount, asset.assetGroup.type)}
                    >
                      {asset.name}
                      {asset.cardId ? `(${asset.cardId})` : ''}
                    </List.Item>
                  </SwipeAction>
                ))}
              </List>
            ))
          : <div className="my-[80px]"><ErrorBlock status="empty" description={t("manager.emptyDescription")} /></div>
      }
    </div>
  );
};
