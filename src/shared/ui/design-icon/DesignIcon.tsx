import type { LucideIcon, LucideProps } from 'lucide-react';
import {
  ArrowLeft,
  ArrowRightLeft,
  Award,
  CalendarCheck2,
  CalendarDays,
  ChartColumn,
  ChartPie,
  ChevronDown,
  ChevronRight,
  Compass,
  Crown,
  Delete,
  Eye,
  EyeOff,
  Gift,
  MessageSquare,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  Settings,
  Star,
  UserRound,
  WalletCards,
} from 'lucide-react';

const iconComponents = {
  'action-asset': WalletCards,
  'action-exchange': ArrowRightLeft,
  'action-invoice': ReceiptText,
  'amount-hidden': EyeOff,
  'amount-visible': Eye,
  'avatar-edit': Pencil,
  'avatar-user': UserRound,
  'calendar': CalendarDays,
  'chart-selector-chevron': ChevronDown,
  'check-in': CalendarCheck2,
  'discovery-asset': WalletCards,
  'discovery-bill': ReceiptText,
  'discovery-budget': ChartPie,
  'editor-back': ArrowLeft,
  'editor-date': CalendarDays,
  'editor-delete': Delete,
  'list-chevron': ChevronRight,
  'mine-badge': Award,
  'mine-invite': Gift,
  'mine-message': MessageSquare,
  'mine-points': Star,
  'mine-settings': Settings,
  'period-chevron': ChevronRight,
  'search': Search,
  'shortcut-asset': WalletCards,
  'shortcut-bill': ReceiptText,
  'shortcut-budget': ChartPie,
  'tab-add': Plus,
  'tab-chart-active': ChartColumn,
  'tab-chart': ChartColumn,
  'tab-detail-active': ReceiptText,
  'tab-detail': ReceiptText,
  'tab-discovery-active': Compass,
  'tab-discovery': Compass,
  'tab-mine-active': UserRound,
  'tab-mine': UserRound,
  'vip-crown': Crown,
} as const satisfies Record<string, LucideIcon>;

export type DesignIconName = keyof typeof iconComponents;

export interface DesignIconProps extends Omit<LucideProps, 'ref' | 'size'> {
  alt?: string;
  name: DesignIconName;
  size?: number;
}

export function DesignIcon({ alt = '', className, name, size = 20, ...props }: DesignIconProps) {
  const Icon = iconComponents[name];
  const label = props['aria-label'] ?? (alt || undefined);
  const isDecorative = !label && !props['aria-labelledby'];

  return (
    <Icon
      aria-hidden={isDecorative || undefined}
      aria-label={label}
      className={`shrink-0 ${className ?? ''}`}
      data-design-icon={name}
      focusable="false"
      role={isDecorative ? undefined : 'img'}
      size={size}
      strokeWidth={1.8}
      {...props}
    />
  );
}
