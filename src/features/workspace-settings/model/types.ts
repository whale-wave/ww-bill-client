import type { ReactNode } from 'react';
import type { LedgerUserSummary } from '@/entities/ledger';

export type SettingsIconKey
  = | 'account'
    | 'about'
    | 'appearance'
    | 'archive'
    | 'calendar'
    | 'category'
    | 'desktop'
    | 'export'
    | 'help'
    | 'language'
    | 'lock'
    | 'member'
    | 'record'
    | 'shortcut'
    | 'storage'
    | 'tag';

interface SettingsRowBase {
  description?: ReactNode;
  disabled?: boolean;
  icon: SettingsIconKey;
  id: string;
  label: ReactNode;
}

export interface SettingsLinkRow extends SettingsRowBase {
  kind: 'link';
  onClick: () => void;
  value?: ReactNode;
}

export interface SettingsValueRow extends SettingsRowBase {
  kind: 'value';
  value: ReactNode;
}

export interface SettingsSwitchRow extends SettingsRowBase {
  checked: boolean;
  kind: 'switch';
  onChange: (checked: boolean) => void;
}

export interface SettingsAvatarStackRow extends SettingsRowBase {
  avatars: Array<{ alt: string; id: string | number; name?: string; src?: string }>;
  kind: 'avatarStack';
  onClick: () => void;
  overflowCount?: number;
}

export interface SettingsActionRow extends SettingsRowBase {
  danger?: boolean;
  kind: 'action';
  onClick: () => void;
  value?: ReactNode;
}

export interface SettingsPlaceholderRow extends SettingsRowBase {
  kind: 'placeholder';
  onClick: () => void;
}

export type SettingsOverviewRow
  = | SettingsActionRow
    | SettingsAvatarStackRow
    | SettingsLinkRow
    | SettingsPlaceholderRow
    | SettingsSwitchRow
    | SettingsValueRow;

export interface SettingsOverviewSection {
  id: string;
  rows: SettingsOverviewRow[];
  title?: ReactNode;
}

export interface MemberCardItem {
  avatar?: string;
  badge?: ReactNode;
  description?: ReactNode;
  id: string;
  isCurrent?: boolean;
  name: ReactNode;
  onClick?: () => void;
  user?: Partial<LedgerUserSummary>;
  userId: ReactNode;
}
