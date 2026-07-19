import type { FC } from 'react';
import { List } from 'antd-mobile';
import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetAssetGroupQuery } from '@/entities/asset';
import { useTranslation } from '@/shared/i18n';
import { Icon, NavBar } from '@/shared/ui';
import { getAssetGroupNavigationPath, getAssetGroupParentId } from './model/asset-group-navigation';

const AddAssetAccount: FC = () => {
  const { t } = useTranslation('asset');
  const navigate = useNavigate();
  const [query] = useSearchParams();
  const parentId = getAssetGroupParentId(query);

  const { data } = useGetAssetGroupQuery();

  const assetGroup = useMemo(() => {
    if (!data)
      return [];
    if (parentId) {
      return data.filter(i => i.parentId === parentId);
    }
    return data.filter(i => i.level === 0);
  }, [data, parentId]);

  const handleAddAsset = useCallback((item: (typeof assetGroup)[number]) => () => {
    navigate(getAssetGroupNavigationPath(item, data ?? []));
  }, [data, navigate]);

  return (
    <div className="page !overflow-auto">
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
