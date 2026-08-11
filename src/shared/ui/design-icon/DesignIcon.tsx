import type { ImgHTMLAttributes } from 'react';
import actionAsset from '@/assets/icons/figma/action-asset.svg';
import actionExchange from '@/assets/icons/figma/action-exchange.svg';
import actionInvoice from '@/assets/icons/figma/action-invoice.svg';
import amountHidden from '@/assets/icons/figma/amount-hidden.svg';
import amountVisible from '@/assets/icons/figma/amount-visible.svg';
import avatarEdit from '@/assets/icons/figma/avatar-edit.svg';
import avatarUser from '@/assets/icons/figma/avatar-user.svg';
import calendar from '@/assets/icons/figma/calendar.svg';
import chartSelectorChevron from '@/assets/icons/figma/chart-selector-chevron.svg';
import checkIn from '@/assets/icons/figma/check-in.svg';
import discoveryAsset from '@/assets/icons/figma/discovery-asset.svg';
import discoveryBill from '@/assets/icons/figma/discovery-bill.svg';
import discoveryBudget from '@/assets/icons/figma/discovery-budget.svg';
import editorBack from '@/assets/icons/figma/editor-back.svg';
import editorDate from '@/assets/icons/figma/editor-date.svg';
import editorDelete from '@/assets/icons/figma/editor-delete.svg';
import ledger from '@/assets/icons/figma/ledger.svg';
import listChevron from '@/assets/icons/figma/list-chevron.svg';
import mineBadge from '@/assets/icons/figma/mine-badge.svg';
import mineInvite from '@/assets/icons/figma/mine-invite.svg';
import mineMessage from '@/assets/icons/figma/mine-message.svg';
import minePoints from '@/assets/icons/figma/mine-points.svg';
import mineSettings from '@/assets/icons/figma/mine-settings.svg';
import periodChevron from '@/assets/icons/figma/period-chevron.svg';
import search from '@/assets/icons/figma/search.svg';
import shortcutAsset from '@/assets/icons/figma/shortcut-asset.svg';
import shortcutBill from '@/assets/icons/figma/shortcut-bill.svg';
import shortcutBudget from '@/assets/icons/figma/shortcut-budget.svg';
import tabAdd from '@/assets/icons/figma/tab-add.svg';
import tabChartActive from '@/assets/icons/figma/tab-chart-active.svg';
import tabChart from '@/assets/icons/figma/tab-chart.svg';
import tabDetailActive from '@/assets/icons/figma/tab-detail-active.svg';
import tabDetail from '@/assets/icons/figma/tab-detail.svg';
import tabDiscoveryActive from '@/assets/icons/figma/tab-discovery-active.svg';
import tabDiscovery from '@/assets/icons/figma/tab-discovery.svg';
import tabMineActive from '@/assets/icons/figma/tab-mine-active.svg';
import tabMine from '@/assets/icons/figma/tab-mine.svg';
import vipCrown from '@/assets/icons/figma/vip-crown.svg';

const iconSources = {
  'action-asset': actionAsset,
  'action-exchange': actionExchange,
  'action-invoice': actionInvoice,
  'amount-hidden': amountHidden,
  'amount-visible': amountVisible,
  'avatar-edit': avatarEdit,
  'avatar-user': avatarUser,
  'calendar': calendar,
  'chart-selector-chevron': chartSelectorChevron,
  'check-in': checkIn,
  'discovery-asset': discoveryAsset,
  'discovery-bill': discoveryBill,
  'discovery-budget': discoveryBudget,
  'editor-back': editorBack,
  'editor-date': editorDate,
  'editor-delete': editorDelete,
  'ledger': ledger,
  'list-chevron': listChevron,
  'mine-badge': mineBadge,
  'mine-invite': mineInvite,
  'mine-message': mineMessage,
  'mine-points': minePoints,
  'mine-settings': mineSettings,
  'period-chevron': periodChevron,
  'search': search,
  'shortcut-asset': shortcutAsset,
  'shortcut-bill': shortcutBill,
  'shortcut-budget': shortcutBudget,
  'tab-add': tabAdd,
  'tab-chart-active': tabChartActive,
  'tab-chart': tabChart,
  'tab-detail-active': tabDetailActive,
  'tab-detail': tabDetail,
  'tab-discovery-active': tabDiscoveryActive,
  'tab-discovery': tabDiscovery,
  'tab-mine-active': tabMineActive,
  'tab-mine': tabMine,
  'vip-crown': vipCrown,
} as const;

export type DesignIconName = keyof typeof iconSources;

export interface DesignIconProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'height' | 'src' | 'width'> {
  name: DesignIconName;
  size?: number;
}

export function DesignIcon({ alt = '', name, size = 20, ...props }: DesignIconProps) {
  return (
    <img
      alt={alt}
      data-design-icon={name}
      height={size}
      src={iconSources[name]}
      width={size}
      {...props}
    />
  );
}
