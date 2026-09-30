import { groupCategoriesByParent } from '@ww-bill/bill-core';
import { describe, expect, it } from 'vitest';

describe('groupCategoriesByParent', () => {
  it('keeps API order and groups children even when they precede their parent', () => {
    const categories = [
      { id: 11, parentId: 1, name: '午餐' },
      { id: 1, parentId: null, name: '餐饮' },
      { id: 12, parentId: 1, name: '晚餐' },
      { id: 2, parentId: null, name: '购物' },
    ];

    const result = groupCategoriesByParent(categories);

    expect(result.roots.map(category => category.name)).toEqual(['餐饮', '购物']);
    expect(result.childrenByParent.get(1)?.map(category => category.name)).toEqual(['午餐', '晚餐']);
    expect(categories.map(category => category.id)).toEqual([11, 1, 12, 2]);
  });
});
