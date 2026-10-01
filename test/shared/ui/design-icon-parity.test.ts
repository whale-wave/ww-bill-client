import { categoryIconImageSource, categoryIconNames, designIconImageSource, designIconNames } from '@ww-bill/bill-ui';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CategoryIcon } from '@/entities/category';
import { DesignIcon } from '@/shared/ui/design-icon';

describe('shared design icons', () => {
  it('uses the same official glyph geometry and stroke on both hosts', () => {
    for (const name of Object.keys(designIconNames) as (keyof typeof designIconNames)[]) {
      const miniappSvg = decodeURIComponent(designIconImageSource(name).split(',').slice(1).join(','));
      const webSvg = renderToStaticMarkup(createElement(DesignIcon, { name, size: 24 }));
      const parser = new DOMParser();
      const miniapp = parser.parseFromString(miniappSvg, 'image/svg+xml').documentElement;
      const web = parser.parseFromString(webSvg, 'image/svg+xml').documentElement;
      expect(miniapp.innerHTML, name).toBe(web.innerHTML);
      expect(miniapp.getAttribute('viewBox'), name).toBe(web.getAttribute('viewBox'));
      expect(miniapp.getAttribute('stroke-width'), name).toBe(web.getAttribute('stroke-width'));
    }
  });
  it('uses the same category glyph paths for every builtin key', () => {
    for (const [iconKey, glyph] of Object.entries(categoryIconNames)) {
      const miniappSvg = decodeURIComponent(categoryIconImageSource(glyph, { color: 'currentColor' }).split(',').slice(1).join(','));
      const webSvg = renderToStaticMarkup(createElement(CategoryIcon, { iconKey, size: 24 }));
      const parser = new DOMParser();
      const miniapp = parser.parseFromString(miniappSvg, 'image/svg+xml').documentElement;
      const web = parser.parseFromString(webSvg, 'image/svg+xml').documentElement;
      expect(miniapp.innerHTML, iconKey).toBe(web.innerHTML);
      expect(miniapp.getAttribute('stroke-width'), iconKey).toBe(web.getAttribute('stroke-width'));
    }
  });
});
