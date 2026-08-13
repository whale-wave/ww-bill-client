import type { FC } from 'react';
import { AddAssetAccountButton, AssetHeader, AssetInfoCard, AssetList, AssetTabBar } from './ui';

const AssetManager: FC = () => {
  return (
    <div className="page-new overflow-hidden">
      <AssetHeader />
      <main className="ww-tab-bar-scroll-padding min-h-0 flex-grow overflow-y-auto px-[18px]">
        <div className="space-y-[14px] pb-4">
          <AssetInfoCard />
          <AssetList />
          <AddAssetAccountButton />
        </div>
      </main>
      <AssetTabBar activeKey="home" />
    </div>
  );
};

export default AssetManager;
