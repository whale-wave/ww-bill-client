import { i18n } from '@/shared/i18n';
import { AssetGroupType } from './types';

export const AssetGroupNameMap = {
  [AssetGroupType.CASH]: i18n.t('asset:group.cash'),
  [AssetGroupType.VIRTUAL_ACCOUNT]: i18n.t('asset:group.virtualAccount'),
  [AssetGroupType.DEBT]: i18n.t('asset:group.debtClaim'),
} as Record<AssetGroupType, string>;
