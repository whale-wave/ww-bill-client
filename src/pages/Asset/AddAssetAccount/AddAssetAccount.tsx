import { type FC, useCallback, useMemo } from 'react';
import { List } from 'antd-mobile';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES_PATH } from '@/constants';
import { Icon, NavBar } from '@/components';
import { useGetAssetGroupQuery } from '@/hooks';
import type { AssetGroup } from '@/api';

const AddAssetAccount: FC = () => {
  const navigate = useNavigate();
  const [query] = useSearchParams();
  const parentId = query.get('parentId') || null;
  const title = query.get('title') || '账户';

  const { data } = useGetAssetGroupQuery();

  const assetGroup = useMemo(() => {
    if (!data)
      return [];
    if (parentId) {
      return data.filter(i => i.parentId === parentId);
    }
    return data.filter(i => i.level === 0);
  }, [data, parentId]);

  const hasChildren = useCallback((item: AssetGroup) => {
    if (!data)
      return false;
    return data.some(i => i.parentId === item.id);
  }, [data]);

  const handleAddAsset = useCallback((item: AssetGroup) => () => {
    if (hasChildren(item)) {
      navigate(`${ROUTES_PATH.ASSET_ADD_ACCOUNT.getPath()}?parentId=${item.id}&title=${item.name}`);
    }
    else {
      navigate(`${ROUTES_PATH.ASSET_ADD_FORM.getPath()}?groupId=${item.id}&title=${item.name}`);
    }
  }, []);

  return (
    <div className="page pt-[45px]">
      <NavBar back="返回">
        添加
        {title}
      </NavBar>
      <List className="mt-2">
        {assetGroup.map(item => (
          <List.Item style={{ '--adm-font-size-main': '11px' }} key={item.id} prefix={<Icon className="text-2xl" name={item.icon} />} description={item.description} onClick={handleAddAsset(item)}>
            {item.name}
          </List.Item>
        ))}
      </List>
    </div>
  );
};

export default AddAssetAccount;
