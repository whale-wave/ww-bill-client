import type { LedgerCapability } from '@/entities/ledger';
import { Toast } from 'antd-mobile';
import { AddOutline, BillOutline, HistogramOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { LedgerCapability as Capability } from '@/entities/ledger';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { playSound, prefetchRoute } from '@/shared/lib';
import { BottomTabBarPresentation } from '@/shared/ui';

export type LedgerWorkspaceTabKey = 'records' | 'create' | 'charts';

const workspaceTabs = [
  {
    icon: BillOutline,
    key: 'records',
    translationKey: 'tabBar.detail',
  },
  {
    icon: AddOutline,
    key: 'create',
    prominent: true,
    translationKey: 'tabBar.bookkeeping',
  },
  {
    icon: HistogramOutline,
    key: 'charts',
    translationKey: 'tabBar.chart',
  },
] as const;

export interface LedgerWorkspaceTabBarProps {
  activeKey: LedgerWorkspaceTabKey;
  capabilities: readonly LedgerCapability[];
  ledgerId: string;
}

export function LedgerWorkspaceTabBar({
  activeKey,
  capabilities,
  ledgerId,
}: LedgerWorkspaceTabBarProps) {
  const { t: tCommon } = useTranslation('common');
  const { t: tLedger } = useTranslation('ledger');
  const navigate = useNavigate();
  const canCreate = capabilities.includes(Capability.RECORD_CREATE);
  const routes: Record<LedgerWorkspaceTabKey, string> = {
    charts: ROUTES_PATH.LEDGER_CHARTS.getPath(ledgerId),
    create: ROUTES_PATH.LEDGER_RECORD_CREATE.getPath(ledgerId),
    records: ROUTES_PATH.LEDGER_RECORDS.getPath(ledgerId),
  };

  const handleChange = (key: LedgerWorkspaceTabKey) => {
    if (key === 'create' && !canCreate) {
      Toast.show(tLedger('workspace.createDenied'));
      return;
    }
    playSound.turnPage();
    navigate(routes[key]);
  };

  return (
    <BottomTabBarPresentation
      activeKey={activeKey}
      ariaLabel={tCommon('tabBar.navigation')}
      items={workspaceTabs.map((tab) => {
        const Icon = tab.icon;
        const disabled = tab.key === 'create' && !canCreate;
        return {
          disabled,
          icon: <Icon aria-hidden="true" />,
          key: tab.key,
          label: tCommon(tab.translationKey),
          onPrefetch: () => prefetchRoute(`ledger-${tab.key}`),
          onSelect: () => handleChange(tab.key),
          prominent: 'prominent' in tab && tab.prominent,
          route: routes[tab.key],
        };
      })}
    />
  );
}
