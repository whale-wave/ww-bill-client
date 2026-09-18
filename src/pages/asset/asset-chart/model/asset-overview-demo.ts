import type { Asset, AssetGroup } from '@/entities/asset';
import { AssetGroupAssetType } from '@/entities/asset';

const timestamp = '2026-09-18T00:00:00.000Z';

function group(id: string, name: string, type: 'add' | 'sub', parentId = ''): AssetGroup {
  return {
    id,
    name,
    type,
    parentId,
    level: parentId ? 2 : 1,
    assetType: AssetGroupAssetType.NORMAL,
    createdAt: timestamp,
    updatedAt: timestamp,
    description: '',
    icon: '',
    fixedName: false,
  };
}

export const overviewDemoGroups = [
  group('cash', '流动资金', 'add'),
  group('investment', '投资账户', 'add'),
  group('property', '固定资产', 'add'),
  group('credit', '信用卡', 'sub'),
  group('mortgage', '房贷', 'sub'),
];

function account(id: string, name: string, amount: string, groupId: string): Asset {
  const assetGroup = overviewDemoGroups.find(item => item.id === groupId)!;
  return { id, name, amount, assetGroup, createdAt: timestamp, updatedAt: timestamp };
}

export const overviewDemoAssets = [
  account('home', '房产', '9230000', 'property'),
  account('car', '车辆', '465000', 'property'),
  account('stock', '股票', '1335800', 'investment'),
  account('fund', '基金', '35200', 'investment'),
  account('bank', '银行存款', '671900', 'cash'),
  account('wallet', '日常钱包', '84900', 'cash'),
  account('mortgage', '房贷', '4890000', 'mortgage'),
  account('credit', '信用卡', '249000', 'credit'),
];
