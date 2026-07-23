import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
} from 'react';
import type { LedgerCapability } from '@/entities/ledger';
import { TabBar as AntTabBar, Toast } from 'antd-mobile';
import { AddOutline, BillOutline, HistogramOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { LedgerCapability as Capability } from '@/entities/ledger';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { playSound, prefetchRoute } from '@/shared/lib';
import './tab-bar/tab-bar.scss';

export type LedgerWorkspaceTabKey = 'records' | 'create' | 'charts';

interface LedgerWorkspaceTab {
  key: LedgerWorkspaceTabKey;
  translationKey: string;
  icon: typeof BillOutline;
  prominent?: boolean;
}

const workspaceTabs: readonly LedgerWorkspaceTab[] = [
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
];

function getPrefetchKey(
  event: ReactMouseEvent<HTMLDivElement> | ReactTouchEvent<HTMLDivElement>,
) {
  if (!(event.target instanceof Element))
    return;
  return event.target.closest<HTMLElement>('[data-prefetch-key]')?.dataset.prefetchKey;
}

function handleTabArrowKey(event: ReactKeyboardEvent<HTMLButtonElement>) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key))
    return;

  const tabList = event.currentTarget.closest<HTMLElement>('[role="tablist"]');
  const tabs = Array.from(tabList?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []);
  const currentIndex = tabs.indexOf(event.currentTarget);
  if (currentIndex < 0 || !tabs.length)
    return;
  event.preventDefault();

  if (event.key === 'Home') {
    tabs[0]?.focus();
    return;
  }
  if (event.key === 'End') {
    tabs.at(-1)?.focus();
    return;
  }
  const direction = event.key === 'ArrowRight' ? 1 : -1;
  tabs[(currentIndex + direction + tabs.length) % tabs.length]?.focus();
}

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

  const handleChange = (key: string) => {
    const tab = workspaceTabs.find(item => item.key === key);
    if (!tab || tab.key === activeKey)
      return;
    if (tab.key === 'create' && !canCreate) {
      Toast.show(tLedger('workspace.createDenied'));
      return;
    }

    playSound.turnPage();
    navigate(routes[tab.key]);
  };

  const handlePrefetch = (
    event: ReactMouseEvent<HTMLDivElement> | ReactTouchEvent<HTMLDivElement>,
  ) => {
    const key = getPrefetchKey(event);
    if (!key || !workspaceTabs.some(tab => tab.key === key))
      return;
    if (key === 'create' && !canCreate)
      return;
    prefetchRoute(`ledger-${key}`);
  };

  return (
    <div className="ww-tab-bar-spacer">
      <div
        aria-label={tCommon('tabBar.navigation')}
        className="ww-tab-bar ww-ledger-workspace-tab-bar"
        onMouseOver={handlePrefetch}
        onTouchStart={handlePrefetch}
        role="tablist"
      >
        <AntTabBar activeKey={activeKey} onChange={handleChange} safeArea>
          {workspaceTabs.map((tab) => {
            const Icon = tab.icon;
            const disabled = tab.key === 'create' && !canCreate;
            const label = tCommon(tab.translationKey);
            return (
              <AntTabBar.Item
                aria-disabled={disabled ? 'true' : 'false'}
                className={[
                  tab.prominent ? 'ww-tab-bar__item--prominent' : '',
                  disabled ? 'ww-tab-bar__item--disabled' : '',
                ].filter(Boolean).join(' ') || undefined}
                data-prefetch-key={tab.key}
                data-route={routes[tab.key]}
                data-tab-key={tab.key}
                icon={active => (
                  <button
                    aria-disabled={disabled}
                    aria-selected={active}
                    className="ww-tab-bar__button"
                    onFocus={() => {
                      if (!disabled)
                        prefetchRoute(`ledger-${tab.key}`);
                    }}
                    onKeyDown={handleTabArrowKey}
                    role="tab"
                    tabIndex={active ? 0 : -1}
                    type="button"
                  >
                    <span className={tab.prominent
                      ? 'ww-tab-bar__button-icon ww-tab-bar__create-icon'
                      : 'ww-tab-bar__button-icon'}
                    >
                      <Icon aria-hidden="true" />
                    </span>
                    <span className="ww-tab-bar__button-label">{label}</span>
                  </button>
                )}
                key={tab.key}
              />
            );
          })}
        </AntTabBar>
      </div>
    </div>
  );
}
