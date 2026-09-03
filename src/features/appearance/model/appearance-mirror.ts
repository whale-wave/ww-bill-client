import type { AppearancePreference } from './appearance';
import { DEFAULT_APPEARANCE, resolveAppearanceTemplate } from './appearance';

const MIRROR_KEY_PREFIX = 'ww:appearance:v2:';

function getMirrorKey(userId: string): string {
  return `${MIRROR_KEY_PREFIX}${userId}`;
}

export function readAppearancePreferenceMirror(userId?: string): AppearancePreference {
  if (!userId || typeof localStorage === 'undefined')
    return DEFAULT_APPEARANCE;

  try {
    const raw = localStorage.getItem(getMirrorKey(userId));
    if (!raw)
      return DEFAULT_APPEARANCE;

    const parsed: unknown = JSON.parse(raw);
    const template = typeof parsed === 'object' && parsed !== null && 'template' in parsed
      ? (parsed as { template?: unknown }).template
      : undefined;
    return { template: resolveAppearanceTemplate(template) };
  }
  catch {
    return DEFAULT_APPEARANCE;
  }
}

export function writeAppearancePreferenceMirror(userId: string | undefined, preference: AppearancePreference): void {
  if (!userId || typeof localStorage === 'undefined')
    return;

  try {
    localStorage.setItem(getMirrorKey(userId), JSON.stringify({
      template: resolveAppearanceTemplate(preference.template),
    }));
  }
  catch {
    // Appearance mirrors are only a paint-time optimisation. Storage failures
    // must never prevent a user from entering the application.
  }
}
