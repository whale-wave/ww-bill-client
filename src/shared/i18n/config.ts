/** Supported languages with their display names. */
export const SUPPORTED_LANGS = {
  'zh-CN': '简体中文',
  'en': 'English',
} as const;

export type SupportedLang = keyof typeof SUPPORTED_LANGS;

export const DEFAULT_LANG: SupportedLang = 'zh-CN';

/** localStorage key for persisted language preference. */
export const LANG_STORAGE_KEY = 'app-lang';
