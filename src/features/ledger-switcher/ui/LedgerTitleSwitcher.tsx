import { DownFill } from 'antd-mobile-icons';
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LedgerKind, LedgerVisualIcon, useLedgerNavigationQuery } from '@/entities/ledger';
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
    : currentCustom?.type === 'custom'
      ? currentCustom.label
      : ledgerName ?? t('switcher.currentCustom');
  const quickSwitchEnabled = appConfigQuery.data?.isLedgerQuickSwitchEnabled === true;
  const classes = ['ledger-title-switcher', className].filter(Boolean).join(' ');

  const visualIcon = (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[16px] bg-[linear-gradient(145deg,#6fc2dc_6.1733%,#4aaac4_93.827%)]">
      <LedgerVisualIcon
        className="h-4 w-4"
        iconKey={scope.type === 'custom' ? currentCustom?.iconKey : undefined}
        kind={scope.type === 'personal' ? LedgerKind.SYSTEM_DEFAULT : (currentCustom?.kind ?? LedgerKind.CUSTOM)}
        templateKey={scope.type === 'custom' ? currentCustom?.templateKey : undefined}
      />
    </span>
  );

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
              {visualIcon}
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
              {visualIcon}
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
