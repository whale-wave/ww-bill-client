export function getCategoryIconForegroundColor(backgroundColor: string | null | undefined): string | undefined {
  if (!backgroundColor || !/^#[0-9A-F]{6}$/i.test(backgroundColor))
    return undefined;

  const channels = [1, 3, 5].map(index => Number.parseInt(backgroundColor.slice(index, index + 2), 16) / 255);
  const luminance = channels.reduce((sum, channel, index) => {
    const linear = channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    return sum + linear * [0.2126, 0.7152, 0.0722][index];
  }, 0);

  return luminance <= 0.24 ? 'var(--ww-ref-mono-white)' : undefined;
}
