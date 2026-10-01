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
