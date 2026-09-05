import type { AppearanceTemplate, UserAppConfig } from '@/entities/user-app-config';
import { APPEARANCE_TEMPLATES } from '@/entities/user-app-config';
import { APPEARANCE_CHANGE_EVENT } from '@/shared/lib/appearance-tokens';
import { MONO_DEVELOPMENT_TEMPLATE, MONO_DEVELOPMENT_TOKENS } from './development-appearance';

export interface AppearancePreference {
  template: AppearanceTemplate;
}

export type DevelopmentAppearanceTemplate = AppearanceTemplate | typeof MONO_DEVELOPMENT_TEMPLATE;

export const DEFAULT_APPEARANCE: AppearancePreference = { template: 'glass' };

export interface AppearanceTemplateOption {
  descriptionKey: string;
  labelKey: string;
  value: AppearanceTemplate;
}

export const appearanceTemplateOptions: AppearanceTemplateOption[] = [
  { descriptionKey: 'appearance.templates.glassDescription', labelKey: 'appearance.templates.glass', value: 'glass' },
  { descriptionKey: 'appearance.templates.freshDescription', labelKey: 'appearance.templates.fresh', value: 'fresh' },
  { descriptionKey: 'appearance.templates.minimalDescription', labelKey: 'appearance.templates.minimal', value: 'minimal' },
];

export function readAppearancePreference(config?: Pick<UserAppConfig, 'appearanceTemplate'>): AppearancePreference {
  return {
    template: resolveAppearanceTemplate(config?.appearanceTemplate),
  };
}

export const developmentAppearanceTemplateOption = {
  descriptionKey: 'appearance.templates.monoDescription',
  labelKey: 'appearance.templates.mono',
  value: MONO_DEVELOPMENT_TEMPLATE,
} as const;

export function getVisibleAppearanceTemplateOptions(isDevelopment = import.meta.env.DEV): readonly (AppearanceTemplateOption | typeof developmentAppearanceTemplateOption)[] {
  return isDevelopment ? [...appearanceTemplateOptions, developmentAppearanceTemplateOption] : appearanceTemplateOptions;
}

function clearDevelopmentAppearance(): void {
  if (typeof document === 'undefined')
    return;
  delete document.documentElement.dataset.designStudioTemplate;
  Object.keys(MONO_DEVELOPMENT_TOKENS).forEach(name => document.documentElement.style.removeProperty(name));
}

export function applyAppearancePreference(preference: AppearancePreference): void {
  if (typeof document === 'undefined')
    return;
  clearDevelopmentAppearance();
  delete document.documentElement.dataset.appearanceAccent;
  document.documentElement.dataset.appearanceTemplate = preference.template;
  document.dispatchEvent(new Event(APPEARANCE_CHANGE_EVENT));
}

/** Applies the MONO candidate only in dev; it never touches account settings. */
export function applyDevelopmentAppearancePreference(template: DevelopmentAppearanceTemplate): void {
  if (template !== MONO_DEVELOPMENT_TEMPLATE || !import.meta.env.DEV) {
    applyAppearancePreference({ template: resolveAppearanceTemplate(template) });
    return;
  }
  applyAppearancePreference({ template: 'minimal' });
  document.documentElement.dataset.designStudioTemplate = MONO_DEVELOPMENT_TEMPLATE;
  Object.entries(MONO_DEVELOPMENT_TOKENS).forEach(([name, value]) => document.documentElement.style.setProperty(name, value));
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
