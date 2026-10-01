import type { CategoryGlyphName } from './category-icon-names';
import type { DesignIconName } from './design-icon-names';
import { designIconColors, designIconSvg } from './design-icon-assets';
import { designIconNames } from './design-icon-names';

export type IconAppearance = keyof typeof designIconColors;
export type IconTone = keyof typeof designIconColors.glass;

/** SVG image hosts cannot inherit the record icon container's CSS color. */
export function recordIconForeground(index: number, appearance: IconAppearance = 'glass') {
  const palette = designIconColors[appearance];
  return index % 4 === 1 ? palette.expense : index % 4 === 2 ? palette.income : palette.active;
}

/** Image hosts require an explicit stroke; SVG images do not inherit CSS color. */
export function designIconImageSource(name: DesignIconName, { appearance = 'glass', tone = 'inactive' }: { appearance?: IconAppearance; tone?: IconTone } = {}) {
  const svg = designIconSvg[designIconNames[name]].split('currentColor').join(designIconColors[appearance][tone]);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function categoryIconImageSource(glyph: CategoryGlyphName, { appearance = 'glass', color, tone = 'category' }: { appearance?: IconAppearance; color?: string; tone?: IconTone } = {}) {
  const svg = designIconSvg[glyph].split('currentColor').join(color ?? designIconColors[appearance][tone]);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
