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

/** Keep an expanded category panel below its complete five-column row. */
export function categoryRowEndIndex(index: number, count: number): number {
  if (index < 0 || index >= count)
    return -1;
  return Math.min(count - 1, Math.floor(index / 5) * 5 + 4);
}
