export type LocaleTree = Record<string, unknown>;

export function flattenLocaleKeys(value: LocaleTree, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === 'object' && !Array.isArray(child)
      ? flattenLocaleKeys(child as LocaleTree, path)
      : [path];
  });
}

export function compareLocaleKeys(
  reference: LocaleTree,
  candidate: LocaleTree,
): { extra: string[]; missing: string[] } {
  const referenceKeys = new Set(flattenLocaleKeys(reference));
  const candidateKeys = new Set(flattenLocaleKeys(candidate));

  return {
    extra: [...candidateKeys].filter(key => !referenceKeys.has(key)).sort(),
    missing: [...referenceKeys].filter(key => !candidateKeys.has(key)).sort(),
  };
}
