import { type FC, useCallback, useMemo } from 'react';
import { List, SwipeAction } from 'antd-mobile';
import { Icon } from 'bw-mobile';
import { useNavigate } from 'react-router-dom';
import { math } from '@/utils';
import { ROUTES_PATH } from '@/constants';
import { useGetAssetQuery } from '@/hooks';
import type { Asset, AssetGroup } from '@/api';

export const AssetList: FC = () => {
  const navigate = useNavigate();
  const { data: list } = useGetAssetQuery();

  const listGroup = useMemo(() => {
    const result: { id: string; name: string; amount: number; list: Asset[] }[] = [];
    if (!list)
      return result;

    const groupMap = new Map<string, AssetGroup>();
    const groupListMap = new Map<string, Asset[]>();

    list.forEach((asset) => {
      const group = asset.assetGroup;
      groupMap.set(group.id, group);

      const groupId = group.id;
      const assetList = groupListMap.get(groupId) || [];
      assetList.push(asset);
      groupListMap.set(groupId, assetList);
    });

    const sortOrder = Array.from(groupListMap.keys()).sort();

    sortOrder.forEach((groupId) => {
      const assetList = groupListMap.get(groupId)!;
      result.push({
        id: groupId,
        name: groupMap.get(groupId)!.name,
        amount: assetList.reduce((sum, asset) => {
          // TODO: 可能是负债, 需要加负号
          return math.add(sum, asset.amount).toNumber();
        }, 0),
        list: assetList,
      });
    });

    return result;
  }, [list]);

  const handleItemClick = useCallback((item: Asset) => () => {
    navigate(ROUTES_PATH.ASSET_DETAIL.getPath(item.id));
  }, []);

  const handleDelete = useCallback((item: Asset) => () => {
    console.info('删除', item);
  }, []);

  return (
    <div>
      {
        listGroup.length > 0
          ? listGroup.map(group => (
            <List
              key={group.id}
              header={(
                <div className="flex justify-between items-center">
                  <span>{group.name}</span>
                  <span className="!text-[#999]">{group.amount}</span>
                </div>
              )}
            >
              {group.list.map(asset => (
                <SwipeAction
                  key={asset.id}
                  rightActions={[{
                    key: 'delete',
                    text: '删除',
                    color: 'danger',
                    onClick: handleDelete(asset),
                  }]}
                >
                  <List.Item
                    className="!pl-[12px] !px-0"
                    style={{
                      '--adm-color-weak': '#333',
                      '--adm-font-size-main': '11px',
                    }}
                    prefix={<div className="flex justify-center items-center bg-gray-100 rounded-md w-[40px] h-[40px]"><Icon className="text-2xl" name={asset.assetGroup.icon} /></div>}
                    description={asset.comment}
                    onClick={handleItemClick(asset)}
                    arrow={false}
                    extra={asset.amount}
                  >
                    {asset.name}
                  </List.Item>
                </SwipeAction>
              ))}
            </List>
          ))
          : <div className="text-center text-gray-500">暂无数据</div>
      }
    </div>
  );
};
