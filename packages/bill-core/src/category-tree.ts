export interface CategoryNode {
  id: number;
  parentId?: number | null;
}

export function groupCategoriesByParent<T extends CategoryNode>(categories: readonly T[]) {
  const roots: T[] = [];
  const childrenByParent = new Map<number, T[]>();

  for (const category of categories) {
    if (!category.parentId) {
      roots.push(category);
      continue;
    }
    const siblings = childrenByParent.get(category.parentId) ?? [];
    siblings.push(category);
    childrenByParent.set(category.parentId, siblings);
  }

  return { roots, childrenByParent };
}
