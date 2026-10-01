import { categoryRowEndIndex, groupCategoriesByParent } from '@ww-bill/bill-core';
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

describe('categoryRowEndIndex', () => {
  it('keeps complete rows intact and clamps a partial last row', () => {
    expect(categoryRowEndIndex(0, 12)).toBe(4);
    expect(categoryRowEndIndex(4, 12)).toBe(4);
    expect(categoryRowEndIndex(5, 12)).toBe(9);
    expect(categoryRowEndIndex(10, 12)).toBe(11);
    expect(categoryRowEndIndex(-1, 12)).toBe(-1);
    expect(categoryRowEndIndex(0, 0)).toBe(-1);
  });
});
