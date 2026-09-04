import type { FC } from 'react';
import type { AssetViewMode } from './ui';
import { useCallback, useState } from 'react';
import { useGetAssetQuery } from '@/entities/asset';
import { AddAssetAccountButton, AssetHeader, AssetInfoCard, AssetList, AssetTabBar, AssetViewModeToggle, AssetWalletPack } from './ui';

const ASSET_VIEW_MODE_STORAGE_KEY = 'ww-bill:asset-view-mode';

function getInitialAssetViewMode(): AssetViewMode {
  try {
    const storedValue = globalThis.localStorage?.getItem(ASSET_VIEW_MODE_STORAGE_KEY);
    return storedValue === 'wallet' ? 'wallet' : 'list';
  }
  catch {
    return 'list';
  }
}

const AssetManager: FC = () => {
  const [viewMode, setViewMode] = useState<AssetViewMode>(getInitialAssetViewMode);
  const { data: assets } = useGetAssetQuery();
  const hasAssets = assets.length > 0;
  const shouldShowAddAccountButton = viewMode === 'list' || hasAssets;

  const handleViewModeChange = useCallback((nextViewMode: AssetViewMode) => {
    setViewMode(nextViewMode);
    try {
      globalThis.localStorage?.setItem(ASSET_VIEW_MODE_STORAGE_KEY, nextViewMode);
    }
    catch {
      // Keep the current session's selection when persistent storage is unavailable.
    }
  }, []);

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-16 h-56 w-56 rounded-full bg-primary-light/45 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-12 h-48 w-48 rounded-full bg-ww-pink/15 blur-3xl" />
      <AssetHeader />
      <main className="ww-tab-bar-scroll-padding relative z-[1] min-h-0 flex-grow overflow-y-auto px-[18px] pt-2">
        <div className="mx-auto max-w-[520px] space-y-[14px] pb-4">
          <AssetViewModeToggle onChange={handleViewModeChange} value={viewMode} />
          {viewMode === 'list'
            ? (
                <>
                  {hasAssets && <AssetInfoCard />}
                  <AssetList />
                </>
              )
            : <AssetWalletPack />}
          {shouldShowAddAccountButton && <AddAssetAccountButton />}
        </div>
      </main>
      <AssetTabBar activeKey="home" />
    </div>
  );
};

export default AssetManager;
