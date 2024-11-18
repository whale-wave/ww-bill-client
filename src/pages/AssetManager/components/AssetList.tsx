import { type FC, useCallback } from 'react';
import { List } from 'antd-mobile';

enum AssetGroupType {
  Cash = 'Cash',
  VirtualAccount = 'VirtualAccount',
  Debt = 'Debt',
}

enum AssetType {
  Cash = 'Cash',
  AliPay = 'AliPay',
  WeChat = 'WeChat',
  Debt = 'Debt',
}

export const AssetList: FC = () => {
  const list = [
    {
      group: AssetGroupType.Cash,
      type: AssetType.Cash,
      name: '现金',
      icon: 'cash',
      remark: '这是流动资金',
      money: '50000.00',
    },
    {
      group: AssetGroupType.VirtualAccount,
      type: AssetType.AliPay,
      name: '支付宝',
      icon: 'alipay',
      remark: '这是支付宝',
      money: '90000.00',
    },
    {
      group: AssetGroupType.Debt,
      type: AssetType.WeChat,
      name: '微信',
      icon: 'wechat',
      remark: '这是微信',
      money: '300000.00',
    },
    {
      group: AssetGroupType.Debt,
      type: AssetType.Debt,
      name: '债权',
      icon: 'debt',
      remark: '这是债权',
      money: '2000.00',
    },
  ];

  const handleItemClick = useCallback(() => () => {
  }, []);

  return (
    <div>
      <List header={(
        <div className="flex justify-between items-center">
          <span>资产</span>
          <span>10000</span>
        </div>
      )}
      >
        {list.map((item, index) => (
        // <AssetListItem key={index} />
          <List.Item
            key={index}
            prefix={item.icon}
            description={item.remark}
            onClick={handleItemClick(item)}
            arrow={false}
            extra={item.money}
          >
            {item.name}
          </List.Item>
        ))}
      </List>
    </div>
  );
};
