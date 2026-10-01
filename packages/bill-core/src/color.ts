export function withColorAlpha(hexColor: string, alpha: number): string {
  const normalized = hexColor.replace('#', '');
  const expanded = normalized.length === 3
    ? normalized.split('').map(value => `${value}${value}`).join('')
    : normalized;
  if (!/^[\da-f]{6}$/i.test(expanded))
    return hexColor;
  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
