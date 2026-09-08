import type { DesignIconName } from '@/shared/ui';
import { ROUTES_PATH } from '@/shared/config/routes';

export type PersonalTabKey
  = | 'detail'
    | 'chart'
    | 'bookkeeping'
    | 'discovery'
    | 'mine';

export interface PersonalTab {
  icon: DesignIconName;
  iconActive?: DesignIconName;
  key: PersonalTabKey;
  prominent?: boolean;
  route: string;
  translationKey: string;
}

export const PERSONAL_TABS: readonly PersonalTab[] = [
  {
    icon: 'tab-detail',
    iconActive: 'tab-detail-active',
    key: 'detail',
    route: ROUTES_PATH.DETAIL.getPath(),
    translationKey: 'tabBar.detail',
  },
  {
    icon: 'tab-chart',
    iconActive: 'tab-chart-active',
    key: 'chart',
    route: ROUTES_PATH.CHART.getPath(),
    translationKey: 'tabBar.chart',
  },
  {
    icon: 'tab-add',
    key: 'bookkeeping',
    prominent: true,
    route: ROUTES_PATH.BOOKKEEPING.getPath(),
    translationKey: 'tabBar.bookkeeping',
  },
  {
    icon: 'tab-discovery',
    iconActive: 'tab-discovery-active',
    key: 'discovery',
    route: ROUTES_PATH.DISCOVERY.getPath(),
    translationKey: 'tabBar.discovery',
  },
  {
    icon: 'tab-mine',
    iconActive: 'tab-mine-active',
    key: 'mine',
    route: ROUTES_PATH.MINE.getPath(),
    translationKey: 'tabBar.mine',
  },
];

export const PERSONAL_SWIPE_TABS = PERSONAL_TABS.filter(tab => !tab.prominent);
