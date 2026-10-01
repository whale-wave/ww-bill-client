import type { CategoryGlyphName } from './category-icon-names';
import type { DesignIconName } from './design-icon-names';
import { designIconColors, designIconSvg } from './design-icon-assets';
import { designIconNames } from './design-icon-names';

export type IconAppearance = keyof typeof designIconColors;
export type IconTone = keyof typeof designIconColors.glass;

/** Image hosts require an explicit stroke; SVG images do not inherit CSS color. */
export function designIconImageSource(name: DesignIconName, { appearance = 'glass', tone = 'inactive' }: { appearance?: IconAppearance; tone?: IconTone } = {}) {
  const svg = designIconSvg[designIconNames[name]].split('currentColor').join(designIconColors[appearance][tone]);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function categoryIconImageSource(glyph: CategoryGlyphName, { appearance = 'glass', color }: { appearance?: IconAppearance; color?: string } = {}) {
  const svg = designIconSvg[glyph].split('currentColor').join(color ?? designIconColors[appearance].category);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
