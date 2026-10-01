export const APPEARANCE_TEMPLATES = ['fresh', 'minimal', 'glass'] as const;
export type AppearanceTemplate = typeof APPEARANCE_TEMPLATES[number];

export function isAppearanceTemplate(value: unknown): value is AppearanceTemplate {
  return APPEARANCE_TEMPLATES.includes(value as AppearanceTemplate);
}

export function resolveAppearanceTemplate(value: unknown): AppearanceTemplate {
  return isAppearanceTemplate(value) ? value : 'glass';
}
