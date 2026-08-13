import type { FC } from 'react';
import { ChartNoAxesCombined, WalletCards } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
import { BottomTabBarPresentation } from '@/shared/ui';

export const AssetTabBar: FC<{ activeKey: string }> = ({ activeKey }) => {
  const { t } = useTranslation('asset');
  const navigate = useNavigate();

  const tabs = [
    {
      key: 'home',
      label: t('tab.assets'),
      icon: <WalletCards size={19} strokeWidth={1.9} />,
      onSelect: () => {
        navigate(ROUTES_PATH.ASSET.getPath(), { replace: true });
      },
      route: ROUTES_PATH.ASSET.getPath(),
    },
    {
      key: 'chart',
      label: t('tab.chart'),
      icon: <ChartNoAxesCombined size={19} strokeWidth={1.9} />,
      onSelect: () => {
        navigate(ROUTES_PATH.ASSET_CHART.getPath(), { replace: true });
      },
      route: ROUTES_PATH.ASSET_CHART.getPath(),
    },
  ] as const;

  return (
    <BottomTabBarPresentation
      activeKey={activeKey}
      ariaLabel={t('manager.navigation')}
      items={tabs}
    />
  );
};
