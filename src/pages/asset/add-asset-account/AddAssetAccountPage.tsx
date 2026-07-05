import type { FC } from 'react';
import type { AssetGroup } from '@/entities/asset';
import { List } from 'antd-mobile';
import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetAssetGroupQuery } from '@/entities/asset';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { Icon, NavBar } from '@/shared/ui';

const AddAssetAccount: FC = () => {
  const { t } = useTranslation('asset');
  const navigate = useNavigate();
  const [query] = useSearchParams();
  const parentId = query.get('parentId') || null;

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
      navigate(`${ROUTES_PATH.ASSET_ADD_ACCOUNT.getPath()}?parentId=${item.id}`);
    }
    else {
      navigate(`${ROUTES_PATH.ASSET_ADD_FORM.getPath()}?groupId=${item.id}&assetType=${item.assetType}&type=${item.type}`);
    }
  }, []);

  return (
    <div className="page pt-[45px] !overflow-auto">
      <NavBar back={t('common:nav.back')}>
        {t('addAccount')}
      </NavBar>
      <List className="mt-2">
        {assetGroup.map(item => (
          // eslint-disable-next-line ts/ban-ts-comment
          // @ts-expect-error
          <List.Item style={{ '--adm-font-size-main': '11px' }} key={item.id} prefix={<Icon className="text-2xl" name={item.icon} />} description={item.description} onClick={handleAddAsset(item)}>
            {item.name}
          </List.Item>
        ))}
      </List>
    </div>
  );
};

export default AddAssetAccount;
