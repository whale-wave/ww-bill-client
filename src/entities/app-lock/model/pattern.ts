export const APP_LOCK_MIN_POINTS = 4;

export function normalizePattern(pattern: number[]) {
  return [...new Set(pattern)].filter(point => point >= 1 && point <= 9);
}

export function isTooSimplePattern(pattern: number[]) {
  const normalized = normalizePattern(pattern);
  if (normalized.length < APP_LOCK_MIN_POINTS)
    return true;
  const straightLines = [
    [1, 2, 3, 4, 5],
    [2, 3, 4, 5, 6],
    [3, 4, 5, 6, 7],
    [4, 5, 6, 7, 8],
    [5, 6, 7, 8, 9],
    [1, 4, 7, 8, 9],
    [2, 5, 8, 9],
    [3, 6, 9, 8],
  ];
  return straightLines.some(line =>
    line.every((point, index) => normalized[index] === point),
  );
}

export function serializePattern(pattern: number[]) {
  return normalizePattern(pattern).join('-');
}
