import { type FC, useCallback, useMemo } from 'react';
import { List } from 'antd-mobile';
import { Icon } from 'bw-mobile';
import { useNavigate } from 'react-router-dom';
import { math } from '@/utils';
import { AssetGroupType, AssetType } from '@/types';
import { AssetGroupNameMap, ROUTES_PATH } from '@/constants';

export interface AssetItem {
  id: string;
  group: AssetGroupType;
  type: AssetType;
  name: string;
  icon: string;
  remark: string;
  money: string;
}

export const AssetList: FC = () => {
  const navigate = useNavigate();

  const list = [
    {
      id: '1',
      group: AssetGroupType.CASH,
      type: AssetType.CASH,
      name: '现金',
      icon: 'cash',
      remark: '这是流动资金',
      money: '50000.00',
    },
    {
      id: '2',
      group: AssetGroupType.VIRTUAL_ACCOUNT,
      type: AssetType.ALI_PAY,
      name: '支付宝',
      icon: 'alipay',
      remark: '这是支付宝',
      money: '90000.00',
    },
    {
      id: '3',
      group: AssetGroupType.DEBT,
      type: AssetType.WE_CHAT,
      name: '微信',
      icon: 'wechat',
      remark: '这是微信',
      money: '300000.00',
    },
    {
      id: '4',
      group: AssetGroupType.DEBT,
      type: AssetType.DEBT,
      name: '债权',
      icon: 'debt',
      remark: '这是债权',
      money: '2000.00',
    },
  ];

  const listGroup = useMemo(() => {
    const result: { type: AssetGroupType; name: string; amount: number; list: AssetItem[] }[] = [];
    const groupMap = new Map<AssetGroupType, AssetItem[]>();

    list.forEach((item) => {
      const group = item.group;
      const groupList = groupMap.get(group) || [];
      groupList.push(item);
      groupMap.set(group, groupList);
    });

    const sortOrder = [AssetGroupType.CASH, AssetGroupType.VIRTUAL_ACCOUNT, AssetGroupType.DEBT];

    sortOrder.forEach((type) => {
      if (groupMap.has(type)) {
        const list = groupMap.get(type)!;
        result.push({
          type,
          name: AssetGroupNameMap[type],
          amount: list.reduce((acc, item) => math.add(acc, item.money).toNumber(), 0),
          list,
        });
      }
    });

    return result;
  }, []);

  const handleItemClick = useCallback((item: AssetItem) => () => {
    navigate(ROUTES_PATH.ASSET_DETAIL.getPath(item.id));
  }, []);

  return (
    <div>
      {
        listGroup.map(group => (
          <List
            key={group.type}
            header={(
              <div className="flex justify-between items-center">
                <span>{group.name}</span>
                <span className="!text-[#999]">{group.amount}</span>
              </div>
            )}
          >
            {group.list.map((item, index) => (
              <List.Item
                className="!pl-[12px] !px-0"
                style={{
                  '--adm-color-weak': '#333',
                  '--adm-font-size-main': '11px',
                }}
                key={index}
                prefix={<div className="flex justify-center items-center bg-gray-100 rounded-md w-[40px] h-[40px]"><Icon className="text-2xl" name={item.icon} /></div>}
                description={item.remark}
                onClick={handleItemClick(item)}
                arrow={false}
                extra={item.money}
              >
                {item.name}
              </List.Item>
            ))}
          </List>
        ))
      }
    </div>
  );
};
