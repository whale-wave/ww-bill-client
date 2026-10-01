import type { DesignIconName } from '@ww-bill/bill-ui';
import type { LucideIcon, LucideProps } from 'lucide-react';
import { designIconNames } from '@ww-bill/bill-ui';
import {
  ArrowLeft,
  ArrowRightLeft,
  Award,
  CalendarCheck2,
  CalendarDays,
  ChartColumn,
  ChartPie,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Compass,
  Crown,
  Delete,
  Eye,
  EyeOff,
  Gift,
  LockKeyhole,
  Medal,
  MessageSquare,
  Pencil,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  Settings,
  Star,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react';

const iconComponents = {
  WalletCards,
  X,
  ArrowRightLeft,
  ReceiptText,
  EyeOff,
  Eye,
  Pencil,
  UserRound,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  CalendarCheck2,
  ChartPie,
  Check,
  ArrowLeft,
  Delete,
  ChevronRight,
  Award,
  Gift,
  LockKeyhole,
  Medal,
  MessageSquare,
  Star,
  Settings,
  Search,
  Plus,
  ChartColumn,
  Compass,
  CircleAlert,
  Clock3,
  RefreshCw,
  Crown,
} satisfies Record<string, LucideIcon>;

export type { DesignIconName } from '@ww-bill/bill-ui';

export interface DesignIconProps extends Omit<LucideProps, 'ref' | 'size'> {
  alt?: string;
  name: DesignIconName;
  size?: number;
}

export function DesignIcon({ alt = '', className, name, size = 20, ...props }: DesignIconProps) {
  const Icon = iconComponents[designIconNames[name]];
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
