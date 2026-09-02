import type { AppearanceAccent, AppearanceTemplate, UserAppConfig } from '@/entities/user-app-config';
import { APPEARANCE_ACCENTS, APPEARANCE_TEMPLATES } from '@/entities/user-app-config';
import { APPEARANCE_CHANGE_EVENT } from '@/shared/lib/appearance-tokens';

export interface AppearancePreference {
  accent: AppearanceAccent;
  template: AppearanceTemplate;
}

export const DEFAULT_APPEARANCE: AppearancePreference = { accent: 'sky', template: 'glass' };

export const appearanceTemplateOptions: Array<{
  descriptionKey: string;
  labelKey: string;
  value: AppearanceTemplate;
}> = [
  { descriptionKey: 'appearance.templates.glassDescription', labelKey: 'appearance.templates.glass', value: 'glass' },
  { descriptionKey: 'appearance.templates.freshDescription', labelKey: 'appearance.templates.fresh', value: 'fresh' },
  { descriptionKey: 'appearance.templates.minimalDescription', labelKey: 'appearance.templates.minimal', value: 'minimal' },
];

export const appearanceAccentOptions: Array<{ labelKey: string; value: AppearanceAccent }> = [
  { labelKey: 'appearance.accents.sky', value: 'sky' },
  { labelKey: 'appearance.accents.coral', value: 'coral' },
  { labelKey: 'appearance.accents.lavender', value: 'lavender' },
  { labelKey: 'appearance.accents.mint', value: 'mint' },
];

export function readAppearancePreference(config?: Pick<UserAppConfig, 'appearanceAccent' | 'appearanceTemplate'>): AppearancePreference {
  return {
    accent: config?.appearanceAccent ?? DEFAULT_APPEARANCE.accent,
    template: config?.appearanceTemplate ?? DEFAULT_APPEARANCE.template,
  };
}

export function applyAppearancePreference(preference: AppearancePreference): void {
  if (typeof document === 'undefined')
    return;
  document.documentElement.dataset.appearanceAccent = preference.accent;
  document.documentElement.dataset.appearanceTemplate = preference.template;
  document.dispatchEvent(new Event(APPEARANCE_CHANGE_EVENT));
}

export function resetAppearancePreference(): void {
  applyAppearancePreference(DEFAULT_APPEARANCE);
}

export function isAppearanceTemplate(value: string): value is AppearanceTemplate {
  return APPEARANCE_TEMPLATES.includes(value as AppearanceTemplate);
}

export function isAppearanceAccent(value: string): value is AppearanceAccent {
  return APPEARANCE_ACCENTS.includes(value as AppearanceAccent);
}
