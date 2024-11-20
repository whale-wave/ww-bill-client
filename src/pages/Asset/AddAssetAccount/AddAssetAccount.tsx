import { type FC, useCallback } from 'react';
import { List } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { AssetGroupType } from '@/types';
import { AssetGroupNameMap, ROUTES_PATH } from '@/constants';
import { Icon, NavBar } from '@/components';

const AddAssetAccount: FC = () => {
  const navigate = useNavigate();

  const assetGroup = [
    {
      group: AssetGroupType.CASH,
      name: AssetGroupNameMap[AssetGroupType.CASH],
      icon: 'cash',
      single: true,
      onClick: () => {

      },
    },
    {
      group: AssetGroupType.VIRTUAL_ACCOUNT,
      name: AssetGroupNameMap[AssetGroupType.VIRTUAL_ACCOUNT],
      icon: 'alipay',
      description: '支付宝/微信',
      onClick: () => {},
    },
    {
      group: AssetGroupType.DEBT,
      name: AssetGroupNameMap[AssetGroupType.DEBT],
      description: '应收/借出',
      icon: 'debt',
      onClick: () => {},
    },
  ];

  const handleAddAsset = useCallback(() => {
    navigate(ROUTES_PATH.ASSET_ADD_FORM.getPath());
  }, []);

  return (
    <div className="page pt-[45px]">
      <NavBar back="返回">添加账户</NavBar>
      <List className="mt-2">
        {assetGroup.map(item => (
          <List.Item style={{ '--adm-font-size-main': '11px' }} key={item.group} prefix={<Icon className="text-2xl" name={item.icon} />} description={item.description} onClick={handleAddAsset}>
            {item.name}
          </List.Item>
        ))}
      </List>
    </div>
  );
};

export default AddAssetAccount;
