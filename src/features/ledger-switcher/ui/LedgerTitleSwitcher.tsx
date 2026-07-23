import { DownFill } from 'antd-mobile-icons';
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLedgerNavigationQuery } from '@/entities/ledger';
import { useGetUserAppConfigQuery } from '@/entities/user-app-config';
import config from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { getLedgerWorkspaceScope } from '../model/ledger-navigation';
import { toLedgerSwitcherItems } from '../model/ledger-switcher-view-model';
import { LedgerSwitcherPanel } from './LedgerSwitcherPanel';
import './ledger-switcher.scss';

export interface LedgerTitleSwitcherProps {
  className?: string;
  ledgerName?: string;
}

export function LedgerTitleSwitcher({
  className,
  ledgerName,
}: LedgerTitleSwitcherProps) {
  const { t } = useTranslation('ledger');
  const location = useLocation();
  const ledgerQuery = useLedgerNavigationQuery();
  const appConfigQuery = useGetUserAppConfigQuery();
  const [panelVisible, setPanelVisible] = useState(false);
  const scope = getLedgerWorkspaceScope(location.pathname);
  const items = useMemo(
    () => toLedgerSwitcherItems(ledgerQuery.data),
    [ledgerQuery.data],
  );
  const currentCustom = scope.type === 'custom'
    ? items.find(item => item.type === 'custom' && item.ledgerId === scope.ledgerId)
    : undefined;
  const title = scope.type === 'personal'
    ? config.appName
    : currentCustom?.label ?? ledgerName ?? t('switcher.currentCustom');
  const quickSwitchEnabled = appConfigQuery.data?.isLedgerQuickSwitchEnabled === true;
  const classes = ['ledger-title-switcher', className].filter(Boolean).join(' ');

  return (
    <>
      {quickSwitchEnabled
        ? (
            <button
              aria-expanded={panelVisible}
              aria-haspopup="dialog"
              className={classes}
              data-testid="ledger-switcher-title"
              onClick={() => setPanelVisible(current => !current)}
              type="button"
            >
              <span>{title}</span>
              <DownFill aria-hidden="true" />
            </button>
          )
        : (
            <span
              aria-disabled="true"
              className={`${classes} ledger-title-switcher--static`}
              data-testid="ledger-switcher-title"
            >
              <span>{title}</span>
            </span>
          )}

      <LedgerSwitcherPanel
        onClose={() => setPanelVisible(false)}
        visible={panelVisible}
      />
    </>
  );
}
