import type { FC } from 'react';
import { AddAssetAccountButton, AssetHeader, AssetInfoCard, AssetList } from './components';

const AssetManager: FC = () => {
  return (
    <div className="page pt-[52px] !overflow-auto">
      <AssetHeader />
      <div className="flex-grow px-3">
        <AssetInfoCard />
        <AssetList />
        <AddAssetAccountButton />
      </div>
      {/* <AssetTabBar /> */}
    </div>
  );
};

export default AssetManager;
