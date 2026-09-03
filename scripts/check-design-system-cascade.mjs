import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

const projectRoot = resolve(import.meta.dirname, '..');
const assetDirectory = resolve(projectRoot, 'dist/assets');
const css = readdirSync(assetDirectory)
  .filter(file => file.endsWith('.css'))
  .map(file => readFileSync(resolve(assetDirectory, file), 'utf8'))
  .join('\n');

const requiredUtilities = [
  'rgb(var(--ww-color-action-primary) / .2)',
  'rgb(var(--ww-color-fg) / .6)',
  'rgb(var(--ww-color-stroke) / .5)',
];

const failures = requiredUtilities
  .filter(utility => !css.includes(utility))
  .map(utility => `missing alpha-safe token utility: ${utility}`);

function surfaceRule(material) {
  return new RegExp(`\\.ww-surface--${material}\\{([^}]*)\\}`).exec(css)?.[1] ?? '';
}

for (const material of ['content', 'raised']) {
  if (/backdrop-filter/.test(surfaceRule(material)))
    failures.push(`${material} may not apply backdrop-filter`);
}

for (const material of ['chrome', 'floating']) {
  if (!/backdrop-filter/.test(surfaceRule(material)))
    failures.push(`${material} must own its backdrop-filter recipe`);
}

if (!/html\[data-appearance-template=minimal\]\{[^}]*--ww-material-chrome-blur:none/.test(css))
  failures.push('minimal must resolve chrome blur to none');

if (failures.length > 0) {
  console.error('WW Design System v2 cascade contract failed:');
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
