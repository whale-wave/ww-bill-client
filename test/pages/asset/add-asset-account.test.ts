import { describe, expect, it } from 'vitest';
import {
  getAssetGroupNavigationPath,
  getAssetGroupParentId,
} from '@/pages/asset/add-asset-account/model/asset-group-navigation';

describe('add asset account navigation', () => {
  it('reads the selected parent asset group from the navigation URL', () => {
    const query = new URLSearchParams('parentId=bank-card');

    expect(getAssetGroupParentId(query)).toBe('bank-card');
  });

  it('navigates a parent asset group to its child group list', () => {
    const bankCardGroup = {
      id: 'bank-card',
      assetType: 'normal' as const,
      type: 'add' as const,
    };
    const groups = [
      bankCardGroup,
      {
        id: 'debit-card',
        parentId: 'bank-card',
        assetType: 'bank' as const,
        type: 'add' as const,
      },
    ];

    expect(getAssetGroupNavigationPath(bankCardGroup, groups)).toBe('/asset/add-account?parentId=bank-card');
  });
});
