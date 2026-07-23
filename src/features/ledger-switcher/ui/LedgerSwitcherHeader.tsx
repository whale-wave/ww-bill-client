import type { ReactNode } from 'react';
import { NavBar, SafeArea } from 'antd-mobile';
import { LedgerTitleSwitcher } from './LedgerTitleSwitcher';
import './ledger-switcher.scss';

export interface LedgerSwitcherHeaderAction {
  key: string;
  text: ReactNode;
  path?: string;
  onClick?: () => void;
}

export interface LedgerSwitcherHeaderProps {
  ledgerName?: string;
  /**
   * Kept for call-site compatibility. Existing page actions must remain in
   * their original page header instead of moving into a capsule menu.
   */
  leadingActions?: LedgerSwitcherHeaderAction[];
  titleContent?: ReactNode;
}

export function LedgerSwitcherHeader({
  ledgerName,
  titleContent,
}: LedgerSwitcherHeaderProps) {
  return (
    <div className="ledger-switcher-header-shell">
      <SafeArea position="top" />
      <NavBar
        back={null}
        backArrow={false}
        className="ledger-switcher-header"
      >
        {titleContent
          ? (
              <div
                className="ledger-switcher-header__business-title"
                data-testid="ledger-business-title"
              >
                {titleContent}
              </div>
            )
          : <LedgerTitleSwitcher ledgerName={ledgerName} />}
      </NavBar>
    </div>
  );
}
