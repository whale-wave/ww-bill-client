import type { AppearanceTemplate, UserAppConfig } from '@/entities/user-app-config';
import { APPEARANCE_TEMPLATES } from '@/entities/user-app-config';
import { APPEARANCE_CHANGE_EVENT } from '@/shared/lib/appearance-tokens';

export interface AppearancePreference {
  template: AppearanceTemplate;
}

export const DEFAULT_APPEARANCE: AppearancePreference = { template: 'glass' };

export const appearanceTemplateOptions: Array<{
  descriptionKey: string;
  labelKey: string;
  value: AppearanceTemplate;
}> = [
  { descriptionKey: 'appearance.templates.glassDescription', labelKey: 'appearance.templates.glass', value: 'glass' },
  { descriptionKey: 'appearance.templates.freshDescription', labelKey: 'appearance.templates.fresh', value: 'fresh' },
  { descriptionKey: 'appearance.templates.minimalDescription', labelKey: 'appearance.templates.minimal', value: 'minimal' },
];

export function readAppearancePreference(config?: Pick<UserAppConfig, 'appearanceTemplate'>): AppearancePreference {
  return {
    template: resolveAppearanceTemplate(config?.appearanceTemplate),
  };
}

export function applyAppearancePreference(preference: AppearancePreference): void {
  if (typeof document === 'undefined')
    return;
  delete document.documentElement.dataset.appearanceAccent;
  document.documentElement.dataset.appearanceTemplate = preference.template;
  document.dispatchEvent(new Event(APPEARANCE_CHANGE_EVENT));
}

export function resetAppearancePreference(): void {
  applyAppearancePreference(DEFAULT_APPEARANCE);
}

export function isAppearanceTemplate(value: unknown): value is AppearanceTemplate {
  return APPEARANCE_TEMPLATES.includes(value as AppearanceTemplate);
}

export function resolveAppearanceTemplate(value: unknown): AppearanceTemplate {
  return isAppearanceTemplate(value) ? value : DEFAULT_APPEARANCE.template;
}
