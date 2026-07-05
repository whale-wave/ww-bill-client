import { useTranslation } from '@/shared/i18n';
import type { FC } from 'react';
import { AddAssetAccountButton, AssetHeader, AssetInfoCard, AssetList, AssetTabBar } from './ui';

const AssetManager: FC = () => {
  return (
    <div className="page pt-[52px] !overflow-auto">
      <AssetHeader />
      <div className="flex-grow px-4 pb-8">
        <AssetInfoCard />
        <AssetList />
        <AddAssetAccountButton />
      </div>
      <AssetTabBar activeKey="home" />
    </div>
  );
};

export default AssetManager;
