import type {
  FC,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
} from 'react';
import { TabBar as AntTabBar } from 'antd-mobile';
import {
  AddOutline,
  BillOutline,
  CompassOutline,
  HistogramOutline,
  UserOutline,
} from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { playSound, prefetchRoute } from '@/shared/lib';
import './tab-bar.scss';

export type PersonalTabKey
  = | 'detail'
    | 'chart'
    | 'bookkeeping'
    | 'discovery'
    | 'mine';

interface PersonalTab {
  key: PersonalTabKey;
  route: string;
  translationKey: string;
  icon: typeof BillOutline;
  prominent?: boolean;
}

const personalTabs: readonly PersonalTab[] = [
  {
    icon: BillOutline,
    key: 'detail',
    route: ROUTES_PATH.DETAIL.getPath(),
    translationKey: 'tabBar.detail',
  },
  {
    icon: HistogramOutline,
    key: 'chart',
    route: ROUTES_PATH.CHART.getPath(),
    translationKey: 'tabBar.chart',
  },
  {
    icon: AddOutline,
    key: 'bookkeeping',
    prominent: true,
    route: ROUTES_PATH.BOOKKEEPING.getPath(),
    translationKey: 'tabBar.bookkeeping',
  },
  {
    icon: CompassOutline,
    key: 'discovery',
    route: ROUTES_PATH.DISCOVERY.getPath(),
    translationKey: 'tabBar.discovery',
  },
  {
    icon: UserOutline,
    key: 'mine',
    route: ROUTES_PATH.MINE.getPath(),
    translationKey: 'tabBar.mine',
  },
];

function prefetchPersonalRoute(key: PersonalTabKey): void {
  prefetchRoute(`personal-${key}`);
}

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

export interface TabBarProps {
  /** String key used by the official Ant Design Mobile TabBar API. */
  activeKey?: PersonalTabKey;
  /** Temporary compatibility for pages that have not migrated to string keys yet. */
  active?: number;
}

export const TabBar: FC<TabBarProps> = ({ active, activeKey }) => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const resolvedActiveKey = activeKey ?? personalTabs[active ?? 0]?.key ?? 'detail';

  const handleChange = (key: string) => {
    const tab = personalTabs.find(item => item.key === key);
    if (!tab || tab.key === resolvedActiveKey)
      return;

    playSound.turnPage();
    navigate(tab.route);
  };

  const handlePrefetch = (
    event: ReactMouseEvent<HTMLDivElement> | ReactTouchEvent<HTMLDivElement>,
  ) => {
    const key = getPrefetchKey(event);
    if (key && personalTabs.some(tab => tab.key === key))
      prefetchPersonalRoute(key as PersonalTabKey);
  };

  return (
    <div className="ww-tab-bar-spacer">
      <div
        aria-label={t('tabBar.navigation')}
        className="ww-tab-bar ww-personal-tab-bar"
        onMouseOver={handlePrefetch}
        onTouchStart={handlePrefetch}
        role="tablist"
      >
        <AntTabBar activeKey={resolvedActiveKey} onChange={handleChange} safeArea>
          {personalTabs.map((tab) => {
            const Icon = tab.icon;
            const label = t(tab.translationKey);
            return (
              <AntTabBar.Item
                aria-disabled="false"
                className={tab.prominent ? 'ww-tab-bar__item--prominent' : undefined}
                data-prefetch-key={tab.key}
                data-route={tab.route}
                data-tab-key={tab.key}
                icon={active => (
                  <button
                    aria-selected={active}
                    className="ww-tab-bar__button"
                    onFocus={() => prefetchPersonalRoute(tab.key)}
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
};
