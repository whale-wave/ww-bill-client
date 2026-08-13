import type { FC } from 'react';
import { AddAssetAccountButton, AssetHeader, AssetInfoCard, AssetList, AssetTabBar } from './ui';

const AssetManager: FC = () => {
  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-16 h-56 w-56 rounded-full bg-primary-light/45 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-12 h-48 w-48 rounded-full bg-ww-pink/15 blur-3xl" />
      <AssetHeader />
      <main className="ww-tab-bar-scroll-padding relative z-[1] min-h-0 flex-grow overflow-y-auto px-[18px] pt-2">
        <div className="mx-auto max-w-[520px] space-y-[14px] pb-4">
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
