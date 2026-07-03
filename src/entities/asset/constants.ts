import { AssetGroupType } from './types';

export const AssetGroupNameMap = {
  [AssetGroupType.CASH]: '现金',
  [AssetGroupType.VIRTUAL_ACCOUNT]: '虚拟账户',
  [AssetGroupType.DEBT]: '债权',
} as Record<AssetGroupType, string>;
